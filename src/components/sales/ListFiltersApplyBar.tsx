import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface ListFiltersApplyBarProps {
  dirty: boolean
  onApply: () => void
}

export function ListFiltersApplyBar({ dirty, onApply }: ListFiltersApplyBarProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
      {dirty ? (
        <p className="text-sm text-amber-800 sm:mr-auto">Filters changed — click Apply to update the list.</p>
      ) : null}
      <Button
        type="button"
        onClick={onApply}
        aria-label="Apply filters"
        className={cn(
          'w-full px-6 py-2.5 text-base font-semibold sm:w-auto',
          dirty ? 'bg-slate-900 shadow-sm ring-2 ring-slate-900/20' : 'bg-slate-700',
        )}
      >
        Apply filters
      </Button>
    </div>
  )
}
