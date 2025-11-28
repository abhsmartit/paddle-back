import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { ClosedDatesService } from '../closed-dates/closed-dates.service';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

export interface CourtSchedule {
  courtId: string;
  courtName: string;
  bookings: BookingInfo[];
  closedDates?: ClosedDateInfo[];
}

export interface ClosedDateInfo {
  closedDateId: string;
  closedDate: Date;
  reason: string;
}

export interface BookingInfo {
  bookingId: string;
  bookingName: string;
  startDateTime: Date;
  endDateTime: Date;
  price: number;
  categoryName?: string;
  categoryColor?: string;
  coachName?: string;
  phone: string;
  notes?: string;
  bookingType: string;
  seriesId?: string;
  repeatedDayOfWeek?: string;
  repeatedDaysOfWeek?: string[];
  recurrenceEndDate?: Date;
}

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private closedDatesService: ClosedDatesService,
  ) {}

  async getDaySchedule(clubId: string, date: string): Promise<CourtSchedule[]> {
    const targetDate = parseISO(date);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    return this.getSchedule(clubId, dayStart, dayEnd);
  }

  async getWeekSchedule(
    clubId: string,
    from: string,
    to: string,
  ): Promise<CourtSchedule[]> {
    const startDate = startOfDay(parseISO(from));
    const endDate = endOfDay(parseISO(to));

    return this.getSchedule(clubId, startDate, endDate);
  }

  private async getSchedule(
    clubId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CourtSchedule[]> {
    // Find bookings that overlap with the requested date range
    // This includes overnight bookings that span across days
    const bookings = await this.bookingModel
      .find({
        clubId,
        $or: [
          // Booking starts within the range
          {
            startDateTime: { $gte: startDate, $lte: endDate },
          },
          // Booking ends within the range
          {
            endDateTime: { $gte: startDate, $lte: endDate },
          },
          // Booking spans across the entire range
          {
            startDateTime: { $lte: startDate },
            endDateTime: { $gte: endDate },
          },
        ],
      })
      .populate('courtId', 'name')
      .populate('coachId', 'fullName')
      .populate('bookingCategoryId', 'name colorHex')
      .sort({ startDateTime: 1 })
      .exec();

    // Group by court
    const courtMap = new Map<string, CourtSchedule>();

    for (const booking of bookings) {
      const court = booking.courtId as any;
      const courtId = court._id.toString();

      if (!courtMap.has(courtId)) {
        courtMap.set(courtId, {
          courtId,
          courtName: court.name,
          bookings: [],
        });
      }

      const coach = booking.coachId as any;
      const category = booking.bookingCategoryId as any;

      const bookingInfo: BookingInfo = {
        bookingId: booking._id.toString(),
        bookingName: booking.bookingName,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        price: booking.price,
        categoryName: category?.name,
        categoryColor: category?.colorHex,
        coachName: coach?.fullName,
        phone: booking.phone,
        notes: booking.notes,
        bookingType: booking.bookingType,
        seriesId: booking.seriesId,
        repeatedDayOfWeek: booking.repeatedDayOfWeek,
        repeatedDaysOfWeek: booking.repeatedDaysOfWeek,
        recurrenceEndDate: booking.recurrenceEndDate,
      };

      courtMap.get(courtId)!.bookings.push(bookingInfo);
    }

    // Get closed dates for the range
    const closedDates = await this.closedDatesService.findAll(
      clubId,
      startDate.toISOString().split('T')[0],
    );
    console.log(   clubId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]);
    
    console.log(closedDates ,"closedDates");
    

    // Add closed dates to all courts (club-wide closure)
    for (const closedDate of closedDates) {
      for (const courtSchedule of courtMap.values()) {
        if (!courtSchedule.closedDates) {
          courtSchedule.closedDates = [];
        }
        courtSchedule.closedDates.push({
          closedDateId: closedDate._id.toString(),
          closedDate: closedDate.closedDate,
          reason: closedDate.reason,
        });
      }
    }

    return Array.from(courtMap.values());
  }
}
