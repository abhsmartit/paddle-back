import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: '🎾 Padel Club API is running successfully!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('health')
  getHealthCheck() {
    return {
      status: 'ok',
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
