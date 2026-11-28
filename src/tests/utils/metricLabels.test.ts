import { describe, expect, it } from 'vitest'
import { formatBreakdownKey, formatMetricTitle, isPlatformBreakdown } from '@/utils/metricLabels'

describe('metricLabels', () => {
  it('overrides onboarding_completed_approved title', () => {
    expect(formatMetricTitle('onboarding_completed_approved')).toBe('Onboarding completed (approved)')
  })

  it('overrides platform onboarding series titles', () => {
    expect(formatMetricTitle('onboarding_completed_ios')).toBe('Onboarding completed (iOS)')
    expect(formatMetricTitle('onboarding_completed_android')).toBe('Onboarding completed (Android)')
    expect(formatMetricTitle('onboarding_completed_approved_ios')).toBe(
      'Onboarding completed approved (iOS)',
    )
  })

  it('formats platform breakdown keys', () => {
    expect(formatBreakdownKey('IOS')).toBe('iOS')
    expect(formatBreakdownKey('ANDROID')).toBe('Android')
    expect(formatBreakdownKey('UNKNOWN')).toBe('Unknown')
    expect(formatBreakdownKey('OTHER')).toBe('OTHER')
  })

  it('detects platform-only breakdowns', () => {
    expect(isPlatformBreakdown(['IOS', 'ANDROID', 'UNKNOWN'])).toBe(true)
    expect(isPlatformBreakdown(['IOS', 'plan_a'])).toBe(false)
    expect(isPlatformBreakdown([])).toBe(false)
  })
})
