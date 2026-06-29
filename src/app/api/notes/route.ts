import { createNote, getNotes } from '@/lib/notes'
import { getSessionId } from '@/lib/session'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export async function GET() {
  const userId = await getSessionId()
  const noteList = await getNotes(userId)

  const withCounts = await Promise.all(noteList.map(async (note) => {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(todos).where(
      and(eq(todos.noteId, note.id), eq(todos.userId, userId), eq(todos.completed, false))
    )
    return { ...note, todoCount: row?.count ?? 0 }
  }))

  return NextResponse.json(withCounts)
}

export async function POST(req: Request) {
  const userId = await getSessionId()
  const { title, body } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const note = await createNote(userId, { title: title.trim(), body })
  return NextResponse.json(note, { status: 201 })
}
