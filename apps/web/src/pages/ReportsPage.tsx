import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { type ReportSummary } from '../api';
import { useApi } from '../api/ApiProvider';
import { StatusPill } from '../components/StatusPill';
import { demoExamId } from '../fixtures/mockData';

export function ReportsPage() {
  const api = useApi();
  const { examId = demoExamId } = useParams();
  const [report, setReport] = useState<ReportSummary>();
  useEffect(() => { void api.getReport(examId).then(setReport); }, [api, examId]);
  if (!report) return <div className="loading">Loading report...</div>;

  return (
    <div className="page-grid">
      <section className="card span-2"><p className="eyebrow">Exam report</p><h2>{report.examTitle}</h2><div className="settings-grid"><div><b>{report.totalAttempts}</b><span>Attempts</span></div><div><b>{report.averageScore}%</b><span>Average</span></div><div><b>{report.passRate}%</b><span>Pass rate</span></div></div></section>
      <section className="card"><h2>Score distribution</h2><div className="bar-list">{report.scoreDistribution.map((x) => <div key={x.label}><span>{x.label}</span><div><i style={{ width: `${x.count * 10}%` }} /></div><b>{x.count}</b></div>)}</div></section>
      <section className="card full"><h2>Item analysis</h2><div className="table-list">{report.itemAnalysis.map((item) => <article className="question-row" key={item.questionId}><div><h3>{item.questionTitle}</h3><p>Avg time {item.avgTimeSec}s. Discrimination index {item.discriminationIndex}.</p></div><StatusPill label={`${item.correctRate}% correct`} tone={item.correctRate > 70 ? 'green' : 'orange'} /></article>)}</div></section>
    </div>
  );
}
