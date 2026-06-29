'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface ArchivedTodo {
  id: string
  title: string
  dueDate: string | null
  noteId: string | null
  createdAt: number
}

interface ArchivedNote {
  id: string
  title: string
  body: string | null
  createdAt: number
}

export default function ArchivePage() {
  const router = useRouter()
  const [todos, setTodos] = useState<ArchivedTodo[]>([])
  const [notes, setNotes] = useState<ArchivedNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/archive')
      .then(r => r.json())
      .then(data => {
        setTodos(data.todos ?? [])
        setNotes(data.notes ?? [])
        setLoading(false)
      })
  }, [])

  async function unarchiveTodo(id: string) {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle' }),
    })
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  async function unarchiveNote(id: string) {
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: false }),
    })
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const fmt = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Archive</h1>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-10">Loading…</p>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All <Badge variant="secondary" className="ml-1.5">{todos.length + notes.length}</Badge></TabsTrigger>
            <TabsTrigger value="notes">Notes <Badge variant="secondary" className="ml-1.5">{notes.length}</Badge></TabsTrigger>
            <TabsTrigger value="todos">Todos <Badge variant="secondary" className="ml-1.5">{todos.length}</Badge></TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            {todos.length === 0 && notes.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-10">Nothing archived yet.</p>
            )}
            {notes.map(note => (
              <ArchiveCard key={`note-${note.id}`} title={note.title} subtitle="Note" date={fmt(note.createdAt)}
                onView={() => router.push(`/notes/${note.id}`)} onRestore={() => unarchiveNote(note.id)} />
            ))}
            {todos.map(todo => (
              <ArchiveCard key={`todo-${todo.id}`} title={todo.title} subtitle={todo.noteId ? 'Todo (from note)' : 'Todo'} date={fmt(todo.createdAt)}
                onRestore={() => unarchiveTodo(todo.id)} />
            ))}
          </TabsContent>

          <TabsContent value="notes" className="space-y-2">
            {notes.length === 0 && <p className="text-muted-foreground text-sm text-center py-10">No archived notes.</p>}
            {notes.map(note => (
              <ArchiveCard key={note.id} title={note.title} subtitle="Note" date={fmt(note.createdAt)}
                onView={() => router.push(`/notes/${note.id}`)} onRestore={() => unarchiveNote(note.id)} />
            ))}
          </TabsContent>

          <TabsContent value="todos" className="space-y-2">
            {todos.length === 0 && <p className="text-muted-foreground text-sm text-center py-10">No archived todos.</p>}
            {todos.map(todo => (
              <ArchiveCard key={todo.id} title={todo.title} subtitle={todo.noteId ? 'Todo (from note)' : 'Todo'} date={fmt(todo.createdAt)}
                onRestore={() => unarchiveTodo(todo.id)} />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function ArchiveCard({ title, subtitle, date, onView, onRestore }: {
  title: string
  subtitle: string
  date: string
  onView?: () => void
  onRestore: () => void
}) {
  return (
    <Card>
      <CardContent className="py-3 px-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle} · {date}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {onView && (
            <Button variant="ghost" size="sm" onClick={onView}>View</Button>
          )}
          <Button variant="outline" size="sm" onClick={onRestore}>Restore</Button>
        </div>
      </CardContent>
    </Card>
  )
}
