'use client';

import { createContext, useContext } from 'react';
import { useSession } from '@/lib/auth-client';

const SessionContext = createContext();

export function SessionProvider({ children, initialSession = null }) {
  // Client hook still keeps session fresh; initialSession prevents flash
  const { data: liveSession, isPending: livePending } = useSession();
  const session = liveSession || initialSession;
  const isPending = !session && livePending;

  return (
    <SessionContext.Provider value={{ session, isPending }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useAuthSession must be used within SessionProvider');
  }
  return context;
}
