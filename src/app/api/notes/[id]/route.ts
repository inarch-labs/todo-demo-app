import { deleteNote, getNoteWithTodos, updateNote } from '@/lib/notes'
import { getSessionId } from '@/lib/session'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const userId = await getSessionId()
  const { id } = await params
  const result = await getNoteWithTodos(userId, id)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(result)
}

export async function PATCH(req: Request, { params }: Params) {
  const userId = await getSessionId()
  const { id } = await params
  const body = await req.json()
  const note = await updateNote(userId, id, body)
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(note)
}

export async function DELETE(_req: Request, { params }: Params) {
  const userId = await getSessionId()
  const { id } = await params
  await deleteNote(userId, id)
  return new NextResponse(null, { status: 204 })
}
