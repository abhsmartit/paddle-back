import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  IsMongoId,
  Min,
  ValidateIf,
} from 'class-validator';
import { BookingType, PaymentStatus, DayOfWeek } from '@/common/enums';

export class CreateSingleBookingDto {
  @IsMongoId()
  courtId: string;

  @IsMongoId()
  @IsOptional()
  coachId?: string;

  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  bookingName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(BookingType)
  bookingType: BookingType.SINGLE;

  @IsDateString()
  startDateTime: string;

  @IsDateString()
  endDateTime: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsMongoId()
  @IsOptional()
  bookingCategoryId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateFixedBookingDto {
  @IsMongoId()
  courtId: string;

  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  bookingName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(BookingType)
  bookingType: BookingType.FIXED;

  @IsDateString()
  startDateTime: string; // First occurrence date and time

  @IsNumber()
  @Min(15)
  durationMinutes: number;

  @IsEnum(DayOfWeek)
  repeatedDayOfWeek: DayOfWeek;

  @IsDateString()
  recurrenceEndDate: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsMongoId()
  @IsOptional()
  bookingCategoryId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateCoachBookingDto {
  @IsMongoId()
  courtId: string;

  @IsMongoId()
  coachId: string;

  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  bookingName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(BookingType)
  bookingType: BookingType.COACH;

  @IsDateString()
  startDateTime: string;

  @IsDateString()
  endDateTime: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsMongoId()
  @IsOptional()
  bookingCategoryId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

// Union type for create booking DTO
export type CreateBookingDto =
  | CreateSingleBookingDto
  | CreateFixedBookingDto
  | CreateCoachBookingDto;
