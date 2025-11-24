import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsEnum,
  Min,
} from 'class-validator';
import { PaymentStatus } from '@/common/enums';

export class UpdateBookingDto {
  @IsMongoId()
  @IsOptional()
  courtId?: string;

  @IsMongoId()
  @IsOptional()
  coachId?: string;

  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  bookingName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  startDateTime?: string;

  @IsDateString()
  @IsOptional()
  endDateTime?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalReceived?: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsMongoId()
  @IsOptional()
  bookingCategoryId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
