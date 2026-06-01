import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminSalesLeads, useAdminSalesSummary } from '@/hooks/api/useAdminSales'
import type { AccountStatus, AdminSalesStatus, ProfileStatus } from '@/api/types'
import { routes } from '@/router/paths'
import { toUtcIso } from '@/utils/date'
import { formatCompactNumber, formatDateTime } from '@/utils/format'

const PAGE_SIZE = 20
const salesStatuses = [
  'ALL',
  'CALL_REMAINING',
  'ALREADY_CALLED',
  'CALL_NOT_PICKED',
  'CALL_BACK_LATER',
  'INTERESTED',
  'NOT_INTERESTED',
]

type SalesAccountFilter = AccountStatus | 'ANY'
type SalesProfileFilter = ProfileStatus | 'ANY'

export default function SalesPage() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [status, setStatus] = useState<'ALL' | AdminSalesStatus>('ALL')
  const [followUpStart, setFollowUpStart] = useState('')
  const [followUpEnd, setFollowUpEnd] = useState('')
  const [search, setSearch] = useState('')
  const [accountStatus, setAccountStatus] = useState<SalesAccountFilter>('ACTIVE')
  const [profileStatus, setProfileStatus] = useState<SalesProfileFilter>('APPROVED')
  const [genderInput, setGenderInput] = useState('')
  const [subscribedTri, setSubscribedTri] = useState<'' | 'true' | 'false'>('')
  const [verifiedTri, setVerifiedTri] = useState<'' | 'true' | 'false'>('')
  const [page, setPage] = useState(0)

  const filters = {
    start: toUtcIso(start),
    end: toUtcIso(end),
    status: status || 'ALL',
    followUpStart: toUtcIso(followUpStart),
    followUpEnd: toUtcIso(followUpEnd),
    query: search || undefined,
    accountStatus: accountStatus === 'ANY' ? undefined : accountStatus,
    profileStatus: profileStatus === 'ANY' ? undefined : profileStatus,
    gender: genderInput.trim() || undefined,
    subscribed: subscribedTri === '' ? undefined : subscribedTri === 'true',
    verifiedProfile: verifiedTri === '' ? undefined : verifiedTri === 'true',
    page,
    size: PAGE_SIZE,
  } as const

  const leadsQuery = useAdminSalesLeads(filters)
  const summaryQuery = useAdminSalesSummary({ start: filters.start, end: filters.end })

  const totalPages = useMemo(() => {
    const total = leadsQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [leadsQuery.data?.total])

  const filteredTotalIsPageBound =
    status !== 'ALL' || Boolean(filters.followUpStart) || Boolean(filters.followUpEnd)

  return (
    <section className="space-y-4">
      <PageHeader title="Sales" description="Manage lead pipeline, follow-ups, and sales outcomes." />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <p className="mt-1 text-sm text-slate-600">
            The first date range filters leads by <strong>when their profile was created</strong> and drives the{' '}
            <strong>summary KPI cards</strong> with the same range. The second range filters the <strong>leads table
            only</strong> by scheduled follow-up. Times use your browser clock and are sent to the API as UTC.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            <strong>Profile filters</strong> below match <code className="rounded bg-slate-100 px-1">user_profiles</code>{' '}
            (same idea as User search). By default we send <strong>account ACTIVE</strong> and <strong>profile
            APPROVED</strong> so deleted, banned, or non-approved profiles stay out of the call queue—set Account or
            Profile to <strong>Any</strong> to widen the list.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Profile created</h4>
            <p className="text-xs text-slate-600">
              Optional. When set, narrows the list to profiles whose <code className="rounded bg-slate-100 px-1">createdAt</code>{' '}
              falls in this window. Summary totals use these same dates. Leave both empty to list all leads; summary may
              then follow server defaults, so pick a range if KPIs and the table should match.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">From</span>
                <Input
                  id="sales-filter-profile-start"
                  type="datetime-local"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  aria-label="Profile created from"
                />
              </label>
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">To</span>
                <Input
                  id="sales-filter-profile-end"
                  type="datetime-local"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  aria-label="Profile created to"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900">Follow-up scheduled</h4>
            <p className="text-xs text-slate-600">
              Optional. Filters the <strong>leads table only</strong> by follow-up time. If either bound is set, leads
              with no follow-up date are hidden. Does not change the summary KPI cards.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">From</span>
                <Input
                  id="sales-filter-followup-start"
                  type="datetime-local"
                  value={followUpStart}
                  onChange={(event) => setFollowUpStart(event.target.value)}
                  aria-label="Follow-up from"
                />
              </label>
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">To</span>
                <Input
                  id="sales-filter-followup-end"
                  type="datetime-local"
                  value={followUpEnd}
                  onChange={(event) => setFollowUpEnd(event.target.value)}
                  aria-label="Follow-up to"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900">Profile filters</h4>
            <p className="text-xs text-slate-600">
              Optional refinements on profile data. Gender must match the stored value exactly (trimmed). Subscribed
              and Verified profile use Yes/No only when you need to narrow results.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Account status</span>
                <Select
                  id="sales-filter-account-status"
                  value={accountStatus}
                  onChange={(event) => {
                    setAccountStatus(event.target.value as SalesAccountFilter)
                    setPage(0)
                  }}
                  aria-label="Filter by account status"
                >
                  <option value="ACTIVE">Active (default)</option>
                  <option value="ANY">Any</option>
                  <option value="DELETED">Deleted</option>
                  <option value="BANNED">Banned</option>
                </Select>
              </label>
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Profile status</span>
                <Select
                  id="sales-filter-profile-status"
                  value={profileStatus}
                  onChange={(event) => {
                    setProfileStatus(event.target.value as SalesProfileFilter)
                    setPage(0)
                  }}
                  aria-label="Filter by profile moderation status"
                >
                  <option value="APPROVED">Approved (default)</option>
                  <option value="ANY">Any</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </Select>
              </label>
              <label className="block text-sm text-slate-600 sm:col-span-2 lg:col-span-1">
                <span className="mb-1 block font-medium text-slate-800">Gender (exact match)</span>
                <Input
                  id="sales-filter-gender"
                  placeholder="e.g. Male"
                  value={genderInput}
                  onChange={(event) => {
                    setGenderInput(event.target.value)
                    setPage(0)
                  }}
                  aria-label="Filter by gender exact match"
                />
              </label>
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Subscribed</span>
                <Select
                  id="sales-filter-subscribed"
                  value={subscribedTri}
                  onChange={(event) => {
                    setSubscribedTri(event.target.value as '' | 'true' | 'false')
                    setPage(0)
                  }}
                  aria-label="Filter by subscribed"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </label>
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Verified profile</span>
                <Select
                  id="sales-filter-verified"
                  value={verifiedTri}
                  onChange={(event) => {
                    setVerifiedTri(event.target.value as '' | 'true' | 'false')
                    setPage(0)
                  }}
                  aria-label="Filter by verified profile"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </label>
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Sales status</span>
              <Select
                id="sales-filter-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as 'ALL' | AdminSalesStatus)
                  setPage(0)
                }}
                aria-label="Filter by sales status"
              >
                {salesStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Search</span>
              <Input
                id="sales-filter-search"
                placeholder="User ID, member ID, phone, or name"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(0)
                }}
                aria-label="Search leads by user ID, member ID, phone, or name"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <QueryFeedback loading={false} error={summaryQuery.error} onRetry={() => void summaryQuery.refetch()} />
      {summaryQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`sales-summary-${index + 1}`} className="h-28 w-full" />
          ))}
        </div>
      ) : null}
      {summaryQuery.data?.metrics?.length ? (
        <>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            {summaryQuery.data.metrics.map((metric) => (
              <Card key={metric.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase text-slate-500">{metric.key}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(metric.total)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Summary KPIs use the <strong>Profile created</strong> dates in Filters (or server defaults when both are
            empty).
          </p>
        </>
      ) : null}

      <QueryFeedback loading={false} error={leadsQuery.error} onRetry={() => void leadsQuery.refetch()} />
      {leadsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`lead-row-${index + 1}`} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {!leadsQuery.isLoading && !leadsQuery.data?.items.length ? (
        <EmptyState title="No leads found." subtitle="Try adjusting date, status, or follow-up filters." />
      ) : null}

      {leadsQuery.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">User ID</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Note</th>
                  <th className="px-3 py-2">Follow-up</th>
                  <th className="px-3 py-2">Last Called</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {leadsQuery.data.items.map((lead) => (
                  <tr key={lead.userId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <UserLink userId={lead.userId} label={lead.fullName ?? lead.userId} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      <UserLink userId={lead.userId} />
                    </td>
                    <td className="px-3 py-2">{lead.salesStatus}</td>
                    <td className="max-w-[250px] px-3 py-2">{lead.note || '--'}</td>
                    <td className="px-3 py-2">{formatDateTime(lead.followUpAt)}</td>
                    <td className="px-3 py-2">{formatDateTime(lead.lastCalledAt)}</td>
                    <td className="px-3 py-2">
                      <Link className="underline" to={routes.salesLeadDetail(lead.userId)}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          <p>
            Page {page + 1} of {totalPages}
          </p>
          {filteredTotalIsPageBound ? (
            <p className="text-xs">
              Filtered totals are page-scoped by backend when status or follow-up filters are applied.
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
