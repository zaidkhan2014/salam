import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminLifeTogetherOnboardingResponse, AdminMetricsResponse } from '@/api/types'
import LifeTogetherPage from '@/pages/life-together/LifeTogetherPage'

const mockUsage: AdminMetricsResponse = {
  start: '2026-09-17T00:00:00Z',
  end: '2026-09-24T00:00:00Z',
  granularity: 'DAILY',
  metrics: [],
}

const mockOnboarding: AdminLifeTogetherOnboardingResponse = {
  start: '2026-09-17T00:00:00Z',
  end: '2026-09-24T00:00:00Z',
  onboardingComplete: {
    total: 1200,
    male: 900,
    female: 280,
    unknown: 20,
    femalePercent: 23.33,
    malePercent: 75.0,
    maleToFemaleRatio: '3.21:1',
  },
  lifeTogetherFilled: {
    total: 450,
    male: 300,
    female: 140,
    unknown: 10,
    femalePercent: 31.11,
    malePercent: 66.67,
    maleToFemaleRatio: '2.14:1',
  },
  lifeTogetherSkipped: {
    total: 500,
    male: 420,
    female: 70,
    unknown: 10,
    femalePercent: 14.0,
    malePercent: 84.0,
    maleToFemaleRatio: '6.00:1',
  },
}

vi.mock('@/hooks/api/useAdminAnalytics', () => ({
  useLifeTogetherMetrics: () => ({
    data: mockUsage,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useLifeTogetherOnboardingMetrics: () => ({
    data: mockOnboarding,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}))

describe('LifeTogetherPage', () => {
  it('renders usage and onboarding gender sections', () => {
    render(<LifeTogetherPage />)
    expect(screen.getByRole('heading', { name: 'Life Together' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Usage metrics' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Onboarding gender' })).toBeInTheDocument()
    expect(screen.getAllByText('Onboarding complete').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Life Together filled').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Life Together skipped').length).toBeGreaterThanOrEqual(1)
  })
})
