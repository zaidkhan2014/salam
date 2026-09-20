import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import OnboardingDropoffPage from '@/pages/onboarding-dropoff/OnboardingDropoffPage'

vi.mock('@/hooks/api/useAdminAnalytics', () => ({
  useAdminOnboardingDropoff: () => ({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}))

describe('OnboardingDropoffPage', () => {
  it('renders header and Check controls without results until applied', () => {
    render(<OnboardingDropoffPage />)
    expect(screen.getByRole('heading', { name: 'Onboarding Dropoff' })).toBeInTheDocument()
    expect(screen.getByLabelText('UTC onboarding day')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    expect(screen.getByText('Select a UTC day and click Check')).toBeInTheDocument()
    expect(screen.queryByText('Male')).not.toBeInTheDocument()
  })
})
