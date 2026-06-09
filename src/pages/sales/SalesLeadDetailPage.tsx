import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { UserProfileDetailSections } from '@/components/users/UserProfileDetailSections'
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
import { formatDateTime, formatNumber } from '@/utils/format'
import { getInitialsFromFullName, getPrimaryGalleryImageUrl } from '@/utils/profileMedia'

const statuses = [
  'CALL_REMAINING',
  'ALREADY_CALLED',
  'CALL_NOT_PICKED',
  'CALL_BACK_LATER',
  'INTERESTED',
  'NOT_INTERESTED',
] as const

const engagementFields = [
  'reportsAgainstUser',
  'blocksByUser',
  'blocksAgainstUser',
  'activeMatches',
  'initiatedChats',
  'interactionsSent',
] as const

type SalesDetailLocationState = {
  salesListSearch?: string
}

function salesListSearchForLink(raw?: string): string {
  if (!raw) return ''
  return raw.startsWith('?') ? raw.slice(1) : raw
}

export default function SalesLeadDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const location = useLocation()
  const state = location.state as SalesDetailLocationState | null
  const backSearch = salesListSearchForLink(state?.salesListSearch)

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

  const profile = query.data?.profile
  const mainImageUrl = profile ? getPrimaryGalleryImageUrl(profile) : null
  const displayName = profile?.basicDetails?.fullName?.trim() || profile?.userId || userId
  const photoAlt = displayName ? `Profile photo for ${displayName}` : 'Profile photo'

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader title="Sales Lead Detail" description={`Manage sales lead for ${userId ?? '--'}.`} />
      <Link to={{ pathname: routes.sales, search: backSearch }} className="text-sm text-slate-700 underline">
        Back to sales
      </Link>

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
      {query.isLoading ? <Skeleton className="h-80 w-full" /> : null}

      {query.data ? (
        <div className="min-w-0 space-y-4">
          <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start">
            <div className="mx-auto w-full max-w-full min-w-0 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:max-w-md lg:mx-0 lg:w-80">
              <div className="aspect-square w-full">
                {mainImageUrl ? (
                  <img src={mainImageUrl} alt={photoAlt} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-6 text-center text-lg font-medium text-slate-500">
                    {getInitialsFromFullName(profile?.basicDetails?.fullName ?? null) ?? 'No photo'}
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales & activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="User ID" value={<UserLink userId={query.data.profile.userId} />} />
                  <Row label="Sales status" value={query.data.salesStatus} />
                  <Row label="Latest note" value={query.data.note || '--'} />
                  <Row label="Follow-up at" value={formatDateTime(query.data.followUpAt)} />
                  <Row label="Last called at" value={formatDateTime(query.data.lastCalledAt)} />
                  <Row label="Assigned to admin" value={query.data.assignedToAdminId ?? '--'} />
                  <Row label="Sales record created" value={formatDateTime(query.data.salesCreatedAt)} />
                  <Row label="Sales record updated" value={formatDateTime(query.data.salesUpdatedAt)} />
                  <Row label="OTP verified" value={query.data.otpVerified ? 'Yes' : 'No'} />
                  <Row label="Profile registered" value={query.data.profileRegistered ? 'Yes' : 'No'} />
                  <Row label="Signup at" value={formatDateTime(query.data.signupAt)} />
                  <Row label="OTP verified at" value={formatDateTime(query.data.otpVerifiedAt)} />
                  <Row label="Last login at" value={formatDateTime(query.data.lastLoginAt)} />
                  <Row label="Last activity at" value={formatDateTime(query.data.lastActivityAt)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Engagement counters</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {engagementFields.map((field) => (
                    <div key={field} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs uppercase text-slate-500">{field}</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{formatNumber(query.data[field])}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Full profile</CardTitle>
            </CardHeader>
            <CardContent>
              <UserProfileDetailSections profile={query.data.profile} />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
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

            <Card>
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
        </div>
      ) : null}
    </section>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="min-w-0 shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 break-words text-left font-medium text-slate-900 sm:max-w-[65%] sm:text-right">
        {value || '--'}
      </span>
    </div>
  )
}
