import {
  IsString,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClosedDateDto {
  @ApiProperty({
    example: '2025-12-25',
    description: 'Date when all courts in the club are closed (ISO date format)',
  })
  @IsDateString()
  closedDate: string;

  @ApiProperty({
    example: 'Public Holiday - National Day',
    description: 'Reason for closure',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
