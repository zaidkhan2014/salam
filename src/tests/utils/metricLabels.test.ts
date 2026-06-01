import { describe, expect, it } from 'vitest'
import { formatMetricTitle } from '@/utils/metricLabels'

describe('formatMetricTitle', () => {
  it('uses OTP acronym overrides', () => {
    expect(formatMetricTitle('otp_requested')).toBe('OTP requested')
    expect(formatMetricTitle('otp_success')).toBe('OTP success')
    expect(formatMetricTitle('otp_failed')).toBe('OTP failed')
  })

  it('title-cases unknown snake_case keys', () => {
    expect(formatMetricTitle('mongo_profile_count')).toBe('Mongo Profile Count')
    expect(formatMetricTitle('active_users')).toBe('Active Users')
  })
})
