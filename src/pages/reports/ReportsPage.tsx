import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminReportsSearch } from '@/hooks/api/useAdminReports'
import type { ReportReason } from '@/api/types'
import { routes } from '@/router/paths'
import { toUtcIso } from '@/utils/date'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 20
const reportReasons = [
  'HARASSMENT',
  'FAKE_PROFILE',
  'INAPPROPRIATE_CONTENT',
  'SPAM_OR_SCAM',
  'NOT_INTERESTED_IN_THIS_PERSON',
  'UNDERAGE_OR_MINOR',
  'NUDITY',
  'PERSONAL',
  'HATE_SPEECH',
  'OTHER',
] as const

export default function ReportsPage() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [reason, setReason] = useState<'' | ReportReason>('')
  const [fromUserId, setFromUserId] = useState('')
  const [toUserId, setToUserId] = useState('')
  const [page, setPage] = useState(0)

  const query = useAdminReportsSearch({
    start: toUtcIso(start),
    end: toUtcIso(end),
    reason: reason || undefined,
    fromUserId: fromUserId || undefined,
    toUserId: toUserId || undefined,
    page,
    size: PAGE_SIZE,
  })

  const totalPages = useMemo(() => {
    const total = query.data?.total ?? 0
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [query.data?.total])

  return (
    <section className="space-y-4">
      <PageHeader title="Reports" description="Review user reports and drill into affected users." />
      <Card>
        <CardContent className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-5">
          <Input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
          <Input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
          <Select value={reason} onChange={(event) => setReason(event.target.value as '' | ReportReason)}>
            <option value="">All reasons</option>
            {reportReasons.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Input placeholder="Reporter userId" value={fromUserId} onChange={(event) => setFromUserId(event.target.value)} />
          <Input placeholder="Reported userId" value={toUserId} onChange={(event) => setToUserId(event.target.value)} />
        </CardContent>
      </Card>

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`report-row-${index + 1}`} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {!query.isLoading && !query.data?.items.length ? (
        <EmptyState title="No reports found." subtitle="Try broadening your filters." />
      ) : null}

      {query.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Report ID</th>
                  <th className="px-3 py-2">Reporter</th>
                  <th className="px-3 py-2">Reported User</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((report) => (
                  <tr key={report.reportId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <Link className="underline" to={routes.reportDetail(report.reportId)}>
                        {report.reportId}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <UserLink userId={report.reporterUserId} />
                    </td>
                    <td className="px-3 py-2">
                      <UserLink userId={report.reportedUserId} />
                    </td>
                    <td className="px-3 py-2">{report.reason}</td>
                    <td className="px-3 py-2">{report.reportTargetType}</td>
                    <td className="px-3 py-2">{formatDateTime(report.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
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
    </section>
  )
}
