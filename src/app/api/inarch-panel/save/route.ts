import { NextResponse } from 'next/server'
import { getInarchStore } from '@/lib/inarch-store'
import type { TestDefinition } from '@inarch/sdk'

export async function POST(req: Request) {
  const definition = (await req.json()) as TestDefinition
  const store = await getInarchStore()
  await store.saveTestDefinition(definition)
  return NextResponse.json({ ok: true })
}
