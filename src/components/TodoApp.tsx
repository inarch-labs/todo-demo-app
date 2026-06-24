'use client'

import { useState, useEffect, useRef } from 'react'

interface Todo {
  id: string
  title: string
  body: string | null
  completed: boolean
  dueDate: string | null
  sharedWith: string | null
  relatedItems: string | null
  archivedAt: number | null
  createdAt: number
}

function parseTodo(todo: Todo) {
  return {
    ...todo,
    sharedWith: todo.sharedWith ? JSON.parse(todo.sharedWith) as string[] : [],
    relatedItems: todo.relatedItems ? JSON.parse(todo.relatedItems) as string[] : [],
  }
}

type Tab = 'active' | 'archived'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [archived, setArchived] = useState<Todo[]>([])
  const [tab, setTab] = useState<Tab>('active')
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [selected, setSelected] = useState<Todo | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function loadActive() {
    const res = await fetch('/api/todos')
    const data = await res.json()
    setTodos(data)
  }

  async function loadArchived() {
    const res = await fetch('/api/todos/archived')
    const data = await res.json()
    setArchived(data)
  }

  useEffect(() => {
    Promise.all([loadActive(), loadArchived()]).then(() => setLoading(false))
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
    setTodos(prev => [todo, ...prev])
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
    setTodos(prev => prev.map(t => t.id === id ? updated : t))
    if (selected?.id === id) setSelected(updated)
  }

  async function archive(id: string) {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'archive' }),
    })
    const todo = todos.find(t => t.id === id)
    setTodos(prev => prev.filter(t => t.id !== id))
    if (todo) setArchived(prev => [{ ...todo, archivedAt: Date.now() }, ...prev])
    if (selected?.id === id) setSelected(null)
  }

  async function unarchive(id: string) {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unarchive' }),
    })
    const updated = await res.json()
    setArchived(prev => prev.filter(t => t.id !== id))
    setTodos(prev => [updated, ...prev])
    if (selected?.id === id) setSelected(null)
  }

  async function remove(id: string) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    setTodos(prev => prev.filter(t => t.id !== id))
    setArchived(prev => prev.filter(t => t.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  async function saveDetail(id: string, fields: Partial<Todo & { sharedWith: string[]; relatedItems: string[] }>) {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    const updated = await res.json()
    setTodos(prev => prev.map(t => t.id === id ? updated : t))
    setArchived(prev => prev.map(t => t.id === id ? updated : t))
    setSelected(updated)
  }

  async function seed() {
    setSeeding(true)
    const res = await fetch('/api/todos/seed', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setTodos(data)
    }
    setSeeding(false)
  }

  const open = todos.filter(t => !t.completed)
  const done = todos.filter(t => t.completed)
  const list = tab === 'active' ? { open, done } : null

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['active', 'archived'] as Tab[]).map(t => (
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
            {t === 'active' && todos.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">{todos.length}</span>
            )}
            {t === 'archived' && archived.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">{archived.length}</span>
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
        <>
          {todos.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm mb-4">No tasks yet.</p>
              <button
                onClick={seed}
                disabled={seeding}
                className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              >
                {seeding ? 'Loading…' : 'Load sample todos for testing'}
              </button>
            </div>
          )}
          {list!.open.length > 0 && (
            <TodoList todos={list!.open} onToggle={toggle} onArchive={archive} onDelete={remove} onSelect={setSelected} />
          )}
          {list!.done.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Completed</p>
              <TodoList todos={list!.done} onToggle={toggle} onArchive={archive} onDelete={remove} onSelect={setSelected} />
            </div>
          )}
        </>
      ) : (
        <>
          {archived.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No archived tasks.</p>
          ) : (
            <TodoList todos={archived} onToggle={() => {}} onArchive={() => {}} onUnarchive={unarchive} onDelete={remove} onSelect={setSelected} isArchived />
          )}
        </>
      )}

      {/* Detail popover */}
      {selected && (
        <TodoDetail
          todo={parseTodo(selected)}
          allTodos={[...todos, ...archived]}
          onClose={() => setSelected(null)}
          onSave={(fields) => saveDetail(selected.id, fields)}
          onToggle={() => toggle(selected.id)}
          onArchive={selected.archivedAt ? () => unarchive(selected.id) : () => archive(selected.id)}
          onDelete={() => remove(selected.id)}
        />
      )}
    </div>
  )
}

function TodoList({ todos, onToggle, onArchive, onUnarchive, onDelete, onSelect, isArchived = false }: {
  todos: Todo[]
  onToggle: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive?: (id: string) => void
  onDelete: (id: string) => void
  onSelect: (todo: Todo) => void
  isArchived?: boolean
}) {
  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <li
          key={todo.id}
          className="flex items-center gap-3 group bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors cursor-pointer"
          onClick={() => onSelect(todo)}
        >
          {!isArchived && (
            <button
              onClick={e => { e.stopPropagation(); onToggle(todo.id) }}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-blue-500'
              }`}
            />
          )}
          <span className={`flex-1 text-sm ${todo.completed || isArchived ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {todo.title}
          </span>
          {todo.dueDate && (
            <span className="text-xs text-gray-400 flex-shrink-0">{todo.dueDate}</span>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
            {isArchived ? (
              <button onClick={() => onUnarchive?.(todo.id)} className="text-xs text-gray-400 hover:text-blue-500 px-1">Restore</button>
            ) : (
              <button onClick={() => onArchive(todo.id)} className="text-xs text-gray-400 hover:text-gray-600 px-1">Archive</button>
            )}
            <button onClick={() => onDelete(todo.id)} className="text-gray-300 hover:text-red-500 text-lg leading-none px-1">×</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function TodoDetail({ todo, allTodos, onClose, onSave, onToggle, onArchive, onDelete }: {
  todo: ReturnType<typeof parseTodo>
  allTodos: Todo[]
  onClose: () => void
  onSave: (fields: Record<string, unknown>) => void
  onToggle: () => void
  onArchive: () => void
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
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); mark() }}
              className="flex-1 text-lg font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none pb-1"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0">×</button>
          </div>

          {/* Body */}
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

          {/* Due date */}
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => { setDueDate(e.target.value); mark() }}
              className="mt-1 block text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Shared with */}
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

          {/* Related items */}
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

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={onToggle}
                className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                {todo.completed ? 'Mark active' : 'Mark done'}
              </button>
              <button
                onClick={onArchive}
                className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                {todo.archivedAt ? 'Restore' : 'Archive'}
              </button>
            </div>
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
