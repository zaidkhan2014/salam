import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AxiosError } from 'axios'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import type { AdminStaffLoginResponse, AdminTokenResponse, ErrorResponse } from '@/api/types'
import { clearSession, getSession, setSession, type AdminSession } from '@/features/auth/session'

interface BootstrapLoginInput {
  adminUserId: string
  adminSecret: string
}

interface StaffLoginInput {
  email: string
  password: string
}

interface AuthContextValue {
  session: AdminSession | null
  isAuthenticated: boolean
  login: (input: BootstrapLoginInput) => Promise<void>
  staffLogin: (input: StaffLoginInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const serverMessage = (error.response?.data as ErrorResponse | undefined)?.message
    if (serverMessage) return serverMessage
  }
  if (error instanceof Error && error.message) return error.message
  return 'Unable to sign in. Please check credentials and try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AdminSession | null>(() => getSession())

  const login = useCallback(async (input: BootstrapLoginInput) => {
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

  const staffLogin = useCallback(async (input: StaffLoginInput) => {
    try {
      const response = await adminClient.post<AdminStaffLoginResponse>(adminEndpoints.authLogin, input)
      const nextSession: AdminSession = {
        ...response.data,
        staff: response.data.staff,
      }
      setSession(nextSession)
      setSessionState(nextSession)
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
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
      staffLogin,
      logout,
    }),
    [session, login, staffLogin, logout],
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
