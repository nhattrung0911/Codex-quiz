import { useEffect, useMemo, useState } from 'react';
import { type AuthoringQuestion } from '../api';
import { useApi } from '../api/ApiProvider';
import { Button } from '../components/Button';
import { StatusPill } from '../components/StatusPill';

export function QuestionBankPage() {
  const api = useApi();
  const [questions, setQuestions] = useState<AuthoringQuestion[]>([]);
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => questions.filter((q) => `${q.title} ${q.prompt} ${q.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [questions, search]);

  async function load() {
    const res = await api.listQuestions({ search });
    setQuestions(res.items);
  }

  useEffect(() => {
    void api.listQuestions().then((res) => setQuestions(res.items));
  }, [api]);

  async function addSample() {
    const q = await api.createQuestion({
      type: 'single_choice', title: 'New generated MCQ', prompt: 'Which layer should own realtime room orchestration?',
      options: [
        { id: 'a', label: 'A', text: 'Frontend only' },
        { id: 'b', label: 'B', text: 'Backend realtime service', isCorrect: true },
        { id: 'c', label: 'C', text: 'Static HTML file' },
        { id: 'd', label: 'D', text: 'Email service' }
      ],
      answerKey: ['b'], tags: ['architecture'], difficulty: 'medium', points: 10, explanation: 'The backend controls authoritative state.'
    });
    setQuestions([q, ...questions]);
  }

  return (
    <section className="card full">
      <div className="section-head">
        <div><h2>Question bank</h2><p className="muted">Reusable, searchable, randomizable questions.</p></div>
        <div className="toolbar"><input placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} /><Button onClick={load} variant="secondary">Search</Button><Button onClick={addSample}>Add MCQ</Button></div>
      </div>
      <div className="table-list">
        {filtered.map((q) => (
          <article className="question-row" key={q.id}>
            <div>
              <h3>{q.title}</h3>
              <p>{q.prompt}</p>
              <div className="tag-row">{q.tags.map((tag) => <StatusPill key={tag} label={tag} tone="slate" />)}</div>
            </div>
            <div className="right-stack"><StatusPill label={q.type} tone="blue" /><b>{q.points} pts</b><span className="muted small">{q.difficulty}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}
