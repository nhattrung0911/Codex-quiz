import type { AttemptAnswer, ID, LeaderboardEntry, LiveRoom, ProctorEvent, PublicQuestion } from '../api/types';

export type ClientEvent =
  | { type: 'room.join'; payload: { roomId: ID; participantId: ID } }
  | { type: 'answer.submit'; payload: AttemptAnswer }
  | { type: 'proctor.event'; payload: ProctorEvent }
  | { type: 'heartbeat'; payload: { participantId: ID; at: string } };

export type ServerEvent =
  | { type: 'room.state'; payload: LiveRoom }
  | { type: 'question.opened'; payload: { roomId: ID; questionId: ID; index: number; closesAt: string; question?: PublicQuestion } }
  | { type: 'answer.submitted'; payload: { roomId: ID; participantId: ID; questionId: ID; answeredAt: string } }
  | { type: 'leaderboard.updated'; payload: { roomId: ID; leaderboard: LeaderboardEntry[] } }
  | { type: 'proctor.alert'; payload: ProctorEvent }
  | { type: 'room.ended'; payload: { roomId: ID; endedAt: string } };

export type EventHandler<T> = (event: T) => void;
