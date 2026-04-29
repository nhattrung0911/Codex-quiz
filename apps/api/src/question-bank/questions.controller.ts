import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { AuthoringQuestion } from '@quizforge/contracts';
import { DataStore } from '../shared/data-store';
import { Roles } from '../shared/roles.decorator';

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

@Controller('questions')
@Roles('admin', 'instructor')
export class QuestionsController {
  constructor(private readonly data: DataStore) {}

  @Get()
  list(@Query() query: { search?: string; tag?: string; difficulty?: string; type?: string }) {
    const items = this.data.questions.filter((question) => {
      const text = `${question.title} ${question.prompt} ${question.tags.join(' ')}`.toLowerCase();
      if (query.search && !text.includes(query.search.toLowerCase())) return false;
      if (query.tag && !question.tags.includes(query.tag)) return false;
      if (query.difficulty && query.difficulty !== 'all' && question.difficulty !== query.difficulty) return false;
      if (query.type && query.type !== 'all' && question.type !== query.type) return false;
      return true;
    });
    return { items, total: items.length };
  }

  @Post()
  create(@Body() body: Omit<AuthoringQuestion, 'id' | 'orgId' | 'createdBy' | 'updatedAt'>) {
    const question: AuthoringQuestion = {
      ...body,
      id: id('q'),
      orgId: this.data.organization.id,
      createdBy: 'usr_teacher',
      updatedAt: now()
    };
    this.data.questions.unshift(question);
    return question;
  }

  @Patch(':id')
  update(@Param('id') questionId: string, @Body() body: Partial<AuthoringQuestion>) {
    this.data.questions = this.data.questions.map((question) =>
      question.id === questionId ? { ...question, ...body, updatedAt: now() } : question
    );
    return this.data.questions.find((question) => question.id === questionId);
  }

  @Delete(':id')
  delete(@Param('id') questionId: string) {
    this.data.questions = this.data.questions.filter((question) => question.id !== questionId);
  }
}
