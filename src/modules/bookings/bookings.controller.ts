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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { DragDropUpdateDto } from './dto/drag-drop-update.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({ summary: 'Create a new booking (single, fixed, or coach)' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid booking data' })
  @ApiResponse({ status: 409, description: 'Time slot already booked' })
  @Post('clubs/:clubId/bookings')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  create(
    @Param('clubId') clubId: string,
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.create(clubId, createBookingDto, user.userId);
  }

  @ApiOperation({ summary: 'Get all bookings for a club with optional date filtering' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter bookings from this date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter bookings until this date (ISO format)' })
  @ApiResponse({ status: 200, description: 'List of bookings retrieved successfully' })
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

  @ApiOperation({ summary: 'Get a specific booking by ID' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Get('clubs/:clubId/bookings/:id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a booking' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Patch('clubs/:clubId/bookings/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @ApiOperation({ summary: 'Update booking time/court via drag-and-drop' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking rescheduled successfully' })
  @ApiResponse({ status: 409, description: 'New time slot not available' })
  @Put('clubs/:clubId/bookings/:id/drag-drop')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  dragDropUpdate(
    @Param('id') id: string,
    @Body() dragDropUpdateDto: DragDropUpdateDto,
  ) {
    return this.bookingsService.dragDropUpdate(id, dragDropUpdateDto);
  }

  @ApiOperation({ summary: 'Delete a booking' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Delete('clubs/:clubId/bookings/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }

  @ApiOperation({ summary: 'Cancel a single occurrence of a recurring booking' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'id', description: 'Booking occurrence ID' })
  @ApiResponse({ status: 200, description: 'Occurrence cancelled successfully' })
  @Post('clubs/:clubId/bookings/:id/cancel-occurrence')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  cancelOccurrence(@Param('id') id: string) {
    return this.bookingsService.cancelOccurrence(id);
  }

  @ApiOperation({ summary: 'Cancel entire recurring booking series' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiParam({ name: 'seriesId', description: 'Booking series ID' })
  @ApiResponse({ status: 200, description: 'Series cancelled successfully' })
  @Post('clubs/:clubId/bookings/cancel-series/:seriesId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  cancelSeries(@Param('seriesId') seriesId: string) {
    return this.bookingsService.cancelSeries(seriesId);
  }
}
