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
      gstRate: 0.18,
      newSubscriptionCount: 2,
      renewalCount: 4,
      totalPaidEvents: 6,
      grossRevenue: 59.99,
      storeCommission: 9,
      netRevenue: 50.99,
      iosGrossRevenue: 29.99,
      iosStoreCommission: 4.5,
      iosNetRevenue: 25.49,
      androidGrossRevenue: 30,
      androidStoreCommission: 4.5,
      androidNetRevenue: 25.5,
      unknownStoreGrossRevenue: 0,
      unknownStoreCommission: 0,
      unknownStoreNetRevenue: 0,
      iosAmountExGst: 25.42,
      iosAppleCommission: 3.81,
      iosPartnerNetRevenue: 21.61,
      androidAmountExGst: 25.42,
      partnerNetTotal: 47.03,
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
  usePlanHoldersByPlan: () => ({
    data: {
      start: '2026-11-01T00:00:00Z',
      end: '2026-11-03T00:00:00Z',
      granularity: 'DAILY',
      source: 'USER_SUBSCRIPTIONS',
      totalUsers: 10,
      plans: [
        {
          planId: 'gold',
          planName: 'Gold',
          tierCode: 'GOLD',
          billingPeriod: 'MONTHLY',
          iosProductId: 'gold.ios',
          androidProductId: 'gold_android',
          productId: null,
          count: 7,
          sharePercent: 70,
          series: [
            { bucket: '2026-11-01', count: 4 },
            { bucket: '2026-11-02', count: 3 },
          ],
        },
      ],
    },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  usePlanPaidEventsByPlan: () => ({
    data: {
      start: '2026-11-01T00:00:00Z',
      end: '2026-11-03T00:00:00Z',
      granularity: 'DAILY',
      source: 'REVENUECAT_PAID_EVENTS',
      totalInitialPurchases: 5,
      totalRenewals: 3,
      totalPaidEvents: 8,
      plans: [
        {
          planId: 'gold',
          planName: 'Gold',
          tierCode: 'GOLD',
          billingPeriod: 'MONTHLY',
          iosProductId: 'gold.ios',
          androidProductId: 'gold_android',
          productId: null,
          initialPurchaseCount: 5,
          renewalCount: 3,
          totalPaidEvents: 8,
          initialSharePercent: 100,
          renewalSharePercent: 100,
          series: [
            { bucket: '2026-11-01', initialPurchaseCount: 2, renewalCount: 1, totalPaidEvents: 3 },
            { bucket: '2026-11-02', initialPurchaseCount: 3, renewalCount: 2, totalPaidEvents: 5 },
          ],
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
  it('renders Razorpay, Store IAP, and plan popularity sections', () => {
    render(<RevenuePage />)
    expect(screen.getByRole('heading', { name: 'Revenue' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Razorpay / payments' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Store IAP (RevenueCat)' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Plan popularity' })).toBeInTheDocument()
    expect(screen.getByText('New subscriptions')).toBeInTheDocument()
    expect(screen.getByText('Gross revenue')).toBeInTheDocument()
    expect(screen.getByText('Plan holders')).toBeInTheDocument()
    expect(screen.getByText('Paid events by plan')).toBeInTheDocument()
  })
})
