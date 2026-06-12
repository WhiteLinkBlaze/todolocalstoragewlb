'use client'

import { useState } from 'react'
import {
  createId, formatDueDate, isOverdue, getDaysUntilDue,
  getNextRepeatDate, PRIORITY_OPTIONS, REPEAT_OPTIONS,
} from '@/utils/todo'

function DDayBadge({ dueDate, completed }) {
  const days = getDaysUntilDue(dueDate)
  if (!dueDate || completed || days === null || days > 3) return null

  let text, cls
  if (days < 0) {
    text = `D+${Math.abs(days)}`
    cls = 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
  } else if (days === 0) {
    text = 'D-DAY'
    cls = 'bg-red-500 text-white'
  } else {
    text = `D-${days}`
    cls = 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
  }

  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${cls}`}>{text}</span>
}

function PriorityDot({ priority, onClick }) {
  const opt = PRIORITY_OPTIONS.find(o => o.value === priority)
  return (
    <button
      onClick={onClick}
      title="우선순위 변경 (클릭)"
      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 border-2 transition-all ${
        opt?.dot ? `${opt.dot} border-transparent` : 'border-gray-300 dark:border-gray-600 bg-transparent'
      }`}
    />
  )
}

export default function TaskItem({ todo, isFirst, onUpdate, onDelete, onRepeatComplete, dragProps }) {
  const [expanded, setExpanded] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(todo.title)
  const [subInput, setSubInput] = useState('')
  const [editingSubId, setEditingSubId] = useState(null)
  const [editingSubValue, setEditingSubValue] = useState('')

  function cyclePriority() {
    const idx = PRIORITY_OPTIONS.findIndex(o => o.value === todo.priority)
    const next = PRIORITY_OPTIONS[(idx + 1) % PRIORITY_OPTIONS.length]
    onUpdate({ priority: next.value })
  }

  function commitTitle() {
    const next = titleValue.trim()
    if (next) onUpdate({ title: next })
    else setTitleValue(todo.title)
    setEditingTitle(false)
  }

  function handleToggle() {
    if (!todo.completed && todo.repeat !== 'none' && todo.dueDate) {
      const nextDate = getNextRepeatDate(todo.dueDate, todo.repeat)
      onRepeatComplete?.(nextDate)
    } else {
      onUpdate({ completed: !todo.completed })
    }
  }

  function addSubTask(e) {
    e.preventDefault()
    const title = subInput.trim()
    if (!title) return
    onUpdate({
      subTasks: [...todo.subTasks, { id: createId(), title, completed: false, createdAt: Date.now(), dueDate: null }],
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

  const overdue = isOverdue(todo.dueDate, todo.completed)
  const dueLabel = formatDueDate(todo.dueDate)
  const completedSubs = todo.subTasks.filter(s => s.completed).length
  const repeatLabel = REPEAT_OPTIONS.find(r => r.value === (todo.repeat ?? 'none'))?.label

  return (
    <li
      className={`${isFirst ? '' : 'border-t border-gray-50 dark:border-gray-700'} ${
        dragProps?.isDragging ? 'opacity-40' : ''
      } ${dragProps?.isOver ? 'border-t-2 !border-blue-400' : ''}`}
      draggable={dragProps?.draggable}
      onDragStart={dragProps?.onDragStart}
      onDragOver={dragProps?.onDragOver}
      onDrop={dragProps?.onDrop}
      onDragEnd={dragProps?.onDragEnd}
    >
      <div className="flex items-start gap-2 px-3 py-3 group">
        {/* 드래그 핸들 */}
        {dragProps && (
          <span className="text-gray-200 dark:text-gray-700 cursor-grab active:cursor-grabbing mt-1 select-none flex-shrink-0 text-base leading-none">⠿</span>
        )}

        {/* 체크박스 */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          aria-label="완료 상태 변경"
          className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 accent-gray-900 cursor-pointer flex-shrink-0"
        />

        {/* 우선순위 점 */}
        <div className="mt-1.5">
          <PriorityDot priority={todo.priority} onClick={cyclePriority} />
        </div>

        {/* 내용 */}
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
              className="w-full text-sm border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-gray-900 dark:focus:border-white bg-transparent text-gray-900 dark:text-white py-0.5"
            />
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-sm ${todo.completed ? 'line-through text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'}`}>
                {todo.title}
              </span>
              <DDayBadge dueDate={todo.dueDate} completed={todo.completed} />
            </div>
          )}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {dueLabel && (
              <span className={`text-xs ${overdue ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {overdue ? '⚠ ' : ''}{dueLabel}
              </span>
            )}
            {todo.repeat && todo.repeat !== 'none' && (
              <span className="text-xs text-gray-400 dark:text-gray-500">🔄 {repeatLabel}</span>
            )}
            {todo.subTasks.length > 0 && (
              <span className="text-xs text-gray-300 dark:text-gray-600">{completedSubs}/{todo.subTasks.length}</span>
            )}
          </div>
        </div>

        {/* 액션 */}
        <div className="flex gap-0.5 flex-shrink-0 items-center mt-0.5">
          <label className="cursor-pointer" title="마감일 변경">
            <span className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
              todo.dueDate
                ? overdue
                  ? 'border-red-200 text-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                : 'border-dashed border-gray-200 dark:border-gray-600 text-gray-300 dark:text-gray-600 hover:text-gray-400 hover:border-gray-300'
            }`}>
              {dueLabel ?? '날짜'}
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
            aria-label="펼치기"
            className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
          >
            {expanded ? '▲' : '▼'}
          </button>
          <div className="flex gap-0.5">
            <button
              onClick={() => setEditingTitle(true)}
              aria-label="수정"
              className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ✎
            </button>
            <button
              onClick={onDelete}
              aria-label="삭제"
              className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-white hover:bg-red-400 transition-colors rounded-lg"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* 펼쳐진 영역 */}
      {expanded && (
        <div className="bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700 px-4 pb-3">
          {/* 메모 */}
          <textarea
            value={todo.note ?? ''}
            onChange={e => onUpdate({ note: e.target.value })}
            placeholder="메모를 입력하세요..."
            rows={2}
            className="w-full mt-2 text-xs text-gray-600 dark:text-gray-400 placeholder:text-gray-300 dark:placeholder:text-gray-600 resize-none focus:outline-none bg-transparent"
          />

          {/* 우선순위 + 반복 */}
          <div className="flex flex-wrap gap-4 py-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 dark:text-gray-500">우선순위</span>
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={String(opt.value)}
                    onClick={() => onUpdate({ priority: opt.value })}
                    className={`text-xs px-1.5 py-0.5 rounded-md transition-colors ${
                      todo.priority === opt.value
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 dark:text-gray-500">반복</span>
              <select
                value={todo.repeat ?? 'none'}
                onChange={e => onUpdate({ repeat: e.target.value })}
                className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-1.5 py-0.5 focus:outline-none bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                {REPEAT_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          {/* 하위 작업 */}
          {todo.subTasks.map((sub, i) => (
            <div
              key={sub.id}
              className={`flex items-start gap-2 py-2 group/sub pl-5 border-t border-gray-100 dark:border-gray-700`}
            >
              <input
                type="checkbox"
                checked={sub.completed}
                onChange={() => updateSubTask(sub.id, { completed: !sub.completed })}
                className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 dark:border-gray-600 accent-gray-700 cursor-pointer flex-shrink-0"
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
                    className="w-full text-xs border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-gray-900 bg-transparent text-gray-900 dark:text-white"
                  />
                ) : (
                  <span className={`text-xs block truncate ${sub.completed ? 'line-through text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                    {sub.title}
                  </span>
                )}
                {sub.dueDate && (
                  <span className={`text-xs ${isOverdue(sub.dueDate, sub.completed) ? 'text-red-400' : 'text-gray-300 dark:text-gray-600'}`}>
                    {formatDueDate(sub.dueDate)}
                  </span>
                )}
              </div>
              <div className="flex gap-0.5 items-center flex-shrink-0">
                <label className="cursor-pointer" title="마감일">
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${
                    sub.dueDate
                      ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700'
                      : 'border-dashed border-gray-200 dark:border-gray-600 text-gray-300 dark:text-gray-600'
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
                <div className="flex gap-0.5">
                  <button
                    onClick={() => { setEditingSubId(sub.id); setEditingSubValue(sub.title) }}
                    className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
                  >✎</button>
                  <button
                    onClick={() => deleteSubTask(sub.id)}
                    className="p-1 text-gray-300 dark:text-gray-600 hover:text-white hover:bg-red-400 rounded text-xs"
                  >×</button>
                </div>
              </div>
            </div>
          ))}

          <form onSubmit={addSubTask} className="flex gap-2 mt-2 pl-5">
            <input
              type="text"
              value={subInput}
              onChange={e => setSubInput(e.target.value)}
              placeholder="하위 작업 추가"
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:text-gray-300 dark:placeholder:text-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
            <button
              type="submit"
              className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >추가</button>
          </form>
        </div>
      )}
    </li>
  )
}
