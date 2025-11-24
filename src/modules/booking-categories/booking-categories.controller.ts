import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BookingCategoriesService } from './booking-categories.service';
import { CreateBookingCategoryDto } from './dto/create-booking-category.dto';
import { UpdateBookingCategoryDto } from './dto/update-booking-category.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('booking-categories')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BookingCategoriesController {
  constructor(private readonly bookingCategoriesService: BookingCategoriesService) {}

  @ApiOperation({ summary: 'Create a new booking category' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiResponse({ status: 201, description: 'Booking category created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid category data' })
  @Post('clubs/:clubId/booking-categories')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(
    @Param('clubId') clubId: string,
    @Body() createBookingCategoryDto: CreateBookingCategoryDto,
  ) {
    return this.bookingCategoriesService.create(clubId, createBookingCategoryDto);
  }

  @ApiOperation({ summary: 'Get all booking categories for a club' })
  @ApiParam({ name: 'clubId', description: 'Club ID' })
  @ApiQuery({ name: 'activeOnly', required: false, description: 'Filter only active categories (true/false)' })
  @ApiResponse({ status: 200, description: 'List of booking categories' })
  @Get('clubs/:clubId/booking-categories')
  findByClub(
    @Param('clubId') clubId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.bookingCategoriesService.findByClub(clubId, activeOnly === 'true');
  }

  @ApiOperation({ summary: 'Get booking category by ID' })
  @ApiParam({ name: 'id', description: 'Booking category ID' })
  @ApiResponse({ status: 200, description: 'Category details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Get('booking-categories/:id')
  findOne(@Param('id') id: string) {
    return this.bookingCategoriesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update booking category details' })
  @ApiParam({ name: 'id', description: 'Booking category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Patch('booking-categories/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateBookingCategoryDto: UpdateBookingCategoryDto,
  ) {
    return this.bookingCategoriesService.update(id, updateBookingCategoryDto);
  }

  @ApiOperation({ summary: 'Delete a booking category' })
  @ApiParam({ name: 'id', description: 'Booking category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Delete('booking-categories/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.bookingCategoriesService.remove(id);
  }
}
