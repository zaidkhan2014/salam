import { PageHeader } from '@/components/common/PageHeader'
import { GenderMonitoringSection } from '@/components/genderMonitoring/GenderMonitoringSection'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { MetricsSection } from '@/components/metrics/MetricsSection'
import { useGenderMonitoringMetrics, useOverviewMetrics, useSearchIndexMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function OverviewPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useOverviewMetrics(filters)
  const genderMonitoringQuery = useGenderMonitoringMetrics(filters)
  const searchIndexQuery = useSearchIndexMetrics(filters)

  return (
    <section className="space-y-4">
      <PageHeader title="Overview" description="Key product and activity metrics." />
      <DateGranularityControls
        start={filters.start}
        end={filters.end}
        granularity={filters.granularity}
        onChange={setFilters}
      />
      <MetricsSection query={query} />

      <div className="space-y-3 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">Gender monitoring</h2>
        <p className="text-sm text-slate-600">
          Snapshot charts are all-time current pool values; trend and city charts use the selected range.
        </p>
        <GenderMonitoringSection query={genderMonitoringQuery} />
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">Search index health</h2>
        <p className="text-sm text-slate-600">
          Mongo vs Elasticsearch profile counts and index delta (same range as above).
        </p>
        <MetricsSection query={searchIndexQuery} />
      </div>
    </section>
  )
}
