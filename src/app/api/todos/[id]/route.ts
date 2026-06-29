import { deleteTodo, toggleTodo, updateTodo } from '@/lib/todos'
import { getSessionId } from '@/lib/session'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const userId = await getSessionId()
  const { id } = await params
  const body = await req.json()

  if (body.action === 'toggle') {
    const todo = await toggleTodo(userId, id)
    if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(todo)
  }

  const todo = await updateTodo(userId, id, body)
  if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(todo)
}

export async function DELETE(_req: Request, { params }: Params) {
  const userId = await getSessionId()
  const { id } = await params
  await deleteTodo(userId, id)
  return new NextResponse(null, { status: 204 })
}
