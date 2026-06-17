import { auth } from '@/lib/auth'
import { deleteTodo, toggleTodo } from '@/lib/todos'
import { NextResponse } from 'next/server'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const todo = await toggleTodo(session.user.id, id)
  if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(todo)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteTodo(session.user.id, id)
  return new NextResponse(null, { status: 204 })
}
