'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { NavDrawer } from '@/components/NavDrawer'

/**
 * Wraps the app's own header + main content area. Skips the header (and its
 * reserved top padding) on /inarch-panel specifically — that route is loaded
 * inside InarchLauncher's iframe, and it only needs the Inarch panel's own
 * nav, not the product's. Client-side pathname check since RootLayout itself
 * is a Server Component and doesn't know the current route.
 */
export function AppChrome({ branch, children }: { branch: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isInarchPanel = pathname === '/inarch-panel'

  if (isInarchPanel) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-background border-b border-border h-14 flex items-center px-4">
        <div className="flex items-center">
          <NavDrawer />
        </div>
        <div className="flex-1 flex justify-center">
          <Link href="/notes" className="text-base font-semibold tracking-tight">To Do!</Link>
        </div>
        <div className="flex items-center">
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
            {branch}
          </span>
        </div>
      </header>
      <main className="flex-1 pt-14">{children}</main>
    </>
  )
}
