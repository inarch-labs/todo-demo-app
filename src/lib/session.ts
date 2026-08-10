import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { PREVIEW_SESSION_COOKIE } from '@/proxy'
import type { SessionType } from '@/lib/study'

/**
 * Reads the session_id cookie that proxy.ts (src/proxy.ts) already assigned
 * for this request. Only falls back to minting an ephemeral id if called
 * somewhere proxy's matcher doesn't cover — that id won't persist, since a
 * Server Component render can't set cookies (Route Handlers can, but they
 * see proxy's cookie too by the time they run).
 */
export async function getSessionId(): Promise<string> {
  const jar = await cookies()
  return jar.get('session_id')?.value ?? nanoid()
}

/**
 * Whether this browser is in a preview session (see proxy.ts's handling of
 * PREVIEW_SESSION_PARAM) — determines the `type` a session/studyProgress/
 * studyEvents/studyRatings row gets written with.
 */
export async function getSessionType(): Promise<SessionType> {
  const jar = await cookies()
  return jar.get(PREVIEW_SESSION_COOKIE)?.value ? 'preview' : 'regular'
}
