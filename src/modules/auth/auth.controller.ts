import { Controller, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerVerifyDto } from './dto/customer-verify.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ============ Admin Authentication ============

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.refreshTokens(req.user.userId, req.user.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req) {
    await this.authService.logout(req.user.userId);
    return { message: 'Logout successful' };
  }

  // ============ Customer Authentication ============

  @Post('customer/login')
  async customerLogin(@Body() customerLoginDto: CustomerLoginDto) {
    return this.authService.customerLogin(
      customerLoginDto.phone,
      customerLoginDto.bookingName,
    );
  }

  @Post('customer/verify')
  async customerVerify(
    @Body() customerVerifyDto: CustomerVerifyDto,
    @Query('clubId') clubId: string,
  ) {
    return this.authService.customerVerifyOtp(
      customerVerifyDto.phone,
      customerVerifyDto.otp,
      clubId,
    );
  }

  @Post('customer/resend-otp')
  async resendOtp(@Body('phone') phone: string) {
    return this.authService.resendOtp(phone);
  }
}
