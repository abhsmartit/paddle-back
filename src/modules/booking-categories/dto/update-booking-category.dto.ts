import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingCategoryDto } from './create-booking-category.dto';

export class UpdateBookingCategoryDto extends PartialType(CreateBookingCategoryDto) {}
