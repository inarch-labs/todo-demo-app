'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onAddItem: () => void
  onAddDetails: () => void
  onAddWithAI: () => void
  disabled?: boolean
  loading?: boolean
  size?: 'default' | 'sm'
}

export function AddTodoButton({ onAddItem, onAddDetails, onAddWithAI, disabled, loading, size = 'default' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function pick(fn: () => void) {
    setOpen(false)
    fn()
  }

  const h = size === 'sm' ? 'h-8 text-xs px-2.5' : 'h-9 text-sm px-4'
  const chevronH = size === 'sm' ? 'h-8 px-2' : 'h-9 px-2'

  return (
    <div className="relative flex items-stretch" ref={ref}>
      <button
        type="button"
        onClick={onAddItem}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-l-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-r-none border-r border-primary-foreground/20 transition-colors ${h}`}
      >
        {loading ? 'Loading…' : 'Add'}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center justify-center rounded-r-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors ${chevronH}`}
        aria-label="More add options"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-40 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1">
          <button
            type="button"
            onMouseDown={() => pick(onAddDetails)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            Add details
          </button>
          <button
            type="button"
            onMouseDown={() => pick(onAddWithAI)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
            </svg>
            Add with AI
          </button>
        </div>
      )}
    </div>
  )
}
