import { useState } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type {
  AdminDayGenderCountsResponse,
  AdminDeletedApprovedByDayResponse,
  DayGenderCountsFilters,
} from '@/api/types'
import { useDeletedApprovedByDay, useOnboardedByDay } from '@/hooks/api/useAdminAnalytics'
import { isValidUtcDay } from '@/pages/onboarding-dropoff/onboardingDropoffHelpers'
import { formatDateTime, formatNumber } from '@/utils/format'

export default function DayGenderCountsPage() {
  const [draftDay, setDraftDay] = useState('')
  const [applied, setApplied] = useState<DayGenderCountsFilters | null>(null)
  const [dayError, setDayError] = useState<string | null>(null)

  const deletedQuery = useDeletedApprovedByDay(applied)
  const onboardedQuery = useOnboardedByDay(applied)
  const fetching = deletedQuery.isFetching || onboardedQuery.isFetching

  function handleCheck() {
    const trimmed = draftDay.trim()
    if (!isValidUtcDay(trimmed)) {
      setDayError('Select a valid UTC day (yyyy-MM-dd) before checking.')
      return
    }
    setDayError(null)
    setApplied({ day: trimmed })
  }

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader
        title="Day Gender Counts"
        description="UTC-day gender totals for approved onboarded profiles deleted that day (plus same-day create+delete), and for profiles that finished onboarding that day (including later-deleted accounts)."
      />

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Day check</CardTitle>
          <p className="mt-1 text-sm text-slate-600">
            Pick a UTC calendar day, then click <strong>Check</strong>. Changing the date alone does not call the
            API.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <label className="block min-w-0 text-sm text-slate-600">
            <span className="mb-1 block font-medium text-slate-800">UTC day</span>
            <Input
              type="date"
              value={draftDay}
              onChange={(event) => {
                setDraftDay(event.target.value)
                setDayError(null)
              }}
              aria-label="UTC day"
              disabled={fetching && Boolean(applied)}
            />
          </label>
          <Button type="button" onClick={handleCheck} disabled={fetching || !isValidUtcDay(draftDay)}>
            {fetching ? 'Checking…' : 'Check'}
          </Button>
          {dayError ? <p className="w-full text-sm text-red-600">{dayError}</p> : null}
        </CardContent>
      </Card>

      {!applied ? (
        <EmptyState title="Select a UTC day and click Check" subtitle="No API call until you run Check." />
      ) : null}

      {applied ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <DeletedApprovedPanel query={deletedQuery} />
          <DayGenderPanel
            title="Onboarded by day"
            description="Profiles that finished onboarding on this UTC day (includes ACTIVE and DELETED accounts)."
            query={onboardedQuery}
          />
        </div>
      ) : null}
    </section>
  )
}

function DeletedApprovedPanel({
  query,
}: {
  query: {
    data?: AdminDeletedApprovedByDayResponse
    error: unknown
    isError: boolean
    isLoading: boolean
    refetch: () => unknown
  }
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Deleted approved by day</CardTitle>
        <p className="mt-1 text-sm text-slate-600">
          Approved, onboarded profiles with accountStatus DELETED whose deletedAt falls on this UTC day.
        </p>
        {query.data ? (
          <p className="mt-1 text-xs text-slate-500">
            Window {formatDateTime(query.data.dayStart)} → {formatDateTime(query.data.dayEnd)}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isError ? (
          <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
        ) : null}
        {query.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={`deleted-kpi-${index + 1}`} className="h-24 w-full" />
            ))}
          </div>
        ) : null}
        {query.data ? (
          <>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Deleted on day
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <CountCard label="Male" value={query.data.maleCount} />
                <CountCard label="Female" value={query.data.femaleCount} />
                <CountCard label="Unknown" value={query.data.unknownCount} />
                <CountCard label="Total" value={query.data.totalCount} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Same-day created & deleted
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <CountCard label="Male" value={query.data.sameDayCreatedDeletedMaleCount} />
                <CountCard label="Female" value={query.data.sameDayCreatedDeletedFemaleCount} />
                <CountCard label="Unknown" value={query.data.sameDayCreatedDeletedUnknownCount} />
                <CountCard label="Total" value={query.data.sameDayCreatedDeletedTotalCount} />
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function DayGenderPanel({
  title,
  description,
  query,
}: {
  title: string
  description: string
  query: {
    data?: AdminDayGenderCountsResponse
    error: unknown
    isError: boolean
    isLoading: boolean
    refetch: () => unknown
  }
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
        {query.data ? (
          <p className="mt-1 text-xs text-slate-500">
            Window {formatDateTime(query.data.dayStart)} → {formatDateTime(query.data.dayEnd)}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {query.isError ? (
          <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
        ) : null}
        {query.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`${title}-kpi-${index + 1}`} className="h-24 w-full" />
            ))}
          </div>
        ) : null}
        {query.data ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <CountCard label="Male" value={query.data.maleCount} />
            <CountCard label="Female" value={query.data.femaleCount} />
            <CountCard label="Unknown" value={query.data.unknownCount} />
            <CountCard label="Total" value={query.data.totalCount} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(value)}</p>
    </div>
  )
}
