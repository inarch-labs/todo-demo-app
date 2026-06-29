import { getTodosWithDueDate } from '@/lib/todos'
import { getSessionId } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const userId = await getSessionId()
  const items = await getTodosWithDueDate(userId)
  return NextResponse.json(items)
}
