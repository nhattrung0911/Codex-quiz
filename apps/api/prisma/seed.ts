import { PrismaClient, Role, ExamStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.organization.upsert({
    where: { slug: 'quizforge' },
    update: {},
    create: { id: 'org_demo', name: 'QuizForge Academy', slug: 'quizforge', plan: 'enterprise' }
  });

  await prisma.user.upsert({
    where: { email: 'teacher@quizforge.local' },
    update: {},
    create: {
      id: 'usr_teacher',
      orgId: 'org_demo',
      email: 'teacher@quizforge.local',
      name: 'Demo Instructor',
      role: Role.instructor,
      password: 'demo1234'
    }
  });

  await prisma.question.upsert({
    where: { id: 'q1' },
    update: {},
    create: {
      id: 'q1',
      orgId: 'org_demo',
      type: 'single_choice',
      title: 'Realtime protocol',
      prompt: 'Which protocol is most suitable for low-latency live quiz updates?',
      answerKey: ['q1b'],
      explanation: 'WebSocket gives full-duplex realtime communication.',
      tags: ['realtime'],
      difficulty: 'easy',
      points: 10,
      createdById: 'usr_teacher',
      options: {
        create: [
          { id: 'q1a', label: 'A', text: 'SMTP' },
          { id: 'q1b', label: 'B', text: 'WebSocket', isCorrect: true }
        ]
      }
    }
  });

  await prisma.exam.upsert({
    where: { id: 'exam1' },
    update: {},
    create: {
      id: 'exam1',
      orgId: 'org_demo',
      title: 'Realtime Online Exam Demo',
      description: 'Seeded demo exam.',
      status: ExamStatus.scheduled,
      joinCode: 'DEMO-777',
      createdById: 'usr_teacher',
      settings: {
        create: {
          shuffleQuestions: true,
          shuffleOptions: true,
          showCorrectAfterSubmit: false,
          allowReview: true,
          preventCopyPaste: true,
          tabSwitchLimit: 3,
          cameraRequired: false,
          maxAttempts: 1,
          durationMin: 12
        }
      },
      questions: {
        create: [{ questionId: 'q1', order: 1 }]
      }
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
