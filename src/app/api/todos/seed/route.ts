import { auth } from '@clerk/nextjs/server'
import { seedSampleTodos, getActiveTodos, getCompletedTodos } from '@/lib/todos'
import { NextResponse } from 'next/server'
import samples from '@/data/sample-todos.json'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getActiveTodos(userId)
  if (existing.length > 0) {
    return NextResponse.json({ error: 'You already have todos — clear them first or start fresh.' }, { status: 409 })
  }

  await seedSampleTodos(userId, samples)
  const [active, completed] = await Promise.all([getActiveTodos(userId), getCompletedTodos(userId)])
  return NextResponse.json({ active, completed }, { status: 201 })
}
