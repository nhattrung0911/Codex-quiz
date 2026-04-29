import { useEffect, useState } from 'react';
import { type DashboardSummary } from '../api';
import { useApi } from '../api/ApiProvider';
import { MetricCard } from '../components/MetricCard';
import { StatusPill } from '../components/StatusPill';

export function DashboardPage() {
  const api = useApi();
  const [summary, setSummary] = useState<DashboardSummary>();
  useEffect(() => { void api.getDashboard().then(setSummary); }, [api]);

  if (!summary) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page-grid">
      <MetricCard label="Active exams" value={summary.activeExams} hint="scheduled or live" />
      <MetricCard label="Questions" value={summary.totalQuestions} hint="reusable bank items" />
      <MetricCard label="Participants today" value={summary.participantsToday} hint="live room activity" />
      <MetricCard label="Avg score" value={`${summary.averageScore}%`} hint="latest rooms" />
      <section className="card span-2">
        <h2>Best-practice blueprint</h2>
        <div className="feature-list">
          <div><StatusPill label="Moodle" tone="blue" /><p>Reusable question bank, randomization, grading review.</p></div>
          <div><StatusPill label="Kahoot" tone="green" /><p>Live code join, countdown, animated leaderboard, fast feedback.</p></div>
          <div><StatusPill label="Smart Quiz" tone="orange" /><p>JWT auth, realtime proctor events, tab switch and copy-paste detection.</p></div>
          <div><StatusPill label="QST" tone="slate" /><p>Self-hosting, data ownership, import and export friendly architecture.</p></div>
        </div>
      </section>
      <section className="card">
        <h2>Recent activity</h2>
        <div className="activity-list">
          {summary.activity.map((item) => <div key={item.id}><StatusPill label={item.at} tone={item.tone} /><span>{item.label}</span></div>)}
        </div>
      </section>
    </div>
  );
}
