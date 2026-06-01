import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useLikesMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function LikesPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useLikesMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Likes Analytics"
      description="Monitor likes usage and like-limit reach events."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
