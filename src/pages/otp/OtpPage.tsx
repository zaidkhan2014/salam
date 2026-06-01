import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useOtpMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

function OtpSemanticsDetails() {
  return (
    <div>
      <p className="font-medium text-slate-700">How these metrics are counted</p>
      <ul>
        <li>
          Each metric counts <strong>auth_info</strong> documents whose timestamp falls in{' '}
          <strong>[start, end)</strong> (per time bucket for series charts).
        </li>
        <li>
          <strong>OTP requested</strong> (<code className="rounded bg-slate-100 px-1">otp_requested</code>):{' '}
          <code className="rounded bg-slate-100 px-1">lastOtpRequestedAt</code> — set on every successful request-OTP
          (send or retry); <strong>not</strong> cleared when the user verifies; reflects request/login volume; at most
          one document per user per bucket.
        </li>
        <li>
          <strong>OTP success</strong> (<code className="rounded bg-slate-100 px-1">otp_success</code>):{' '}
          <code className="rounded bg-slate-100 px-1">otpVerifiedAt</code>.
        </li>
        <li>
          <strong>OTP failed</strong> (<code className="rounded bg-slate-100 px-1">otp_failed</code>):{' '}
          <code className="rounded bg-slate-100 px-1">lastOtpFailedAt</code> (last failed verify attempt in range).
        </li>
        <li>
          <strong>Legacy rows</strong> may have null <code className="rounded bg-slate-100 px-1">lastOtpRequestedAt</code>{' '}
          until the user requests OTP again after deploy.
        </li>
      </ul>
    </div>
  )
}

export default function OtpPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useOtpMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="OTP Analytics"
      description="OTP request volume vs successful verification and failed verify attempts."
      details={<OtpSemanticsDetails />}
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
