import { Controller, Get, Param } from '@nestjs/common';
import { DataStore } from '../shared/data-store';
import { Roles } from '../shared/roles.decorator';

@Controller('reports')
@Roles('admin', 'instructor')
export class ReportsController {
  constructor(private readonly data: DataStore) {}

  @Get('exams/:id')
  get(@Param('id') examId: string) {
    const exam = this.data.exams.find((candidate) => candidate.id === examId) || this.data.exams[0];
    const attempts = this.data.attempts.filter((attempt) => attempt.examId === exam.id);
    const maxScore = attempts[0]?.maxScore || 1;
    const averageScore = attempts.length
      ? Math.round((attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length / maxScore) * 100)
      : 0;
    return {
      examId: exam.id,
      examTitle: exam.title,
      totalAttempts: attempts.length,
      averageScore,
      passRate: attempts.length
        ? Math.round((attempts.filter((attempt) => attempt.score / maxScore >= 0.6).length / attempts.length) * 100)
        : 0,
      scoreDistribution: [
        { label: '0-40', count: attempts.filter((attempt) => attempt.score / maxScore <= 0.4).length },
        { label: '41-60', count: attempts.filter((attempt) => attempt.score / maxScore > 0.4 && attempt.score / maxScore <= 0.6).length },
        { label: '61-80', count: attempts.filter((attempt) => attempt.score / maxScore > 0.6 && attempt.score / maxScore <= 0.8).length },
        { label: '81-100', count: attempts.filter((attempt) => attempt.score / maxScore > 0.8).length }
      ],
      itemAnalysis: this.data.questions.map((question) => ({
        questionId: question.id,
        questionTitle: question.title,
        correctRate: 0,
        avgTimeSec: question.timeLimitSec || 0,
        discriminationIndex: 0
      }))
    };
  }
}
