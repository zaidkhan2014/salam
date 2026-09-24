import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminLoginFunnelResponse } from '@/api/types'
import LoginFunnelPage from '@/pages/login-funnel/LoginFunnelPage'

const mockResponse: AdminLoginFunnelResponse = {
  start: '2026-09-17T00:00:00Z',
  end: '2026-09-24T00:00:00Z',
  otpRequested: 4200,
  otpVerified: 3100,
  existingUserLogin: {
    total: 1800,
    male: 1400,
    female: 380,
    unknown: 20,
    femalePercent: 21.11,
    malePercent: 77.78,
    maleToFemaleRatio: '3.68:1',
  },
}

vi.mock('@/hooks/api/useAdminAnalytics', () => ({
  useLoginFunnelMetrics: () => ({
    data: mockResponse,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}))

describe('LoginFunnelPage', () => {
  it('renders funnel KPIs and existing-login gender pie', () => {
    render(<LoginFunnelPage />)
    expect(screen.getByRole('heading', { name: 'Login Funnel' })).toBeInTheDocument()
    expect(screen.getByText('OTP requested')).toBeInTheDocument()
    expect(screen.getByText('OTP verified')).toBeInTheDocument()
    expect(screen.getByText('Existing user login')).toBeInTheDocument()
    expect(screen.getByText('Existing user login by gender')).toBeInTheDocument()
  })
})
