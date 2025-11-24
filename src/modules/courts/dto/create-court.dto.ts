import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCourtDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  surfaceType: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @Min(0)
  defaultPricePerHour: number;
}
