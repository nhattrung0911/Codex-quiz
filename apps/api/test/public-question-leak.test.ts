import { describe, expect, it } from 'vitest';
import { DataStore } from '../src/shared/data-store';

describe('student/public question payloads', () => {
  it('do not include answerKey, isCorrect, or explanation', () => {
    const data = new DataStore();
    const exam = data.exams[0];

    const publicQuestions = data.publicQuestionsForExam(exam);

    expect(publicQuestions.length).toBeGreaterThan(0);
    for (const question of publicQuestions) {
      expect('answerKey' in question).toBe(false);
      expect('explanation' in question).toBe(false);
      for (const option of question.options) {
        expect('isCorrect' in option).toBe(false);
      }
    }
  });
});
