import { describe, expect, it } from 'vitest'
import type { AdminMetricCard } from '@/api/types'
import { filterUnknownPlatformMetrics } from '@/utils/overviewMetrics'

function metric(
  key: string,
  breakdown: AdminMetricCard['breakdown'] = [],
): AdminMetricCard {
  return { key, total: 1, series: [], breakdown }
}

describe('filterUnknownPlatformMetrics', () => {
  it('drops unknown onboarding platform series cards', () => {
    const filtered = filterUnknownPlatformMetrics([
      metric('onboarding_completed'),
      metric('onboarding_completed_ios'),
      metric('onboarding_completed_android'),
      metric('onboarding_completed_unknown'),
      metric('onboarding_completed_approved_unknown'),
      metric('paid_users'),
    ])

    expect(filtered.map((item) => item.key)).toEqual([
      'onboarding_completed',
      'onboarding_completed_ios',
      'onboarding_completed_android',
      'paid_users',
    ])
  })

  it('strips UNKNOWN from breakdown while keeping iOS and Android', () => {
    const filtered = filterUnknownPlatformMetrics([
      metric('onboarding_completed', [
        { key: 'IOS', value: 10 },
        { key: 'ANDROID', value: 8 },
        { key: 'UNKNOWN', value: 2 },
      ]),
    ])

    expect(filtered).toHaveLength(1)
    expect(filtered[0].breakdown).toEqual([
      { key: 'IOS', value: 10 },
      { key: 'ANDROID', value: 8 },
    ])
  })

  it('leaves metrics without UNKNOWN breakdown unchanged by reference', () => {
    const card = metric('matches', [{ key: 'like', value: 3 }])
    const filtered = filterUnknownPlatformMetrics([card])
    expect(filtered[0]).toBe(card)
  })
})
