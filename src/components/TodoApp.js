'use client'

import { useState, useEffect } from 'react'
import ListView from './ListView'
import CalendarMonth from './CalendarMonth'
import CalendarWeek from './CalendarWeek'

const STORAGE_KEY = 'mission.todo.localStorage.items'
const THEME_KEY = 'mission.todo.theme'

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
  const [dark, setDark] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      const migrated = (Array.isArray(saved) ? saved : []).map(t => ({
        dueDate: null,
        subTasks: [],
        priority: null,
        note: '',
        repeat: 'none',
        ...t,
      }))
      setTodos(migrated)
    } catch {
      setTodos([])
    }
    if (localStorage.getItem(THEME_KEY) === 'dark') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos, mounted])

  function toggleDark() {
    setDark(d => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">할 일 목록</h1>
        <div className="flex items-center gap-1">
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              aria-pressed={view === v.key}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === v.key
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {v.label}
            </button>
          ))}
          <button
            onClick={toggleDark}
            className="ml-1 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="다크 모드 전환"
          >
            {dark ? '☀️' : '🌙'}
          </button>
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
