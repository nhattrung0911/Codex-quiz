import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { DataStore, type ExamRecord } from '../shared/data-store';
import { Roles } from '../shared/roles.decorator';

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

@Controller('exams')
@Roles('admin', 'instructor')
export class ExamsController {
  constructor(private readonly data: DataStore) {}

  @Get()
  list() {
    return { items: this.data.exams, total: this.data.exams.length };
  }

  @Get(':id')
  get(@Param('id') examId: string) {
    return this.data.exams.find((exam) => exam.id === examId);
  }

  @Post()
  create(@Body() body: Pick<ExamRecord, 'title' | 'description' | 'settings' | 'questionRefs'>) {
    const exam: ExamRecord = {
      ...body,
      id: id('exam'),
      orgId: this.data.organization.id,
      status: 'draft',
      joinCode: `QF-${Math.floor(Math.random() * 900 + 100)}`,
      createdBy: 'usr_teacher',
      updatedAt: now()
    };
    this.data.exams.unshift(exam);
    return exam;
  }

  @Patch(':id')
  update(@Param('id') examId: string, @Body() body: Partial<ExamRecord>) {
    this.data.exams = this.data.exams.map((exam) => (exam.id === examId ? { ...exam, ...body, updatedAt: now() } : exam));
    return this.data.exams.find((exam) => exam.id === examId);
  }

  @Post(':id/publish')
  publish(@Param('id') examId: string) {
    this.data.exams = this.data.exams.map((exam) =>
      exam.id === examId ? { ...exam, status: 'scheduled', updatedAt: now() } : exam
    );
    return this.data.exams.find((exam) => exam.id === examId);
  }
}
