import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post('clubs/:clubId/courts')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Param('clubId') clubId: string, @Body() createCourtDto: CreateCourtDto) {
    return this.courtsService.create(clubId, createCourtDto);
  }

  @Get('clubs/:clubId/courts')
  findByClub(@Param('clubId') clubId: string) {
    return this.courtsService.findByClub(clubId);
  }

  @Get('courts/:id')
  findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  @Patch('courts/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateCourtDto: UpdateCourtDto) {
    return this.courtsService.update(id, updateCourtDto);
  }

  @Delete('courts/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.courtsService.remove(id);
  }
}
