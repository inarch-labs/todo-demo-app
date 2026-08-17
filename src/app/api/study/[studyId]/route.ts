import { NextResponse } from 'next/server'
import { getSessionId } from '@/lib/session'
import { getInarchStore } from '@/lib/inarch-store'

/**
 * Reads a participant's raw ingredients for deriveStudyProgress() (see
 * @inarch/sdk) — the events themselves, and the session's own startedAt.
 * studyId is accepted for URL-shape/routing consistency but doesn't filter
 * here; deriveStudyProgress() already filters by study.id itself. No POST
 * handler anymore — writes go straight from the client through
 * useTelemetry(), the same /api/telemetry pipeline clicks/timing already
 * use, not a bespoke endpoint.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ studyId: string }> }) {
  await params
  const sessionId = await getSessionId()
  const store = await getInarchStore()
  const [events, session] = await Promise.all([store.getEvents(sessionId), store.getSession(sessionId)])

  return NextResponse.json({
    events,
    startedAt: session?.createdAt ?? new Date().toISOString(),
  })
}
