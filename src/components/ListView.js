'use client'

import { useState } from 'react'
import TaskItem from './TaskItem'
import { createId } from '@/utils/todo'

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행중' },
  { key: 'completed', label: '완료' },
]

export default function ListView({ todos, setTodos }) {
  const [filter, setFilter] = useState('all')
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')

  function addTodo(e) {
    e.preventDefault()
    const title = input.trim()
    if (!title) return
    setTodos(prev => [
      { id: createId(), title, completed: false, createdAt: Date.now(), dueDate: dueDate || null, subTasks: [] },
      ...prev,
    ])
    setInput('')
    setDueDate('')
  }

  function updateTodo(id, changes) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
  }

  function deleteTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const filtered = filter === 'active'
    ? todos.filter(t => !t.completed)
    : filter === 'completed'
    ? todos.filter(t => t.completed)
    : todos

  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.length - activeCount

  const emptyMessage = filter === 'active'
    ? '진행중인 할 일이 없습니다.'
    : filter === 'completed'
    ? '완료한 할 일이 없습니다.'
    : '아직 등록된 할 일이 없습니다.'

  return (
    <div>
      <form onSubmit={addTodo} className="mb-5">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="새 할 일을 입력하세요"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-300"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            추가
          </button>
        </div>
        <div className="flex items-center gap-2 px-1">
          <label className="text-xs text-gray-400">마감일</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer"
          />
          {dueDate && (
            <button type="button" onClick={() => setDueDate('')} className="text-xs text-gray-300 hover:text-gray-500">
              ×
            </button>
          )}
        </div>
      </form>

      <div className="flex gap-1 mb-3">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-300 py-12">{emptyMessage}</p>
        ) : (
          <ul>
            {filtered.map((todo, i) => (
              <TaskItem
                key={todo.id}
                todo={todo}
                isFirst={i === 0}
                onUpdate={changes => updateTodo(todo.id, changes)}
                onDelete={() => deleteTodo(todo.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 px-1">
        <span className="text-sm text-gray-500">남은 할 일 {activeCount}개</span>
        <button
          onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
          disabled={completedCount === 0}
          className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          완료 항목 정리
        </button>
      </div>
    </div>
  )
}
