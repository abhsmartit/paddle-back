import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('clubs/:clubId/customers')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  create(@Param('clubId') clubId: string, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(clubId, createCustomerDto);
  }

  @Get('clubs/:clubId/customers')
  findAll(@Query('search') search?: string) {
    return this.customersService.findAll(search);
  }

  @Get('customers/:id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch('customers/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete('customers/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
