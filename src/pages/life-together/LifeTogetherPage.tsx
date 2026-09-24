import { PageHeader } from '@/components/common/PageHeader'
import { LifeTogetherOnboardingSection } from '@/components/lifeTogether/LifeTogetherOnboardingSection'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { MetricsSection } from '@/components/metrics/MetricsSection'
import { useLifeTogetherMetrics, useLifeTogetherOnboardingMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function LifeTogetherPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const usageQuery = useLifeTogetherMetrics(filters)
  const onboardingQuery = useLifeTogetherOnboardingMetrics({ start: filters.start, end: filters.end })

  return (
    <section className="space-y-4">
      <PageHeader
        title="Life Together"
        description="Track life-together feature usage and onboarding gender cohorts over time."
      />
      <DateGranularityControls
        start={filters.start}
        end={filters.end}
        granularity={filters.granularity}
        onChange={setFilters}
      />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Usage metrics</h2>
        <p className="text-sm text-slate-600">Feature usage totals and daily series for the selected range.</p>
        <MetricsSection query={usageQuery} />
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">Onboarding gender</h2>
        <p className="text-sm text-slate-600">
          Onboarding completed in selected range · Self-only for skipped
        </p>
        <LifeTogetherOnboardingSection query={onboardingQuery} />
      </div>
    </section>
  )
}
