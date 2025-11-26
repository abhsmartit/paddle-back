import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import {
  CreateBookingDto,
  CreateSingleBookingDto,
  CreateFixedBookingDto,
  CreateCoachBookingDto,
} from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { parseISO, differenceInMinutes, addDays, addWeeks, getDay } from 'date-fns';
import { randomUUID } from 'crypto';
import { BookingType, DayOfWeek } from '@/common/enums';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(
    clubId: string,
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<Booking | Booking[]> {
    // Dispatch based on booking type
    switch (createBookingDto.bookingType) {
      case BookingType.SINGLE:
        return this.createSingleBooking(
          clubId,
          createBookingDto as CreateSingleBookingDto,
          userId,
        );
      case BookingType.FIXED:
        return this.createFixedBooking(
          clubId,
          createBookingDto as CreateFixedBookingDto,
          userId,
        );
      case BookingType.COACH:
        return this.createCoachBooking(
          clubId,
          createBookingDto as CreateCoachBookingDto,
          userId,
        );
      default:
        throw new BadRequestException('Invalid booking type');
    }
  }

  private async createSingleBooking(
    clubId: string,
    dto: CreateSingleBookingDto,
    userId: string,
  ): Promise<Booking> {
    if (!dto.endDateTime && !dto.durationMinutes) {
      throw new BadRequestException('Either endDateTime or durationMinutes must be provided');
    }

    const startDateTime = parseISO(dto.startDateTime);
    let endDateTime: Date;
    let durationMinutes: number;

    if (dto.endDateTime) {
      endDateTime = parseISO(dto.endDateTime);
      durationMinutes = differenceInMinutes(endDateTime, startDateTime);
    } else {
      durationMinutes = dto.durationMinutes!;
      endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
    }

    // Validate court overlap
    await this.validateCourtAvailability(dto.courtId, startDateTime, endDateTime);

    // Validate coach overlap if coach booking
    if (dto.coachId) {
      await this.validateCoachAvailability(dto.coachId, startDateTime, endDateTime);
    }

    const booking = new this.bookingModel({
      ...dto,
      clubId,
      startDateTime,
      endDateTime,
      durationMinutes,
      createdByUserId: userId,
    });

    return booking.save();
  }

  private async createCoachBooking(
    clubId: string,
    dto: CreateCoachBookingDto,
    userId: string,
  ): Promise<Booking> {
    const startDateTime = parseISO(dto.startDateTime);
    const endDateTime = parseISO(dto.endDateTime);
    const durationMinutes = differenceInMinutes(endDateTime, startDateTime);

    if (!dto.coachId) {
      throw new BadRequestException('Coach booking requires coachId');
    }

    // Validate court overlap
    await this.validateCourtAvailability(dto.courtId, startDateTime, endDateTime);

    // Validate coach overlap
    await this.validateCoachAvailability(dto.coachId, startDateTime, endDateTime);

    const booking = new this.bookingModel({
      ...dto,
      clubId,
      startDateTime,
      endDateTime,
      durationMinutes,
      createdByUserId: userId,
    });

    return booking.save();
  }

  private async createFixedBooking(
    clubId: string,
    dto: CreateFixedBookingDto,
    userId: string,
  ): Promise<Booking[]> {
    const startDate = parseISO(dto.startDateTime);
    const endDate = parseISO(dto.recurrenceEndDate);
    const seriesId = randomUUID();

    // Support both single day and multiple days
    const daysOfWeek = dto.repeatedDaysOfWeek && dto.repeatedDaysOfWeek.length > 0
      ? dto.repeatedDaysOfWeek
      : dto.repeatedDayOfWeek
      ? [dto.repeatedDayOfWeek]
      : [];

    if (daysOfWeek.length === 0) {
      throw new BadRequestException('Either repeatedDayOfWeek or repeatedDaysOfWeek must be provided');
    }

    // Generate all occurrences for all selected days
    const occurrences = this.generateRecurringOccurrencesMultipleDays(
      startDate,
      endDate,
      daysOfWeek,
      dto.durationMinutes,
    );

    if (occurrences.length === 0) {
      throw new BadRequestException('No valid occurrences found between start and end dates');
    }

    // Validate all occurrences for overlaps - but don't fail entire series if one fails
    const validOccurrences: Array<{ start: Date; end: Date }> = [];
    const failedOccurrences: Array<{ start: Date; end: Date; error: string }> = [];

    for (const { start, end } of occurrences) {
      try {
        await this.validateCourtAvailability(dto.courtId, start, end);
        validOccurrences.push({ start, end });
      } catch (error) {
        failedOccurrences.push({
          start,
          end,
          error: error.message || 'Validation failed',
        });
      }
    }

    if (validOccurrences.length === 0) {
      throw new ConflictException(
        `All ${occurrences.length} occurrences have conflicts. Cannot create any bookings.`,
      );
    }

    // Create all booking instances for valid occurrences only
    const bookings = validOccurrences.map(
      ({ start, end }) =>
        new this.bookingModel({
          clubId,
          courtId: dto.courtId,
          customerId: dto.customerId,
          bookingName: dto.bookingName,
          phone: dto.phone,
          bookingType: BookingType.FIXED,
          startDateTime: start,
          endDateTime: end,
          durationMinutes: dto.durationMinutes,
          repeatedDayOfWeek: dto.repeatedDayOfWeek,
          repeatedDaysOfWeek: daysOfWeek,
          recurrenceEndDate: endDate,
          seriesId,
          price: dto.price,
          bookingCategoryId: dto.bookingCategoryId,
          notes: dto.notes,
          createdByUserId: userId,
        }),
    );

    const result = await this.bookingModel.insertMany(bookings);

    // Log warning if some occurrences failed
    if (failedOccurrences.length > 0) {
      console.warn(
        `Created ${result.length} bookings, but ${failedOccurrences.length} occurrences were skipped due to conflicts`,
      );
    }

    return result;
  }

  private generateRecurringOccurrences(
    startDate: Date,
    endDate: Date,
    dayOfWeek: DayOfWeek,
    durationMinutes: number,
  ): Array<{ start: Date; end: Date }> {
    const occurrences: Array<{ start: Date; end: Date }> = [];
    const dayMap = {
      [DayOfWeek.SUNDAY]: 0,
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6,
    };

    const targetDay = dayMap[dayOfWeek];
    let current = new Date(startDate.getTime());

    // Move to the first occurrence of the target day
    while (getDay(current) !== targetDay && current <= endDate) {
      current = addDays(current, 1);
    }

    // Generate weekly occurrences
    while (current <= endDate) {
      const start = new Date(current.getTime());
      const end = new Date(current.getTime() + durationMinutes * 60000);
      occurrences.push({ start, end });

      // Move to next week
      current = addWeeks(current, 1);
    }

    return occurrences;
  }

  private generateRecurringOccurrencesMultipleDays(
    startDate: Date,
    endDate: Date,
    daysOfWeek: DayOfWeek[],
    durationMinutes: number,
  ): Array<{ start: Date; end: Date }> {
    const occurrences: Array<{ start: Date; end: Date }> = [];
    const dayMap = {
      [DayOfWeek.SUNDAY]: 0,
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6,
    };

    const targetDays = daysOfWeek.map(day => dayMap[day]);

    // Iterate through each day in the date range
    let current = new Date(startDate.getTime());
    
    while (current <= endDate) {
      const currentDay = getDay(current);
      
      // Check if current day is in the selected days
      if (targetDays.includes(currentDay)) {
        const start = new Date(current.getTime());
        const end = new Date(current.getTime() + durationMinutes * 60000);
        occurrences.push({ start, end });
      }
      
      // Move to next day
      current = addDays(current, 1);
    }

    return occurrences;
  }

  private async validateCourtAvailability(
    courtId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeBookingId?: string,
  ): Promise<void> {
    // Enhanced overlap detection for overnight bookings (e.g., 11:30 PM to 3 AM)
    const query: any = {
      courtId,
      $or: [
        // Case 1: Existing booking overlaps with new booking start time
        {
          startDateTime: { $lte: startDateTime },
          endDateTime: { $gt: startDateTime },
        },
        // Case 2: Existing booking overlaps with new booking end time
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gte: endDateTime },
        },
        // Case 3: New booking completely contains existing booking
        {
          startDateTime: { $gte: startDateTime },
          endDateTime: { $lte: endDateTime },
        },
        // Case 4: Existing booking completely contains new booking
        {
          startDateTime: { $lte: startDateTime },
          endDateTime: { $gte: endDateTime },
        },
      ],
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const overlappingBookings = await this.bookingModel.find(query).exec();

    if (overlappingBookings.length > 0) {
      const conflicts = overlappingBookings.map(b => 
        `${b.bookingName} (${b.startDateTime.toLocaleTimeString()} - ${b.endDateTime.toLocaleTimeString()})`
      ).join(', ');
      
      throw new ConflictException(
        `Court is not available during the requested time slot. Conflicts with: ${conflicts}`,
      );
    }
  }

  private async validateCoachAvailability(
    coachId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeBookingId?: string,
  ): Promise<void> {
    // Enhanced overlap detection for coaches (including overnight sessions)
    const query: any = {
      coachId,
      $or: [
        // Case 1: Existing booking overlaps with new booking start time
        {
          startDateTime: { $lte: startDateTime },
          endDateTime: { $gt: startDateTime },
        },
        // Case 2: Existing booking overlaps with new booking end time
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gte: endDateTime },
        },
        // Case 3: New booking completely contains existing booking
        {
          startDateTime: { $gte: startDateTime },
          endDateTime: { $lte: endDateTime },
        },
        // Case 4: Existing booking completely contains new booking
        {
          startDateTime: { $lte: startDateTime },
          endDateTime: { $gte: endDateTime },
        },
      ],
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const overlappingBookings = await this.bookingModel.find(query).exec();

    if (overlappingBookings.length > 0) {
      const conflicts = overlappingBookings.map(b => 
        `${b.bookingName} (${b.startDateTime.toLocaleTimeString()} - ${b.endDateTime.toLocaleTimeString()})`
      ).join(', ');
      
      throw new ConflictException(
        `Coach is not available during the requested time slot. Conflicts with: ${conflicts}`,
      );
    }
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(id)
      .populate('courtId')
      .populate('coachId')
      .populate('customerId')
      .populate('bookingCategoryId')
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async findByClub(
    clubId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Booking[]> {
    const query: any = { clubId };

    if (startDate && endDate) {
      query.startDateTime = { $gte: startDate, $lte: endDate };
    }

    return this.bookingModel
      .find(query)
      .populate('courtId')
      .populate('coachId')
      .populate('customerId')
      .populate('bookingCategoryId')
      .sort({ startDateTime: 1 })
      .exec();
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    // If updating time, validate overlaps
    if (updateBookingDto.startDateTime || updateBookingDto.endDateTime) {
      const startDateTime = updateBookingDto.startDateTime
        ? new Date(updateBookingDto.startDateTime)
        : booking.startDateTime;
      const endDateTime = updateBookingDto.endDateTime
        ? new Date(updateBookingDto.endDateTime)
        : booking.endDateTime;

      const courtId = updateBookingDto.courtId || booking.courtId.toString();
      await this.validateCourtAvailability(
        courtId,
        startDateTime,
        endDateTime,
        id,
      );

      if (booking.coachId || updateBookingDto.coachId) {
        const coachId = updateBookingDto.coachId || booking.coachId?.toString();
        if (coachId) {
          await this.validateCoachAvailability(
            coachId,
            startDateTime,
            endDateTime,
            id,
          );
        }
      }

      // Update duration if times changed
      if (updateBookingDto.startDateTime || updateBookingDto.endDateTime) {
        const duration = differenceInMinutes(endDateTime, startDateTime);
        updateBookingDto['durationMinutes'] = duration;
      }
    }

    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate('courtId')
      .populate('coachId')
      .populate('customerId')
      .populate('bookingCategoryId')
      .exec();

    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return updatedBooking;
  }

  /**
   * Drag and drop update - optimized for calendar drag-drop operations
   * Validates overlaps for both new time slot and optionally new court/coach
   * IMPORTANT: This method will throw ConflictException if time overlap is detected
   */
  async dragDropUpdate(
    id: string,
    dragDropDto: { startDateTime: string; endDateTime: string; courtId?: string; coachId?: string },
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    const startDateTime = parseISO(dragDropDto.startDateTime);
    const endDateTime = parseISO(dragDropDto.endDateTime);
    
    // Validate end time is after start time
    if (endDateTime <= startDateTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Calculate duration
    const durationMinutes = differenceInMinutes(endDateTime, startDateTime);

    // Determine which court to validate (new court if changed, else existing)
    const targetCourtId = dragDropDto.courtId || booking.courtId.toString();
    
    // CRITICAL: Validate court availability - will throw ConflictException on overlap
    await this.validateCourtAvailability(
      targetCourtId,
      startDateTime,
      endDateTime,
      id, // Exclude current booking from overlap check
    );

    // If coach is assigned (either existing or new), validate coach availability
    const targetCoachId = dragDropDto.coachId || booking.coachId?.toString();
    if (targetCoachId) {
      // CRITICAL: Validate coach availability - will throw ConflictException on overlap
      await this.validateCoachAvailability(
        targetCoachId,
        startDateTime,
        endDateTime,
        id, // Exclude current booking from overlap check
      );
    }

    // Only update if validation passes (no overlaps detected)
    const updateData: any = {
      startDateTime,
      endDateTime,
      durationMinutes,
    };

    if (dragDropDto.courtId) {
      updateData.courtId = dragDropDto.courtId;
    }

    if (dragDropDto.coachId) {
      updateData.coachId = dragDropDto.coachId;
    }

    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('courtId')
      .populate('coachId')
      .populate('customerId')
      .populate('bookingCategoryId')
      .exec();

    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return updatedBooking;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }

  async cancelOccurrence(id: string): Promise<void> {
    // Cancel single occurrence of a recurring booking
    await this.remove(id);
  }

  async cancelSeries(seriesId: string): Promise<void> {
    // Cancel all bookings in a recurring series
    await this.bookingModel.deleteMany({ seriesId }).exec();
  }
}
