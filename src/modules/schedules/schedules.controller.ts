import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SchedulesService } from './schedules.service';
import { RolesGuard } from '@/common/guards/roles.guard';

@ApiTags('schedules')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @ApiOperation({ summary: 'Get schedule for a specific day' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiQuery({ name: 'date', description: 'Date in ISO format (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Day schedule with all bookings' })
  @Get('clubs/:clubId/schedule/day')
  getDaySchedule(
    @Param('clubId') clubId: string,
    @Query('date') date: string,
  ) {
    return this.schedulesService.getDaySchedule(clubId, date);
  }

  @ApiOperation({ summary: 'Get schedule for a week range' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiQuery({ name: 'from', description: 'Start date in ISO format (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', description: 'End date in ISO format (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Week schedule with all bookings' })
  @Get('clubs/:clubId/schedule/week')
  getWeekSchedule(
    @Param('clubId') clubId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.schedulesService.getWeekSchedule(clubId, from, to);
  }
}
