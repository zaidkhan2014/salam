import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DayGenderCountsPage from '@/pages/day-gender-counts/DayGenderCountsPage'

const deletedData = {
  day: '2026-10-02',
  dayStart: '2026-10-02T00:00:00Z',
  dayEnd: '2026-10-03T00:00:00Z',
  maleCount: 12,
  femaleCount: 8,
  unknownCount: 1,
  totalCount: 21,
  iosCount: 9,
  androidCount: 10,
  unknownPlatformCount: 2,
  sameDayCreatedDeletedMaleCount: 3,
  sameDayCreatedDeletedFemaleCount: 2,
  sameDayCreatedDeletedUnknownCount: 0,
  sameDayCreatedDeletedTotalCount: 5,
}

vi.mock('@/hooks/api/useAdminAnalytics', () => ({
  useDeletedApprovedByDay: (filters: { day: string } | null) => ({
    data: filters ? deletedData : undefined,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useOnboardedByDay: (filters: { day: string } | null) => ({
    data: filters
      ? {
          day: '2026-10-02',
          dayStart: '2026-10-02T00:00:00Z',
          dayEnd: '2026-10-03T00:00:00Z',
          maleCount: 4,
          femaleCount: 5,
          unknownCount: 0,
          totalCount: 9,
        }
      : undefined,
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

  it('shows platform KPIs after Check', () => {
    render(<DayGenderCountsPage />)
    fireEvent.change(screen.getByLabelText('UTC day'), { target: { value: '2026-10-02' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText('Deleted approved by day')).toBeInTheDocument()
    expect(screen.getByText('Platform (last login OS)')).toBeInTheDocument()
    expect(screen.getByText('iOS')).toBeInTheDocument()
    expect(screen.getByText('Android')).toBeInTheDocument()
    expect(screen.getByText('Unknown platform')).toBeInTheDocument()
  })
})
