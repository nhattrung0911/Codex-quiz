import { createContext, useContext, useMemo } from 'react';
import { createQuizForgeConfig, type QuizForgeConfig, type QuizForgeConfigInput } from './appConfig';

const AppConfigContext = createContext<QuizForgeConfig | undefined>(undefined);

export function AppConfigProvider({
  children,
  config
}: {
  children: React.ReactNode;
  config?: QuizForgeConfigInput;
}) {
  const value = useMemo(() => createQuizForgeConfig(config), [config]);
  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  const value = useContext(AppConfigContext);
  if (!value) throw new Error('useAppConfig must be used inside AppConfigProvider');
  return value;
}
