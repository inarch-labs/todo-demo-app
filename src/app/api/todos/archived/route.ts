import { auth } from '@clerk/nextjs/server'
import { getCompletedTodos } from '@/lib/todos'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await getCompletedTodos(userId)
  return NextResponse.json(items)
}
