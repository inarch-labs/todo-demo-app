import { auth } from '@clerk/nextjs/server'
import { createTodo, getActiveTodos } from '@/lib/todos'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await getActiveTodos(userId)
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, body, dueDate, sharedWith } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const todo = await createTodo(userId, { title: title.trim(), body, dueDate, sharedWith })
  return NextResponse.json(todo, { status: 201 })
}
