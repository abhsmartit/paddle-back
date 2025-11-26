import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { BookingType, PaymentStatus, DayOfWeek } from '@/common/enums';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: String, default: () => randomUUID() })
  _id: string;

  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Court', required: true, index: true })
  courtId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Coach' })
  coachId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId?: Types.ObjectId;

  @Prop({ required: true })
  bookingName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: String, enum: BookingType, required: true })
  bookingType: BookingType;

  @Prop({ required: true, type: Date, index: true })
  startDateTime: Date;

  @Prop({ required: true, type: Date, index: true })
  endDateTime: Date;

  @Prop({ required: true })
  durationMinutes: number;

  // For FIXED bookings
  @Prop({ type: String, enum: DayOfWeek })
  repeatedDayOfWeek?: DayOfWeek;

  @Prop({ type: [String], enum: DayOfWeek })
  repeatedDaysOfWeek?: DayOfWeek[]; // Multiple days selection for FIXED bookings

  @Prop({ type: Date })
  recurrenceEndDate?: Date;

  @Prop({ type: String })
  seriesId?: string; // To group recurring bookings

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  totalReceived: number;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.NOT_PAID })
  paymentStatus: PaymentStatus;

  @Prop({ type: Types.ObjectId, ref: 'BookingCategory' })
  bookingCategoryId?: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdByUserId: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Compound indexes for performance and overlap detection
BookingSchema.index({ courtId: 1, startDateTime: 1, endDateTime: 1 });
BookingSchema.index({ clubId: 1, startDateTime: 1 });
BookingSchema.index({ coachId: 1, startDateTime: 1, endDateTime: 1 });
BookingSchema.index({ seriesId: 1 });
BookingSchema.index({ customerId: 1 });
