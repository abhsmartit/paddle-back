import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('clubs')
@ApiBearerAuth()
@Controller('clubs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @ApiOperation({ summary: 'Create a new club' })
  @ApiResponse({ status: 201, description: 'Club created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid club data' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubsService.create(createClubDto);
  }

  @ApiOperation({ summary: 'Get all clubs' })
  @ApiResponse({ status: 200, description: 'List of all clubs' })
  @Get()
  findAll() {
    return this.clubsService.findAll();
  }

  @ApiOperation({ summary: 'Get club by ID' })
  @ApiParam({ name: 'id', description: 'Club ID' })
  @ApiResponse({ status: 200, description: 'Club details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update club details' })
  @ApiParam({ name: 'id', description: 'Club ID' })
  @ApiResponse({ status: 200, description: 'Club updated successfully' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateClubDto: UpdateClubDto) {
    return this.clubsService.update(id, updateClubDto);
  }

  @ApiOperation({ summary: 'Delete a club' })
  @ApiParam({ name: 'id', description: 'Club ID' })
  @ApiResponse({ status: 200, description: 'Club deleted successfully' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.clubsService.remove(id);
  }
}
