import { auth } from '@clerk/nextjs/server'
import { deleteTodo, toggleTodo } from '@/lib/todos'
import { NextResponse } from 'next/server'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const todo = await toggleTodo(userId, id)
  if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(todo)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteTodo(userId, id)
  return new NextResponse(null, { status: 204 })
}
