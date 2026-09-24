import type { UseQueryResult } from '@tanstack/react-query'
import type { AdminLoginFunnelResponse } from '@/api/types'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { GenderPieChart } from '@/components/genderMonitoring/GenderPieChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCompactNumber } from '@/utils/format'

interface LoginFunnelSectionProps {
  query: UseQueryResult<AdminLoginFunnelResponse, Error>
}

function formatPercent(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return '—'
  }
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

export function LoginFunnelSection({ query }: LoginFunnelSectionProps) {
  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`login-funnel-kpi-${index + 1}`} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
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

  const verifyRate = formatPercent(data.otpVerified, data.otpRequested)
  const existingShare = formatPercent(data.existingUserLogin.total, data.otpVerified)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>OTP requested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(data.otpRequested)}</p>
            <p className="mt-1 text-xs text-slate-500">Distinct users with OTP request in range</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>OTP verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(data.otpVerified)}</p>
            <p className="mt-1 text-xs text-slate-500">Verify rate: {verifyRate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing user login</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">
              {formatCompactNumber(data.existingUserLogin.total)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Female {data.existingUserLogin.femalePercent.toFixed(1)}% · Share of verifies: {existingShare}
            </p>
          </CardContent>
        </Card>
      </div>

      <GenderPieChart
        title="Existing user login by gender"
        subtitle="Profile registered before that login"
        snapshot={data.existingUserLogin}
      />
    </div>
  )
}
