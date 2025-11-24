import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { PaymentStatus } from '@/common/enums';
import { parseISO } from 'date-fns';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(
    clubId: string,
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    // Verify booking exists
    const booking = await this.bookingModel.findById(createPaymentDto.bookingId);
    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${createPaymentDto.bookingId} not found`,
      );
    }

    const payment = new this.paymentModel({
      ...createPaymentDto,
      clubId,
      paidAt: parseISO(createPaymentDto.paidAt),
      createdByUserId: userId,
    });

    const savedPayment = await payment.save();

    // Update booking payment status
    await this.updateBookingPaymentStatus(createPaymentDto.bookingId);

    return savedPayment;
  }

  private async updateBookingPaymentStatus(bookingId: string): Promise<void> {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) return;

    // Calculate total received
    const payments = await this.paymentModel.find({ bookingId }).exec();
    const totalReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Determine payment status
    let paymentStatus: PaymentStatus;
    if (totalReceived === 0) {
      paymentStatus = PaymentStatus.NOT_PAID;
    } else if (totalReceived >= booking.price) {
      paymentStatus = PaymentStatus.PAID;
    } else {
      paymentStatus = PaymentStatus.PARTIALLY_PAID;
    }

    await this.bookingModel.findByIdAndUpdate(bookingId, {
      totalReceived,
      paymentStatus,
    });
  }

  async findByBooking(bookingId: string): Promise<Payment[]> {
    return this.paymentModel
      .find({ bookingId: new Types.ObjectId(bookingId) })
      .sort({ paidAt: -1 })
      .exec();
  }

  async findByClub(
    clubId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Payment[]> {
    const query: any = { clubId };

    if (startDate && endDate) {
      query.paidAt = { $gte: startDate, $lte: endDate };
    }

    return this.paymentModel
      .find(query)
      .populate('bookingId')
      .sort({ paidAt: -1 })
      .exec();
  }

  async remove(id: string): Promise<void> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    const bookingId = payment.bookingId.toString();
    await this.paymentModel.findByIdAndDelete(id).exec();

    // Update booking payment status after deletion
    await this.updateBookingPaymentStatus(bookingId);
  }
}
