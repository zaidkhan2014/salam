import type { UseQueryResult } from '@tanstack/react-query'
import type { AdminLifeTogetherOnboardingResponse, GenderSnapshot } from '@/api/types'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { GenderPieChart } from '@/components/genderMonitoring/GenderPieChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCompactNumber } from '@/utils/format'

interface LifeTogetherOnboardingSectionProps {
  query: UseQueryResult<AdminLifeTogetherOnboardingResponse, Error>
}

function CohortKpiCard({
  title,
  snapshot,
  hint,
}: {
  title: string
  snapshot: GenderSnapshot
  hint: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(snapshot.total)}</p>
        <p className="mt-1 text-xs text-slate-500">
          Female {snapshot.femalePercent.toFixed(1)}% · {hint}
        </p>
      </CardContent>
    </Card>
  )
}

function formatSkipRate(filled: number, skipped: number) {
  const denom = filled + skipped
  if (denom <= 0) {
    return '—'
  }
  return `${((skipped / denom) * 100).toFixed(1)}%`
}

export function LifeTogetherOnboardingSection({ query }: LifeTogetherOnboardingSectionProps) {
  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`lt-onboard-kpi-${index + 1}`} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`lt-onboard-pie-${index + 1}`} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (query.isError) {
    return <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
  }

  const data = query.data
  if (!data) {
    return null
  }

  const skipRate = formatSkipRate(data.lifeTogetherFilled.total, data.lifeTogetherSkipped.total)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <CohortKpiCard
          title="Onboarding complete"
          snapshot={data.onboardingComplete}
          hint={`Ratio ${data.onboardingComplete.maleToFemaleRatio}`}
        />
        <CohortKpiCard
          title="Life Together filled"
          snapshot={data.lifeTogetherFilled}
          hint={`Ratio ${data.lifeTogetherFilled.maleToFemaleRatio}`}
        />
        <CohortKpiCard
          title="Life Together skipped"
          snapshot={data.lifeTogetherSkipped}
          hint={`Self skip rate ${skipRate}`}
        />
      </div>

      <p className="text-xs text-slate-500">
        Self skip rate = skipped ÷ (filled + skipped). Non-Self onboarded users appear in complete only.
      </p>

      <div className="grid gap-4 xl:grid-cols-3">
        <GenderPieChart
          title="Onboarding complete"
          subtitle="Finished onboarding in range"
          snapshot={data.onboardingComplete}
        />
        <GenderPieChart
          title="Life Together filled"
          subtitle="Onboarded with LT answers"
          snapshot={data.lifeTogetherFilled}
        />
        <GenderPieChart
          title="Life Together skipped"
          subtitle="Self profiles with no LT answers"
          snapshot={data.lifeTogetherSkipped}
        />
      </div>
    </div>
  )
}
