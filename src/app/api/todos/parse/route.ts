import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createInarch } from '@inarch/sdk'
import { getSessionId } from '@/lib/session'
import { getNotes, getNoteById } from '@/lib/notes'

const MODEL = 'claude-haiku-4-5-20251001'

function buildSystem(notesContext: string) {
  return `You are a task parser with access to the user's notes. The user will describe a task in natural language.
Use the notes below to understand their projects, priorities, and terminology when extracting the task.

Extract the task details and return ONLY valid JSON with these fields:
- title: string (required, concise action-oriented title)
- titleSource: string | null (exact title of the note this title was informed by, or null if not from a note)
- body: string | null (optional notes or context, referencing relevant notes if helpful)
- bodySource: string | null (exact title of the note the body content came from, or null)
- dueDate: string | null (ISO date YYYY-MM-DD if mentioned or inferable from notes, otherwise null)
- dueDateSource: string | null (exact title of the note the due date came from, or null)

Today's date is ${new Date().toISOString().split('T')[0]}.
Return only the JSON object, no markdown fences.

--- USER NOTES ---
${notesContext || '(no notes yet)'}
--- END NOTES ---`
}

export async function POST(req: Request) {
  const { input, noteId } = await req.json()
  if (!input?.trim()) return NextResponse.json({ error: 'input required' }, { status: 400 })

  const sessionId = await getSessionId()

  let notesContext: string
  if (noteId) {
    const note = await getNoteById(sessionId, noteId)
    notesContext = note ? `### ${note.title}\n${note.body ?? '(no body)'}` : '(no notes yet)'
  } else {
    const notes = await getNotes(sessionId)
    notesContext = notes.map(n => `### ${n.title}\n${n.body ?? '(no body)'}`).join('\n\n')
  }

  const inarch = createInarch({ sessionId, branch: 'nl-task-creation-with-notes' })
  const anthropic = inarch.wrap(new Anthropic())

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: buildSystem(notesContext),
    messages: [{ role: 'user', content: input.trim() }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = JSON.parse(text)

  return NextResponse.json({
    title: parsed.title ?? null,
    titleSource: parsed.titleSource ?? null,
    body: parsed.body ?? null,
    bodySource: parsed.bodySource ?? null,
    dueDate: parsed.dueDate ?? null,
    dueDateSource: parsed.dueDateSource ?? null,
  })
}
