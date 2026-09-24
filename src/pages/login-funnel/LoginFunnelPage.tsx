import { PageHeader } from '@/components/common/PageHeader'
import { LoginFunnelSection } from '@/components/loginFunnel/LoginFunnelSection'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { useLoginFunnelMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function LoginFunnelPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useLoginFunnelMetrics({ start: filters.start, end: filters.end })

  return (
    <section className="space-y-4">
      <PageHeader
        title="Login Funnel"
        description="OTP activity in range · existing login = profile registered before that login"
      />
      <DateGranularityControls
        start={filters.start}
        end={filters.end}
        granularity={filters.granularity}
        onChange={setFilters}
        showGranularity={false}
      />
      <LoginFunnelSection query={query} />
    </section>
  )
}
