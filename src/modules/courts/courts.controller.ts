import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('courts')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @ApiOperation({ summary: 'Create a new court for a club' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiResponse({ status: 201, description: 'Court created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid court data' })
  @Post('clubs/:clubId/courts')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Param('clubId') clubId: string, @Body() createCourtDto: CreateCourtDto) {
    return this.courtsService.create(clubId, createCourtDto);
  }

  @ApiOperation({ summary: 'Get all courts for a club' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiResponse({ status: 200, description: 'List of courts' })
  @Get('clubs/:clubId/courts')
  findByClub(@Param('clubId') clubId: string) {
    return this.courtsService.findByClub(clubId);
  }

  @ApiOperation({ summary: 'Get court by ID' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @Get('courts/:id')
  findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update court details' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court updated successfully' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @Patch('courts/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateCourtDto: UpdateCourtDto) {
    return this.courtsService.update(id, updateCourtDto);
  }

  @ApiOperation({ summary: 'Delete a court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 200, description: 'Court deleted successfully' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @Delete('courts/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.courtsService.remove(id);
  }
}
