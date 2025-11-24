import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingCategoriesService } from './booking-categories.service';
import { CreateBookingCategoryDto } from './dto/create-booking-category.dto';
import { UpdateBookingCategoryDto } from './dto/update-booking-category.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BookingCategoriesController {
  constructor(private readonly bookingCategoriesService: BookingCategoriesService) {}

  @Post('clubs/:clubId/booking-categories')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(
    @Param('clubId') clubId: string,
    @Body() createBookingCategoryDto: CreateBookingCategoryDto,
  ) {
    return this.bookingCategoriesService.create(clubId, createBookingCategoryDto);
  }

  @Get('clubs/:clubId/booking-categories')
  findByClub(
    @Param('clubId') clubId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.bookingCategoriesService.findByClub(clubId, activeOnly === 'true');
  }

  @Get('booking-categories/:id')
  findOne(@Param('id') id: string) {
    return this.bookingCategoriesService.findOne(id);
  }

  @Patch('booking-categories/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateBookingCategoryDto: UpdateBookingCategoryDto,
  ) {
    return this.bookingCategoriesService.update(id, updateBookingCategoryDto);
  }

  @Delete('booking-categories/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.bookingCategoriesService.remove(id);
  }
}
