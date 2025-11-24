import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsArray, IsOptional, IsMongoId, Min } from 'class-validator';

export class CreateCoachDto {
  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];
}
