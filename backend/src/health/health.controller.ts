import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'ox-game-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
