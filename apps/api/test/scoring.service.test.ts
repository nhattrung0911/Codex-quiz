import { describe, expect, it } from 'vitest';
import { ScoringService } from '../src/scoring/scoring.service';
import type { AuthoringQuestion } from '@quizforge/contracts';

const question: AuthoringQuestion = {
  id: 'q1',
  orgId: 'org1',
  type: 'single_choice',
  title: 'Scoring',
  prompt: 'Pick one',
  options: [
    { id: 'a', label: 'A', text: 'Wrong' },
    { id: 'b', label: 'B', text: 'Right', isCorrect: true }
  ],
  answerKey: ['b'],
  tags: ['test'],
  difficulty: 'easy',
  points: 10,
  updatedAt: '2026-04-28T00:00:00.000Z',
  createdBy: 'u1'
};

describe('ScoringService', () => {
  it('scores on the backend answer key and ignores client-provided score', () => {
    const service = new ScoringService();

    expect(service.grade(question, { selectedOptionIds: ['a'], clientScore: 999 })).toEqual({
      isCorrect: false,
      scoreAwarded: 0
    });
    expect(service.grade(question, { selectedOptionIds: ['b'], clientScore: 0 })).toEqual({
      isCorrect: true,
      scoreAwarded: 10
    });
  });
});
