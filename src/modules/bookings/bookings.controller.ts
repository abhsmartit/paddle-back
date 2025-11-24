import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { DragDropUpdateDto } from './dto/drag-drop-update.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('clubs/:clubId/bookings')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  create(
    @Param('clubId') clubId: string,
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.create(clubId, createBookingDto, user.userId);
  }

  @Get('clubs/:clubId/bookings')
  findByClub(
    @Param('clubId') clubId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.bookingsService.findByClub(clubId, start, end);
  }

  @Get('clubs/:clubId/bookings/:id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch('clubs/:clubId/bookings/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Put('clubs/:clubId/bookings/:id/drag-drop')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  dragDropUpdate(
    @Param('id') id: string,
    @Body() dragDropUpdateDto: DragDropUpdateDto,
  ) {
    return this.bookingsService.dragDropUpdate(id, dragDropUpdateDto);
  }

  @Delete('clubs/:clubId/bookings/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }

  @Post('clubs/:clubId/bookings/:id/cancel-occurrence')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  cancelOccurrence(@Param('id') id: string) {
    return this.bookingsService.cancelOccurrence(id);
  }

  @Post('clubs/:clubId/bookings/cancel-series/:seriesId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  cancelSeries(@Param('seriesId') seriesId: string) {
    return this.bookingsService.cancelSeries(seriesId);
  }
}
