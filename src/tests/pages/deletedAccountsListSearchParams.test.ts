import { describe, expect, it } from 'vitest'
import {
  defaultDeletedAccountsListUrlState,
  deletedAccountsListStateToApiFilters,
  deletionRangePreset,
  parseDeletedAccountsListSearchParams,
  toDeletedAccountsListSearchParams,
} from '@/pages/deleted-accounts/deletedAccountsListSearchParams'

function roundTrip(initial: ReturnType<typeof defaultDeletedAccountsListUrlState>) {
  return parseDeletedAccountsListSearchParams(toDeletedAccountsListSearchParams(initial))
}

describe('deletedAccountsListSearchParams', () => {
  it('round-trips defaults via empty URLSearchParams', () => {
    expect(parseDeletedAccountsListSearchParams(new URLSearchParams())).toEqual(
      defaultDeletedAccountsListUrlState(),
    )
  })

  it('round-trips filters without accountStatus', () => {
    const state = {
      ...defaultDeletedAccountsListUrlState(),
      status: 'INTERESTED' as const,
      gender: 'Female',
      birthYear: '2000',
      minIncomeBandId: 'INC_IN_30_40',
      pool: 'true' as const,
      page: 1,
    }
    expect(roundTrip(state)).toEqual(state)
    expect(toDeletedAccountsListSearchParams(state).get('accountStatus')).toBeNull()
  })

  it('maps to API filters without accountStatus', () => {
    const api = deletedAccountsListStateToApiFilters(
      {
        ...defaultDeletedAccountsListUrlState(),
        gender: 'Male',
        status: 'CALL_REMAINING',
      },
      20,
    )
    expect(api).not.toHaveProperty('accountStatus')
    expect(api.gender).toBe('Male')
    expect(api.status).toBe('CALL_REMAINING')
  })

  it('preserves multi-word and trailing-space state/city while typing', () => {
    const midType = {
      ...defaultDeletedAccountsListUrlState(),
      state: 'Uttar ',
      city: 'New ',
    }
    expect(toDeletedAccountsListSearchParams(midType).get('state')).toBe('Uttar ')
    expect(toDeletedAccountsListSearchParams(midType).get('city')).toBe('New ')
    expect(roundTrip(midType)).toEqual(midType)

    const complete = {
      ...defaultDeletedAccountsListUrlState(),
      state: 'Uttar Pradesh',
      city: 'New Delhi',
    }
    expect(roundTrip(complete)).toEqual(complete)
  })

  it('trims state/city when mapping to API filters', () => {
    const api = deletedAccountsListStateToApiFilters(
      {
        ...defaultDeletedAccountsListUrlState(),
        state: 'Uttar Pradesh ',
        city: ' New Delhi',
      },
      20,
    )
    expect(api.state).toBe('Uttar Pradesh')
    expect(api.city).toBe('New Delhi')
  })

  it('deletionRangePreset returns datetime-local start/end', () => {
    const range = deletionRangePreset(7)
    expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})
