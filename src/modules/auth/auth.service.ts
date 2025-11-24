import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CustomersService } from '../customers/customers.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/schemas/user.schema';
import { addMinutes } from 'date-fns';

@Injectable()
export class AuthService {
  // In-memory OTP storage (use Redis in production)
  private otpStore = new Map<string, { otp: string; expiresAt: Date; customerData: any }>();

  constructor(
    private usersService: UsersService,
    private customersService: CustomersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user._id, 
      roles: user.roles 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    await this.usersService.updateRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const payload = { 
      email: user.email, 
      sub: user._id, 
      roles: user.roles 
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    await this.usersService.updateRefreshToken(user._id.toString(), newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  // ============ Customer Authentication Methods ============

  /**
   * Send OTP to customer phone (mock implementation)
   * In production, integrate with SMS service like Twilio, SNS, or local SMS gateway
   */
  async customerLogin(phone: string, bookingName: string) {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = addMinutes(new Date(), 5); // OTP valid for 5 minutes

    // Store OTP temporarily
    this.otpStore.set(phone, {
      otp,
      expiresAt,
      customerData: { phone, bookingName },
    });

    // TODO: Send SMS in production
    console.log(`📱 SMS sent to ${phone}: Your OTP is ${otp}`);

    return {
      message: 'OTP sent successfully',
      phone,
      expiresIn: 300, // seconds
      // For development only - remove in production
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  /**
   * Verify OTP and return customer token
   */
  async customerVerifyOtp(phone: string, otp: string, clubId: string) {
    const stored = this.otpStore.get(phone);

    if (!stored) {
      throw new UnauthorizedException('OTP not found or expired');
    }

    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(phone);
      throw new UnauthorizedException('OTP expired');
    }

    if (stored.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // OTP verified - delete it
    this.otpStore.delete(phone);

    // Find or create customer
    let customer = await this.customersService.findByPhone(phone, clubId);
    
    if (!customer) {
      // Create new customer
      customer = await this.customersService.create(clubId, {
        fullName: stored.customerData.bookingName,
        phone: stored.customerData.phone,
        email: `${phone.replace(/\+/g, '')}@customer.temp`,
      });
    }

    // Generate customer JWT token
    const payload = {
      sub: (customer as any)._id.toString(),
      phone: customer.phone,
      type: 'customer',
      clubId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '30d', // Customers stay logged in longer
    });

    return {
      accessToken,
      customer: {
        id: (customer as any)._id.toString(),
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
      },
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp(phone: string) {
    const stored = this.otpStore.get(phone);
    if (!stored) {
      throw new UnauthorizedException('No OTP request found for this phone');
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = addMinutes(new Date(), 5);

    this.otpStore.set(phone, {
      ...stored,
      otp,
      expiresAt,
    });

    console.log(`📱 SMS resent to ${phone}: Your OTP is ${otp}`);

    return {
      message: 'OTP resent successfully',
      phone,
      expiresIn: 300,
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }
}
