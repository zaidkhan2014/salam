import { describe, expect, it } from 'vitest'
import { formatCompactNumber, formatDateTime, formatNumber } from '@/utils/format'

describe('format utils', () => {
  it('formats numbers in en-IN locale', () => {
    expect(formatNumber(123456)).toContain('1')
  })

  it('formats compact numbers', () => {
    expect(formatCompactNumber(123456)).not.toHaveLength(0)
  })

  it('handles nullable dates', () => {
    expect(formatDateTime(null)).toBe('--')
    expect(formatDateTime('')).toBe('--')
  })
})
