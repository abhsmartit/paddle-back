import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClosedDatesController } from './closed-dates.controller';
import { ClosedDatesService } from './closed-dates.service';
import { ClosedDate, ClosedDateSchema } from './schemas/closed-date.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClosedDate.name, schema: ClosedDateSchema },
    ]),
  ],
  controllers: [ClosedDatesController],
  providers: [ClosedDatesService],
  exports: [ClosedDatesService],
})
export class ClosedDatesModule {}
