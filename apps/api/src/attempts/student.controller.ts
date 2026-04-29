import { Body, Controller, Param, Post } from '@nestjs/common';
import { DataStore, type AttemptRecord } from '../shared/data-store';
import { Public } from '../shared/public.decorator';
import { ScoringService } from '../scoring/scoring.service';

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

@Controller('student')
export class StudentController {
  constructor(
    private readonly data: DataStore,
    private readonly scoring: ScoringService
  ) {}

  @Public()
  @Post('join')
  join(@Body() body: { joinCode: string; displayName: string }) {
    const exam = this.data.exams.find((candidate) => candidate.joinCode.toLowerCase() === body.joinCode.toLowerCase()) || this.data.exams[0];
    const participant = this.data.createParticipant(body.displayName);
    this.data.room.examId = exam.id;
    this.data.room.joinCode = exam.joinCode;
    this.data.recomputeLeaderboard();
    return { room: this.data.room, participant, exam, questions: this.data.publicQuestionsForExam(exam) };
  }

  @Public()
  @Post('exams/:id/attempts')
  startAttempt(@Param('id') examId: string, @Body() body: { participantId: string }) {
    const exam = this.data.exams.find((candidate) => candidate.id === examId) || this.data.exams[0];
    const maxScore = exam.questionRefs.reduce((sum, ref) => {
      return sum + (this.data.questions.find((question) => question.id === ref.questionId)?.points || 0);
    }, 0);
    const attempt: AttemptRecord = {
      id: id('att'),
      examId,
      participantId: body.participantId,
      status: 'in_progress',
      answers: [],
      score: 0,
      maxScore,
      startedAt: now()
    };
    this.data.attempts.unshift(attempt);
    return attempt;
  }

  @Public()
  @Post('attempts/:id/answers')
  submitAnswer(
    @Param('id') attemptId: string,
    @Body() body: { questionId: string; selectedOptionIds?: string[]; textAnswer?: string; timeSpentSec?: number; score?: number }
  ) {
    const attempt = this.data.attempts.find((candidate) => candidate.id === attemptId);
    if (!attempt) return undefined;
    const question = this.data.questions.find((candidate) => candidate.id === body.questionId);
    const result = this.scoring.grade(question, body);
    const answer = {
      questionId: body.questionId,
      selectedOptionIds: body.selectedOptionIds || [],
      textAnswer: body.textAnswer,
      answeredAt: now(),
      timeSpentSec: body.timeSpentSec || 0,
      isCorrect: result.isCorrect,
      scoreAwarded: result.scoreAwarded
    };
    attempt.answers = [...attempt.answers.filter((candidate) => candidate.questionId !== body.questionId), answer];
    attempt.score = attempt.answers.reduce((sum, candidate) => sum + (candidate.scoreAwarded || 0), 0);
    const participant = this.data.room.participants.find((candidate) => candidate.id === attempt.participantId);
    if (participant) {
      participant.score = attempt.score;
      participant.progress = Math.round((attempt.answers.length / Math.max(1, this.data.questions.length)) * 100);
    }
    this.data.recomputeLeaderboard();
    return attempt;
  }

  @Public()
  @Post('attempts/:id/finish')
  finish(@Param('id') attemptId: string) {
    const attempt = this.data.attempts.find((candidate) => candidate.id === attemptId);
    if (!attempt) return undefined;
    attempt.status = 'submitted';
    attempt.submittedAt = now();
    return attempt;
  }
}
