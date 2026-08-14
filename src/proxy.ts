import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'
import { handlePreviewLink } from '@inarch/sdk/panel/preview'

const SESSION_COOKIE = 'session_id'
const SESSION_MAX_AGE = 60 * 60 * 24 * 365

/**
 * Assigns the session_id cookie here, not in RootLayout/session.ts — a
 * Server Component render can only read cookies, not set them (Next.js
 * throws "Cookies can only be modified in a Server Action or Route
 * Handler" otherwise). Proxy runs ahead of every matched request, so it's
 * the one place that can both mint the cookie for first-time visitors and
 * make it visible to the rest of this same request via request.cookies.
 */
export function proxy(request: NextRequest) {
  const previewResponse = handlePreviewLink(request)
  if (previewResponse) return previewResponse

  if (request.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.next()
  }

  const id = nanoid()
  request.cookies.set(SESSION_COOKIE, id)

  const response = NextResponse.next({ request })
  response.cookies.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return response
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
}
