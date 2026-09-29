import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminNonIndianOnboarded } from '@/hooks/api/useAdminUsers'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'
import { formatDateTime, formatNumber } from '@/utils/format'

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

function locationLabel(city: string | null, state: string | null, country: string | null) {
  const parts = [city, state, country].filter((part): part is string => Boolean(part?.trim()))
  return parts.length ? parts.join(', ') : '--'
}

export default function NonIndianOnboardedPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const query = useAdminNonIndianOnboarded({
    start: filters.start,
    end: filters.end,
    page,
    size: pageSize,
  })

  const totalPages = useMemo(() => {
    const total = query.data?.total ?? 0
    return Math.max(1, Math.ceil(total / pageSize))
  }, [pageSize, query.data?.total])

  return (
    <section className="space-y-4">
      <PageHeader
        title="Non-Indian Onboarded"
        description="Onboarded users whose phone is not +91 (country is display-only)."
      />

      <Card>
        <CardContent className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-2">
            <DateGranularityControls
              start={filters.start}
              end={filters.end}
              granularity={filters.granularity}
              onChange={(next) => {
                setFilters(next)
                setPage(0)
              }}
              showGranularity={false}
            />
          </div>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Page size</span>
            <Select
              aria-label="Page size"
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(0)
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>

      <p className="text-sm text-slate-600">
        Total:{' '}
        <span className="font-semibold text-slate-900">
          {query.data ? formatNumber(query.data.total) : '—'}
        </span>
      </p>

      {query.isError ? (
        <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
      ) : null}

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`non-indian-row-${index + 1}`} className="h-14 w-full" />
          ))}
        </div>
      ) : null}

      {!query.isLoading && !query.isError && !query.data?.items.length ? (
        <EmptyState
          title="No non-Indian onboarded users."
          subtitle="Try widening the date range."
        />
      ) : null}

      {!query.isLoading && query.data && query.data.items.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Member ID</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Gender</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Onboarded at</th>
                  <th className="px-3 py-2">Profile</th>
                  <th className="px-3 py-2">Account</th>
                  <th className="px-3 py-2">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((item) => (
                  <tr key={item.userId} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2">
                      <UserLink userId={item.userId} label={item.fullName ?? item.userId} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">
                      {item.memberId ?? '--'}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {item.phone ? (
                        <a className="text-sky-700 underline" href={`tel:${item.phone}`}>
                          {item.phone}
                        </a>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-3 py-2">{item.gender ?? '--'}</td>
                    <td className="px-3 py-2">{locationLabel(item.city, item.state, item.country)}</td>
                    <td className="px-3 py-2">{formatDateTime(item.onboardingCompletedAt)}</td>
                    <td className="px-3 py-2">{item.profileStatus ?? '--'}</td>
                    <td className="px-3 py-2">{item.accountStatus ?? '--'}</td>
                    <td className="px-3 py-2">{item.subscribed ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
