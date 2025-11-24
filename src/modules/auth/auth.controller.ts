import { Controller, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerVerifyDto } from './dto/customer-verify.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ============ Admin Authentication ============

  @ApiOperation({ summary: 'Admin/Staff login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful, returns access and refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New tokens generated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.refreshTokens(req.user.userId, req.user.refreshToken);
  }

  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req) {
    await this.authService.logout(req.user.userId);
    return { message: 'Logout successful' };
  }

  // ============ Customer Authentication ============

  @ApiOperation({ summary: 'Customer login with phone number - sends OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  @ApiBody({ type: CustomerLoginDto })
  @Post('customer/login')
  async customerLogin(@Body() customerLoginDto: CustomerLoginDto) {
    return this.authService.customerLogin(
      customerLoginDto.phone,
      customerLoginDto.bookingName,
    );
  }

  @ApiOperation({ summary: 'Verify OTP and complete customer login' })
  @ApiResponse({ status: 200, description: 'OTP verified, returns access token and customer data' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @ApiBody({ type: CustomerVerifyDto })
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

  @ApiOperation({ summary: 'Resend OTP to customer phone number' })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number or no pending OTP' })
  @Post('customer/resend-otp')
  async resendOtp(@Body('phone') phone: string) {
    return this.authService.resendOtp(phone);
  }
}
