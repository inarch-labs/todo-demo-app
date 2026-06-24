import { auth } from '@clerk/nextjs/server'
import { deleteTodo, toggleTodo, updateTodo, archiveTodo, unarchiveTodo } from '@/lib/todos'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()

  if (body.action === 'toggle') {
    const todo = await toggleTodo(userId, id)
    if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(todo)
  }

  if (body.action === 'archive') {
    const todo = await archiveTodo(userId, id)
    if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(todo)
  }

  if (body.action === 'unarchive') {
    const todo = await unarchiveTodo(userId, id)
    if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(todo)
  }

  // General field update
  const todo = await updateTodo(userId, id, body)
  if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(todo)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteTodo(userId, id)
  return new NextResponse(null, { status: 204 })
}
