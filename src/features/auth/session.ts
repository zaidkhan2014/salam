import type { AdminTokenResponse } from '@/api/types'

const AUTH_KEY = 'admin_auth_session'

export interface AdminSession extends AdminTokenResponse {
  adminUserId: string
}

let inMemorySession: AdminSession | null = null

export function getSession() {
  if (inMemorySession) {
    return inMemorySession
  }

  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) {
    return null
  }

  try {
    inMemorySession = JSON.parse(raw) as AdminSession
    return inMemorySession
  } catch {
    localStorage.removeItem(AUTH_KEY)
    return null
  }
}

export function setSession(session: AdminSession) {
  inMemorySession = session
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
}

export function clearSession() {
  inMemorySession = null
  localStorage.removeItem(AUTH_KEY)
}

export function getAccessToken() {
  return getSession()?.accessToken ?? null
}
