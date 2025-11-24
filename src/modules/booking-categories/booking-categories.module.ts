import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingCategoriesService } from './booking-categories.service';
import { BookingCategoriesController } from './booking-categories.controller';
import { BookingCategory, BookingCategorySchema } from './schemas/booking-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BookingCategory.name, schema: BookingCategorySchema },
    ]),
  ],
  controllers: [BookingCategoriesController],
  providers: [BookingCategoriesService],
  exports: [BookingCategoriesService],
})
export class BookingCategoriesModule {}
