import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import VipCustomersPage from '@/pages/vip/VipCustomersPage'

vi.mock('@/hooks/api/useAdminVip', () => ({
  useAdminVipLeads: () => ({
    data: { items: [], page: 0, size: 20, total: 0 },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

describe('VipCustomersPage', () => {
  it('renders header and last-requested filters', () => {
    render(
      <MemoryRouter>
        <VipCustomersPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'VIP Customers' })).toBeInTheDocument()
    expect(screen.getByText('Last requested')).toBeInTheDocument()
    expect(screen.getByLabelText('Last requested from')).toBeInTheDocument()
    expect(screen.getByText('Last 7d')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by VIP status')).toBeInTheDocument()
  })
})
