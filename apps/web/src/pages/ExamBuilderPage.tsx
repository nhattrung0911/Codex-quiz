import { useEffect, useState } from 'react';
import { defaultExamSettings, type AuthoringQuestion, type Exam } from '../api';
import { useApi } from '../api/ApiProvider';
import { Button } from '../components/Button';
import { StatusPill } from '../components/StatusPill';

export function ExamBuilderPage() {
  const api = useApi();
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<AuthoringQuestion[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam>();

  useEffect(() => {
    async function load() {
      const [examsRes, qRes] = await Promise.all([api.listExams(), api.listQuestions()]);
      setExams(examsRes.items); setQuestions(qRes.items); setSelectedExam(examsRes.items[0]);
    }

    void load();
  }, [api]);

  async function createExam() {
    const exam = await api.createExam({ title: 'New realtime assessment', description: 'Created from FE kit', settings: defaultExamSettings, questionRefs: questions.slice(0, 3).map((q, index) => ({ questionId: q.id, order: index + 1 })) });
    setExams([exam, ...exams]); setSelectedExam(exam);
  }

  async function publish() {
    if (!selectedExam) return;
    const exam = await api.publishExam(selectedExam.id);
    setSelectedExam(exam); setExams(exams.map((e) => e.id === exam.id ? exam : e));
  }

  return (
    <div className="builder-layout">
      <section className="card">
        <div className="section-head"><h2>Exams</h2><Button onClick={createExam}>New</Button></div>
        <div className="exam-list">
          {exams.map((exam) => <button key={exam.id} className={selectedExam?.id === exam.id ? 'exam-item active' : 'exam-item'} onClick={() => setSelectedExam(exam)}><b>{exam.title}</b><span>{exam.joinCode}</span></button>)}
        </div>
      </section>
      <section className="card span-2">
        {selectedExam && <>
          <div className="section-head"><div><h2>{selectedExam.title}</h2><p>{selectedExam.description}</p></div><StatusPill label={selectedExam.status} tone="green" /></div>
          <div className="settings-grid">
            <div><b>{selectedExam.settings.durationMin} min</b><span>Duration</span></div>
            <div><b>{selectedExam.settings.tabSwitchLimit}</b><span>Tab switch limit</span></div>
            <div><b>{selectedExam.settings.shuffleQuestions ? 'On' : 'Off'}</b><span>Question shuffle</span></div>
            <div><b>{selectedExam.settings.preventCopyPaste ? 'On' : 'Off'}</b><span>Copy paste guard</span></div>
          </div>
          <h3>Selected questions</h3>
          <div className="mini-list">{selectedExam.questionRefs.map((ref) => <div key={ref.questionId}><span>#{ref.order}</span><b>{questions.find((q) => q.id === ref.questionId)?.title || ref.questionId}</b></div>)}</div>
          <div className="toolbar"><Button onClick={publish}>Publish exam</Button><Button variant="secondary">Import QTI</Button><Button variant="secondary">Export JSON</Button></div>
        </>}
      </section>
    </div>
  );
}
