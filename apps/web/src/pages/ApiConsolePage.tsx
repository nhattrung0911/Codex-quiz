const endpoints = [
  ['POST', '/auth/login', 'Login and get JWT tokens'],
  ['GET', '/dashboard', 'Dashboard KPIs'],
  ['GET', '/questions', 'Search question bank'],
  ['POST', '/questions', 'Create question'],
  ['PATCH', '/questions/{id}', 'Update question'],
  ['GET', '/exams', 'List exams'],
  ['POST', '/exams', 'Create exam'],
  ['POST', '/exams/{id}/publish', 'Publish exam'],
  ['GET', '/live/exams/{id}', 'Get live room state'],
  ['POST', '/live/exams/{id}/start', 'Start live exam'],
  ['POST', '/student/join', 'Join by code'],
  ['POST', '/student/attempts/{id}/answers', 'Submit answer'],
  ['GET', '/reports/exams/{id}', 'Analytics and item analysis'],
  ['GET', '/proctoring/exams/{id}/events', 'Proctor alerts']
];

const wsEvents = ['room.state', 'question.opened', 'answer.submitted', 'leaderboard.updated', 'proctor.alert', 'room.ended'];

export function ApiConsolePage() {
  return (
    <div className="page-grid">
      <section className="card span-2"><h2>REST API contract</h2><p>Build the backend to these endpoints, then switch VITE_API_MODE to real.</p><div className="api-table">{endpoints.map(([method, path, desc]) => <div key={method + path}><b>{method}</b><code>{path}</code><span>{desc}</span></div>)}</div></section>
      <section className="card"><h2>WebSocket events</h2><div className="mini-list">{wsEvents.map((event) => <div key={event}><span>event</span><b>{event}</b></div>)}</div></section>
      <section className="card full"><h2>Backend notes</h2><p>Use Postgres for persistence, Redis for room state and pub/sub, and a WebSocket gateway for live quiz orchestration. Keep scoring and answer keys authoritative on the backend. Student/live question payloads must use PublicQuestion and never include answerKey or option.isCorrect.</p></section>
    </div>
  );
}
