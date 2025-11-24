import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { parseISO } from 'date-fns';

@ApiTags('payments')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create a payment for a booking' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @Post('clubs/:clubId/payments')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  create(
    @Param('clubId') clubId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.create(clubId, createPaymentDto, user.userId);
  }

  @ApiOperation({ summary: 'Get all payments for a club with optional date filtering' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter from this date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter until this date (ISO format)' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  @Get('clubs/:clubId/payments')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByClub(
    @Param('clubId') clubId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? parseISO(startDate) : undefined;
    const end = endDate ? parseISO(endDate) : undefined;
    return this.paymentsService.findByClub(clubId, start, end);
  }

  @ApiOperation({ summary: 'Get all payments for a specific booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'List of payments for the booking' })
  @Get('bookings/:bookingId/payments')
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Delete('payments/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
