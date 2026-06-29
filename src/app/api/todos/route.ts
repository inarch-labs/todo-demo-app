import { createTodo, getActiveTodos, reorderTodos } from '@/lib/todos'
import { getSessionId } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const userId = await getSessionId()
  const items = await getActiveTodos(userId)
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const userId = await getSessionId()
  const body = await req.json()

  if (body.action === 'reorder') {
    if (!Array.isArray(body.ids)) return NextResponse.json({ error: 'ids required' }, { status: 400 })
    await reorderTodos(userId, body.ids)
    return new NextResponse(null, { status: 204 })
  }

  const { title, bodyText, dueDate, sharedWith, noteId } = body
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const todo = await createTodo(userId, { title: title.trim(), body: bodyText, dueDate, sharedWith, noteId })
  return NextResponse.json(todo, { status: 201 })
}
