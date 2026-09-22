import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import VipCustomersPage from '@/pages/vip/VipCustomersPage'

vi.mock('@/hooks/api/useAdminVip', () => ({
  useAdminVipLeads: () => ({
    data: {
      items: [
        {
          userId: 'user-1',
          memberId: 'Q1',
          phone: null,
          fullName: 'Aisha Khan',
          gender: 'Female',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          country: 'India',
          profileCreatedAt: null,
          profileStatus: 'APPROVED',
          accountStatus: 'ACTIVE',
          subscribed: false,
          status: 'CALL_REMAINING',
          note: null,
          followUpAt: null,
          lastCalledAt: null,
          assignedToAdminId: null,
          claimedAt: null,
          outcomeReason: null,
          convertedAt: null,
          requestedAt: null,
          lastRequestedAt: null,
          requestCount: 1,
          vipPlanId: null,
          vipTitle: 'Qurb VIP',
          originalPriceInr: 99000,
          discountedPriceInr: 65000,
          currency: 'INR',
          updatedAt: null,
          profession: 'Software Engineer',
          incomeLabel: '₹30–₹40 Lakh',
          education: 'Masters',
          industry: 'Technology',
          age: 34,
          dateOfBirth: '1992-04-15',
          maritalStatus: 'Never Married',
          height: 165,
          verifiedProfile: true,
          approvedPhotoCount: 4,
        },
      ],
      page: 0,
      size: 20,
      total: 1,
    },
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
    expect(screen.getByRole('heading', { name: 'Last requested' })).toBeInTheDocument()
    expect(screen.getByLabelText('Last requested from')).toBeInTheDocument()
    expect(screen.getByText('Last 7d')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by VIP status')).toBeInTheDocument()
  })

  it('renders new profile columns from leads list', () => {
    render(
      <MemoryRouter>
        <VipCustomersPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('columnheader', { name: 'State' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'City' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Profession' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Income' })).toBeInTheDocument()
    expect(screen.getByText('Uttar Pradesh')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('₹30–₹40 Lakh')).toBeInTheDocument()
  })
})
