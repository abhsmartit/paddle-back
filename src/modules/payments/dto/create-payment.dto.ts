import { IsMongoId, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { PaymentMethod } from '@/common/enums';

export class CreatePaymentDto {
  @IsMongoId()
  bookingId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsDateString()
  paidAt: string;
}
