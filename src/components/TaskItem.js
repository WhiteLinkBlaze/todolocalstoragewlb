'use client'

import { useState } from 'react'
import { createId, formatDueDate, isOverdue } from '@/utils/todo'

function DueDateBadge({ dateStr, completed }) {
  const label = formatDueDate(dateStr)
  const overdue = isOverdue(dateStr, completed)
  if (!label) return null
  return (
    <span className={`text-xs ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
      {overdue ? '⚠ ' : ''}{label}
    </span>
  )
}

export default function TaskItem({ todo, isFirst, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(todo.title)
  const [subInput, setSubInput] = useState('')
  const [editingSubId, setEditingSubId] = useState(null)
  const [editingSubValue, setEditingSubValue] = useState('')

  function commitTitle() {
    const next = titleValue.trim()
    if (next) onUpdate({ title: next })
    else setTitleValue(todo.title)
    setEditingTitle(false)
  }

  function addSubTask(e) {
    e.preventDefault()
    const title = subInput.trim()
    if (!title) return
    onUpdate({
      subTasks: [
        ...todo.subTasks,
        { id: createId(), title, completed: false, createdAt: Date.now(), dueDate: null },
      ],
    })
    setSubInput('')
  }

  function updateSubTask(subId, changes) {
    onUpdate({ subTasks: todo.subTasks.map(s => s.id === subId ? { ...s, ...changes } : s) })
  }

  function deleteSubTask(subId) {
    onUpdate({ subTasks: todo.subTasks.filter(s => s.id !== subId) })
  }

  function commitSubTitle(subId) {
    const next = editingSubValue.trim()
    if (next) updateSubTask(subId, { title: next })
    setEditingSubId(null)
  }

  const completedSubs = todo.subTasks.filter(s => s.completed).length

  return (
    <li className={isFirst ? '' : 'border-t border-gray-50'}>
      <div className="flex items-start gap-3 px-4 py-3 group">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onUpdate({ completed: !todo.completed })}
          aria-label="완료 상태 변경"
          className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-gray-900 cursor-pointer flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') commitTitle()
                if (e.key === 'Escape') { setTitleValue(todo.title); setEditingTitle(false) }
              }}
              maxLength={80}
              autoFocus
              className="w-full text-sm border-b border-gray-300 focus:outline-none focus:border-gray-900 bg-transparent py-0.5"
            />
          ) : (
            <span className={`text-sm block truncate ${todo.completed ? 'line-through text-gray-300' : 'text-gray-700'}`}>
              {todo.title}
            </span>
          )}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <DueDateBadge dateStr={todo.dueDate} completed={todo.completed} />
            {todo.subTasks.length > 0 && (
              <span className="text-xs text-gray-300">{completedSubs}/{todo.subTasks.length} 완료</span>
            )}
          </div>
        </div>

        <div className="flex gap-0.5 flex-shrink-0 items-center mt-0.5">
          <label className="cursor-pointer" title="마감일 변경">
            <span className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
              todo.dueDate
                ? isOverdue(todo.dueDate, todo.completed)
                  ? 'border-red-200 text-red-400 bg-red-50'
                  : 'border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100'
                : 'border-dashed border-gray-200 text-gray-300 hover:text-gray-400 hover:border-gray-300'
            }`}>
              {todo.dueDate ? formatDueDate(todo.dueDate) : '날짜'}
            </span>
            <input
              type="date"
              value={todo.dueDate ?? ''}
              onChange={e => onUpdate({ dueDate: e.target.value || null })}
              className="sr-only"
            />
          </label>
          <button
            onClick={() => setExpanded(v => !v)}
            aria-label="하위 작업"
            title="하위 작업"
            className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors rounded-lg hover:bg-gray-50 text-xs leading-none"
          >
            {expanded ? '▲' : '▼'}
          </button>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditingTitle(true)}
              aria-label="수정"
              className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              ✎
            </button>
            <button
              onClick={onDelete}
              aria-label="삭제"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-red-400 transition-colors rounded-lg"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="bg-gray-50/60 border-t border-gray-50 px-4 pt-1 pb-3">
          {todo.subTasks.map((sub, i) => (
            <div
              key={sub.id}
              className={`flex items-start gap-2 py-2 group/sub pl-6 ${i !== 0 ? 'border-t border-gray-100' : ''}`}
            >
              <input
                type="checkbox"
                checked={sub.completed}
                onChange={() => updateSubTask(sub.id, { completed: !sub.completed })}
                className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 accent-gray-700 cursor-pointer flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                {editingSubId === sub.id ? (
                  <input
                    type="text"
                    value={editingSubValue}
                    onChange={e => setEditingSubValue(e.target.value)}
                    onBlur={() => commitSubTitle(sub.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitSubTitle(sub.id)
                      if (e.key === 'Escape') setEditingSubId(null)
                    }}
                    maxLength={80}
                    autoFocus
                    className="w-full text-xs border-b border-gray-300 focus:outline-none focus:border-gray-900 bg-transparent"
                  />
                ) : (
                  <span className={`text-xs block truncate ${sub.completed ? 'line-through text-gray-300' : 'text-gray-500'}`}>
                    {sub.title}
                  </span>
                )}
                <DueDateBadge dateStr={sub.dueDate} completed={sub.completed} />
              </div>
              <div className="flex gap-0.5 items-center flex-shrink-0">
                <label className="cursor-pointer" title="마감일 변경">
                  <span className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
                    sub.dueDate
                      ? isOverdue(sub.dueDate, sub.completed)
                        ? 'border-red-200 text-red-400 bg-red-50'
                        : 'border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100'
                      : 'border-dashed border-gray-200 text-gray-300 hover:text-gray-400'
                  }`}>
                    {sub.dueDate ? formatDueDate(sub.dueDate) : '날짜'}
                  </span>
                  <input
                    type="date"
                    value={sub.dueDate ?? ''}
                    onChange={e => updateSubTask(sub.id, { dueDate: e.target.value || null })}
                    className="sr-only"
                  />
                </label>
                <div className="flex gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingSubId(sub.id); setEditingSubValue(sub.title) }}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 text-xs"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteSubTask(sub.id)}
                    className="p-1 text-gray-400 hover:text-white hover:bg-red-400 rounded text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}

          <form onSubmit={addSubTask} className="flex gap-2 mt-2 pl-6">
            <input
              type="text"
              value={subInput}
              onChange={e => setSubInput(e.target.value)}
              placeholder="하위 작업 추가"
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:text-gray-300 bg-white"
            />
            <button
              type="submit"
              className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              추가
            </button>
          </form>
        </div>
      )}
    </li>
  )
}
