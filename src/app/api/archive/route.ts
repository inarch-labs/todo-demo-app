import { getCompletedTodos } from '@/lib/todos'
import { getCompletedNotes } from '@/lib/notes'
import { getSessionId } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const userId = await getSessionId()
  const [todos, notes] = await Promise.all([
    getCompletedTodos(userId),
    getCompletedNotes(userId),
  ])
  return NextResponse.json({ todos, notes })
}
