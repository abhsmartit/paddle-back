import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerLoginDto {
  @ApiProperty({ example: '+966501234567', description: 'Customer phone number in international format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be a valid international phone number',
  })
  phone: string;

  @ApiProperty({ example: 'John Doe', description: 'Customer name for the booking' })
  @IsString()
  @IsNotEmpty()
  bookingName: string;
}
