import { IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '@/common/enums';

class LocationDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsArray()
  @IsOptional()
  coordinates?: number[];
}

class OpeningHoursDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @IsNotEmpty()
  openTime: string;

  @IsString()
  @IsNotEmpty()
  closeTime: string;
}

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  @IsOptional()
  openingHours?: OpeningHoursDto[];
}
