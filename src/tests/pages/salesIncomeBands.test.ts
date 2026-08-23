import { describe, expect, it } from 'vitest'
import {
  ALL_MIN_INCOME_BAND_IDS,
  INDIA_MIN_INCOME_BANDS,
  INTL_MIN_INCOME_BANDS,
  isValidMinIncomeBandId,
  minIncomeBandLabel,
} from '@/pages/sales/salesIncomeBands'

describe('salesIncomeBands', () => {
  it('ALL_MIN_INCOME_BAND_IDS includes all India and International bands', () => {
    for (const band of [...INDIA_MIN_INCOME_BANDS, ...INTL_MIN_INCOME_BANDS]) {
      expect(ALL_MIN_INCOME_BAND_IDS.has(band.id)).toBe(true)
    }
    expect(ALL_MIN_INCOME_BAND_IDS.size).toBe(INDIA_MIN_INCOME_BANDS.length + INTL_MIN_INCOME_BANDS.length)
  })

  it('isValidMinIncomeBandId accepts known ids and rejects garbage', () => {
    expect(isValidMinIncomeBandId('INC_IN_30_40')).toBe(true)
    expect(isValidMinIncomeBandId('INC_INTL_200000P')).toBe(true)
    expect(isValidMinIncomeBandId('INVALID_BAND')).toBe(false)
    expect(isValidMinIncomeBandId('')).toBe(false)
  })

  it('minIncomeBandLabel returns label for known ids', () => {
    expect(minIncomeBandLabel('INC_IN_30_40')).toBe('₹30–₹40 lakh')
    expect(minIncomeBandLabel('INC_INTL_0_20000')).toBe('$0–$20k')
    expect(minIncomeBandLabel('UNKNOWN')).toBeUndefined()
  })
})
