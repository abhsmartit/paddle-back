import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
