import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useLifeTogetherMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function LifeTogetherPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useLifeTogetherMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Life Together"
      description="Track life-together feature usage over time."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
