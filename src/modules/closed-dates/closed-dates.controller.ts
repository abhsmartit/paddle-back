import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClosedDatesService } from './closed-dates.service';
import { CreateClosedDateDto } from './dto/create-closed-date.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('Closed Dates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ClosedDatesController {
  constructor(private readonly closedDatesService: ClosedDatesService) {}

  @Post('clubs/:clubId/closed-dates')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a closed date for entire club (all courts)' })
  create(
    @Param('clubId') clubId: string,
    @Body() createClosedDateDto: CreateClosedDateDto,
    @Request() req,
  ) {
    return this.closedDatesService.create(clubId, createClosedDateDto, req.user.userId);
  }

  @Get('clubs/:clubId/closed-dates')
  @ApiOperation({ summary: 'Get all closed dates for a club' })
  findAll(
    @Param('clubId') clubId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.closedDatesService.findAll(clubId, from, to);
  }

  @Get('closed-dates/:id')
  @ApiOperation({ summary: 'Get a specific closed date' })
  findOne(@Param('id') id: string) {
    return this.closedDatesService.findOne(id);
  }

  @Delete('closed-dates/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a closed date' })
  delete(@Param('id') id: string) {
    return this.closedDatesService.delete(id);
  }
}
