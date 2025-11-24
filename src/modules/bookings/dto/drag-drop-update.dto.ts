import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class DragDropUpdateDto {
  @IsDateString()
  @IsNotEmpty()
  startDateTime: string;

  @IsDateString()
  @IsNotEmpty()
  endDateTime: string;

  @IsString()
  @IsOptional()
  courtId?: string;

  @IsString()
  @IsOptional()
  coachId?: string;
}
