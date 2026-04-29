import { Controller, Get } from '@nestjs/common';
import { Public } from '../shared/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return { ok: true, service: 'quizforge-api', at: new Date().toISOString() };
  }
}
