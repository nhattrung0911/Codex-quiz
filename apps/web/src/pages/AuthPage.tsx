import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../api/ApiProvider';
import { useAppState } from '../state/AppState';
import { Button } from '../components/Button';

export function AuthPage() {
  const api = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAppState();
  const [email, setEmail] = useState('teacher@quizforge.local');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function login() {
    setLoading(true);
    setError(undefined);
    try {
      const session = await api.login(email, password);
      setSession(session);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from || (session.user.role === 'student' ? '/student' : '/dashboard'), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Realtime quiz and exam platform</p>
        <h1>Build live exams with question banks, proctoring, analytics, and game energy.</h1>
        <p>Front-end kit ready for a real backend. Mock mode is included so your BE team can build against a stable contract.</p>
        <div className="hero-grid">
          <span>Realtime leaderboard</span><span>Question bank</span><span>Exam builder</span><span>Proctor alerts</span>
        </div>
      </section>
      <section className="card login-card">
        <h2>Sign in</h2>
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="error-text">{error}</p>}
        <Button onClick={login} disabled={loading}>{loading ? 'Signing in...' : 'Enter dashboard'}</Button>
        <p className="muted small">Use mock mode now, switch to real API later in .env.</p>
      </section>
    </main>
  );
}
