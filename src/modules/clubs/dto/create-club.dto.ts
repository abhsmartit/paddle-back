import { IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '@/common/enums';

class LocationDto {
  @ApiProperty({ example: 'Riyadh', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Saudi Arabia', description: 'Country name' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ example: [24.7136, 46.6753], description: 'Coordinates [latitude, longitude]' })
  @IsArray()
  @IsOptional()
  coordinates?: number[];
}

class OpeningHoursDto {
  @ApiProperty({ example: 'SUNDAY', enum: DayOfWeek, description: 'Day of the week' })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '08:00', description: 'Opening time (HH:mm format)' })
  @IsString()
  @IsNotEmpty()
  openTime: string;

  @ApiProperty({ example: '23:00', description: 'Closing time (HH:mm format)' })
  @IsString()
  @IsNotEmpty()
  closeTime: string;
}

export class CreateClubDto {
  @ApiProperty({ example: 'Padel Club Riyadh', description: 'Club name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: LocationDto, description: 'Club location details' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiPropertyOptional({ example: 'Asia/Riyadh', description: 'IANA timezone identifier' })
  @IsString()
  @IsOptional()
  timeZone?: string;

  @ApiPropertyOptional({ type: [OpeningHoursDto], description: 'Operating hours for each day' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  @IsOptional()
  openingHours?: OpeningHoursDto[];
}
