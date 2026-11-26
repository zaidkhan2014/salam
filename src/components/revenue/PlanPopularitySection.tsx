import type { UseQueryResult } from '@tanstack/react-query'
import type { AdminPlanHoldersResponse, AdminPlanPaidEventsResponse } from '@/api/types'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { PlanHoldersChart } from '@/components/revenue/PlanHoldersChart'
import { PlanPaidEventsChart } from '@/components/revenue/PlanPaidEventsChart'
import { Skeleton } from '@/components/ui/skeleton'

interface PlanPopularitySectionProps {
  holdersQuery: UseQueryResult<AdminPlanHoldersResponse, Error>
  paidEventsQuery: UseQueryResult<AdminPlanPaidEventsResponse, Error>
}

export function PlanPopularitySection({ holdersQuery, paidEventsQuery }: PlanPopularitySectionProps) {
  return (
    <div className="space-y-4">
      {holdersQuery.isLoading || paidEventsQuery.isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : null}

      {holdersQuery.isError ? (
        <QueryFeedback
          loading={false}
          error={holdersQuery.error}
          onRetry={() => void holdersQuery.refetch()}
        />
      ) : null}
      {paidEventsQuery.isError ? (
        <QueryFeedback
          loading={false}
          error={paidEventsQuery.error}
          onRetry={() => void paidEventsQuery.refetch()}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {holdersQuery.data ? <PlanHoldersChart data={holdersQuery.data} /> : null}
        {paidEventsQuery.data ? <PlanPaidEventsChart data={paidEventsQuery.data} /> : null}
      </div>
    </div>
  )
}
