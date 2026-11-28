import type { AdminMetricCard } from '@/api/types'

const UNKNOWN_ONBOARDING_PLATFORM_KEYS = new Set([
  'onboarding_completed_unknown',
  'onboarding_completed_approved_unknown',
])

function isUnknownBreakdownKey(key: string): boolean {
  return key.trim().toUpperCase() === 'UNKNOWN'
}

/**
 * Overview-only filter: drop Unknown-platform onboarding series cards and
 * strip UNKNOWN from remaining metric breakdowns.
 */
export function filterUnknownPlatformMetrics(metrics: AdminMetricCard[]): AdminMetricCard[] {
  return metrics
    .filter((metric) => !UNKNOWN_ONBOARDING_PLATFORM_KEYS.has(metric.key))
    .map((metric) => {
      if (!metric.breakdown.some((item) => isUnknownBreakdownKey(item.key))) {
        return metric
      }
      return {
        ...metric,
        breakdown: metric.breakdown.filter((item) => !isUnknownBreakdownKey(item.key)),
      }
    })
}
