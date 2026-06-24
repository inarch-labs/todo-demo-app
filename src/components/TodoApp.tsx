'use client'

import { useState, useEffect, useRef } from 'react'

interface Todo {
  id: string
  title: string
  body: string | null
  completed: boolean
  sortOrder: number
  dueDate: string | null
  sharedWith: string | null
  relatedItems: string | null
  createdAt: number
}

function parseTodo(todo: Todo) {
  return {
    ...todo,
    sharedWith: todo.sharedWith ? JSON.parse(todo.sharedWith) as string[] : [],
    relatedItems: todo.relatedItems ? JSON.parse(todo.relatedItems) as string[] : [],
  }
}

type Tab = 'active' | 'complete'

export default function TodoApp() {
  const [active, setActive] = useState<Todo[]>([])
  const [completed, setCompleted] = useState<Todo[]>([])
  const [tab, setTab] = useState<Tab>('active')
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [selected, setSelected] = useState<Todo | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/todos').then(r => r.json()),
      fetch('/api/todos/archived').then(r => r.json()),
    ]).then(([a, c]) => {
      setActive(a)
      setCompleted(c)
      setLoading(false)
    })
  }, [])

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input.trim(), dueDate: dueDate || undefined }),
    })
    const todo = await res.json()
    setActive(prev => [todo, ...prev])
    setInput('')
    setDueDate('')
    inputRef.current?.focus()
  }

  async function toggle(id: string) {
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
      const { active, completed } = await res.json()
      setActive(active)
      setCompleted(completed)
    }
    setSeeding(false)
  }

  // Drag-to-reorder
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
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['active', 'complete'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'active' && active.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">{active.length}</span>
            )}
            {t === 'complete' && completed.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">{completed.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Add form — active tab only */}
      {tab === 'active' && (
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">Loading…</p>
      ) : tab === 'active' ? (
        active.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm mb-4">No active tasks.</p>
            <button
              onClick={seed}
              disabled={seeding}
              className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
            >
              {seeding ? 'Loading…' : 'Load sample todos for testing'}
            </button>
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
                className={`flex items-center gap-3 group bg-white border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                  dragOverId === todo.id && dragId !== todo.id
                    ? 'border-blue-400 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                } ${dragId === todo.id ? 'opacity-40' : ''}`}
              >
                <span className="text-gray-300 cursor-grab active:cursor-grabbing flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" title="Drag to reorder">
                  ⠿
                </span>
                <button
                  onClick={e => { e.stopPropagation(); toggle(todo.id) }}
                  className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-blue-500 flex-shrink-0 transition-colors"
                />
                <span className="flex-1 text-sm text-gray-800">{todo.title}</span>
                {todo.dueDate && (
                  <span className="text-xs text-gray-400 flex-shrink-0">{todo.dueDate}</span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); remove(todo.id) }}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        completed.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">No completed tasks yet.</p>
        ) : (
          <ul className="space-y-2">
            {completed.map(todo => (
              <li
                key={todo.id}
                onClick={() => setSelected(todo)}
                className="flex items-center gap-3 group bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors cursor-pointer"
              >
                <button
                  onClick={e => { e.stopPropagation(); toggle(todo.id) }}
                  className="w-5 h-5 rounded-full border-2 bg-green-500 border-green-500 flex-shrink-0 transition-colors"
                  title="Move back to active"
                />
                <span className="flex-1 text-sm line-through text-gray-400">{todo.title}</span>
                {todo.dueDate && (
                  <span className="text-xs text-gray-400 flex-shrink-0">{todo.dueDate}</span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); remove(todo.id) }}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      {selected && (
        <TodoDetail
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

function TodoDetail({ todo, allTodos, onClose, onSave, onToggle, onDelete }: {
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); mark() }}
              className="flex-1 text-lg font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none pb-1"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0">×</button>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</label>
            <textarea
              value={body}
              onChange={e => { setBody(e.target.value); mark() }}
              placeholder="Add notes…"
              rows={3}
              className="mt-1 w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => { setDueDate(e.target.value); mark() }}
              className="mt-1 block text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Shared with</label>
            <input
              value={sharedWith}
              onChange={e => { setSharedWith(e.target.value); mark() }}
              placeholder="email@example.com, another@example.com"
              className="mt-1 w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Separate multiple with commas</p>
          </div>

          {relatedTodos.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Related items</label>
              <ul className="mt-1 space-y-1">
                {relatedTodos.map(t => (
                  <li key={t.id} className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    {t.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={onToggle}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              {todo.completed ? 'Move to active' : 'Mark complete'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={onDelete}
                className="text-sm text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors"
              >
                Delete
              </button>
              {dirty && (
                <button
                  onClick={save}
                  className="text-sm bg-blue-600 text-white rounded-lg px-4 py-1.5 hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
