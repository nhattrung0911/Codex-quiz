import { describe, expect, it } from 'vitest';
import { toPublicQuestion } from './dtoSafety';
import type { AuthoringQuestion } from './types';

describe('toPublicQuestion', () => {
  it('removes answer keys and correct-option markers from student payloads', () => {
    const question: AuthoringQuestion = {
      id: 'q1',
      orgId: 'org1',
      type: 'single_choice',
      title: 'Safe DTO',
      prompt: 'Which fields are safe?',
      options: [
        { id: 'a', label: 'A', text: 'Public text' },
        { id: 'b', label: 'B', text: 'Correct text', isCorrect: true }
      ],
      answerKey: ['b'],
      explanation: 'Only show this in review/admin views.',
      tags: ['security'],
      difficulty: 'easy',
      points: 10,
      createdBy: 'u1',
      updatedAt: '2026-04-28T00:00:00.000Z'
    };

    const safe = toPublicQuestion(question);

    expect('answerKey' in safe).toBe(false);
    expect('explanation' in safe).toBe(false);
    expect(safe.options.every((option) => !('isCorrect' in option))).toBe(true);
    expect(safe.options).toEqual([
      { id: 'a', label: 'A', text: 'Public text' },
      { id: 'b', label: 'B', text: 'Correct text' }
    ]);
  });
});
