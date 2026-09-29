import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import NonIndianOnboardedPage from '@/pages/non-indian-onboarded/NonIndianOnboardedPage'

vi.mock('@/hooks/api/useAdminUsers', () => ({
  useAdminNonIndianOnboarded: () => ({
    data: { start: '', end: '', total: 0, page: 0, size: 20, items: [] },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

describe('NonIndianOnboardedPage', () => {
  it('renders header, date controls, and empty state', () => {
    render(
      <MemoryRouter>
        <NonIndianOnboardedPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Non-Indian Onboarded' })).toBeInTheDocument()
    expect(screen.getByLabelText('start-date')).toBeInTheDocument()
    expect(screen.getByLabelText('end-date')).toBeInTheDocument()
    expect(screen.getByText('Total:')).toBeInTheDocument()
    expect(screen.getByText('No non-Indian onboarded users.')).toBeInTheDocument()
  })
})
