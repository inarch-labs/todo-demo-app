import { getSessionId } from '@/lib/session'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { notes, todos } from '@/db/schema' // todos used in DELETE
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { sampleNotes } from '@/data/sample-data'

export async function POST() {
  const userId = await getSessionId()

  const existingNotes = await db.select({ id: notes.id }).from(notes).where(eq(notes.userId, userId))
  if (existingNotes.length > 0) {
    return NextResponse.json({ error: 'Sample data already loaded.' }, { status: 409 })
  }

  const now = new Date()

  for (const sample of sampleNotes) {
    const noteId = nanoid()
    await db.insert(notes).values({
      id: noteId,
      userId,
      title: sample.title,
      body: sample.body,
      completed: false,
      createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE() {
  const userId = await getSessionId()
  await db.delete(todos).where(eq(todos.userId, userId))
  await db.delete(notes).where(eq(notes.userId, userId))
  return new NextResponse(null, { status: 204 })
}
