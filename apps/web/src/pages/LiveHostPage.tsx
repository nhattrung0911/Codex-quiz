import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { type LiveRoom, type ProctorEvent } from '../api';
import { useApi } from '../api/ApiProvider';
import { Button } from '../components/Button';
import { Leaderboard } from '../components/Leaderboard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusPill } from '../components/StatusPill';
import { useAppConfig } from '../config/AppConfigContext';
import { demoExamId } from '../fixtures/mockData';
import { createRealtimeAdapter } from '../realtime/realtimeAdapter';

export function LiveHostPage() {
  const api = useApi();
  const config = useAppConfig();
  const { examId = demoExamId } = useParams();
  const [room, setRoom] = useState<LiveRoom>();
  const [events, setEvents] = useState<ProctorEvent[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function connect() {
      const [r, e] = await Promise.all([api.getLiveRoom(examId), api.listProctorEvents(examId)]);
      setRoom(r);
      setEvents(e);
      const realtime = createRealtimeAdapter(config, api, examId);
      unsubscribe = realtime.subscribe(r.id, (event) => {
        if (event.type === 'room.state') setRoom(event.payload);
        if (event.type === 'leaderboard.updated') setRoom((current) => current ? { ...current, leaderboard: event.payload.leaderboard } : current);
        if (event.type === 'proctor.alert') setEvents((current) => [event.payload, ...current]);
        if (event.type === 'room.ended') setRoom((current) => current ? { ...current, status: 'ended' } : current);
      });
    }

    void connect();
    return () => unsubscribe?.();
  }, [api, config, examId]);

  async function call(action: 'start' | 'next' | 'pause' | 'end') {
    const r = action === 'start' ? await api.startLiveRoom(examId) : action === 'next' ? await api.nextQuestion(examId) : action === 'pause' ? await api.pauseLiveRoom(examId) : await api.endLiveRoom(examId);
    setRoom(r);
  }

  if (!room) return <div className="loading">Preparing room...</div>;

  return (
    <div className="page-grid">
      <section className="card span-2 live-stage">
        <div className="section-head"><div><p className="eyebrow">Join code</p><h2>{room.joinCode}</h2></div><StatusPill label={room.status} tone="green" /></div>
        <div className="live-question-card">
          <p className="eyebrow">Question {room.currentQuestionIndex + 1}</p>
          <h3>Open realtime question for all participants</h3>
          <p>Use WebSocket room.state, question.opened, and leaderboard.updated events for real backend.</p>
        </div>
        <div className="toolbar"><Button onClick={() => call('start')}>Start</Button><Button variant="secondary" onClick={() => call('next')}>Next question</Button><Button variant="secondary" onClick={() => call('pause')}>Pause</Button><Button variant="danger" onClick={() => call('end')}>End</Button></div>
      </section>
      <section className="card"><h2>Leaderboard</h2><Leaderboard items={room.leaderboard} /></section>
      <section className="card span-2"><h2>Participants</h2>{room.participants.map((p) => <div className="participant-row" key={p.id}><span className="avatar" style={{ background: p.avatarColor }}>{p.displayName.slice(0,1)}</span><b>{p.displayName}</b><ProgressBar value={p.progress} /><span>{p.score} pts</span><StatusPill label={`${p.violations} alerts`} tone={p.violations ? 'orange' : 'green'} /></div>)}</section>
      <section className="card"><h2>Proctor feed</h2><div className="activity-list">{events.map((event) => <div key={event.id}><StatusPill label={event.severity} tone={event.severity === 'high' ? 'red' : event.severity === 'medium' ? 'orange' : 'blue'} /><span>{event.message}</span></div>)}</div></section>
    </div>
  );
}
