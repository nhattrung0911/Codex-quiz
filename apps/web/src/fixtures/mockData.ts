import { defaultExamSettings, type AuthoringQuestion, type Exam, type LiveRoom, type ProctorEvent } from '../api/types';

export const mockOrganization = {
  id: 'org_demo',
  name: 'QuizForge Academy',
  slug: 'quizforge',
  plan: 'enterprise' as const
};

export const mockInstructor = {
  id: 'usr_teacher',
  orgId: mockOrganization.id,
  name: 'Demo Instructor',
  email: 'teacher@quizforge.local',
  role: 'instructor' as const
};

export const mockStudent = {
  id: 'usr_student',
  orgId: mockOrganization.id,
  name: 'Demo Student',
  email: 'student@quizforge.local',
  role: 'student' as const
};

export const demoExamId = 'exam1';
export const demoJoinCode = 'DEMO-777';

const now = () => new Date().toISOString();

export function createMockQuestions(): AuthoringQuestion[] {
  return [
    {
      id: 'q1',
      orgId: mockOrganization.id,
      type: 'single_choice',
      title: 'Realtime protocol',
      prompt: 'Which protocol is most suitable for low-latency live quiz updates?',
      options: [
        { id: 'q1a', label: 'A', text: 'SMTP' },
        { id: 'q1b', label: 'B', text: 'WebSocket', isCorrect: true },
        { id: 'q1c', label: 'C', text: 'FTP' },
        { id: 'q1d', label: 'D', text: 'POP3' }
      ],
      answerKey: ['q1b'],
      explanation: 'WebSocket gives full-duplex realtime communication.',
      tags: ['realtime', 'architecture'],
      difficulty: 'easy',
      points: 10,
      timeLimitSec: 45,
      createdBy: mockInstructor.id,
      updatedAt: now()
    },
    {
      id: 'q2',
      orgId: mockOrganization.id,
      type: 'multiple_choice',
      title: 'Exam anti-cheat controls',
      prompt: 'Which controls are commonly used in online exam proctoring?',
      options: [
        { id: 'q2a', label: 'A', text: 'Tab switch monitoring', isCorrect: true },
        { id: 'q2b', label: 'B', text: 'Copy paste prevention', isCorrect: true },
        { id: 'q2c', label: 'C', text: 'Randomizing options', isCorrect: true },
        { id: 'q2d', label: 'D', text: 'Disabling all CSS' }
      ],
      answerKey: ['q2a', 'q2b', 'q2c'],
      explanation: 'These reduce cheating opportunities without blocking legitimate users.',
      tags: ['security', 'proctoring'],
      difficulty: 'medium',
      points: 15,
      timeLimitSec: 60,
      createdBy: mockInstructor.id,
      updatedAt: now()
    },
    {
      id: 'q3',
      orgId: mockOrganization.id,
      type: 'true_false',
      title: 'Question bank reuse',
      prompt: 'A question bank should allow reuse of questions across multiple exams.',
      options: [
        { id: 'q3a', label: 'True', text: 'True', isCorrect: true },
        { id: 'q3b', label: 'False', text: 'False' }
      ],
      answerKey: ['q3a'],
      tags: ['question-bank'],
      difficulty: 'easy',
      points: 5,
      timeLimitSec: 30,
      createdBy: mockInstructor.id,
      updatedAt: now()
    },
    {
      id: 'q4',
      orgId: mockOrganization.id,
      type: 'short_answer',
      title: 'Open standard',
      prompt: 'Name one common standard format for importing and exporting quiz questions.',
      options: [],
      answerKey: ['IMS QTI'],
      tags: ['interoperability'],
      difficulty: 'hard',
      points: 20,
      timeLimitSec: 90,
      createdBy: mockInstructor.id,
      updatedAt: now()
    }
  ];
}

export function createMockExams(questions: AuthoringQuestion[]): Exam[] {
  return [
    {
      id: demoExamId,
      orgId: mockOrganization.id,
      title: 'Realtime Online Exam Demo',
      description: 'A polished live quiz inspired by Kahoot, Moodle, and Smart Quiz System.',
      status: 'scheduled',
      joinCode: demoJoinCode,
      settings: { ...defaultExamSettings, durationMin: 12, cameraRequired: false },
      questionRefs: questions.map((q, index) => ({ questionId: q.id, order: index + 1 })),
      createdBy: mockInstructor.id,
      updatedAt: now()
    }
  ];
}

export function createMockRoom(): LiveRoom {
  return {
    id: 'room1',
    examId: demoExamId,
    joinCode: demoJoinCode,
    status: 'waiting',
    currentQuestionIndex: 0,
    participants: [
      {
        id: 'p1',
        displayName: 'Linh',
        avatarColor: '#7c3aed',
        joinedAt: now(),
        score: 25,
        progress: 80,
        isOnline: true,
        violations: 0
      },
      {
        id: 'p2',
        displayName: 'Minh',
        avatarColor: '#0ea5e9',
        joinedAt: now(),
        score: 20,
        progress: 70,
        isOnline: true,
        violations: 1
      },
      {
        id: 'p3',
        displayName: 'An',
        avatarColor: '#f97316',
        joinedAt: now(),
        score: 15,
        progress: 55,
        isOnline: false,
        violations: 2
      }
    ],
    leaderboard: []
  };
}

export function createMockProctorEvents(): ProctorEvent[] {
  return [
    {
      id: 'pe1',
      examId: demoExamId,
      participantId: 'p2',
      type: 'tab_switch',
      severity: 'medium',
      message: 'Participant switched tab once.',
      createdAt: now()
    },
    {
      id: 'pe2',
      examId: demoExamId,
      participantId: 'p3',
      type: 'blur',
      severity: 'low',
      message: 'Window lost focus for 8 seconds.',
      createdAt: now()
    }
  ];
}
