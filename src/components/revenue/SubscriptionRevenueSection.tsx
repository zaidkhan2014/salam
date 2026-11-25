import type { UseQueryResult } from '@tanstack/react-query'
import type { AdminSubscriptionRevenueBreakdownResponse } from '@/api/types'
import { EmptyState } from '@/components/common/EmptyState'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { SubscriptionRevenueSummaryCards } from '@/components/revenue/SubscriptionRevenueSummaryCards'
import { SubscriptionRevenueTrendChart } from '@/components/revenue/SubscriptionRevenueTrendChart'
import { SubscriptionVolumeStackedBar } from '@/components/revenue/SubscriptionVolumeStackedBar'
import { hasSubscriptionRevenueSeries } from '@/components/revenue/subscriptionRevenueTransforms'
import { Skeleton } from '@/components/ui/skeleton'

interface SubscriptionRevenueSectionProps {
  query: UseQueryResult<AdminSubscriptionRevenueBreakdownResponse, Error>
}

export function SubscriptionRevenueSection({ query }: SubscriptionRevenueSectionProps) {
  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`sub-rev-card-${index + 1}`} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  if (query.isError) {
    return <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
  }

  const data = query.data
  if (!data) {
    return <EmptyState title="No store revenue data." subtitle="Try changing the date range or granularity." />
  }

  const series = data.series ?? []
  if (!hasSubscriptionRevenueSeries(series) && data.totalPaidEvents === 0) {
    return <EmptyState title="No store IAP events in this range." subtitle="Try a wider date range." />
  }

  return (
    <div className="space-y-4">
      <SubscriptionRevenueSummaryCards data={data} />
      <div className="grid gap-4 xl:grid-cols-2">
        <SubscriptionVolumeStackedBar series={series} />
        <SubscriptionRevenueTrendChart series={series} />
      </div>
    </div>
  )
}
