import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import OtpUnverifiedPage from '@/pages/otp-unverified/OtpUnverifiedPage'

vi.mock('@/hooks/api/useAdminAnalytics', () => ({
  useOtpUnverified: () => ({
    data: {
      start: '',
      end: '',
      total: 12,
      indiaCount: 8,
      nonIndiaCount: 4,
      page: 0,
      size: 20,
      items: [],
    },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

describe('OtpUnverifiedPage', () => {
  it('renders header, date controls, India/Non-IN counts, and empty state', () => {
    render(
      <MemoryRouter>
        <OtpUnverifiedPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'OTP Unverified' })).toBeInTheDocument()
    expect(screen.getByLabelText('start-date')).toBeInTheDocument()
    expect(screen.getByLabelText('end-date')).toBeInTheDocument()
    expect(screen.getByText('Total · India · Non-IN:')).toBeInTheDocument()
    expect(screen.getByText('12 · 8 · 4')).toBeInTheDocument()
    expect(screen.getByText('No unverified OTP requests.')).toBeInTheDocument()
  })
})
