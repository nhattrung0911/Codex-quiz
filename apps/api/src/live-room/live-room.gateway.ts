import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { DataStore } from '../shared/data-store';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  path: '/ws'
})
export class LiveRoomGateway {
  @WebSocketServer()
  server?: Server;

  constructor(private readonly data: DataStore) {}

  emitRoomState(roomId: string) {
    this.server?.to(roomId).emit('room.state', this.data.room);
  }

  @SubscribeMessage('room.join')
  join(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket) {
    client.join(payload.roomId);
    this.server?.to(payload.roomId).emit('room.state', this.data.room);
  }

  @SubscribeMessage('answer.submit')
  answerSubmitted(@MessageBody() payload: { roomId?: string; participantId?: string; questionId: string }) {
    const roomId = payload.roomId || this.data.room.id;
    this.server?.to(roomId).emit('answer.submitted', {
      roomId,
      participantId: payload.participantId,
      questionId: payload.questionId,
      answeredAt: new Date().toISOString()
    });
    this.server?.to(roomId).emit('leaderboard.updated', {
      roomId,
      leaderboard: this.data.recomputeLeaderboard()
    });
  }

  @SubscribeMessage('proctor.event')
  proctorEvent(@MessageBody() payload: Record<string, unknown>) {
    this.data.proctorEvents.unshift({ ...payload, createdAt: new Date().toISOString() });
    this.server?.to(this.data.room.id).emit('proctor.alert', payload);
  }
}
