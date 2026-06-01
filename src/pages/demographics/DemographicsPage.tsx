import { useState } from 'react'
import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useDemographicsMetrics } from '@/hooks/api/useAdminAnalytics'
import { defaultDateRange } from '@/utils/date'

export default function DemographicsPage() {
  const defaults = defaultDateRange()
  const [filters, setFilters] = useState<{ start?: string; end?: string }>({
    start: defaults.start,
    end: defaults.end,
  })

  const query = useDemographicsMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Demographics"
      description="Top categories by gender, city, and country with optional Other bucket."
      filters={filters}
      onFiltersChange={(next) => setFilters({ start: next.start, end: next.end })}
      query={query}
      showGranularity={false}
    />
  )
}
