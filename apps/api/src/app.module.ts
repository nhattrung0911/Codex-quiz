import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AccessTokenGuard } from './shared/auth.guard';
import { DataStore } from './shared/data-store';
import { ExamsController } from './exams/exams.controller';
import { HealthController } from './health/health.controller';
import { LiveRoomController } from './live-room/live-room.controller';
import { LiveRoomGateway } from './live-room/live-room.gateway';
import { ProctoringController } from './proctoring/proctoring.controller';
import { PrismaService } from './prisma/prisma.service';
import { QuestionsController } from './question-bank/questions.controller';
import { ReportsController } from './reports/reports.controller';
import { ScoringService } from './scoring/scoring.service';
import { RbacGuard } from './shared/rbac.guard';
import { StudentController } from './attempts/student.controller';
import { loadEnv } from './shared/env';

const env = loadEnv();

@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.ACCESS_TOKEN_TTL_SECONDS }
    })
  ],
  controllers: [
    AuthController,
    ExamsController,
    HealthController,
    LiveRoomController,
    ProctoringController,
    QuestionsController,
    ReportsController,
    StudentController
  ],
  providers: [
    AuthService,
    DataStore,
    LiveRoomGateway,
    PrismaService,
    ScoringService,
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RbacGuard }
  ]
})
export class AppModule {}
