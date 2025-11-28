import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { CourtsModule } from './modules/courts/courts.module';
import { CoachesModule } from './modules/coaches/coaches.module';
import { CustomersModule } from './modules/customers/customers.module';
import { BookingCategoriesModule } from './modules/booking-categories/booking-categories.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ClosedDatesModule } from './modules/closed-dates/closed-dates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ClubsModule,
    CourtsModule,
    CoachesModule,
    CustomersModule,
    BookingCategoriesModule,
    BookingsModule,
    SchedulesModule,
    PaymentsModule,
    ClosedDatesModule,
  ],
})
export class AppModule {}
