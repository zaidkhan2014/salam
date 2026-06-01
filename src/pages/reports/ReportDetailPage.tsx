import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminReportDetail } from '@/hooks/api/useAdminReports'
import { routes } from '@/router/paths'
import { formatDateTime } from '@/utils/format'

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const query = useAdminReportDetail(reportId)

  return (
    <section className="space-y-4">
      <PageHeader title="Report Detail" description={`Detail for report ${reportId ?? '--'}.`} />
      <Link to={routes.reports} className="text-sm text-slate-700 underline">
        Back to reports
      </Link>

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
      {query.isLoading ? <Skeleton className="h-52 w-full" /> : null}

      {query.data ? (
        <Card>
          <CardHeader>
            <CardTitle>Report Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Report ID" value={query.data.reportId} />
            <Row label="Reporter" value={<UserLink userId={query.data.reporterUserId} />} />
            <Row label="Reported User" value={<UserLink userId={query.data.reportedUserId} />} />
            <Row label="Reason" value={query.data.reason} />
            <Row label="Target Type" value={query.data.reportTargetType} />
            <Row label="Created" value={formatDateTime(query.data.createdAt)} />
            <Row label="Details" value={query.data.details || '--'} />
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value || '--'}</span>
    </div>
  )
}
