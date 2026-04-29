import { toPublicQuestions } from './dtoSafety';
import type {
  Attempt,
  AuthSession,
  AuthoringQuestion,
  CreateExamInput,
  CreateQuestionInput,
  DashboardSummary,
  Exam,
  ID,
  LeaderboardEntry,
  LiveRoom,
  Participant,
  ProctorEvent,
  QuestionFilters,
  QuizForgeApi,
  ReportSummary,
  SubmitAnswerInput,
  UpdateExamInput,
  UpdateQuestionInput
} from './types';
import {
  createMockExams,
  createMockProctorEvents,
  createMockQuestions,
  createMockRoom,
  mockInstructor,
  mockOrganization,
  mockStudent
} from '../fixtures/mockData';

const now = () => new Date().toISOString();
const delay = <T,>(value: T, ms = 180) =>
  new Promise<T>((resolve) => window.setTimeout(() => resolve(structuredClone(value)), ms));
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export function createMockApi(): QuizForgeApi {
  let questions: AuthoringQuestion[] = createMockQuestions();
  let exams: Exam[] = createMockExams(questions);
  let room: LiveRoom = createMockRoom();
  let attempts: Attempt[] = [];
  const proctorEvents: ProctorEvent[] = createMockProctorEvents();

  function computeLeaderboard(): LeaderboardEntry[] {
    return room.participants
      .map((p) => ({
        participantId: p.id,
        displayName: p.displayName,
        score: p.score,
        streak: Math.max(1, Math.floor(p.score / 10)),
        correct: Math.floor(p.score / 10),
        rank: 0
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  function matchQuestionFilters(q: AuthoringQuestion, filters?: QuestionFilters) {
    if (!filters) return true;
    const text = `${q.title} ${q.prompt} ${q.tags.join(' ')}`.toLowerCase();
    if (filters.search && !text.includes(filters.search.toLowerCase())) return false;
    if (filters.tag && !q.tags.includes(filters.tag)) return false;
    if (filters.difficulty && filters.difficulty !== 'all' && q.difficulty !== filters.difficulty) return false;
    if (filters.type && filters.type !== 'all' && q.type !== filters.type) return false;
    return true;
  }

  function grade(question: AuthoringQuestion | undefined, selectedOptionIds: ID[], textAnswer?: string) {
    if (!question) return { isCorrect: false, score: 0 };
    if (question.type === 'short_answer' || question.type === 'essay') {
      const ok = Boolean(textAnswer && question.answerKey.some((x) => textAnswer.toLowerCase().includes(x.toLowerCase())));
      return { isCorrect: ok, score: ok ? question.points : 0 };
    }
    const expected = [...question.answerKey].sort().join('|');
    const actual = [...selectedOptionIds].sort().join('|');
    const ok = expected === actual;
    return { isCorrect: ok, score: ok ? question.points : 0 };
  }

  room.leaderboard = computeLeaderboard();

  return {
    login(email: string) {
      const isStudent = email.includes('student');
      const user = isStudent ? { ...mockStudent, email } : { ...mockInstructor, email };
      const session: AuthSession = {
        user,
        organization: mockOrganization,
        tokens: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          expiresAt: new Date(Date.now() + 3600_000).toISOString()
        }
      };
      return delay(session);
    },
    me() {
      return delay({
        user: mockInstructor,
        organization: mockOrganization,
        tokens: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          expiresAt: new Date(Date.now() + 3600_000).toISOString()
        }
      });
    },
    logout() {
      return delay(undefined);
    },

    getDashboard() {
      const summary: DashboardSummary = {
        activeExams: exams.filter((x) => x.status === 'live' || x.status === 'scheduled').length,
        totalQuestions: questions.length,
        participantsToday: room.participants.length,
        averageScore: Math.round(
          room.participants.reduce((sum, participant) => sum + participant.score, 0) /
            Math.max(1, room.participants.length)
        ),
        activity: [
          { id: 'a1', label: `${room.joinCode} scheduled`, at: '2 min ago', tone: 'blue' },
          { id: 'a2', label: 'Question bank imported 4 items', at: '18 min ago', tone: 'green' },
          { id: 'a3', label: 'Tab switch warning detected', at: '32 min ago', tone: 'orange' }
        ]
      };
      return delay(summary);
    },

    listQuestions(filters?: QuestionFilters) {
      const items = questions.filter((q) => matchQuestionFilters(q, filters));
      return delay({ items, total: items.length });
    },
    createQuestion(input: CreateQuestionInput) {
      const q: AuthoringQuestion = { id: id('q'), orgId: mockOrganization.id, createdBy: mockInstructor.id, updatedAt: now(), ...input };
      questions = [q, ...questions];
      return delay(q);
    },
    updateQuestion(questionId: ID, input: UpdateQuestionInput) {
      questions = questions.map((q) => (q.id === questionId ? { ...q, ...input, updatedAt: now() } : q));
      return delay(questions.find((q) => q.id === questionId)!);
    },
    deleteQuestion(questionId: ID) {
      questions = questions.filter((q) => q.id !== questionId);
      return delay(undefined);
    },

    listExams() {
      return delay({ items: exams, total: exams.length });
    },
    getExam(examId: ID) {
      return delay(exams.find((x) => x.id === examId)!);
    },
    createExam(input: CreateExamInput) {
      const exam: Exam = {
        id: id('exam'),
        orgId: mockOrganization.id,
        status: 'draft',
        joinCode: `QF-${Math.floor(Math.random() * 900 + 100)}`,
        createdBy: mockInstructor.id,
        updatedAt: now(),
        ...input
      };
      exams = [exam, ...exams];
      return delay(exam);
    },
    updateExam(examId: ID, input: UpdateExamInput) {
      exams = exams.map((e) => (e.id === examId ? { ...e, ...input, updatedAt: now() } : e));
      return delay(exams.find((e) => e.id === examId)!);
    },
    publishExam(examId: ID) {
      exams = exams.map((e) => (e.id === examId ? { ...e, status: 'scheduled', updatedAt: now() } : e));
      return delay(exams.find((e) => e.id === examId)!);
    },

    getLiveRoom(examId?: ID) {
      const target = examId ? exams.find((exam) => exam.id === examId) : undefined;
      if (target) room = { ...room, examId: target.id, joinCode: target.joinCode };
      room.leaderboard = computeLeaderboard();
      return delay(room);
    },
    startLiveRoom(examId: ID) {
      room = { ...room, examId, status: 'question', startedAt: now() };
      return delay(room);
    },
    nextQuestion(examId: ID) {
      const exam = exams.find((candidate) => candidate.id === examId) || exams[0];
      room = {
        ...room,
        examId,
        status: 'question',
        currentQuestionIndex: Math.min(room.currentQuestionIndex + 1, exam.questionRefs.length - 1)
      };
      return delay(room);
    },
    pauseLiveRoom() {
      room = { ...room, status: 'paused' };
      return delay(room);
    },
    endLiveRoom() {
      room = { ...room, status: 'ended' };
      return delay(room);
    },

    joinByCode(joinCode: string, displayName: string) {
      const exam = exams.find((e) => e.joinCode.toLowerCase() === joinCode.toLowerCase()) || exams[0];
      const participant: Participant = {
        id: id('p'),
        displayName,
        avatarColor: '#22c55e',
        joinedAt: now(),
        score: 0,
        progress: 0,
        isOnline: true,
        violations: 0
      };
      room = {
        ...room,
        examId: exam.id,
        joinCode: exam.joinCode,
        participants: [...room.participants, participant],
        leaderboard: computeLeaderboard()
      };
      const examQuestions = exam.questionRefs
        .map((ref) => questions.find((q) => q.id === ref.questionId))
        .filter(Boolean) as AuthoringQuestion[];
      return delay({ room, participant, exam, questions: toPublicQuestions(examQuestions) });
    },
    startAttempt(examId: ID, participantId: ID) {
      const exam = exams.find((e) => e.id === examId)!;
      const maxScore = exam.questionRefs.reduce(
        (sum, ref) => sum + (questions.find((q) => q.id === ref.questionId)?.points || 0),
        0
      );
      const attempt: Attempt = {
        id: id('att'),
        examId,
        participantId,
        status: 'in_progress',
        answers: [],
        score: 0,
        maxScore,
        startedAt: now()
      };
      attempts = [attempt, ...attempts];
      return delay(attempt);
    },
    submitAnswer(input: SubmitAnswerInput) {
      const attempt = attempts.find((a) => a.id === input.attemptId)!;
      const q = questions.find((x) => x.id === input.questionId);
      const result = grade(q, input.selectedOptionIds, input.textAnswer);
      const answer = {
        questionId: input.questionId,
        selectedOptionIds: input.selectedOptionIds,
        textAnswer: input.textAnswer,
        timeSpentSec: input.timeSpentSec,
        answeredAt: now(),
        isCorrect: result.isCorrect,
        scoreAwarded: result.score
      };
      const nextAnswers = [...attempt.answers.filter((a) => a.questionId !== input.questionId), answer];
      const score = nextAnswers.reduce((sum, a) => sum + (a.scoreAwarded || 0), 0);
      const updated = { ...attempt, answers: nextAnswers, score };
      attempts = attempts.map((a) => (a.id === attempt.id ? updated : a));
      room.participants = room.participants.map((p) =>
        p.id === attempt.participantId
          ? { ...p, score, progress: Math.round((nextAnswers.length / Math.max(1, questions.length)) * 100) }
          : p
      );
      room.leaderboard = computeLeaderboard();
      return delay(updated);
    },
    finishAttempt(attemptId: ID) {
      attempts = attempts.map((a) => (a.id === attemptId ? { ...a, status: 'submitted', submittedAt: now() } : a));
      return delay(attempts.find((a) => a.id === attemptId)!);
    },

    getReport(examId: ID) {
      const exam = exams.find((e) => e.id === examId) || exams[0];
      const report: ReportSummary = {
        examId: exam.id,
        examTitle: exam.title,
        totalAttempts: Math.max(8, attempts.length),
        averageScore: 72,
        passRate: 86,
        scoreDistribution: [
          { label: '0-40', count: 1 },
          { label: '41-60', count: 2 },
          { label: '61-80', count: 8 },
          { label: '81-100', count: 6 }
        ],
        itemAnalysis: questions.map((q, index) => ({
          questionId: q.id,
          questionTitle: q.title,
          correctRate: Math.max(42, 92 - index * 11),
          avgTimeSec: q.timeLimitSec || 45,
          discriminationIndex: Number((0.32 + index * 0.07).toFixed(2))
        }))
      };
      return delay(report);
    },
    listProctorEvents() {
      return delay(proctorEvents);
    }
  };
}
