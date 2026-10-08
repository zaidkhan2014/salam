import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DayGenderCountsPage from '@/pages/day-gender-counts/DayGenderCountsPage'

vi.mock('@/hooks/api/useAdminAnalytics', () => ({
  useDeletedApprovedByDay: () => ({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useOnboardedByDay: () => ({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}))

describe('DayGenderCountsPage', () => {
  it('renders header and Check controls without results until applied', () => {
    render(<DayGenderCountsPage />)
    expect(screen.getByRole('heading', { name: 'Day Gender Counts' })).toBeInTheDocument()
    expect(screen.getByLabelText('UTC day')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    expect(screen.getByText('Select a UTC day and click Check')).toBeInTheDocument()
    expect(screen.queryByText('Deleted approved by day')).not.toBeInTheDocument()
  })
})
