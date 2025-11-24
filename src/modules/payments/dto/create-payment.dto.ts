import { IsMongoId, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@/common/enums';

export class CreatePaymentDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Booking ID' })
  @IsMongoId()
  bookingId: string;

  @ApiProperty({ example: 150, description: 'Payment amount in SAR' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'CASH', enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: '2025-11-24T14:30:00Z', description: 'Payment date and time (ISO format)' })
  @IsDateString()
  paidAt: string;
}
