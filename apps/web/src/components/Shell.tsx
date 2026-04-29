import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../api/ApiProvider';
import { useAppConfig } from '../config/AppConfigContext';
import { useAppState } from '../state/AppState';
import { Button } from './Button';

const nav: Array<{ to: string; label: string; icon: string; roles: string[] }> = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid', roles: ['admin', 'instructor', 'proctor'] },
  { to: '/questions', label: 'Question Bank', icon: 'bank', roles: ['admin', 'instructor'] },
  { to: '/builder', label: 'Exam Builder', icon: 'build', roles: ['admin', 'instructor'] },
  { to: '/live', label: 'Live Host', icon: 'live', roles: ['admin', 'instructor', 'proctor'] },
  { to: '/student', label: 'Student Mode', icon: 'play', roles: ['admin', 'instructor', 'student'] },
  { to: '/reports', label: 'Reports', icon: 'chart', roles: ['admin', 'instructor'] },
  { to: '/api', label: 'API Console', icon: 'api', roles: ['admin', 'instructor'] }
];

function titleForPath(pathname: string) {
  return nav.find((item) => pathname.startsWith(item.to))?.label || 'QuizForge';
}

export function Shell() {
  const api = useApi();
  const config = useAppConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setSession } = useAppState();
  const visibleNav = nav.filter((item) => !session || item.roles.includes(session.user.role));

  async function logout() {
    await api.logout();
    setSession(undefined);
    navigate('/login', { replace: true });
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">QF</div>
          <div>
            <b>QuizForge</b>
            <span>Embeddable exam FE</span>
          </div>
        </div>
        <nav>
          {visibleNav.map((item) => (
            <NavLink className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} key={item.to} to={item.to}>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{session?.organization.name || 'QuizForge Academy'}</p>
            <h1>{titleForPath(location.pathname)}</h1>
          </div>
          <div className="topbar-actions">
            <span className="environment">{config.apiMode === 'real' ? 'REAL API' : 'MOCK API'}</span>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
