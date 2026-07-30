import { db } from '@/db'
import { studyProgress, studyEvents, studyRatings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { StudyEventName, StudyRatingAnswer } from '@inarch/sdk'

export type StudyProgressRow = typeof studyProgress.$inferSelect

function progressId(sessionId: string, studyId: string) {
  return `${sessionId}:${studyId}`
}

export async function getOrCreateProgress(sessionId: string, branch: string, studyId: string): Promise<StudyProgressRow> {
  const id = progressId(sessionId, studyId)
  const [existing] = await db.select().from(studyProgress).where(eq(studyProgress.id, id))
  if (existing) return existing

  const [created] = await db.insert(studyProgress).values({
    id,
    sessionId,
    branch,
    studyId,
    currentStepIndex: 0,
    startedAt: new Date(),
    successAt: null,
  }).returning()
  return created
}

export async function advanceStep(sessionId: string, studyId: string, stepIndex: number) {
  const id = progressId(sessionId, studyId)
  const [updated] = await db.update(studyProgress)
    .set({ currentStepIndex: stepIndex })
    .where(eq(studyProgress.id, id))
    .returning()
  return updated ?? null
}

export async function markSuccess(sessionId: string, studyId: string) {
  const id = progressId(sessionId, studyId)
  const [existing] = await db.select().from(studyProgress).where(eq(studyProgress.id, id))
  if (existing?.successAt) return existing // already marked, idempotent
  const [updated] = await db.update(studyProgress)
    .set({ successAt: new Date() })
    .where(eq(studyProgress.id, id))
    .returning()
  return updated ?? null
}

export async function recordEvent(
  sessionId: string,
  branch: string,
  studyId: string,
  name: StudyEventName,
  stepId: string | null
) {
  await db.insert(studyEvents).values({
    id: nanoid(),
    sessionId,
    branch,
    studyId,
    stepId,
    name,
    createdAt: new Date(),
  })
}

export async function recordRating(
  sessionId: string,
  branch: string,
  studyId: string,
  stepId: string,
  answers: StudyRatingAnswer[]
) {
  await db.insert(studyRatings).values({
    id: nanoid(),
    sessionId,
    branch,
    studyId,
    stepId,
    answers: JSON.stringify(answers),
    createdAt: new Date(),
  })
  await recordEvent(sessionId, branch, studyId, 'rating_submitted', stepId)
}

export async function getStudyResults(studyId: string) {
  const events = await db.select().from(studyEvents).where(eq(studyEvents.studyId, studyId))
  const ratings = await db.select().from(studyRatings).where(eq(studyRatings.studyId, studyId))
  const progress = await db.select().from(studyProgress).where(eq(studyProgress.studyId, studyId))
  return { events, ratings, progress }
}

export async function getProgressForSession(sessionId: string, studyId: string) {
  const id = progressId(sessionId, studyId)
  const [row] = await db.select().from(studyProgress).where(
    and(eq(studyProgress.id, id), eq(studyProgress.studyId, studyId))
  )
  return row ?? null
}
