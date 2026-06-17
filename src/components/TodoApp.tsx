'use client'

import { useState, useEffect, useRef } from 'react'

interface Todo {
  id: string
  title: string
  completed: boolean
  dueDate: string | null
  createdAt: number
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/todos')
      .then(r => r.json())
      .then(data => { setTodos(data); setLoading(false) })
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
    const res = await fetch(`/api/todos/${id}`, { method: 'PATCH' })
    const updated = await res.json()
    setTodos(prev => prev.map(t => t.id === id ? updated : t))
  }

  async function remove(id: string) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const open = todos.filter(t => !t.completed)
  const done = todos.filter(t => t.completed)

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <form onSubmit={addTodo} className="flex gap-2 mb-8">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400 text-sm text-center">Loading…</p>
      ) : (
        <>
          <TodoList todos={open} onToggle={toggle} onDelete={remove} />
          {done.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Completed</p>
              <TodoList todos={done} onToggle={toggle} onDelete={remove} />
            </div>
          )}
          {todos.length === 0 && (
            <p className="text-gray-400 text-sm text-center">No tasks yet. Add one above.</p>
          )}
        </>
      )}
    </div>
  )
}

function TodoList({ todos, onToggle, onDelete }: {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <li key={todo.id} className="flex items-center gap-3 group bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors">
          <button
            onClick={() => onToggle(todo.id)}
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
              todo.completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-blue-500'
            }`}
          />
          <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {todo.title}
          </span>
          {todo.dueDate && (
            <span className="text-xs text-gray-400 flex-shrink-0">{todo.dueDate}</span>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
