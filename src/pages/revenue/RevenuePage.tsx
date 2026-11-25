import { PageHeader } from '@/components/common/PageHeader'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { MetricsSection } from '@/components/metrics/MetricsSection'
import { SubscriptionRevenueSection } from '@/components/revenue/SubscriptionRevenueSection'
import { useRevenueMetrics, useSubscriptionRevenueBreakdown } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function RevenuePage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useRevenueMetrics(filters)
  const storeIapQuery = useSubscriptionRevenueBreakdown(filters)

  return (
    <section className="space-y-4">
      <PageHeader
        title="Revenue"
        description="Subscription purchases and total revenue."
      />
      <p className="text-sm text-slate-600">
        Razorpay / bank-style <code>subscription_payments</code> are shown first. Store IAP (App Store /
        Play) from RevenueCat follows below — both use the same date range and granularity.
      </p>
      <DateGranularityControls
        start={filters.start}
        end={filters.end}
        granularity={filters.granularity}
        onChange={setFilters}
      />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Razorpay / payments</h2>
        <MetricsSection query={query} />
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Store IAP (RevenueCat)</h2>
          <p className="text-sm text-slate-600">
            New subscriptions vs renewals from RevenueCat. INR amounts use{' '}
            <code>priceInPurchasedCurrency</code> when currency is INR; non-INR purchases still count
            but add ₹0. Net applies a flat 15% store commission. Sandbox events are excluded.
          </p>
        </div>
        <SubscriptionRevenueSection query={storeIapQuery} />
      </div>
    </section>
  )
}
