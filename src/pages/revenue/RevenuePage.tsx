import { PageHeader } from '@/components/common/PageHeader'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { MetricsSection } from '@/components/metrics/MetricsSection'
import { PlanPopularitySection } from '@/components/revenue/PlanPopularitySection'
import { SubscriptionRevenueSection } from '@/components/revenue/SubscriptionRevenueSection'
import {
  usePlanHoldersByPlan,
  usePlanPaidEventsByPlan,
  useRevenueMetrics,
  useSubscriptionRevenueBreakdown,
} from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'
import { useMemo } from 'react'

export default function RevenuePage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useRevenueMetrics(filters)
  const storeIapQuery = useSubscriptionRevenueBreakdown(filters)
  const planFilters = useMemo(
    () => ({ start: filters.start, end: filters.end, granularity: filters.granularity }),
    [filters.start, filters.end, filters.granularity],
  )
  const holdersQuery = usePlanHoldersByPlan(planFilters)
  const paidEventsQuery = usePlanPaidEventsByPlan(planFilters)

  return (
    <section className="space-y-4">
      <PageHeader title="Revenue" description="Subscription purchases and total revenue." />
      <p className="text-sm text-slate-600">
        Razorpay / bank-style <code>subscription_payments</code> are shown first. Store IAP and plan
        popularity use the same date range (granularity applies to series metrics only).
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

      <div className="space-y-3 border-t border-slate-200 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Plan popularity</h2>
          <p className="text-sm text-slate-600">
            Holders (who sits on which plan, incl. legacy) and paid events (new buys vs renewals) are
            different units — do not add them together. Paid events are PRODUCTION RevenueCat only;
            charts emphasize initial purchases for acquisition ranking.
          </p>
        </div>
        <PlanPopularitySection holdersQuery={holdersQuery} paidEventsQuery={paidEventsQuery} />
      </div>
    </section>
  )
}
