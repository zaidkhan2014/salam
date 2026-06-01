import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useSafetyMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function SafetyPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useSafetyMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Safety"
      description="User reports, blocks, and verification outcomes."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
