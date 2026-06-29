import { getSessionId } from '@/lib/session'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { notes, todos } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { sampleNotes, sampleStandaloneTodos } from '@/data/sample-data'

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

    const todoRows = sample.todos.map((t, i) => ({
      id: nanoid(),
      userId,
      title: t.title,
      body: null,
      completed: t.completed ?? false,
      dueDate: t.dueDate ?? null,
      noteId,
      sortOrder: i,
      sharedWith: null,
      relatedItems: null,
      createdAt: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000),
    }))
    if (todoRows.length) await db.insert(todos).values(todoRows)
  }

  const standaloneRows = sampleStandaloneTodos.map((t, i) => ({
    id: nanoid(),
    userId,
    title: t.title,
    body: t.body ?? null,
    completed: t.completed ?? false,
    dueDate: t.dueDate ?? null,
    noteId: null,
    sortOrder: i,
    sharedWith: null,
    relatedItems: null,
    createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  }))
  if (standaloneRows.length) await db.insert(todos).values(standaloneRows)

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE() {
  const userId = await getSessionId()
  await db.delete(todos).where(eq(todos.userId, userId))
  await db.delete(notes).where(eq(notes.userId, userId))
  return new NextResponse(null, { status: 204 })
}
