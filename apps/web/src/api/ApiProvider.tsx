import { createContext, useContext, useMemo } from 'react';
import { useAppConfig } from '../config/AppConfigContext';
import { createMockApi } from './mockApi';
import { createRealApi } from './realApi';
import type { AuthSession, QuizForgeApi } from './types';

const ApiContext = createContext<QuizForgeApi | undefined>(undefined);

export function ApiProvider({
  children,
  session
}: {
  children: React.ReactNode;
  session?: AuthSession;
}) {
  const config = useAppConfig();
  const accessToken = session?.tokens.accessToken;
  const api = useMemo(() => {
    if (config.apiMode === 'real') {
      return createRealApi(config, () => accessToken);
    }
    return createMockApi();
  }, [config, accessToken]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const value = useContext(ApiContext);
  if (!value) throw new Error('useApi must be used inside ApiProvider');
  return value;
}
