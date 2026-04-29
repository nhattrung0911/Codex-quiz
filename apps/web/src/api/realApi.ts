import type { QuizForgeConfig } from '../config/appConfig';
import { ApiError } from './ApiError';
import type {
  Attempt,
  AuthSession,
  AuthoringQuestion,
  CreateExamInput,
  CreateQuestionInput,
  DashboardSummary,
  Exam,
  ID,
  JoinExamResponse,
  LiveRoom,
  PageResult,
  ProctorEvent,
  QuestionFilters,
  QuizForgeApi,
  ReportSummary,
  SubmitAnswerInput,
  UpdateExamInput,
  UpdateQuestionInput
} from './types';

type TokenReader = () => string | undefined;

async function parseError(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = (await res.json().catch(() => undefined)) as { message?: string; detail?: string } | undefined;
    return body?.detail || body?.message || `API error ${res.status}`;
  }
  return (await res.text()) || `API error ${res.status}`;
}

async function request<T>(
  config: QuizForgeConfig,
  getToken: TokenReader,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = config.accessToken || getToken();
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    credentials: config.authProviderMode === 'host' ? 'include' : init.credentials,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {})
    }
  });

  if (res.status === 401) config.onUnauthorized?.();

  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const toQuery = (filters?: QuestionFilters) => {
  if (!filters) return '';
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== 'all') qs.set(k, String(v));
  });
  const value = qs.toString();
  return value ? `?${value}` : '';
};

export function createRealApi(config: QuizForgeConfig, getToken: TokenReader): QuizForgeApi {
  const call = <T>(path: string, init?: RequestInit) => request<T>(config, getToken, path, init);

  return {
    async login(email: string, password: string) {
      return call<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },
    me: () => call<AuthSession>('/auth/me'),
    logout: () => call<void>('/auth/logout', { method: 'POST' }),

    getDashboard: () => call<DashboardSummary>('/dashboard'),

    listQuestions: (filters?: QuestionFilters) => call<PageResult<AuthoringQuestion>>(`/questions${toQuery(filters)}`),
    createQuestion: (input: CreateQuestionInput) =>
      call<AuthoringQuestion>('/questions', { method: 'POST', body: JSON.stringify(input) }),
    updateQuestion: (id: ID, input: UpdateQuestionInput) =>
      call<AuthoringQuestion>(`/questions/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    deleteQuestion: (id: ID) => call<void>(`/questions/${id}`, { method: 'DELETE' }),

    listExams: () => call<PageResult<Exam>>('/exams'),
    getExam: (id: ID) => call<Exam>(`/exams/${id}`),
    createExam: (input: CreateExamInput) => call<Exam>('/exams', { method: 'POST', body: JSON.stringify(input) }),
    updateExam: (id: ID, input: UpdateExamInput) =>
      call<Exam>(`/exams/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    publishExam: (id: ID) => call<Exam>(`/exams/${id}/publish`, { method: 'POST' }),

    getLiveRoom: (examId: ID) => call<LiveRoom>(`/live/exams/${examId}`),
    startLiveRoom: (examId: ID) => call<LiveRoom>(`/live/exams/${examId}/start`, { method: 'POST' }),
    nextQuestion: (examId: ID) => call<LiveRoom>(`/live/exams/${examId}/next`, { method: 'POST' }),
    pauseLiveRoom: (examId: ID) => call<LiveRoom>(`/live/exams/${examId}/pause`, { method: 'POST' }),
    endLiveRoom: (examId: ID) => call<LiveRoom>(`/live/exams/${examId}/end`, { method: 'POST' }),

    joinByCode: (joinCode: string, displayName: string) =>
      call<JoinExamResponse>('/student/join', {
        method: 'POST',
        body: JSON.stringify({ joinCode, displayName })
      }),
    startAttempt: (examId: ID, participantId: ID) =>
      call<Attempt>(`/student/exams/${examId}/attempts`, {
        method: 'POST',
        body: JSON.stringify({ participantId })
      }),
    submitAnswer: (input: SubmitAnswerInput) =>
      call<Attempt>(`/student/attempts/${input.attemptId}/answers`, {
        method: 'POST',
        body: JSON.stringify(input)
      }),
    finishAttempt: (attemptId: ID) => call<Attempt>(`/student/attempts/${attemptId}/finish`, { method: 'POST' }),

    getReport: (examId: ID) => call<ReportSummary>(`/reports/exams/${examId}`),
    listProctorEvents: (examId: ID) => call<ProctorEvent[]>(`/proctoring/exams/${examId}/events`)
  };
}
