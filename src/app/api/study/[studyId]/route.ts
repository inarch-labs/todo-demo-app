import { NextResponse } from 'next/server'
import { getSessionId } from '@/lib/session'
import { INARCH_BRANCH } from '@/lib/inarch-branch'
import {
  getOrCreateProgress,
  advanceStep,
  markSuccess,
  recordEvent,
  recordRating,
} from '@/lib/study'
import type { StudyEventName, StudyRatingAnswer } from '@inarch/sdk'

export async function GET(_req: Request, { params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params
  const sessionId = await getSessionId()
  const progress = await getOrCreateProgress(sessionId, INARCH_BRANCH, studyId)
  return NextResponse.json(progress)
}

export async function POST(req: Request, { params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params
  const sessionId = await getSessionId()
  const body = await req.json()

  switch (body.action) {
    case 'advance': {
      if (typeof body.stepIndex !== 'number') {
        return NextResponse.json({ error: 'stepIndex required' }, { status: 400 })
      }
      const updated = await advanceStep(sessionId, studyId, body.stepIndex)
      return NextResponse.json(updated)
    }
    case 'success': {
      const updated = await markSuccess(sessionId, studyId)
      await recordEvent(sessionId, INARCH_BRANCH, studyId, 'success_reached', body.stepId ?? null)
      return NextResponse.json(updated)
    }
    case 'event': {
      const name = body.name as StudyEventName
      if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
      await recordEvent(sessionId, INARCH_BRANCH, studyId, name, body.stepId ?? null)
      return new NextResponse(null, { status: 204 })
    }
    case 'rating': {
      if (!body.stepId || !Array.isArray(body.answers)) {
        return NextResponse.json({ error: 'stepId and answers required' }, { status: 400 })
      }
      await recordRating(sessionId, INARCH_BRANCH, studyId, body.stepId, body.answers as StudyRatingAnswer[])
      return new NextResponse(null, { status: 204 })
    }
    default:
      return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  }
}
