import { IsString, IsNotEmpty, IsBoolean, IsOptional, Matches } from 'class-validator';

export class CreateBookingCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'colorHex must be a valid hex color code (e.g., #FF5733)',
  })
  colorHex: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
