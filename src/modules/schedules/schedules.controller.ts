import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SchedulesService } from './schedules.service';
import { RolesGuard } from '@/common/guards/roles.guard';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('clubs/:clubId/schedule/day')
  getDaySchedule(
    @Param('clubId') clubId: string,
    @Query('date') date: string,
  ) {
    return this.schedulesService.getDaySchedule(clubId, date);
  }

  @Get('clubs/:clubId/schedule/week')
  getWeekSchedule(
    @Param('clubId') clubId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.schedulesService.getWeekSchedule(clubId, from, to);
  }
}
