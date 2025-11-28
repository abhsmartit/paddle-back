import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClosedDate, ClosedDateDocument } from './schemas/closed-date.schema';
import { CreateClosedDateDto } from './dto/create-closed-date.dto';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ClosedDatesService {
  constructor(
    @InjectModel(ClosedDate.name)
    private closedDateModel: Model<ClosedDateDocument>,
  ) {}

  async create(
    clubId: string,
    createClosedDateDto: CreateClosedDateDto,
    userId: string,
  ): Promise<ClosedDate> {
    const closedDate = startOfDay(parseISO(createClosedDateDto.closedDate));

    // Check if already exists
    const existing = await this.closedDateModel.findOne({
      clubId,
      closedDate,
    });

    if (existing) {
      throw new ConflictException('This date is already marked as closed');
    }

    const closedDateDoc = new this.closedDateModel({
      clubId,
      closedDate,
      reason: createClosedDateDto.reason,
      createdByUserId: userId,
    });

    return closedDateDoc.save();
  }

  async findAll(clubId: string, from?: string, to?: string): Promise<ClosedDate[]> {
    const query: any = { clubId };

    if (from && to) {
      query.closedDate = {
        $gte: startOfDay(parseISO(from)),
        $lte: endOfDay(parseISO(to)),
      };
    }

    return this.closedDateModel
      .find(query)
      .sort({ closedDate: 1 })
      .exec();
  }

  async findOne(id: string): Promise<ClosedDate> {
    const closedDate = await this.closedDateModel
      .findById(id)
      .exec();

    if (!closedDate) {
      throw new NotFoundException('Closed date not found');
    }

    return closedDate;
  }

  async delete(id: string): Promise<void> {
    const result = await this.closedDateModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Closed date not found');
    }
  }

  async isCourtClosed(
    clubId: string,
    courtId: string,
    date: Date,
  ): Promise<{ isClosed: boolean; reason?: string }> {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Check if club is closed on this date
    const closedDate = await this.closedDateModel.findOne({
      clubId,
      closedDate: { $gte: dayStart, $lte: dayEnd },
    });

    if (closedDate) {
      return {
        isClosed: true,
        reason: closedDate.reason,
      };
    }

    return { isClosed: false };
  }

  async getClosedDatesInRange(
    clubId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Date[]> {
    const query: any = {
      clubId,
      closedDate: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) },
    };

    const closedDates = await this.closedDateModel.find(query).exec();
    return closedDates.map(cd => cd.closedDate);
  }
}
