import { describe, expect, it } from 'vitest';
import { toPublicQuestion, type AuthoringQuestion } from '../src/index';

describe('contracts sanitization', () => {
  it('does not expose answer fields in PublicQuestion', () => {
    const question: AuthoringQuestion = {
      id: 'q1',
      orgId: 'org1',
      type: 'single_choice',
      title: 'Safe',
      prompt: 'Safe?',
      options: [{ id: 'a', label: 'A', text: 'Answer', isCorrect: true }],
      answerKey: ['a'],
      explanation: 'Hidden',
      tags: ['security'],
      difficulty: 'easy',
      points: 10,
      updatedAt: '2026-04-28T00:00:00.000Z',
      createdBy: 'u1'
    };

    const safe = toPublicQuestion(question);

    expect('answerKey' in safe).toBe(false);
    expect('explanation' in safe).toBe(false);
    expect(safe.options).toEqual([{ id: 'a', label: 'A', text: 'Answer' }]);
  });
});
