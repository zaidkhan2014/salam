import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useSelfieMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function SelfiePage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useSelfieMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Selfie Analytics"
      description="Monitor selfie verification performance and pending queue."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
