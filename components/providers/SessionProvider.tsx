'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { SessionState } from '@/types/session'

interface SessionContextValue {
  session: Partial<SessionState> | null
  setSession: (s: Partial<SessionState>) => void
  updateSession: (patch: Partial<SessionState>) => void
  clearSession: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Partial<SessionState> | null>(null)

  const setSession = useCallback((s: Partial<SessionState>) => {
    setSessionState(s)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('roomly_session', JSON.stringify(s))
    }
  }, [])

  const updateSession = useCallback((patch: Partial<SessionState>) => {
    setSessionState((prev) => {
      const next = { ...(prev ?? {}), ...patch }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('roomly_session', JSON.stringify(next))
      }
      return next
    })
  }, [])

  const clearSession = useCallback(() => {
    setSessionState(null)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('roomly_session')
    }
  }, [])

  return (
    <SessionContext.Provider value={{ session, setSession, updateSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider')
  return ctx
}
