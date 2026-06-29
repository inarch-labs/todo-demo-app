'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface NoteItem {
  id: string
  title: string
  body: string | null
  completed: boolean
  createdAt: number
  todoCount: number
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  function load() {
    return fetch('/api/notes').then(r => r.json()).then(data => {
      setNotes(Array.isArray(data) ? data : [])
    })
  }

  useEffect(() => {
    load().catch(() => setNotes([])).finally(() => setLoading(false))
  }, [])

  async function seed() {
    setSeeding(true)
    await fetch('/api/seed', { method: 'POST' })
    await load()
    setSeeding(false)
  }

  async function clearAll() {
    setSeeding(true)
    await fetch('/api/seed', { method: 'DELETE' })
    await load()
    setSeeding(false)
  }

  async function createNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() }),
    })
    const note = await res.json()
    setCreating(false)
    setNewTitle('')
    setShowCreate(false)
    router.push(`/notes/${note.id}`)
  }

  const fmt = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  const filtered = query.trim()
    ? notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
    : notes

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 sm:pb-6">

      {/* Header row — desktop shows search + new button here */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold flex-1">Notes</h1>

        {/* Desktop search */}
        <div className={`hidden sm:flex items-center border border-border rounded-lg px-3 h-9 transition-all duration-200 ${searchFocused || query ? 'w-56' : 'w-40'}`}>
          <svg className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground ml-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Desktop new note button */}
        <Button size="sm" className="hidden sm:flex" onClick={() => setShowCreate(true)}>
          + New note
        </Button>

        {notes.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} disabled={seeding} className="text-muted-foreground text-xs">
            Reset
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-10">Loading…</p>
      ) : notes.length === 0 ? (
        <div className="text-center py-10 space-y-3">
          <p className="text-muted-foreground text-sm">No notes yet.</p>
          <Button variant="outline" size="sm" onClick={seed} disabled={seeding}>
            {seeding ? 'Loading…' : 'Load sample data'}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-10">No notes match &ldquo;{query}&rdquo;</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map(note => (
            <li key={note.id}>
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/notes/${note.id}`)}
              >
                <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium flex-1 min-w-0 truncate">{note.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {note.todoCount > 0 && (
                      <Badge variant="secondary">{note.todoCount} todo{note.todoCount !== 1 ? 's' : ''}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{fmt(note.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Mobile-only floating bottom bar */}
      <div className="sm:hidden fixed bottom-6 inset-x-0 flex items-center justify-center gap-3 px-4 pointer-events-none">
        {/* Search pill */}
        <div className={`pointer-events-auto flex items-center bg-background border border-border rounded-full shadow-lg px-4 h-12 transition-all duration-200 ${searchFocused || query ? 'w-64' : 'w-48'}`}>
          <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search notes…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground ml-1 flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Pencil FAB */}
        <button
          onClick={() => setShowCreate(true)}
          className="pointer-events-auto w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
          aria-label="New note"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
        </button>
      </div>

      {/* Create note dialog */}
      <Dialog open={showCreate} onOpenChange={open => { setShowCreate(open); if (!open) setNewTitle('') }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New note</DialogTitle>
          </DialogHeader>
          <form onSubmit={createNote} className="flex flex-col gap-3 pt-1">
            <Input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Note title…"
            />
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create note'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
