import { describe, expect, it } from 'vitest'
import {
  formatCommissionRate,
  formatInr,
  hasSubscriptionRevenueSeries,
} from '@/components/revenue/subscriptionRevenueTransforms'

describe('subscriptionRevenueTransforms', () => {
  it('detects empty series as no data', () => {
    expect(hasSubscriptionRevenueSeries([])).toBe(false)
    expect(
      hasSubscriptionRevenueSeries([
        { bucket: '2026-11-01', newSubscriptions: 0, renewals: 0, grossRevenue: 0, netRevenue: 0 },
      ]),
    ).toBe(false)
  })

  it('detects volume or money activity', () => {
    expect(
      hasSubscriptionRevenueSeries([
        { bucket: '2026-11-01', newSubscriptions: 1, renewals: 0, grossRevenue: 0, netRevenue: 0 },
      ]),
    ).toBe(true)
    expect(
      hasSubscriptionRevenueSeries([
        { bucket: '2026-11-01', newSubscriptions: 0, renewals: 0, grossRevenue: 10, netRevenue: 8.5 },
      ]),
    ).toBe(true)
  })

  it('formats INR and commission rate', () => {
    expect(formatInr(59.99)).toContain('59.99')
    expect(formatInr(59.99)).toMatch(/^₹/)
    expect(formatCommissionRate(0.15)).toBe('15%')
  })
})
