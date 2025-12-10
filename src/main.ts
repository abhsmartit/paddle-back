import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

// Cache for serverless
let cachedServer;

async function createServer() {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const app = await NestFactory.create(AppModule, adapter);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Swagger Configuration (only in non-production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Padel Club API')
      .setDescription('API documentation for Padel Club booking system')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('bookings', 'Booking management')
      .addTag('clubs', 'Club management')
      .addTag('courts', 'Court management')
      .addTag('coaches', 'Coach management')
      .addTag('customers', 'Customer management')
      .addTag('booking-categories', 'Booking category management')
      .addTag('payments', 'Payment management')
      .addTag('schedules', 'Schedule management')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.init();
  cachedServer = expressApp;
  return expressApp;
}

// For local development
async function bootstrap() {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Padel Club API')
    .setDescription('API documentation for Padel Club booking system')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('bookings', 'Booking management')
    .addTag('clubs', 'Club management')
    .addTag('courts', 'Court management')
    .addTag('coaches', 'Coach management')
    .addTag('customers', 'Customer management')
    .addTag('booking-categories', 'Booking category management')
    .addTag('payments', 'Payment management')
    .addTag('schedules', 'Schedule management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;

  await app.listen(port);
  console.log(`🚀 Padel Club API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

if (require.main === module) {
  bootstrap();
}

// Export for Vercel serverless
export default async (req, res) => {
  const server = await createServer();
  return server(req, res);
};
