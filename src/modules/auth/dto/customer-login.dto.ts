import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CustomerLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be a valid international phone number',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  bookingName: string;
}
