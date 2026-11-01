import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDeferredListFilters } from '@/hooks/useDeferredListFilters'

type State = { query: string; status: string; page: number }

describe('useDeferredListFilters', () => {
  it('does not call commit when patching draft', () => {
    const commit = vi.fn()
    const committed: State = { query: '', status: 'ALL', page: 0 }
    const { result } = renderHook(() => useDeferredListFilters(committed, commit))

    act(() => {
      result.current.patchDraft({ query: 'zaid' })
    })

    expect(commit).not.toHaveBeenCalled()
    expect(result.current.draft.query).toBe('zaid')
    expect(result.current.isDirty).toBe(true)
  })

  it('applyFilters commits draft with page 0', () => {
    const commit = vi.fn()
    const committed: State = { query: '', status: 'ALL', page: 2 }
    const { result } = renderHook(() => useDeferredListFilters(committed, commit))

    act(() => {
      result.current.patchDraft({ query: 'aisha', status: 'INTERESTED', page: 5 })
    })
    act(() => {
      result.current.applyFilters()
    })

    expect(commit).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledWith({ query: 'aisha', status: 'INTERESTED', page: 0 })
  })

  it('resets draft when committed changes externally', () => {
    const commit = vi.fn()
    let committed: State = { query: '', status: 'ALL', page: 0 }
    const { result, rerender } = renderHook(
      ({ state }) => useDeferredListFilters(state, commit),
      { initialProps: { state: committed } },
    )

    act(() => {
      result.current.patchDraft({ query: 'draft-only' })
    })
    expect(result.current.isDirty).toBe(true)

    committed = { query: 'from-url', status: 'POOL', page: 1 }
    rerender({ state: committed })

    expect(result.current.draft).toEqual(committed)
    expect(result.current.isDirty).toBe(false)
  })
})
