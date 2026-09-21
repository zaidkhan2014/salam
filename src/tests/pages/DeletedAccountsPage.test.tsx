import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import DeletedAccountsPage from '@/pages/deleted-accounts/DeletedAccountsPage'

vi.mock('@/hooks/api/useAdminDeletedSales', () => ({
  useAdminDeletedSalesLeads: () => ({
    data: { items: [], page: 0, size: 20, total: 0 },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useAdminDeletedSalesSummary: () => ({
    data: { start: '', end: '', granularity: 'DAILY', metrics: [] },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useAdminDeletedSalesSavedViews: () => ({
    data: { items: [], page: 0, size: 20, total: 0 },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useCreateDeletedSalesSavedView: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteDeletedSalesSavedView: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/api/useGeo', () => ({
  useGeoStates: () => ({ data: [], isFetching: false }),
  useGeoCities: () => ({ data: [], isFetching: false }),
}))

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({ session: null }),
}))

vi.mock('@/features/auth/session', () => ({
  isSalesAgent: () => false,
}))

describe('DeletedAccountsPage', () => {
  it('renders header and deletion filters', () => {
    render(
      <MemoryRouter>
        <DeletedAccountsPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Deleted Accounts' })).toBeInTheDocument()
    expect(screen.getByText('Deleted')).toBeInTheDocument()
    expect(screen.getByLabelText('Deleted from')).toBeInTheDocument()
    expect(screen.getByText('Last 7d')).toBeInTheDocument()
    expect(screen.queryByLabelText('Filter by account status')).not.toBeInTheDocument()
  })
})
