import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CoachesService } from './coaches.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Post('clubs/:clubId/coaches')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Param('clubId') clubId: string, @Body() createCoachDto: CreateCoachDto) {
    return this.coachesService.create(clubId, createCoachDto);
  }

  @Get('clubs/:clubId/coaches')
  findByClub(
    @Param('clubId') clubId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.coachesService.findByClub(clubId, activeOnly === 'true');
  }

  @Get('coaches/:id')
  findOne(@Param('id') id: string) {
    return this.coachesService.findOne(id);
  }

  @Patch('coaches/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateCoachDto: UpdateCoachDto) {
    return this.coachesService.update(id, updateCoachDto);
  }

  @Delete('coaches/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.coachesService.remove(id);
  }
}
