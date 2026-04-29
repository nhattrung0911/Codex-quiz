import { describe, expect, it } from 'vitest';
import { StudentController } from '../src/attempts/student.controller';
import { ScoringService } from '../src/scoring/scoring.service';
import { DataStore } from '../src/shared/data-store';

describe('student attempt flow', () => {
  it('joins, starts, submits with server scoring, and finishes without leaking answer keys', () => {
    const data = new DataStore();
    const controller = new StudentController(data, new ScoringService());

    const joined = controller.join({ joinCode: 'DEMO-777', displayName: 'Student A' });
    expect(joined.questions.every((question) => !('answerKey' in question))).toBe(true);
    expect(joined.questions.every((question) => question.options.every((option) => !('isCorrect' in option)))).toBe(true);

    const attempt = controller.startAttempt(joined.exam.id, { participantId: joined.participant.id });
    const wrong = controller.submitAnswer(attempt.id, {
      questionId: 'q1',
      selectedOptionIds: ['q1a'],
      timeSpentSec: 5,
      score: 999
    });
    expect(wrong?.score).toBe(0);

    const correct = controller.submitAnswer(attempt.id, {
      questionId: 'q1',
      selectedOptionIds: ['q1b'],
      timeSpentSec: 5,
      score: 0
    });
    expect(correct?.score).toBe(10);

    const finished = controller.finish(attempt.id);
    expect(finished?.status).toBe('submitted');
  });
});
