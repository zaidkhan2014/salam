import type { InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it } from 'vitest'
import { adminClient } from '@/api/client'
import { clearSession, getSession, setSession } from '@/features/auth/session'

function getRequestFulfilledInterceptor() {
  return (adminClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }> })
    .handlers[0].fulfilled
}

function getResponseRejectedInterceptor() {
  return (adminClient.interceptors.response as unknown as { handlers: Array<{ rejected: (error: unknown) => Promise<unknown> }> })
    .handlers[0].rejected
}

describe('adminClient interceptors', () => {
  it('adds ngrok skip header on ngrok urls', () => {
    const fulfilled = getRequestFulfilledInterceptor()
    const config = fulfilled({
      headers: {},
      baseURL: 'https://example.ngrok-free.app',
      url: '/api/admin/analytics/overview',
    } as InternalAxiosRequestConfig)
    expect(config.headers['ngrok-skip-browser-warning']).toBe('true')
  })

  it('clears session and redirects on 401', async () => {
    setSession({
      adminUserId: 'admin-1',
      accessToken: 'token',
      expiresAt: '2026-01-01T00:00:00.000Z',
      scope: 'full_access',
      roles: ['ROLE_ADMIN'],
      sessionId: 'session-1',
    })

    const rejected = getResponseRejectedInterceptor()
    await expect(
      rejected({
        response: {
          status: 401,
          data: {
            timestamp: '2026-05-30T12:00:00.123Z',
            status: 401,
            error: 'Unauthorized',
            message: 'Invalid token',
          },
        },
      }),
    ).rejects.toBeDefined()

    expect(getSession()).toBeNull()
    clearSession()
  })

  it('keeps session on 403', async () => {
    setSession({
      adminUserId: 'admin-1',
      accessToken: 'token',
      expiresAt: '2026-01-01T00:00:00.000Z',
      scope: 'full_access',
      roles: ['ROLE_ADMIN'],
      sessionId: 'session-1',
    })

    const rejected = getResponseRejectedInterceptor()
    await expect(
      rejected({
        response: {
          status: 403,
          data: {
            timestamp: '2026-05-30T12:00:00.123Z',
            status: 403,
            error: 'Forbidden',
            message: 'Not allowed',
          },
        },
      }),
    ).rejects.toBeDefined()

    expect(getSession()).not.toBeNull()
    clearSession()
  })
})
