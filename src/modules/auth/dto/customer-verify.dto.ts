import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CustomerVerifyDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
