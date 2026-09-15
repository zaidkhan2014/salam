import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminDeletedSalesConversions } from '@/hooks/api/useAdminDeletedSales'
import { DeletedAccountsSubNav } from '@/pages/deleted-accounts/DeletedAccountsSubNav'
import { routes } from '@/router/paths'
import { toUtcIso } from '@/utils/date'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 20

export default function DeletedAccountsConversionsPage() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [assignedToAdminId, setAssignedToAdminId] = useState('')
  const [page, setPage] = useState(0)

  const filters = useMemo(
    () => ({
      start: toUtcIso(start),
      end: toUtcIso(end),
      assignedToAdminId: assignedToAdminId.trim() || undefined,
      page,
      size: PAGE_SIZE,
    }),
    [assignedToAdminId, end, page, start],
  )

  const query = useAdminDeletedSalesConversions(filters)
  const totalPages = Math.max(1, Math.ceil((query.data?.total ?? 0) / PAGE_SIZE))

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader title="Deleted Accounts Conversions" description="Subscribed purged archives with conversion metadata." />
      <DeletedAccountsSubNav />

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm text-slate-600">
          <span className="mb-1 block font-medium">Deleted from</span>
          <Input type="datetime-local" value={start} onChange={(e) => { setStart(e.target.value); setPage(0) }} />
        </label>
        <label className="block text-sm text-slate-600">
          <span className="mb-1 block font-medium">Deleted to</span>
          <Input type="datetime-local" value={end} onChange={(e) => { setEnd(e.target.value); setPage(0) }} />
        </label>
        <label className="block text-sm text-slate-600">
          <span className="mb-1 block font-medium">Assigned to (employeeId)</span>
          <Input
            placeholder="SALES001"
            value={assignedToAdminId}
            onChange={(e) => { setAssignedToAdminId(e.target.value); setPage(0) }}
          />
        </label>
      </div>

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
      {query.isLoading ? <Skeleton className="h-40 w-full" /> : null}

      {!query.isLoading && !query.data?.items.length ? <EmptyState title="No conversions found." /> : null}

      {query.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Assigned</th>
                  <th className="px-3 py-2">Converted</th>
                  <th className="px-3 py-2">Subscribed</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((row) => (
                  <tr key={row.userId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <UserLink userId={row.userId} label={row.fullName ?? row.userId} />
                    </td>
                    <td className="px-3 py-2">{row.phone ?? '--'}</td>
                    <td className="px-3 py-2">{row.assignedToAdminId ?? '--'}</td>
                    <td className="px-3 py-2">{formatDateTime(row.convertedAt)}</td>
                    <td className="px-3 py-2">{formatDateTime(row.subscribedAt)}</td>
                    <td className="px-3 py-2">
                      <Link className="underline" to={routes.deletedAccountsLeadDetail(row.userId)}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
