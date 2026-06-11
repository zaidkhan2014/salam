import { describe, expect, it } from 'vitest'
import {
  defaultSalesListUrlState,
  parseSalesListSearchParams,
  serializeSalesListFiltersForStorage,
  toSalesListSearchParams,
} from '@/pages/sales/salesListSearchParams'

function roundTrip(initial: ReturnType<typeof defaultSalesListUrlState>) {
  const p = toSalesListSearchParams(initial)
  return parseSalesListSearchParams(p)
}

describe('salesListSearchParams', () => {
  it('round-trips defaults via empty URLSearchParams', () => {
    const parsed = parseSalesListSearchParams(new URLSearchParams())
    expect(parsed).toEqual(defaultSalesListUrlState())
  })

  it('round-trips non-default filters', () => {
    const state = {
      ...defaultSalesListUrlState(),
      status: 'INTERESTED' as const,
      query: 'john',
      page: 2,
      accountStatus: 'ANY' as const,
      profileStatus: 'PENDING' as const,
      subscribedTri: 'true' as const,
      verifiedTri: 'false' as const,
      gender: 'Male',
      birthYear: '2000',
      maritalStatus: 'Never married',
    }
    expect(roundTrip(state)).toEqual(state)
  })

  it('round-trips birthYear and maritalStatus in URL', () => {
    const state = {
      ...defaultSalesListUrlState(),
      birthYear: '1995',
      maritalStatus: 'Divorced',
    }
    expect(roundTrip(state)).toEqual(state)
  })

  /** Out-of-range birth year is still preserved in URL state; SalesPage omits it from the API to avoid 400 */
  it('preserves out-of-range birthYear string from URL', () => {
    const parsed = parseSalesListSearchParams(new URLSearchParams('birthYear=1899'))
    expect(parsed.birthYear).toBe('1899')
  })

  it('round-trips datetime-local fragments in URL', () => {
    const state = {
      ...defaultSalesListUrlState(),
      start: '2026-01-01T10:00',
      end: '2026-01-31T18:00',
      followUpStart: '2026-02-01T08:00',
      followUpEnd: '2026-02-10T09:00',
    }
    expect(roundTrip(state)).toEqual(state)
  })

  it('clamps invalid page', () => {
    const p = new URLSearchParams('page=-3&page=notnum')
    expect(parseSalesListSearchParams(p).page).toBe(0)
    const p2 = new URLSearchParams('page=5')
    expect(parseSalesListSearchParams(p2).page).toBe(5)
  })

  it('falls back for unknown enum values', () => {
    const p = new URLSearchParams('status=UNKNOWN&accountStatus=FOO&profileStatus=BAR')
    const parsed = parseSalesListSearchParams(p)
    const d = defaultSalesListUrlState()
    expect(parsed.status).toBe(d.status)
    expect(parsed.accountStatus).toBe(d.accountStatus)
    expect(parsed.profileStatus).toBe(d.profileStatus)
  })

  it('serializeSalesListFiltersForStorage returns empty for defaults', () => {
    expect(serializeSalesListFiltersForStorage(defaultSalesListUrlState())).toBe('')
  })

  it('serializeSalesListFiltersForStorage round-trips with parse', () => {
    const state = {
      ...defaultSalesListUrlState(),
      status: 'INTERESTED' as const,
      query: 'test',
      page: 1,
    }
    const serialized = serializeSalesListFiltersForStorage(state)
    expect(parseSalesListSearchParams(new URLSearchParams(serialized))).toEqual(state)
  })
})
