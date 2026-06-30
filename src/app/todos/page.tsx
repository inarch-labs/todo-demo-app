'use client'

import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { StudyProvider, useStudy } from '@/components/StudyRunner'
import { nlTaskCreationStudy } from '@/lib/studies/nl-task-creation-eval'

interface Todo {
  id: string
  title: string
  body: string | null
  completed: boolean
  sortOrder: number
  dueDate: string | null
  sharedWith: string | null
  relatedItems: string | null
  noteId: string | null
  createdAt: number
}

function parseTodo(todo: Todo) {
  return {
    ...todo,
    sharedWith: todo.sharedWith ? JSON.parse(todo.sharedWith) as string[] : [],
    relatedItems: todo.relatedItems ? JSON.parse(todo.relatedItems) as string[] : [],
  }
}

export default function TodosPage() {
  return (
    <StudyProvider study={nlTaskCreationStudy}>
      <TodosPageContent />
    </StudyProvider>
  )
}

function TodosPageContent() {
  const { reportSuccess } = useStudy()
  const [active, setActive] = useState<Todo[]>([])
  const [completed, setCompleted] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [aiMode, setAiMode] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [selected, setSelected] = useState<Todo | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [dismissing, setDismissing] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/todos').then(r => r.json()),
      fetch('/api/todos/archived').then(r => r.json()),
    ]).then(([a, c]) => {
      setActive(Array.isArray(a) ? a : [])
      setCompleted(Array.isArray(c) ? c : [])
      setLoading(false)
    })
  }, [])

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    let title = input.trim()
    let bodyText: string | undefined
    let parsedDate: string | undefined = dueDate || undefined

    if (aiMode) {
      setParsing(true)
      const res = await fetch('/api/todos/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      })
      const parsed = await res.json()
      setParsing(false)
      title = parsed.title ?? title
      bodyText = parsed.body ?? undefined
      parsedDate = parsed.dueDate ?? parsedDate
    }

    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, bodyText, dueDate: parsedDate }),
    })
    const todo = await res.json()
    setActive(prev => [todo, ...prev])
    setInput('')
    setDueDate('')
    inputRef.current?.focus()

    if (aiMode) reportSuccess()
  }

  async function toggle(id: string) {
    const isActive = active.some(t => t.id === id)
    if (isActive) {
      setDismissing(prev => new Set(prev).add(id))
      await new Promise(r => setTimeout(r, 380))
      setDismissing(prev => { const s = new Set(prev); s.delete(id); return s })
    }
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle' }),
    })
    const updated = await res.json()
    if (updated.completed) {
      setActive(prev => prev.filter(t => t.id !== id))
      setCompleted(prev => [updated, ...prev])
    } else {
      setCompleted(prev => prev.filter(t => t.id !== id))
      setActive(prev => [updated, ...prev])
    }
    if (selected?.id === id) setSelected(updated)
  }

  async function remove(id: string) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    setActive(prev => prev.filter(t => t.id !== id))
    setCompleted(prev => prev.filter(t => t.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  async function saveDetail(id: string, fields: Record<string, unknown>) {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    const updated = await res.json()
    setActive(prev => prev.map(t => t.id === id ? updated : t))
    setCompleted(prev => prev.map(t => t.id === id ? updated : t))
    setSelected(updated)
  }

  async function seed() {
    setSeeding(true)
    const res = await fetch('/api/todos/seed', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setActive(data.active)
      setCompleted(data.completed)
    }
    setSeeding(false)
  }

  function onDragStart(id: string) { setDragId(id) }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverId(id) }

  async function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    const reordered = [...active]
    const fromIdx = reordered.findIndex(t => t.id === dragId)
    const toIdx = reordered.findIndex(t => t.id === targetId)
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    setActive(reordered)
    setDragId(null)
    setDragOverId(null)
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', ids: reordered.map(t => t.id) }),
    })
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Todos</h1>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Active {active.length > 0 && <Badge variant="secondary" className="ml-1.5">{active.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="complete">
            Complete {completed.length > 0 && <Badge variant="secondary" className="ml-1.5">{completed.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <form onSubmit={addTodo} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={aiMode ? 'Describe a task in plain English…' : 'Add a task…'}
              className="flex-1"
              disabled={parsing}
            />
            {!aiMode && (
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="border border-input rounded-md px-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            <Button
              type="button"
              variant={aiMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAiMode(m => !m)}
              className="shrink-0 text-xs px-2"
              title="Toggle AI parsing"
            >
              AI
            </Button>
            <Button type="submit" disabled={parsing}>
              {parsing ? 'Parsing…' : 'Add'}
            </Button>
          </form>

          {loading ? (
            <p className="text-muted-foreground text-sm text-center py-8">Loading…</p>
          ) : active.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-muted-foreground text-sm">No active tasks.</p>
              <Button variant="outline" size="sm" onClick={seed} disabled={seeding}>
                {seeding ? 'Loading…' : 'Load sample todos'}
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {active.map(todo => (
                <li
                  key={todo.id}
                  draggable
                  onDragStart={() => onDragStart(todo.id)}
                  onDragOver={e => onDragOver(e, todo.id)}
                  onDrop={() => onDrop(todo.id)}
                  onDragEnd={() => { setDragId(null); setDragOverId(null) }}
                  onClick={() => setSelected(todo)}
                  className={`flex items-center gap-3 group bg-card border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                    dragOverId === todo.id && dragId !== todo.id ? 'border-primary shadow-md' : 'border-border hover:border-border/80'
                  } ${dragId === todo.id ? 'opacity-40' : ''} ${dismissing.has(todo.id) ? 'todo-dismiss' : ''}`}
                >
                  <span className="text-muted-foreground/40 cursor-grab active:cursor-grabbing flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">⠿</span>
                  <button
                    onClick={e => { e.stopPropagation(); toggle(todo.id) }}
                    className="w-4 h-4 rounded-full border-2 border-muted-foreground hover:border-primary flex-shrink-0 transition-colors"
                  />
                  <span className="flex-1 text-sm">{todo.title}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {todo.noteId && (
                      <Badge variant="outline" className="text-xs" onClick={e => e.stopPropagation()}>
                        <Link href={`/notes/${todo.noteId}`}>note</Link>
                      </Badge>
                    )}
                    {todo.dueDate && <span className="text-xs text-muted-foreground">{todo.dueDate}</span>}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); remove(todo.id) }}
                    className="text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
                  >×</button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="complete">
          {loading ? (
            <p className="text-muted-foreground text-sm text-center py-8">Loading…</p>
          ) : completed.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-10">No completed tasks yet.</p>
          ) : (
            <ul className="space-y-2">
              {completed.map(todo => (
                <li
                  key={todo.id}
                  onClick={() => setSelected(todo)}
                  className="flex items-center gap-3 group bg-card border border-border rounded-lg px-4 py-3 hover:border-border/80 transition-colors cursor-pointer"
                >
                  <button
                    onClick={e => { e.stopPropagation(); toggle(todo.id) }}
                    className="w-4 h-4 rounded-full border-2 bg-primary border-primary flex-shrink-0"
                    title="Move back to active"
                  />
                  <span className="flex-1 text-sm line-through text-muted-foreground">{todo.title}</span>
                  {todo.dueDate && <span className="text-xs text-muted-foreground flex-shrink-0">{todo.dueDate}</span>}
                  <button
                    onClick={e => { e.stopPropagation(); remove(todo.id) }}
                    className="text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
                  >×</button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {selected && (
        <TodoDetailDialog
          todo={parseTodo(selected)}
          allTodos={[...active, ...completed]}
          onClose={() => setSelected(null)}
          onSave={(fields) => saveDetail(selected.id, fields)}
          onToggle={() => toggle(selected.id)}
          onDelete={() => remove(selected.id)}
        />
      )}
    </div>
  )
}

function TodoDetailDialog({ todo, allTodos, onClose, onSave, onToggle, onDelete }: {
  todo: ReturnType<typeof parseTodo>
  allTodos: Todo[]
  onClose: () => void
  onSave: (fields: Record<string, unknown>) => void
  onToggle: () => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(todo.title)
  const [body, setBody] = useState(todo.body ?? '')
  const [dueDate, setDueDate] = useState(todo.dueDate ?? '')
  const [sharedWith, setSharedWith] = useState(todo.sharedWith.join(', '))
  const [dirty, setDirty] = useState(false)

  function mark() { setDirty(true) }

  function save() {
    onSave({
      title: title.trim() || todo.title,
      body: body || null,
      dueDate: dueDate || null,
      sharedWith: sharedWith ? sharedWith.split(',').map(s => s.trim()).filter(Boolean) : [],
    })
    setDirty(false)
  }

  const relatedTodos = allTodos.filter(t => todo.relatedItems.includes(t.id))

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Input
              value={title}
              onChange={e => { setTitle(e.target.value); mark() }}
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0 h-auto"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {todo.noteId && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">From note</p>
              <Link href={`/notes/${todo.noteId}`} className="text-sm text-primary hover:underline" onClick={onClose}>
                View note →
              </Link>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
            <Textarea
              value={body}
              onChange={e => { setBody(e.target.value); mark() }}
              placeholder="Add notes…"
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Due date</p>
            <input
              type="date"
              value={dueDate}
              onChange={e => { setDueDate(e.target.value); mark() }}
              className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Shared with</p>
            <Input
              value={sharedWith}
              onChange={e => { setSharedWith(e.target.value); mark() }}
              placeholder="email@example.com, another@example.com"
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
          </div>

          {relatedTodos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Related items</p>
              <ul className="space-y-1">
                {relatedTodos.map(t => (
                  <li key={t.id} className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">{t.title}</li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={onToggle}>
              {todo.completed ? 'Move to active' : 'Mark complete'}
            </Button>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>
              {dirty && <Button size="sm" onClick={save}>Save</Button>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
