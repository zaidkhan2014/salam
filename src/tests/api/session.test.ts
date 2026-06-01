import { beforeEach, describe, expect, it } from 'vitest'
import { clearSession, getAccessToken, getSession, setSession } from '@/features/auth/session'

describe('auth session storage', () => {
  beforeEach(() => {
    clearSession()
  })

  it('stores and retrieves session token', () => {
    setSession({
      adminUserId: 'admin-1',
      accessToken: 'token-123',
      expiresAt: new Date().toISOString(),
      roles: ['ROLE_ADMIN'],
      scope: 'full_access',
      sessionId: 'session-1',
    })

    expect(getSession()?.adminUserId).toBe('admin-1')
    expect(getAccessToken()).toBe('token-123')
  })
})
