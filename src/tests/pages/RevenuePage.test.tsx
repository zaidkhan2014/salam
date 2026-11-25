import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RevenuePage from '@/pages/revenue/RevenuePage'

vi.mock('@/hooks/api/useAdminAnalytics', () => ({
  useRevenueMetrics: () => ({
    data: { start: '', end: '', granularity: 'DAILY', metrics: [] },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useSubscriptionRevenueBreakdown: () => ({
    data: {
      start: '2026-11-01T00:00:00Z',
      end: '2026-11-03T00:00:00Z',
      granularity: 'DAILY',
      currency: 'INR',
      storeCommissionRate: 0.15,
      newSubscriptionCount: 2,
      renewalCount: 4,
      totalPaidEvents: 6,
      grossRevenue: 59.99,
      storeCommission: 9,
      netRevenue: 50.99,
      series: [
        {
          bucket: '2026-11-01',
          newSubscriptions: 2,
          renewals: 1,
          grossRevenue: 29.99,
          netRevenue: 25.49,
        },
        {
          bucket: '2026-11-02',
          newSubscriptions: 0,
          renewals: 3,
          grossRevenue: 30,
          netRevenue: 25.5,
        },
      ],
    },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/hooks/useAnalyticsFilters', () => ({
  useAnalyticsFilters: () => ({
    filters: { start: '', end: '', granularity: 'daily' },
    setFilters: vi.fn(),
  }),
}))

describe('RevenuePage', () => {
  it('renders Razorpay and Store IAP sections with summary KPIs', () => {
    render(<RevenuePage />)
    expect(screen.getByRole('heading', { name: 'Revenue' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Razorpay / payments' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Store IAP (RevenueCat)' })).toBeInTheDocument()
    expect(screen.getByText('New subscriptions')).toBeInTheDocument()
    expect(screen.getByText('Gross revenue')).toBeInTheDocument()
    expect(screen.getByText('New vs renewals')).toBeInTheDocument()
    expect(screen.getByText('Gross vs net revenue')).toBeInTheDocument()
  })
})
