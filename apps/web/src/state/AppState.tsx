import { createContext, useContext, useMemo, useState } from 'react';
import type { AuthSession } from '../api/types';

interface AppStateValue {
  session?: AuthSession;
  setSession: (session?: AuthSession) => void;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({
  children,
  initialSession
}: {
  children: React.ReactNode;
  initialSession?: AuthSession;
}) {
  const [session, setSession] = useState<AuthSession | undefined>(initialSession);
  const value = useMemo(() => ({ session, setSession }), [session]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
