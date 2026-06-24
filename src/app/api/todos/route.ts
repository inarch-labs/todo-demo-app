import { auth } from '@clerk/nextjs/server'
import { createTodo, getActiveTodos, reorderTodos } from '@/lib/todos'
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
  const body = await req.json()

  // Reorder action
  if (body.action === 'reorder') {
    if (!Array.isArray(body.ids)) return NextResponse.json({ error: 'ids required' }, { status: 400 })
    await reorderTodos(userId, body.ids)
    return new NextResponse(null, { status: 204 })
  }

  const { title, bodyText, dueDate, sharedWith } = body
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const todo = await createTodo(userId, { title: title.trim(), body: bodyText, dueDate, sharedWith })
  return NextResponse.json(todo, { status: 201 })
}
