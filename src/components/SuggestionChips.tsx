'use client'

interface Props {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  onDismiss: (suggestion: string) => void
  loading?: boolean
  selectingChip?: string | null
}

export function SuggestionChips({ suggestions, onSelect, onDismiss, loading, selectingChip }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Suggested todo items</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 rounded-md bg-muted animate-pulse" style={{ width: `${42 + (i % 2) * 12}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!suggestions.length) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Suggested todo items</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => {
          const isSelecting = selectingChip === s
          return (
            <div
              key={s}
              className={`flex items-center gap-1 border-2 rounded-md pl-2.5 pr-1 py-1 max-w-[calc(50%-4px)] transition-opacity ${
                isSelecting ? 'border-blue-300 opacity-60' : 'border-blue-500'
              }`}
            >
              <button
                type="button"
                onClick={() => !isSelecting && onSelect(s)}
                disabled={isSelecting}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate flex-1 text-left disabled:cursor-wait"
              >
                {isSelecting ? 'Loading…' : s}
              </button>
              <button
                type="button"
                onClick={() => onDismiss(s)}
                disabled={isSelecting}
                className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] leading-none hover:bg-blue-600 disabled:opacity-40"
                aria-label="Dismiss suggestion"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
