import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq, and, isNull, isNotNull } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export type Todo = typeof todos.$inferSelect

export async function getActiveTodos(userId: string) {
  return db.select().from(todos).where(
    and(eq(todos.userId, userId), isNull(todos.archivedAt))
  )
}

export async function getArchivedTodos(userId: string) {
  return db.select().from(todos).where(
    and(eq(todos.userId, userId), isNotNull(todos.archivedAt))
  )
}

export async function getTodoById(userId: string, id: string) {
  const [todo] = await db.select().from(todos).where(
    and(eq(todos.id, id), eq(todos.userId, userId))
  )
  return todo ?? null
}

export async function createTodo(
  userId: string,
  fields: { title: string; body?: string; dueDate?: string; sharedWith?: string[] }
) {
  const [todo] = await db.insert(todos).values({
    id: nanoid(),
    userId,
    title: fields.title,
    body: fields.body ?? null,
    dueDate: fields.dueDate ?? null,
    sharedWith: fields.sharedWith ? JSON.stringify(fields.sharedWith) : null,
    createdAt: new Date(),
  }).returning()
  return todo
}

export async function updateTodo(
  userId: string,
  id: string,
  fields: { title?: string; body?: string; dueDate?: string; sharedWith?: string[]; relatedItems?: string[] }
) {
  const [updated] = await db.update(todos)
    .set({
      ...(fields.title !== undefined && { title: fields.title }),
      ...(fields.body !== undefined && { body: fields.body }),
      ...(fields.dueDate !== undefined && { dueDate: fields.dueDate }),
      ...(fields.sharedWith !== undefined && { sharedWith: JSON.stringify(fields.sharedWith) }),
      ...(fields.relatedItems !== undefined && { relatedItems: JSON.stringify(fields.relatedItems) }),
    })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning()
  return updated ?? null
}

export async function toggleTodo(userId: string, id: string) {
  const [existing] = await db.select().from(todos).where(
    and(eq(todos.id, id), eq(todos.userId, userId))
  )
  if (!existing) return null
  const [updated] = await db.update(todos)
    .set({ completed: !existing.completed })
    .where(eq(todos.id, id))
    .returning()
  return updated
}

export async function archiveTodo(userId: string, id: string) {
  const [updated] = await db.update(todos)
    .set({ archivedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning()
  return updated ?? null
}

export async function unarchiveTodo(userId: string, id: string) {
  const [updated] = await db.update(todos)
    .set({ archivedAt: null })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning()
  return updated ?? null
}

export async function deleteTodo(userId: string, id: string) {
  await db.delete(todos).where(
    and(eq(todos.id, id), eq(todos.userId, userId))
  )
}

export async function seedSampleTodos(userId: string, samples: Array<{
  title: string; body?: string; dueDate?: string; completed?: boolean; sharedWith?: string[]
}>) {
  const rows = samples.map(s => ({
    id: nanoid(),
    userId,
    title: s.title,
    body: s.body ?? null,
    dueDate: s.dueDate ?? null,
    completed: s.completed ?? false,
    sharedWith: s.sharedWith?.length ? JSON.stringify(s.sharedWith) : null,
    relatedItems: null,
    archivedAt: null,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
  }))
  await db.insert(todos).values(rows)
}
