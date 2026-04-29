import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { type Attempt, type Exam, type Participant, type PublicQuestion } from '../api';
import { useApi } from '../api/ApiProvider';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { StatusPill } from '../components/StatusPill';
import { useAppConfig } from '../config/AppConfigContext';
import { demoJoinCode } from '../fixtures/mockData';
import { createRealtimeAdapter, type RealtimeAdapter } from '../realtime/realtimeAdapter';

export function StudentExamPage() {
  const api = useApi();
  const config = useAppConfig();
  const params = useParams();
  const realtimeRef = useRef<RealtimeAdapter | null>(null);
  const [joinCode, setJoinCode] = useState(params.joinCode || demoJoinCode);
  const [displayName, setDisplayName] = useState('Guest Player');
  const [participant, setParticipant] = useState<Participant>();
  const [exam, setExam] = useState<Exam>();
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [attempt, setAttempt] = useState<Attempt>();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const current = questions[index];
  const progress = useMemo(() => questions.length ? ((index + 1) / questions.length) * 100 : 0, [index, questions.length]);

  async function join() {
    const res = await api.joinByCode(joinCode, displayName);
    setParticipant(res.participant); setExam(res.exam); setQuestions(res.questions);
    const realtime = createRealtimeAdapter(config, api, res.exam.id);
    realtime.subscribe(res.room.id, (event) => {
      if (event.type === 'question.opened') setIndex(event.payload.index);
      if (event.type === 'room.ended') setAttempt((current) => current ? { ...current, status: 'submitted' } : current);
    });
    realtime.send({ type: 'room.join', payload: { roomId: res.room.id, participantId: res.participant.id } });
    realtimeRef.current = realtime;
    const att = await api.startAttempt(res.exam.id, res.participant.id);
    setAttempt(att);
  }

  useEffect(() => () => realtimeRef.current?.close(), []);

  function toggle(optionId: string) {
    if (!current) return;
    setSelected(current.type === 'multiple_choice' ? (selected.includes(optionId) ? selected.filter((x) => x !== optionId) : [...selected, optionId]) : [optionId]);
  }

  async function submit() {
    if (!attempt || !current) return;
    const updated = await api.submitAnswer({
      attemptId: attempt.id,
      questionId: current.id,
      selectedOptionIds: selected,
      textAnswer: current.options.length === 0 ? textAnswer : undefined,
      timeSpentSec: 12
    });
    setAttempt(updated); setSelected([]); setTextAnswer('');
    const submitted = updated.answers.find((answer) => answer.questionId === current.id);
    if (submitted && participant) {
      realtimeRef.current?.send({ type: 'answer.submit', payload: submitted });
      realtimeRef.current?.send({
        type: 'heartbeat',
        payload: { participantId: participant.id, at: new Date().toISOString() }
      });
    }
    if (index < questions.length - 1) setIndex(index + 1); else setAttempt(await api.finishAttempt(attempt.id));
  }

  if (!participant || !exam) {
    return <section className="card join-card"><h2>Join live exam</h2><label>Join code<input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} /></label><label>Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></label><Button onClick={join}>Join and start</Button></section>;
  }

  if (attempt?.status === 'submitted') {
    return <section className="card result-card"><StatusPill label="submitted" tone="green" /><h2>Your score: {attempt.score}/{attempt.maxScore}</h2><p>Result is ready. Backend can add certificates, review mode, or manual grading here.</p></section>;
  }

  return (
    <section className="student-exam">
      <div className="card exam-header"><div><p className="eyebrow">{exam.title}</p><h2>{current?.title}</h2></div><div><b>{index + 1}/{questions.length}</b><ProgressBar value={progress} /></div></div>
      <article className="card question-card">
        <p>{current?.prompt}</p>
        <div className="option-grid">
          {current?.options.map((option) => <button key={option.id} className={selected.includes(option.id) ? 'option selected' : 'option'} onClick={() => toggle(option.id)}><b>{option.label}</b><span>{option.text}</span></button>)}
        </div>
        {current?.options.length === 0 && <textarea placeholder="Type your answer here" value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} />}
        <div className="toolbar"><Button onClick={submit}>Submit answer</Button><Button variant="secondary">Flag for review</Button></div>
      </article>
    </section>
  );
}
