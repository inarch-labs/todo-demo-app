import { auth } from '@clerk/nextjs/server'
import { createTodo, getTodos } from '@/lib/todos'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await getTodos(userId)
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, dueDate } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const todo = await createTodo(userId, title.trim(), dueDate)
  return NextResponse.json(todo, { status: 201 })
}
