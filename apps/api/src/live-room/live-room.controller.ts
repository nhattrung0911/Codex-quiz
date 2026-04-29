import { Controller, Get, Param, Post } from '@nestjs/common';
import { DataStore } from '../shared/data-store';
import { Roles } from '../shared/roles.decorator';

@Controller('live/exams/:id')
@Roles('admin', 'instructor', 'proctor')
export class LiveRoomController {
  constructor(private readonly data: DataStore) {}

  @Get()
  get(@Param('id') examId: string) {
    this.data.room.examId = examId;
    this.data.recomputeLeaderboard();
    return this.data.room;
  }

  @Post('start')
  start(@Param('id') examId: string) {
    this.data.room.examId = examId;
    this.data.room.status = 'question';
    this.data.recomputeLeaderboard();
    return this.data.room;
  }

  @Post('next')
  next(@Param('id') examId: string) {
    const exam = this.data.exams.find((candidate) => candidate.id === examId) || this.data.exams[0];
    this.data.room.currentQuestionIndex = Math.min(this.data.room.currentQuestionIndex + 1, exam.questionRefs.length - 1);
    this.data.room.status = 'question';
    return this.data.room;
  }

  @Post('pause')
  pause() {
    this.data.room.status = 'paused';
    return this.data.room;
  }

  @Post('end')
  end() {
    this.data.room.status = 'ended';
    return this.data.room;
  }
}
