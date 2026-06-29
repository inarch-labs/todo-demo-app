import { db } from '@/db'
import { notes, todos } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export type Note = typeof notes.$inferSelect

export async function getNotes(userId: string) {
  return db.select().from(notes).where(
    and(eq(notes.userId, userId), eq(notes.completed, false))
  ).orderBy(desc(notes.createdAt))
}

export async function getCompletedNotes(userId: string) {
  return db.select().from(notes).where(
    and(eq(notes.userId, userId), eq(notes.completed, true))
  ).orderBy(desc(notes.createdAt))
}

export async function getNoteById(userId: string, id: string) {
  const [note] = await db.select().from(notes).where(
    and(eq(notes.id, id), eq(notes.userId, userId))
  )
  return note ?? null
}

export async function getNoteWithTodos(userId: string, id: string) {
  const note = await getNoteById(userId, id)
  if (!note) return null
  const noteTodos = await db.select().from(todos).where(
    and(eq(todos.noteId, id), eq(todos.userId, userId))
  )
  return { note, todos: noteTodos }
}

export async function createNote(userId: string, fields: { title: string; body?: string }) {
  const now = new Date()
  const [note] = await db.insert(notes).values({
    id: nanoid(),
    userId,
    title: fields.title,
    body: fields.body ?? null,
    completed: false,
    createdAt: now,
    updatedAt: now,
  }).returning()
  return note
}

export async function updateNote(
  userId: string,
  id: string,
  fields: { title?: string; body?: string; completed?: boolean }
) {
  const [updated] = await db.update(notes)
    .set({
      ...(fields.title !== undefined && { title: fields.title }),
      ...(fields.body !== undefined && { body: fields.body }),
      ...(fields.completed !== undefined && { completed: fields.completed }),
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning()
  return updated ?? null
}

export async function deleteNote(userId: string, id: string) {
  // Delete embedded todos first
  await db.delete(todos).where(and(eq(todos.noteId, id), eq(todos.userId, userId)))
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
}

export async function getNoteTodoCount(userId: string, noteId: string) {
  const rows = await db.select({ id: todos.id }).from(todos).where(
    and(eq(todos.noteId, noteId), eq(todos.userId, userId), eq(todos.completed, false))
  )
  return rows.length
}
