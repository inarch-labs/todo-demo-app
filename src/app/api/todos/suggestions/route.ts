import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSessionId } from '@/lib/session'
import { getNotes, getNoteById } from '@/lib/notes'

const MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM = `You are a task suggestion assistant. Based on the user's notes, suggest up to 4 specific action items they likely need to do.

Rules:
- Each suggestion must be a concrete, actionable task
- Keep each suggestion under 35 characters so it fits on a button
- Focus on tasks with deadlines or clear next steps
- Return ONLY valid JSON: { "suggestions": ["...", "..."] }
- No markdown fences, just the JSON object`

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const noteId = searchParams.get('noteId')

  const sessionId = await getSessionId()

  let notesContext: string
  if (noteId) {
    const note = await getNoteById(sessionId, noteId)
    console.log('[suggestions] noteId:', noteId, 'found:', !!note)
    notesContext = note ? `### ${note.title}\n${note.body ?? '(no body)'}` : ''
  } else {
    const notes = await getNotes(sessionId)
    console.log('[suggestions] sessionId:', sessionId, 'notes count:', notes.length)
    notesContext = notes.map(n => `### ${n.title}\n${n.body ?? '(no body)'}`).join('\n\n')
  }

  if (!notesContext.trim()) {
    console.log('[suggestions] no notes context, returning empty')
    return NextResponse.json({ suggestions: [] })
  }

  const anthropic = new Anthropic()

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Here are my notes:\n\n${notesContext}\n\nSuggest tasks.` }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    const parsed = JSON.parse(text)
    const raw: string[] = Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    const suggestions = raw.map(s => s.slice(0, 35)).filter(Boolean).slice(0, 4)
    console.log('[suggestions] returning:', suggestions)
    return NextResponse.json({ suggestions })
  } catch (e) {
    console.error('[suggestions] JSON parse error:', e, 'raw:', text)
    return NextResponse.json({ suggestions: [] })
  }
}
