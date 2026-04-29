import { Injectable } from '@nestjs/common';
import type { AuthoringQuestion } from '@quizforge/contracts';

@Injectable()
export class ScoringService {
  grade(
    question: AuthoringQuestion | undefined,
    input: { selectedOptionIds?: string[]; textAnswer?: string; clientScore?: number }
  ) {
    if (!question) return { isCorrect: false, scoreAwarded: 0 };
    if (question.type === 'short_answer' || question.type === 'essay') {
      const normalized = input.textAnswer?.toLowerCase() || '';
      const isCorrect = question.answerKey.some((answer) => normalized.includes(answer.toLowerCase()));
      return { isCorrect, scoreAwarded: isCorrect ? question.points : 0 };
    }
    const expected = [...question.answerKey].sort().join('|');
    const actual = [...(input.selectedOptionIds || [])].sort().join('|');
    const isCorrect = expected === actual;
    return { isCorrect, scoreAwarded: isCorrect ? question.points : 0 };
  }
}
