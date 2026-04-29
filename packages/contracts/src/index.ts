import { z } from 'zod';

export const roleSchema = z.enum(['admin', 'instructor', 'student', 'proctor']);
export type Role = z.infer<typeof roleSchema>;

export const publicQuestionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  text: z.string()
});

export const authoringQuestionOptionSchema = publicQuestionOptionSchema.extend({
  isCorrect: z.boolean().optional()
});

export const publicQuestionSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  type: z.string(),
  title: z.string(),
  prompt: z.string(),
  options: z.array(publicQuestionOptionSchema),
  tags: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.number(),
  timeLimitSec: z.number().optional(),
  mediaUrl: z.string().optional(),
  updatedAt: z.string(),
  safeFor: z.enum(['student', 'live'])
});

export const authoringQuestionSchema = publicQuestionSchema.omit({ safeFor: true }).extend({
  options: z.array(authoringQuestionOptionSchema),
  answerKey: z.array(z.string()),
  explanation: z.string().optional(),
  createdBy: z.string()
});

export type PublicQuestion = z.infer<typeof publicQuestionSchema>;
export type AuthoringQuestion = z.infer<typeof authoringQuestionSchema>;

export function toPublicQuestion(question: AuthoringQuestion): PublicQuestion {
  return {
    id: question.id,
    orgId: question.orgId,
    type: question.type,
    title: question.title,
    prompt: question.prompt,
    options: question.options.map(({ id, label, text }) => ({ id, label, text })),
    tags: question.tags,
    difficulty: question.difficulty,
    points: question.points,
    timeLimitSec: question.timeLimitSec,
    mediaUrl: question.mediaUrl,
    updatedAt: question.updatedAt,
    safeFor: 'student'
  };
}
