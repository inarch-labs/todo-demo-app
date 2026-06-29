import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createInarch } from '@inarch/sdk'
import { getSessionId } from '@/lib/session'

const MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM = `You are a task parser. The user will describe a task in natural language.
Extract the task details and return ONLY valid JSON with these fields:
- title: string (required, concise action-oriented title)
- body: string | null (optional notes or context)
- dueDate: string | null (ISO date YYYY-MM-DD if mentioned, otherwise null)

Today's date is ${new Date().toISOString().split('T')[0]}.
Return only the JSON object, no markdown fences.`

export async function POST(req: Request) {
  const { input } = await req.json()
  if (!input?.trim()) return NextResponse.json({ error: 'input required' }, { status: 400 })

  const sessionId = await getSessionId()

  const inarch = createInarch({ sessionId, branch: 'nl-task-creation' })
  const anthropic = inarch.wrap(new Anthropic())

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: SYSTEM,
    messages: [{ role: 'user', content: input.trim() }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = JSON.parse(text)

  return NextResponse.json(parsed)
}
