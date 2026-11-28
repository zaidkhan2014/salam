import type { UseQueryResult } from '@tanstack/react-query'
import type { AdminMetricsResponse } from '@/api/types'
import { EmptyState } from '@/components/common/EmptyState'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { MetricBreakdownList } from '@/components/metrics/MetricBreakdownList'
import { MetricCard } from '@/components/metrics/MetricCard'
import { MetricSeriesChart } from '@/components/metrics/MetricSeriesChart'
import { Skeleton } from '@/components/ui/skeleton'
import { filterUnknownPlatformMetrics } from '@/utils/overviewMetrics'

interface MetricsSectionProps {
  query: UseQueryResult<AdminMetricsResponse, Error>
  /** When true, hide Unknown-platform onboarding cards/charts and UNKNOWN breakdown rows. */
  excludeUnknownPlatform?: boolean
}

export function MetricsSection({ query, excludeUnknownPlatform = false }: MetricsSectionProps) {
  if (query.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={`skeleton-${index + 1}`} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (query.isError) {
    return <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
  }

  const rawMetrics = query.data?.metrics ?? []
  const metrics = excludeUnknownPlatform ? filterUnknownPlatformMetrics(rawMetrics) : rawMetrics
  if (!metrics.length) {
    return <EmptyState title="No metrics found." subtitle="Try changing the date range or granularity." />
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {metrics.map((metric) => (
          <MetricSeriesChart key={`${metric.key}-series`} metric={metric} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {metrics.map((metric) => (
          <MetricBreakdownList key={`${metric.key}-breakdown`} metric={metric} />
        ))}
      </div>
    </div>
  )
}
