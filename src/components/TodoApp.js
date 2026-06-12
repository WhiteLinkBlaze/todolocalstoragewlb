'use client'

import { useState, useEffect } from 'react'
import ListView from './ListView'
import CalendarMonth from './CalendarMonth'
import CalendarWeek from './CalendarWeek'

const STORAGE_KEY = 'mission.todo.localStorage.items'

const VIEWS = [
  { key: 'list', label: '목록' },
  { key: 'month', label: '월간' },
  { key: 'week', label: '주간' },
]

export default function TodoApp() {
  const [todos, setTodos] = useState([])
  const [view, setView] = useState('list')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      const migrated = (Array.isArray(saved) ? saved : []).map(t => ({
        dueDate: null,
        subTasks: [],
        ...t,
      }))
      setTodos(migrated)
    } catch {
      setTodos([])
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos, mounted])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">할 일 목록</h1>
        <div className="flex gap-1">
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              aria-pressed={view === v.key}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === v.key ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {view === 'list' && <ListView todos={todos} setTodos={setTodos} />}
        {view === 'month' && (
          <CalendarMonth todos={todos} calendarDate={calendarDate} setCalendarDate={setCalendarDate} />
        )}
        {view === 'week' && (
          <CalendarWeek todos={todos} calendarDate={calendarDate} setCalendarDate={setCalendarDate} />
        )}
      </main>
    </div>
  )
}
