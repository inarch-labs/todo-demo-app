'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const links = [
  { href: '/notes', label: 'Notes' },
  { href: '/todos', label: 'Todos' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/archive', label: 'Archive' },
]

export function NavDrawer() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="17" y2="6" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="14" x2="17" y2="14" />
        </svg>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 pt-12">
        <nav className="flex flex-col gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
