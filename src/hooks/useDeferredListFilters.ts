import { useCallback, useEffect, useMemo, useState } from 'react'

function stableSerialize(value: unknown): string {
  return JSON.stringify(value)
}

/**
 * Draft form state for list filters. Edits stay local until `applyFilters`
 * commits `{ ...draft, page: 0 }` via `commit`. Re-syncs when `committed` changes
 * (URL navigation, presets, saved views, pagination).
 */
export function useDeferredListFilters<T extends { page: number }>(
  committed: T,
  commit: (next: T) => void,
) {
  const [draft, setDraft] = useState(committed)
  const committedKey = useMemo(() => stableSerialize(committed), [committed])

  useEffect(() => {
    setDraft(committed)
    // Sync only when the committed URL state actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- committedKey tracks committed
  }, [committedKey])

  const patchDraft = useCallback((patch: Partial<T>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const applyFilters = useCallback(() => {
    commit({ ...draft, page: 0 })
  }, [commit, draft])

  const isDirty = useMemo(() => stableSerialize(draft) !== committedKey, [draft, committedKey])

  return { draft, patchDraft, applyFilters, isDirty }
}
