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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingType, PaymentStatus, DayOfWeek } from '@/common/enums';

export class CreateSingleBookingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Court ID' })
  @IsMongoId()
  courtId: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439012', description: 'Coach ID (optional)' })
  @IsMongoId()
  @IsOptional()
  coachId?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439013', description: 'Customer ID (optional)' })
  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: 'Ahmed Al-Rashid', description: 'Booking customer name' })
  @IsString()
  @IsNotEmpty()
  bookingName: string;

  @ApiProperty({ example: '+966501234567', description: 'Customer phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'SINGLE', enum: BookingType, description: 'Must be SINGLE for single bookings' })
  @IsEnum(BookingType)
  bookingType: BookingType.SINGLE;

  @ApiProperty({ example: '2025-11-25T14:00:00Z', description: 'Booking start date and time (ISO format)' })
  @IsDateString()
  startDateTime: string;

  @ApiPropertyOptional({ example: '2025-11-25T16:00:00Z', description: 'Booking end date and time (ISO format). Either this or durationMinutes is required.' })
  @IsDateString()
  @IsOptional()
  endDateTime?: string;

  @ApiPropertyOptional({ example: 90, description: 'Duration in minutes. Either this or endDateTime is required.' })
  @IsNumber()
  @Min(15)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ example: 150, description: 'Booking price in SAR' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439014', description: 'Booking category ID (optional)' })
  @IsMongoId()
  @IsOptional()
  bookingCategoryId?: string;

  @ApiPropertyOptional({ example: 'Customer prefers court 3', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateFixedBookingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Court ID' })
  @IsMongoId()
  courtId: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439013', description: 'Customer ID (optional)' })
  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: 'Ahmed Al-Rashid', description: 'Booking customer name' })
  @IsString()
  @IsNotEmpty()
  bookingName: string;

  @ApiProperty({ example: '+966501234567', description: 'Customer phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'FIXED', enum: BookingType, description: 'Must be FIXED for recurring bookings' })
  @IsEnum(BookingType)
  bookingType: BookingType.FIXED;

  @ApiProperty({ example: '2025-11-25T14:00:00Z', description: 'First occurrence date and time (ISO format)' })
  @IsDateString()
  startDateTime: string; // First occurrence date and time

  @ApiProperty({ example: 90, description: 'Duration of each booking in minutes' })
  @IsNumber()
  @Min(15)
  durationMinutes: number;

  @ApiPropertyOptional({ example: 'MONDAY', enum: DayOfWeek, description: 'Single day of week for recurring booking (deprecated, use repeatedDaysOfWeek)' })
  @IsEnum(DayOfWeek)
  @IsOptional()
  repeatedDayOfWeek?: DayOfWeek;

  @ApiPropertyOptional({ 
    example: ['MONDAY', 'WEDNESDAY', 'FRIDAY'], 
    enum: DayOfWeek, 
    isArray: true,
    description: 'Multiple days of week for recurring bookings' 
  })
  @IsEnum(DayOfWeek, { each: true })
  @IsOptional()
  repeatedDaysOfWeek?: DayOfWeek[];

  @ApiProperty({ example: '2026-11-25', description: 'Date when recurring bookings should end (ISO format)' })
  @IsDateString()
  recurrenceEndDate: string;

  @ApiProperty({ example: 150, description: 'Booking price per occurrence in SAR' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439014', description: 'Booking category ID (optional)' })
  @IsMongoId()
  @IsOptional()
  bookingCategoryId?: string;

  @ApiPropertyOptional({ example: 'Weekly fixed booking', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateCoachBookingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Court ID' })
  @IsMongoId()
  courtId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'Coach ID (required for coach bookings)' })
  @IsMongoId()
  coachId: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439013', description: 'Customer ID (optional)' })
  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: 'Ahmed Al-Rashid', description: 'Booking customer name' })
  @IsString()
  @IsNotEmpty()
  bookingName: string;

  @ApiProperty({ example: '+966501234567', description: 'Customer phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'COACH', enum: BookingType, description: 'Must be COACH for coach bookings' })
  @IsEnum(BookingType)
  bookingType: BookingType.COACH;

  @ApiProperty({ example: '2025-11-25T14:00:00Z', description: 'Booking start date and time (ISO format)' })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({ example: '2025-11-25T16:00:00Z', description: 'Booking end date and time (ISO format)' })
  @IsDateString()
  endDateTime: string;

  @ApiProperty({ example: 200, description: 'Booking price including coach fee in SAR' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439014', description: 'Booking category ID (optional)' })
  @IsMongoId()
  @IsOptional()
  bookingCategoryId?: string;

  @ApiPropertyOptional({ example: 'Private coaching session', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Union type for create booking DTO
export type CreateBookingDto =
  | CreateSingleBookingDto
  | CreateFixedBookingDto
  | CreateCoachBookingDto;
