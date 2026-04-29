import { Injectable } from '@nestjs/common';
import { toPublicQuestion, type AuthoringQuestion } from '@quizforge/contracts';
import type { Role } from './roles';

export interface UserRecord {
  id: string;
  orgId: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface ExamRecord {
  id: string;
  orgId: string;
  title: string;
  description: string;
  status: 'draft' | 'scheduled' | 'live' | 'paused' | 'completed' | 'archived';
  joinCode: string;
  settings: Record<string, unknown>;
  questionRefs: Array<{ questionId: string; order: number; pointsOverride?: number }>;
  createdBy: string;
  updatedAt: string;
}

export interface AttemptRecord {
  id: string;
  examId: string;
  participantId: string;
  status: 'in_progress' | 'submitted' | 'graded';
  answers: Array<{
    questionId: string;
    selectedOptionIds: string[];
    textAnswer?: string;
    answeredAt: string;
    timeSpentSec: number;
    isCorrect?: boolean;
    scoreAwarded?: number;
  }>;
  score: number;
  maxScore: number;
  startedAt: string;
  submittedAt?: string;
}

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

@Injectable()
export class DataStore {
  readonly organization = { id: 'org_demo', name: 'QuizForge Academy', slug: 'quizforge', plan: 'enterprise' };
  readonly users: UserRecord[] = [
    { id: 'usr_admin', orgId: 'org_demo', name: 'Demo Admin', email: 'admin@quizforge.local', password: 'demo1234', role: 'admin' },
    { id: 'usr_teacher', orgId: 'org_demo', name: 'Demo Instructor', email: 'teacher@quizforge.local', password: 'demo1234', role: 'instructor' },
    { id: 'usr_student', orgId: 'org_demo', name: 'Demo Student', email: 'student@quizforge.local', password: 'demo1234', role: 'student' }
  ];

  questions: AuthoringQuestion[] = [
    {
      id: 'q1',
      orgId: 'org_demo',
      type: 'single_choice',
      title: 'Realtime protocol',
      prompt: 'Which protocol is most suitable for low-latency live quiz updates?',
      options: [
        { id: 'q1a', label: 'A', text: 'SMTP' },
        { id: 'q1b', label: 'B', text: 'WebSocket', isCorrect: true }
      ],
      answerKey: ['q1b'],
      explanation: 'WebSocket gives full-duplex realtime communication.',
      tags: ['realtime'],
      difficulty: 'easy',
      points: 10,
      updatedAt: now(),
      createdBy: 'usr_teacher'
    },
    {
      id: 'q2',
      orgId: 'org_demo',
      type: 'multiple_choice',
      title: 'Anti-cheat controls',
      prompt: 'Which controls are useful for online exams?',
      options: [
        { id: 'q2a', label: 'A', text: 'Tab switch monitoring', isCorrect: true },
        { id: 'q2b', label: 'B', text: 'Copy paste prevention', isCorrect: true },
        { id: 'q2c', label: 'C', text: 'Disabling CSS' }
      ],
      answerKey: ['q2a', 'q2b'],
      tags: ['security'],
      difficulty: 'medium',
      points: 15,
      updatedAt: now(),
      createdBy: 'usr_teacher'
    }
  ];

  exams: ExamRecord[] = [
    {
      id: 'exam1',
      orgId: 'org_demo',
      title: 'Realtime Online Exam Demo',
      description: 'Production foundation demo exam.',
      status: 'scheduled',
      joinCode: 'DEMO-777',
      settings: { shuffleQuestions: true, shuffleOptions: true, durationMin: 12 },
      questionRefs: [
        { questionId: 'q1', order: 1 },
        { questionId: 'q2', order: 2 }
      ],
      createdBy: 'usr_teacher',
      updatedAt: now()
    }
  ];

  room = {
    id: 'room1',
    examId: 'exam1',
    joinCode: 'DEMO-777',
    status: 'waiting',
    currentQuestionIndex: 0,
    participants: [] as Array<{
      id: string;
      displayName: string;
      avatarColor: string;
      joinedAt: string;
      score: number;
      progress: number;
      isOnline: boolean;
      violations: number;
    }>,
    leaderboard: [] as Array<{ participantId: string; displayName: string; score: number; streak: number; correct: number; rank: number }>
  };

  attempts: AttemptRecord[] = [];
  proctorEvents: Array<Record<string, unknown>> = [];

  findUser(email: string) {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  createParticipant(displayName: string) {
    const participant = {
      id: id('p'),
      displayName,
      avatarColor: '#22c55e',
      joinedAt: now(),
      score: 0,
      progress: 0,
      isOnline: true,
      violations: 0
    };
    this.room.participants.push(participant);
    return participant;
  }

  publicQuestionsForExam(exam: ExamRecord) {
    const questions = exam.questionRefs
      .sort((a, b) => a.order - b.order)
      .map((ref) => this.questions.find((question) => question.id === ref.questionId))
      .filter(Boolean) as AuthoringQuestion[];
    return questions.map(toPublicQuestion);
  }

  recomputeLeaderboard() {
    this.room.leaderboard = this.room.participants
      .map((participant) => ({
        participantId: participant.id,
        displayName: participant.displayName,
        score: participant.score,
        streak: Math.max(1, Math.floor(participant.score / 10)),
        correct: Math.floor(participant.score / 10),
        rank: 0
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    return this.room.leaderboard;
  }
}
