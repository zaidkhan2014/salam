import { describe, expect, it } from 'vitest'
import { defaultDateRange } from '@/utils/date'

describe('defaultDateRange', () => {
  it('emits UTC Instant strings ending with Z (no local offset)', () => {
    const range = defaultDateRange()
    expect(range.start).toMatch(/Z$/)
    expect(range.end).toMatch(/Z$/)
    expect(range.start).not.toContain('+')
    expect(range.end).not.toContain('+')
  })
})
