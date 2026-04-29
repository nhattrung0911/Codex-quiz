import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ApiProvider } from './api/ApiProvider';
import type { AuthSession, Role } from './api/types';
import { Shell } from './components/Shell';
import { AppConfigProvider, useAppConfig } from './config/AppConfigContext';
import type { QuizForgeConfigInput } from './config/appConfig';
import { ApiConsolePage } from './pages/ApiConsolePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExamBuilderPage } from './pages/ExamBuilderPage';
import { LiveHostPage } from './pages/LiveHostPage';
import { NotFoundPage, UnauthorizedPage } from './pages/SystemPages';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { ReportsPage } from './pages/ReportsPage';
import { StudentExamPage } from './pages/StudentExamPage';
import { AppStateProvider, useAppState } from './state/AppState';

export interface QuizForgeAppProps {
  config?: QuizForgeConfigInput;
  initialSession?: AuthSession;
}

function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const location = useLocation();
  const { session } = useAppState();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!roles.includes(session.user.role)) {
    return <UnauthorizedPage />;
  }

  return children;
}

function AppRoutes() {
  const { session } = useAppState();
  const defaultPath = session?.user.role === 'student' ? '/student' : '/dashboard';

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        element={
          <RequireRole roles={['admin', 'instructor', 'student', 'proctor']}>
            <Shell />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to={defaultPath} replace />} />
        <Route path="/dashboard" element={<RequireRole roles={['admin', 'instructor', 'proctor']}><DashboardPage /></RequireRole>} />
        <Route path="/questions" element={<RequireRole roles={['admin', 'instructor']}><QuestionBankPage /></RequireRole>} />
        <Route path="/builder" element={<RequireRole roles={['admin', 'instructor']}><ExamBuilderPage /></RequireRole>} />
        <Route path="/live/:examId?" element={<RequireRole roles={['admin', 'instructor', 'proctor']}><LiveHostPage /></RequireRole>} />
        <Route path="/student/:joinCode?" element={<RequireRole roles={['admin', 'instructor', 'student']}><StudentExamPage /></RequireRole>} />
        <Route path="/reports/:examId?" element={<RequireRole roles={['admin', 'instructor']}><ReportsPage /></RequireRole>} />
        <Route path="/api" element={<RequireRole roles={['admin', 'instructor']}><ApiConsolePage /></RequireRole>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function RouterHost() {
  const config = useAppConfig();
  const { session } = useAppState();

  return (
    <ApiProvider session={session}>
      <BrowserRouter basename={config.basename === '/' ? undefined : config.basename}>
        <AppRoutes />
      </BrowserRouter>
    </ApiProvider>
  );
}

export function QuizForgeApp({ config, initialSession }: QuizForgeAppProps) {
  return (
    <AppConfigProvider config={config}>
      <AppStateProvider initialSession={initialSession}>
        <RouterHost />
      </AppStateProvider>
    </AppConfigProvider>
  );
}
