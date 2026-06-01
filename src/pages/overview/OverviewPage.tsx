import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useOverviewMetrics, useSearchIndexMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function OverviewPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useOverviewMetrics(filters)
  const searchIndexQuery = useSearchIndexMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Overview"
      description="Key product and activity metrics."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
      extraQueries={[
        {
          title: 'Search index health',
          description: 'Mongo vs Elasticsearch profile counts and index delta (same range as above).',
          query: searchIndexQuery,
        },
      ]}
    />
  )
}
