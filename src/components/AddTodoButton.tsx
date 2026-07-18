'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface Props {
  onAddItem: () => void
  onAddDetails: () => void
  onAddWithAI: () => void
  disabled?: boolean
  loading?: boolean
}

export function AddTodoButton({ onAddItem, onAddDetails, onAddWithAI, disabled, loading }: Props) {
  return (
    <div className="flex items-stretch">
      <Button
        type="button"
        onClick={onAddItem}
        disabled={disabled || loading}
        className="rounded-r-none border-r-0 pr-3"
      >
        {loading ? 'Loading…' : 'Add'}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled || loading}
          className="inline-flex items-center justify-center rounded-l-none rounded-r-md px-2 h-9 bg-primary text-primary-foreground hover:bg-primary/90 border-l border-primary-foreground/20 disabled:opacity-50"
          aria-label="More add options"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onAddDetails}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            Add details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAddWithAI}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
            </svg>
            Add with AI
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
