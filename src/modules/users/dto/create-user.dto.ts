import { IsEmail, IsString, MinLength, IsEnum, IsArray, IsOptional } from 'class-validator';
import { UserRole } from '@/common/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  fullName: string;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  @IsOptional()
  roles?: UserRole[];
}
