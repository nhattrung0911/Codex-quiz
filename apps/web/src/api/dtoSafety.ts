import type { AuthoringQuestion, PublicQuestion, PublicQuestionOption } from './types';

export function toPublicQuestion(question: AuthoringQuestion): PublicQuestion {
  return {
    id: question.id,
    orgId: question.orgId,
    type: question.type,
    title: question.title,
    prompt: question.prompt,
    options: question.options.map<PublicQuestionOption>(({ id, label, text }) => ({ id, label, text })),
    tags: [...question.tags],
    difficulty: question.difficulty,
    points: question.points,
    timeLimitSec: question.timeLimitSec,
    mediaUrl: question.mediaUrl,
    updatedAt: question.updatedAt,
    safeFor: 'student'
  };
}

export function toPublicQuestions(questions: AuthoringQuestion[]): PublicQuestion[] {
  return questions.map(toPublicQuestion);
}
