import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { ClosedDatesModule } from '../closed-dates/closed-dates.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ClosedDatesModule,
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
