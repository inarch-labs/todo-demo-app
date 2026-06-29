'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface Todo {
  id: string
  title: string
  dueDate: string | null
  completed: boolean
  noteId: string | null
}

export default function CalendarPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Date | undefined>(undefined)

  useEffect(() => {
    fetch('/api/todos/calendar')
      .then(r => r.json())
      .then(data => {
        setTodos(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  // Group todos by date string "YYYY-MM-DD"
  const byDate = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
    if (!todo.dueDate) return acc
    acc[todo.dueDate] = [...(acc[todo.dueDate] ?? []), todo]
    return acc
  }, {})

  const dueDates = Object.keys(byDate).map(d => new Date(d + 'T00:00:00'))

  const selectedKey = selected
    ? `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`
    : null

  const selectedTodos = selectedKey ? (byDate[selectedKey] ?? []) : []

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Calendar</h1>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-10">Loading…</p>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Popover open={!!selected && selectedTodos.length > 0} onOpenChange={open => !open && setSelected(undefined)}>
              <PopoverTrigger>
                <div>
                  <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={setSelected}
                    modifiers={{ hasTodo: dueDates }}
                    modifiersClassNames={{ hasTodo: 'font-bold underline decoration-primary' }}
                    className="rounded-lg border"
                  />
                </div>
              </PopoverTrigger>
              {selected && selectedTodos.length > 0 && (
                <PopoverContent className="w-72 p-3" align="center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <ul className="space-y-1.5">
                    {selectedTodos.map(todo => (
                      <li key={todo.id} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="flex-1">{todo.title}</span>
                        {todo.noteId && <Badge variant="outline" className="text-xs">note</Badge>}
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              )}
            </Popover>
          </div>

          {Object.keys(byDate).length === 0 && (
            <p className="text-muted-foreground text-sm text-center">
              No todos with due dates yet. Add a due date to a todo to see it here.
            </p>
          )}

          {/* Upcoming agenda */}
          {Object.keys(byDate).length > 0 && (
            <div className="space-y-2 pt-2">
              <h2 className="text-sm font-medium text-muted-foreground">Upcoming</h2>
              {Object.entries(byDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, items]) => (
                  <div key={date} className="flex gap-3 items-start">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">{date}</span>
                    <ul className="space-y-0.5 flex-1">
                      {items.map(todo => (
                        <li key={todo.id} className="text-sm">{todo.title}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
