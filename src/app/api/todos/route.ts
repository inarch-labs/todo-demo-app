import { auth } from '@/lib/auth'
import { createTodo, getTodos } from '@/lib/todos'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await getTodos(session.user.id)
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, dueDate } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const todo = await createTodo(session.user.id, title.trim(), dueDate)
  return NextResponse.json(todo, { status: 201 })
}
