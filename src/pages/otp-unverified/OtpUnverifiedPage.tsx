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
import { useOtpUnverified } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'
import { formatDateTime, formatNumber } from '@/utils/format'

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

export default function OtpUnverifiedPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const query = useOtpUnverified({
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
        title="OTP Unverified"
        description="Users who requested OTP in range but have not verified that request — call list for dropoff follow-up."
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
        Total unverified:{' '}
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
            <Skeleton key={`otp-unverified-row-${index + 1}`} className="h-14 w-full" />
          ))}
        </div>
      ) : null}

      {!query.isLoading && !query.isError && !query.data?.items.length ? (
        <EmptyState
          title="No unverified OTP requests."
          subtitle="Try widening the date range."
        />
      ) : null}

      {!query.isLoading && query.data && query.data.items.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Requested at</th>
                  <th className="px-3 py-2">Failed at</th>
                  <th className="px-3 py-2">Attempts</th>
                  <th className="px-3 py-2">Channel</th>
                  <th className="px-3 py-2">Registered</th>
                  <th className="px-3 py-2">Blocked</th>
                  <th className="px-3 py-2">Account</th>
                  <th className="px-3 py-2">User</th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((item) => (
                  <tr key={item.userId} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {item.phone ? (
                        <a className="text-sky-700 underline" href={`tel:${item.phone}`}>
                          {item.phone}
                        </a>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-3 py-2">{formatDateTime(item.lastOtpRequestedAt)}</td>
                    <td className="px-3 py-2">{formatDateTime(item.lastOtpFailedAt)}</td>
                    <td className="px-3 py-2">{item.otpAttempts}</td>
                    <td className="px-3 py-2">{item.lastOtpChannel ?? '--'}</td>
                    <td className="px-3 py-2">{item.profileRegistered ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2">
                      {item.blocked ? (
                        <span>
                          Yes
                          {item.blockedUntil ? (
                            <span className="mt-0.5 block text-xs text-slate-500">
                              until {formatDateTime(item.blockedUntil)}
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        'No'
                      )}
                    </td>
                    <td className="px-3 py-2">{item.accountStatus ?? '--'}</td>
                    <td className="px-3 py-2">
                      <UserLink userId={item.userId} label={item.userId.slice(0, 8)} />
                    </td>
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
