import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useMatchingMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function MatchingPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useMatchingMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Matching"
      description="Interest, shortlists, profile visits, and matches."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
