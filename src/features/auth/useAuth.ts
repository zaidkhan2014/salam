import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import type { AdminTokenResponse } from '@/api/types'
import { clearSession, getSession, setSession, type AdminSession } from '@/features/auth/session'

interface LoginInput {
  adminUserId: string
  adminSecret: string
}

interface AuthContextValue {
  session: AdminSession | null
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AdminSession | null>(() => getSession())

  const login = useCallback(async (input: LoginInput) => {
    const response = await adminClient.post<AdminTokenResponse>(
      adminEndpoints.authToken,
      { adminUserId: input.adminUserId },
      {
        headers: {
          'X-Admin-Secret': input.adminSecret,
        },
      },
    )

    const nextSession: AdminSession = {
      adminUserId: input.adminUserId,
      ...response.data,
    }
    setSession(nextSession)
    setSessionState(nextSession)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSessionState(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      login,
      logout,
    }),
    [session, login, logout],
  )

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
