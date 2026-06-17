import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function getTodos(userId: string) {
  return db.select().from(todos).where(eq(todos.userId, userId))
}

export async function createTodo(userId: string, title: string, dueDate?: string) {
  const [todo] = await db.insert(todos).values({
    id: nanoid(),
    userId,
    title,
    dueDate: dueDate ?? null,
    createdAt: new Date(),
  }).returning()
  return todo
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

export async function deleteTodo(userId: string, id: string) {
  await db.delete(todos).where(
    and(eq(todos.id, id), eq(todos.userId, userId))
  )
}
