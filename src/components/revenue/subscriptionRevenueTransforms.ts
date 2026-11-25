import type { AdminSubscriptionRevenuePoint } from '@/api/types'
import { formatNumber } from '@/utils/format'

export function hasSubscriptionRevenueSeries(series: AdminSubscriptionRevenuePoint[]): boolean {
  return series.some(
    (point) =>
      point.newSubscriptions > 0 ||
      point.renewals > 0 ||
      point.grossRevenue > 0 ||
      point.netRevenue > 0,
  )
}

export function formatInr(value: number): string {
  return `₹${formatNumber(value)}`
}

export function formatCommissionRate(rate: number): string {
  return `${Math.round(rate * 100)}%`
}
