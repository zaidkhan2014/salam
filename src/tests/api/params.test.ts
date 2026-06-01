import { describe, expect, it } from 'vitest'
import { cleanQueryParams } from '@/api/params'

describe('cleanQueryParams', () => {
  it('removes null, undefined, and empty strings', () => {
    expect(
      cleanQueryParams({
        a: 'ok',
        b: '',
        c: '   ',
        d: undefined,
        e: null,
      }),
    ).toEqual({ a: 'ok' })
  })

  it('keeps false and numeric zero values', () => {
    expect(cleanQueryParams({ active: false, page: 0, size: 20 })).toEqual({
      active: false,
      page: 0,
      size: 20,
    })
  })

  it('drops empty arrays and keeps non-empty arrays', () => {
    expect(cleanQueryParams({ reasons: [], statuses: ['APPROVED'] })).toEqual({
      statuses: ['APPROVED'],
    })
  })
})
