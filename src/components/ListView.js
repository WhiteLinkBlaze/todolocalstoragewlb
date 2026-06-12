'use client'

import { useState } from 'react'
import TaskItem from './TaskItem'
import { createId, sortTodos } from '@/utils/todo'

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행중' },
  { key: 'completed', label: '완료' },
]

const SORTS = [
  { key: 'default', label: '기본' },
  { key: 'dueDate', label: '마감일순' },
  { key: 'name', label: '이름순' },
  { key: 'priority', label: '우선순위순' },
]

export default function ListView({ todos, setTodos }) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('default')
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)

  function addTodo(e) {
    e.preventDefault()
    const title = input.trim()
    if (!title) return
    setTodos(prev => [
      {
        id: createId(), title, completed: false, createdAt: Date.now(),
        dueDate: dueDate || null, subTasks: [], priority: null, note: '', repeat: 'none',
      },
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

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) return
    setTodos(prev => {
      const next = [...prev]
      const fromIdx = next.findIndex(t => t.id === dragId)
      const toIdx = next.findIndex(t => t.id === targetId)
      const [removed] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, removed)
      return next
    })
    setDragId(null)
    setOverId(null)
  }

  function handleRepeatComplete(todo, nextDueDate) {
    setTodos(prev => {
      const marked = prev.map(t => t.id === todo.id ? { ...t, completed: true } : t)
      const newTodo = { ...todo, id: createId(), completed: false, createdAt: Date.now(), dueDate: nextDueDate, subTasks: [] }
      return [newTodo, ...marked]
    })
  }

  const isDraggable = filter === 'all' && sort === 'default' && !search

  let visible = filter === 'active'
    ? todos.filter(t => !t.completed)
    : filter === 'completed'
    ? todos.filter(t => t.completed)
    : todos

  if (search) {
    const q = search.toLowerCase()
    visible = visible.filter(t => t.title.toLowerCase().includes(q))
  }

  visible = sortTodos(visible, sort)

  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.length - activeCount
  const completionRate = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

  const emptyMessage = search
    ? `"${search}" 검색 결과가 없습니다.`
    : filter === 'active' ? '진행중인 할 일이 없습니다.'
    : filter === 'completed' ? '완료한 할 일이 없습니다.'
    : '아직 등록된 할 일이 없습니다.'

  return (
    <div>
      {/* 진행률 */}
      {todos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">전체 진행률</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{completionRate}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">완료 {completedCount}개</span>
            <span className="text-xs text-gray-400">전체 {todos.length}개</span>
          </div>
        </div>
      )}

      {/* 추가 폼 */}
      <form onSubmit={addTodo} className="mb-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="새 할 일을 입력하세요"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
          >
            추가
          </button>
        </div>
        <div className="flex items-center gap-2 px-1">
          <label className="text-xs text-gray-400 dark:text-gray-500">마감일</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer bg-white dark:bg-gray-800"
          />
          {dueDate && (
            <button type="button" onClick={() => setDueDate('')} className="text-xs text-gray-300 hover:text-gray-500">×</button>
          )}
        </div>
      </form>

      {/* 검색 + 정렬 */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-xs">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="검색"
            className="w-full pl-7 pr-6 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:text-gray-300 dark:placeholder:text-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xs">×</button>
          )}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1.5 focus:outline-none bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer"
        >
          {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-1 mb-3">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {visible.length === 0 ? (
          <p className="text-center text-sm text-gray-300 dark:text-gray-600 py-12">{emptyMessage}</p>
        ) : (
          <ul>
            {visible.map((todo, i) => (
              <TaskItem
                key={todo.id}
                todo={todo}
                isFirst={i === 0}
                onUpdate={changes => updateTodo(todo.id, changes)}
                onDelete={() => deleteTodo(todo.id)}
                onRepeatComplete={nextDueDate => handleRepeatComplete(todo, nextDueDate)}
                dragProps={isDraggable ? {
                  draggable: true,
                  onDragStart: () => setDragId(todo.id),
                  onDragOver: e => { e.preventDefault(); setOverId(todo.id) },
                  onDrop: () => handleDrop(todo.id),
                  onDragEnd: () => { setDragId(null); setOverId(null) },
                  isDragging: dragId === todo.id,
                  isOver: overId === todo.id && dragId !== todo.id,
                } : null}
              />
            ))}
          </ul>
        )}
      </div>

      {/* 하단 */}
      <div className="flex items-center justify-between mt-4 px-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">남은 할 일 {activeCount}개</span>
        <button
          onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
          disabled={completedCount === 0}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          완료 항목 정리
        </button>
      </div>
    </div>
  )
}
