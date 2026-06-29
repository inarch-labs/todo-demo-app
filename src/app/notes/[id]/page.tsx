'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface Todo {
  id: string
  title: string
  body: string | null
  completed: boolean
  dueDate: string | null
  noteId: string | null
  createdAt: number
}

interface Note {
  id: string
  title: string
  body: string | null
  completed: boolean
  createdAt: number
  updatedAt: number
}

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [note, setNote] = useState<Note | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newTodo, setNewTodo] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [addingTodo, setAddingTodo] = useState(false)

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then(r => r.json())
      .then(data => {
        setNote(data.note)
        setTitle(data.note.title)
        setBody(data.note.body ?? '')
        setTodos(data.todos ?? [])
        setLoading(false)
      })
  }, [id])

  const save = useCallback(async () => {
    if (!dirty) return
    setSaving(true)
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() || note?.title, body: body || null }),
    })
    const updated = await res.json()
    setNote(updated)
    setDirty(false)
    setSaving(false)
  }, [dirty, id, title, body, note])

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!newTodo.trim()) return
    setAddingTodo(true)
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodo.trim(), dueDate: newDueDate || undefined, noteId: id }),
    })
    const todo = await res.json()
    setTodos(prev => [todo, ...prev])
    setNewTodo('')
    setNewDueDate('')
    setAddingTodo(false)
  }

  async function toggleTodo(todoId: string) {
    const res = await fetch(`/api/todos/${todoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle' }),
    })
    const updated = await res.json()
    setTodos(prev => prev.map(t => t.id === todoId ? updated : t))
  }

  async function deleteTodo(todoId: string) {
    await fetch(`/api/todos/${todoId}`, { method: 'DELETE' })
    setTodos(prev => prev.filter(t => t.id !== todoId))
  }

  async function completeNote() {
    await save()
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
    router.push('/notes')
  }

  async function deleteNote() {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    router.push('/notes')
  }

  const activeTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  if (loading) return <div className="max-w-xl mx-auto px-4 py-6 text-muted-foreground text-sm">Loading…</div>
  if (!note) return <div className="max-w-xl mx-auto px-4 py-6 text-muted-foreground text-sm">Note not found.</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <button onClick={() => router.push('/notes')} className="text-sm text-muted-foreground hover:text-foreground">
        ← Notes
      </button>

      {/* Title */}
      <Input
        value={title}
        onChange={e => { setTitle(e.target.value); setDirty(true) }}
        onBlur={save}
        className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0 h-auto text-foreground"
        placeholder="Untitled"
      />

      {/* Body */}
      <Textarea
        value={body}
        onChange={e => { setBody(e.target.value); setDirty(true) }}
        onBlur={save}
        placeholder="Write your note here…"
        rows={6}
        className="resize-none text-sm"
      />

      {dirty && (
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      )}

      <Separator />

      {/* Embedded todos */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">To-Do Items</h2>

        <form onSubmit={addTodo} className="flex gap-2">
          <Input
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 text-sm"
          />
          <input
            type="date"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
            className="border border-input rounded-md px-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" size="sm" disabled={addingTodo}>Add</Button>
        </form>

        {activeTodos.length === 0 && completedTodos.length === 0 && (
          <p className="text-muted-foreground text-sm">No to-do items yet.</p>
        )}

        <ul className="space-y-1.5">
          {activeTodos.map(todo => (
            <li key={todo.id} className="flex items-center gap-3 bg-muted/40 border border-border rounded-lg px-3 py-2">
              <button
                onClick={() => toggleTodo(todo.id)}
                className="w-4 h-4 rounded-full border-2 border-muted-foreground hover:border-primary flex-shrink-0 transition-colors"
              />
              <span className="flex-1 text-sm">{todo.title}</span>
              {todo.dueDate && <Badge variant="outline" className="text-xs">{todo.dueDate}</Badge>}
              <button onClick={() => deleteTodo(todo.id)} className="text-muted-foreground hover:text-destructive text-lg leading-none">×</button>
            </li>
          ))}
          {completedTodos.map(todo => (
            <li key={todo.id} className="flex items-center gap-3 bg-muted/20 border border-border rounded-lg px-3 py-2 opacity-60">
              <button
                onClick={() => toggleTodo(todo.id)}
                className="w-4 h-4 rounded-full border-2 bg-primary border-primary flex-shrink-0"
              />
              <span className="flex-1 text-sm line-through text-muted-foreground">{todo.title}</span>
              <button onClick={() => deleteTodo(todo.id)} className="text-muted-foreground hover:text-destructive text-lg leading-none">×</button>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Note actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={completeNote}>
          Mark complete & archive
        </Button>
        <Button variant="destructive" size="sm" onClick={deleteNote}>
          Delete note
        </Button>
      </div>
    </div>
  )
}
