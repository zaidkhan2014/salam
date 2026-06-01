import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useFunnelMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function FunnelPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useFunnelMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Funnel"
      description="Track conversion and onboarding drop-offs."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
