import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createInarch } from '@inarch/sdk'
import { getSessionId } from '@/lib/session'
import { getNotes } from '@/lib/notes'

const MODEL = 'claude-haiku-4-5-20251001'

function buildSystem(notesContext: string) {
  return `You are a task parser with access to the user's notes. The user will describe a task in natural language.
Use the notes below to understand their projects, priorities, and terminology when extracting the task.

Extract the task details and return ONLY valid JSON with these fields:
- title: string (required, concise action-oriented title)
- body: string | null (optional notes or context, referencing relevant notes if helpful)
- dueDate: string | null (ISO date YYYY-MM-DD if mentioned, otherwise null)

Today's date is ${new Date().toISOString().split('T')[0]}.
Return only the JSON object, no markdown fences.

--- USER NOTES ---
${notesContext || '(no notes yet)'}
--- END NOTES ---`
}

export async function POST(req: Request) {
  const { input } = await req.json()
  if (!input?.trim()) return NextResponse.json({ error: 'input required' }, { status: 400 })

  const sessionId = await getSessionId()

  const notes = await getNotes(sessionId)
  const notesContext = notes
    .map(n => `### ${n.title}\n${n.body ?? '(no body)'}`)
    .join('\n\n')

  const inarch = createInarch({ sessionId, branch: 'nl-task-creation-with-notes' })
  const anthropic = inarch.wrap(new Anthropic())

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: buildSystem(notesContext),
    messages: [{ role: 'user', content: input.trim() }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = JSON.parse(text)

  return NextResponse.json(parsed)
}
