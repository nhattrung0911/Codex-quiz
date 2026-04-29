import type { QuizForgeConfig } from '../config/appConfig';
import { io, type Socket } from 'socket.io-client';
import type { ClientEvent, EventHandler, ServerEvent } from './events';

export class RealtimeClient {
  private socket?: Socket;
  private handlers = new Set<EventHandler<ServerEvent>>();

  constructor(private readonly config: QuizForgeConfig) {}

  connect(roomId: string) {
    if (!this.config.wsUrl) throw new Error('WebSocket URL is not configured.');
    this.socket = io(this.config.wsUrl, {
      path: '/ws',
      transports: ['websocket'],
      withCredentials: true
    });
    this.socket.emit('room.join', { roomId });
    this.socket.on('room.state', (payload) => this.emit({ type: 'room.state', payload }));
    this.socket.on('question.opened', (payload) => this.emit({ type: 'question.opened', payload }));
    this.socket.on('answer.submitted', (payload) => this.emit({ type: 'answer.submitted', payload }));
    this.socket.on('leaderboard.updated', (payload) => this.emit({ type: 'leaderboard.updated', payload }));
    this.socket.on('proctor.alert', (payload) => this.emit({ type: 'proctor.alert', payload }));
    this.socket.on('room.ended', (payload) => this.emit({ type: 'room.ended', payload }));
  }

  on(handler: EventHandler<ServerEvent>) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(event: ClientEvent) {
    this.socket?.emit(event.type, event.payload);
  }

  close() {
    this.socket?.disconnect();
    this.handlers.clear();
  }

  private emit(event: ServerEvent) {
    this.handlers.forEach((handler) => handler(event));
  }
}
