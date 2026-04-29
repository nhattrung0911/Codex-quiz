import type { QuizForgeApi } from '../api/types';
import type { QuizForgeConfig } from '../config/appConfig';
import { RealtimeClient } from './realtimeClient';
import type { ClientEvent, EventHandler, ServerEvent } from './events';

export interface RealtimeAdapter {
  subscribe(roomId: string, handler: EventHandler<ServerEvent>): () => void;
  send(event: ClientEvent): void;
  close(): void;
}

class WebSocketRealtimeAdapter implements RealtimeAdapter {
  private client?: RealtimeClient;

  constructor(private readonly config: QuizForgeConfig) {}

  subscribe(roomId: string, handler: EventHandler<ServerEvent>) {
    this.client = new RealtimeClient(this.config);
    const unsubscribe = this.client.on(handler);
    this.client.connect(roomId);
    return () => {
      unsubscribe();
      this.client?.close();
    };
  }

  send(event: ClientEvent) {
    this.client?.send(event);
  }

  close() {
    this.client?.close();
  }
}

class MockRealtimeAdapter implements RealtimeAdapter {
  private timer?: number;

  constructor(
    private readonly api: QuizForgeApi,
    private readonly examId: string
  ) {}

  subscribe(_roomId: string, handler: EventHandler<ServerEvent>) {
    const tick = async () => {
      const room = await this.api.getLiveRoom(this.examId);
      handler({ type: 'room.state', payload: room });
      handler({ type: 'leaderboard.updated', payload: { roomId: room.id, leaderboard: room.leaderboard } });
    };

    void tick();
    this.timer = window.setInterval(tick, 3500);
    return () => this.close();
  }

  send() {}

  close() {
    if (this.timer) window.clearInterval(this.timer);
  }
}

export function createRealtimeAdapter(config: QuizForgeConfig, api: QuizForgeApi, examId: string): RealtimeAdapter {
  if (config.apiMode === 'mock' || !config.wsUrl) {
    return new MockRealtimeAdapter(api, examId);
  }
  return new WebSocketRealtimeAdapter(config);
}
