import { useState } from 'react'
import { useRetentionMetrics } from '@/hooks/api/useAdminAnalytics'
import { PageHeader } from '@/components/common/PageHeader'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { MetricsSection } from '@/components/metrics/MetricsSection'
import { defaultDateRange } from '@/utils/date'

export default function RetentionPage() {
  const defaults = defaultDateRange()
  const [filters, setFilters] = useState<{ cohortStart?: string; cohortEnd?: string }>({
    cohortStart: defaults.start,
    cohortEnd: defaults.end,
  })

  const query = useRetentionMetrics(filters)

  return (
    <section className="space-y-4">
      <PageHeader title="Retention" description="Cohort retention across D1, D7, and D30." />
      <DateGranularityControls
        start={filters.cohortStart}
        end={filters.cohortEnd}
        showGranularity={false}
        onChange={(next) => setFilters({ cohortStart: next.start, cohortEnd: next.end })}
      />
      <MetricsSection query={query} />
    </section>
  )
}
