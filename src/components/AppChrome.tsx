'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { NavDrawer } from '@/components/NavDrawer'
import { InarchLauncher, OPEN_DOCKED_PARAM } from '@inarch/sdk/launcher'

/**
 * Wraps the app's own header + main content area. Skips the header (and its
 * reserved top padding) on /inarch-panel specifically — that route is loaded
 * inside InarchLauncher's iframe, and it only needs the Inarch panel's own
 * nav, not the product's. Client-side pathname check since RootLayout itself
 * is a Server Component and doesn't know the current route.
 *
 * Also skips rendering InarchLauncher itself there: /inarch-panel is the
 * same content the launcher's iframe shows, so keeping the button up would
 * let someone open a second copy of the panel nested inside the first.
 */
export function AppChrome({ branch, testName, children }: { branch: string; testName?: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isInarchPanel = pathname === '/inarch-panel'
  // Same detection InarchLauncher itself uses. The back link only makes
  // sense when /inarch-panel is the whole page — inside the launcher's own
  // iframe, clicking it would navigate the iframe (not the top-level page)
  // to /notes, squeezing the full app into the docked panel's width with no
  // way back out.
  const [isInIframe, setIsInIframe] = useState(false)
  useEffect(() => {
    setIsInIframe(window.self !== window.top)
  }, [])

  if (isInarchPanel) {
    return (
      <>
        {!isInIframe && (
          <div className="shrink-0 px-3 py-2">
            <Link
              href={`/notes?${OPEN_DOCKED_PARAM}=1`}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              ← Back to To Do!
            </Link>
          </div>
        )}
        <main className="flex-1 overflow-hidden">{children}</main>
      </>
    )
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
      <InarchLauncher testName={testName} />
    </>
  )
}
