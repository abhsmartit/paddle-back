import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { parseISO } from 'date-fns';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('clubs/:clubId/payments')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  create(
    @Param('clubId') clubId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.create(clubId, createPaymentDto, user.userId);
  }

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

  @Get('bookings/:bookingId/payments')
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Delete('payments/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
