import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminSalesLeadDetail,
  useUpdateSalesFollowUp,
  useUpdateSalesNote,
  useUpdateSalesStatus,
} from '@/hooks/api/useAdminSales'
import { routes } from '@/router/paths'
import { toUtcIso } from '@/utils/date'
import { formatDateTime } from '@/utils/format'

const statuses = [
  'CALL_REMAINING',
  'ALREADY_CALLED',
  'CALL_NOT_PICKED',
  'CALL_BACK_LATER',
  'INTERESTED',
  'NOT_INTERESTED',
] as const

export default function SalesLeadDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const query = useAdminSalesLeadDetail(userId)
  const updateStatus = useUpdateSalesStatus(userId ?? '')
  const updateNote = useUpdateSalesNote(userId ?? '')
  const updateFollowUp = useUpdateSalesFollowUp(userId ?? '')

  const [status, setStatus] = useState<(typeof statuses)[number]>('CALL_REMAINING')
  const [lastCalledAt, setLastCalledAt] = useState('')
  const [note, setNote] = useState('')
  const [adminUserId, setAdminUserId] = useState('')
  const [followUpAt, setFollowUpAt] = useState('')

  const isBusy =
    updateStatus.isPending || updateNote.isPending || updateFollowUp.isPending || query.isRefetching

  const profileLocation = useMemo(() => {
    const profile = query.data?.profile
    if (!profile) {
      return '--'
    }
    const city = profile.basicDetails?.city ?? ''
    const state = profile.basicDetails?.state ?? ''
    const country = profile.basicDetails?.country ?? ''
    return [city, state, country].filter(Boolean).join(', ') || '--'
  }, [query.data?.profile])

  return (
    <section className="space-y-4">
      <PageHeader title="Sales Lead Detail" description={`Manage sales lead for ${userId ?? '--'}.`} />
      <Link to={routes.sales} className="text-sm text-slate-700 underline">
        Back to sales
      </Link>

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
      {query.isLoading ? <Skeleton className="h-80 w-full" /> : null}

      {query.data ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lead Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="User ID" value={<UserLink userId={query.data.profile.userId} />} />
              <Row label="Full Name" value={query.data.profile.basicDetails?.fullName ?? '--'} />
              <Row label="Phone" value={query.data.profile.phone ?? '--'} />
              <Row label="Location" value={profileLocation} />
              <Row label="Sales Status" value={query.data.salesStatus} />
              <Row label="Latest Note" value={query.data.note || '--'} />
              <Row label="Follow-up At" value={formatDateTime(query.data.followUpAt)} />
              <Row label="Last Called At" value={formatDateTime(query.data.lastCalledAt)} />
              <Row label="Signup At" value={formatDateTime(query.data.signupAt)} />
              <Row label="Last Login At" value={formatDateTime(query.data.lastLoginAt)} />
              <Row label="Last Activity At" value={formatDateTime(query.data.lastActivityAt)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={status}
                onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])}
                disabled={isBusy}
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Input
                type="datetime-local"
                value={lastCalledAt}
                onChange={(event) => setLastCalledAt(event.target.value)}
                disabled={isBusy}
              />
              <Button
                disabled={isBusy}
                onClick={() =>
                  updateStatus.mutate({
                    status,
                    lastCalledAt: toUtcIso(lastCalledAt) ?? null,
                  })
                }
              >
                Update Status
              </Button>

              <Input
                placeholder="admin user id"
                value={adminUserId}
                onChange={(event) => setAdminUserId(event.target.value)}
                disabled={isBusy}
              />
              <Input
                placeholder="Write note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={isBusy}
              />
              <Button
                disabled={isBusy || note.trim().length === 0}
                onClick={() =>
                  updateNote.mutate({
                    note,
                    adminUserId: adminUserId || null,
                  })
                }
              >
                Save Note
              </Button>

              <Input
                type="datetime-local"
                value={followUpAt}
                onChange={(event) => setFollowUpAt(event.target.value)}
                disabled={isBusy}
              />
              <div className="flex gap-2">
                <Button
                  disabled={isBusy}
                  onClick={() =>
                    updateFollowUp.mutate({
                      followUpAt: toUtcIso(followUpAt) ?? null,
                    })
                  }
                >
                  Save Follow-up
                </Button>
                <Button disabled={isBusy} variant="outline" onClick={() => updateFollowUp.mutate({ followUpAt: null })}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Note History</CardTitle>
            </CardHeader>
            <CardContent>
              {!query.data.notes.length ? (
                <p className="text-sm text-slate-500">No notes available.</p>
              ) : (
                <div className="space-y-2">
                  {query.data.notes.map((entry) => (
                    <div key={`${entry.createdAt}-${entry.text}`} className="rounded-lg border border-slate-200 p-3 text-sm">
                      <p className="text-slate-900">{entry.text}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.adminUserId ?? 'unknown admin'} - {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value || '--'}</span>
    </div>
  )
}
