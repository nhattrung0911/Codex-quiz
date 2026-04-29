export type ID = string;
export type Role = 'admin' | 'instructor' | 'student' | 'proctor';
export type ApiMode = 'mock' | 'real';
export type AuthProviderMode = 'embedded' | 'host';
export type ExamStatus = 'draft' | 'scheduled' | 'live' | 'paused' | 'completed' | 'archived';
export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'essay'
  | 'matching'
  | 'ordering';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Organization {
  id: ID;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface User {
  id: ID;
  orgId: ID;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface AuthSession {
  user: User;
  organization: Organization;
  tokens: AuthTokens;
}

export interface PublicQuestionOption {
  id: ID;
  label: string;
  text: string;
}

export interface AuthoringQuestionOption extends PublicQuestionOption {
  isCorrect?: boolean;
}

interface QuestionBase<TOption extends PublicQuestionOption> {
  id: ID;
  orgId: ID;
  type: QuestionType;
  title: string;
  prompt: string;
  options: TOption[];
  tags: string[];
  difficulty: Difficulty;
  points: number;
  timeLimitSec?: number;
  mediaUrl?: string;
  updatedAt: string;
}

export interface PublicQuestion extends QuestionBase<PublicQuestionOption> {
  safeFor: 'student' | 'live';
}

export interface AuthoringQuestion extends QuestionBase<AuthoringQuestionOption> {
  answerKey: string[];
  explanation?: string;
  createdBy: ID;
}

export type Question = AuthoringQuestion;
export type QuestionOption = AuthoringQuestionOption;

export interface ExamSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAfterSubmit: boolean;
  allowReview: boolean;
  preventCopyPaste: boolean;
  tabSwitchLimit: number;
  cameraRequired: boolean;
  maxAttempts: number;
  durationMin: number;
}

export interface ExamQuestionRef {
  questionId: ID;
  order: number;
  pointsOverride?: number;
}

export interface Exam {
  id: ID;
  orgId: ID;
  title: string;
  description: string;
  status: ExamStatus;
  joinCode: string;
  startsAt?: string;
  endsAt?: string;
  settings: ExamSettings;
  questionRefs: ExamQuestionRef[];
  createdBy: ID;
  updatedAt: string;
}

export interface Participant {
  id: ID;
  userId?: ID;
  displayName: string;
  avatarColor: string;
  joinedAt: string;
  score: number;
  progress: number;
  isOnline: boolean;
  violations: number;
}

export interface LeaderboardEntry {
  participantId: ID;
  displayName: string;
  score: number;
  streak: number;
  correct: number;
  rank: number;
}

export interface LiveRoom {
  id: ID;
  examId: ID;
  joinCode: string;
  status: 'waiting' | 'question' | 'leaderboard' | 'paused' | 'ended';
  currentQuestionIndex: number;
  participants: Participant[];
  leaderboard: LeaderboardEntry[];
  startedAt?: string;
}

export interface AttemptAnswer {
  questionId: ID;
  selectedOptionIds: ID[];
  textAnswer?: string;
  answeredAt: string;
  timeSpentSec: number;
  isCorrect?: boolean;
  scoreAwarded?: number;
}

export interface Attempt {
  id: ID;
  examId: ID;
  participantId: ID;
  status: 'in_progress' | 'submitted' | 'graded';
  answers: AttemptAnswer[];
  score: number;
  maxScore: number;
  startedAt: string;
  submittedAt?: string;
}

export interface ProctorEvent {
  id: ID;
  examId: ID;
  participantId: ID;
  type: 'tab_switch' | 'blur' | 'copy_paste' | 'camera_missing' | 'face_missing' | 'network_drop';
  severity: 'low' | 'medium' | 'high';
  message: string;
  createdAt: string;
}

export interface DashboardSummary {
  activeExams: number;
  totalQuestions: number;
  participantsToday: number;
  averageScore: number;
  activity: Array<{ id: ID; label: string; at: string; tone: 'blue' | 'green' | 'orange' | 'red' }>;
}

export interface ItemAnalysis {
  questionId: ID;
  questionTitle: string;
  correctRate: number;
  avgTimeSec: number;
  discriminationIndex: number;
}

export interface ReportSummary {
  examId: ID;
  examTitle: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  itemAnalysis: ItemAnalysis[];
  scoreDistribution: Array<{ label: string; count: number }>;
}

export interface PageResult<T> {
  items: T[];
  total: number;
}

export interface QuestionFilters {
  search?: string;
  tag?: string;
  difficulty?: Difficulty | 'all';
  type?: QuestionType | 'all';
}

export interface CreateQuestionInput {
  type: QuestionType;
  title: string;
  prompt: string;
  options: AuthoringQuestionOption[];
  answerKey: string[];
  tags: string[];
  difficulty: Difficulty;
  points: number;
  explanation?: string;
}

export type UpdateQuestionInput = Partial<CreateQuestionInput>;

export interface CreateExamInput {
  title: string;
  description: string;
  settings: ExamSettings;
  questionRefs: ExamQuestionRef[];
}

export interface UpdateExamInput extends Partial<CreateExamInput> {
  status?: ExamStatus;
  startsAt?: string;
  endsAt?: string;
}

export interface SubmitAnswerInput {
  attemptId: ID;
  questionId: ID;
  selectedOptionIds: ID[];
  textAnswer?: string;
  timeSpentSec: number;
}

export interface JoinExamResponse {
  room: LiveRoom;
  participant: Participant;
  exam: Exam;
  questions: PublicQuestion[];
}

export interface QuizForgeApi {
  login(email: string, password: string): Promise<AuthSession>;
  me(): Promise<AuthSession>;
  logout(): Promise<void>;

  getDashboard(): Promise<DashboardSummary>;

  listQuestions(filters?: QuestionFilters): Promise<PageResult<AuthoringQuestion>>;
  createQuestion(input: CreateQuestionInput): Promise<AuthoringQuestion>;
  updateQuestion(id: ID, input: UpdateQuestionInput): Promise<AuthoringQuestion>;
  deleteQuestion(id: ID): Promise<void>;

  listExams(): Promise<PageResult<Exam>>;
  getExam(id: ID): Promise<Exam>;
  createExam(input: CreateExamInput): Promise<Exam>;
  updateExam(id: ID, input: UpdateExamInput): Promise<Exam>;
  publishExam(id: ID): Promise<Exam>;

  getLiveRoom(examId: ID): Promise<LiveRoom>;
  startLiveRoom(examId: ID): Promise<LiveRoom>;
  nextQuestion(examId: ID): Promise<LiveRoom>;
  pauseLiveRoom(examId: ID): Promise<LiveRoom>;
  endLiveRoom(examId: ID): Promise<LiveRoom>;

  joinByCode(joinCode: string, displayName: string): Promise<JoinExamResponse>;
  startAttempt(examId: ID, participantId: ID): Promise<Attempt>;
  submitAnswer(input: SubmitAnswerInput): Promise<Attempt>;
  finishAttempt(attemptId: ID): Promise<Attempt>;

  getReport(examId: ID): Promise<ReportSummary>;
  listProctorEvents(examId: ID): Promise<ProctorEvent[]>;
}

export const defaultExamSettings: ExamSettings = {
  shuffleQuestions: true,
  shuffleOptions: true,
  showCorrectAfterSubmit: false,
  allowReview: true,
  preventCopyPaste: true,
  tabSwitchLimit: 3,
  cameraRequired: false,
  maxAttempts: 1,
  durationMin: 30
};
