import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DataStore } from '../shared/data-store';
import { Public } from '../shared/public.decorator';
import { Roles } from '../shared/roles.decorator';

@Controller('proctoring')
export class ProctoringController {
  constructor(private readonly data: DataStore) {}

  @Get('exams/:id/events')
  @Roles('admin', 'instructor', 'proctor')
  list(@Param('id') examId: string) {
    return this.data.proctorEvents.filter((event) => event.examId === examId);
  }

  @Public()
  @Post('events')
  create(@Body() body: Record<string, unknown>) {
    const event = {
      id: `pe_${Math.random().toString(36).slice(2, 10)}`,
      ...body,
      createdAt: new Date().toISOString()
    };
    this.data.proctorEvents.unshift(event);
    return event;
  }
}
