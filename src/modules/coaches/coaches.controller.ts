import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CoachesService } from './coaches.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('coaches')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @ApiOperation({ summary: 'Create a new coach for a club' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiResponse({ status: 201, description: 'Coach created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid coach data' })
  @Post('clubs/:clubId/coaches')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Param('clubId') clubId: string, @Body() createCoachDto: CreateCoachDto) {
    return this.coachesService.create(clubId, createCoachDto);
  }

  @ApiOperation({ summary: 'Get all coaches for a club' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiQuery({ name: 'activeOnly', required: false, description: 'Filter only active coaches (true/false)' })
  @ApiResponse({ status: 200, description: 'List of coaches' })
  @Get('clubs/:clubId/coaches')
  findByClub(
    @Param('clubId') clubId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.coachesService.findByClub(clubId, activeOnly === 'true');
  }

  @ApiOperation({ summary: 'Get coach by ID' })
  @ApiParam({ name: 'id', description: 'Coach ID' })
  @ApiResponse({ status: 200, description: 'Coach details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @Get('coaches/:id')
  findOne(@Param('id') id: string) {
    return this.coachesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update coach details' })
  @ApiParam({ name: 'id', description: 'Coach ID' })
  @ApiResponse({ status: 200, description: 'Coach updated successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @Patch('coaches/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateCoachDto: UpdateCoachDto) {
    return this.coachesService.update(id, updateCoachDto);
  }

  @ApiOperation({ summary: 'Delete a coach' })
  @ApiParam({ name: 'id', description: 'Coach ID' })
  @ApiResponse({ status: 200, description: 'Coach deleted successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @Delete('coaches/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.coachesService.remove(id);
  }
}
