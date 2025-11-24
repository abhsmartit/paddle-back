import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookingCategory, BookingCategoryDocument } from './schemas/booking-category.schema';
import { CreateBookingCategoryDto } from './dto/create-booking-category.dto';
import { UpdateBookingCategoryDto } from './dto/update-booking-category.dto';

@Injectable()
export class BookingCategoriesService {
  constructor(
    @InjectModel(BookingCategory.name)
    private bookingCategoryModel: Model<BookingCategoryDocument>,
  ) {}

  async create(
    clubId: string,
    createBookingCategoryDto: CreateBookingCategoryDto,
  ): Promise<BookingCategory> {
    const category = new this.bookingCategoryModel({
      ...createBookingCategoryDto,
      clubId,
    });
    return category.save();
  }

  async findByClub(clubId: string, activeOnly = false): Promise<BookingCategory[]> {
    const query: any = { clubId };
    if (activeOnly) {
      query.isActive = true;
    }
    return this.bookingCategoryModel.find(query).exec();
  }

  async findOne(id: string): Promise<BookingCategory> {
    const category = await this.bookingCategoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Booking category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateBookingCategoryDto: UpdateBookingCategoryDto,
  ): Promise<BookingCategory> {
    const category = await this.bookingCategoryModel
      .findByIdAndUpdate(id, updateBookingCategoryDto, { new: true })
      .exec();
    if (!category) {
      throw new NotFoundException(`Booking category with ID ${id} not found`);
    }
    return category;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookingCategoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Booking category with ID ${id} not found`);
    }
  }
}
