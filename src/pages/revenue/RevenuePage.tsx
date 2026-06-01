import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useRevenueMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function RevenuePage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useRevenueMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Revenue"
      description="Subscription purchases and total revenue."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
