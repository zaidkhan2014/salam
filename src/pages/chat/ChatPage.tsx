import { AnalyticsPageTemplate } from '@/components/metrics/AnalyticsPageTemplate'
import { useChatMetrics } from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function ChatPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const query = useChatMetrics(filters)

  return (
    <AnalyticsPageTemplate
      title="Chat"
      description="Chat initiation and message volume trends."
      filters={filters}
      onFiltersChange={setFilters}
      query={query}
    />
  )
}
