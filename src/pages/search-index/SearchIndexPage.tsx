import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useSearchIndexMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function SearchIndexPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useSearchIndexMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Search Index Health"
      description="Compare Mongo profile counts and Elasticsearch index counts."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
