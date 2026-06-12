'use client'

import { getDaysUntilDue, formatDueDate, PRIORITY_OPTIONS } from '@/utils/todo'

function DDayChip({ days }) {
  if (days < 0) return <span className="text-[10px] font-bold text-red-400">D+{Math.abs(days)}</span>
  if (days === 0) return <span className="text-[10px] font-bold text-red-500">D-DAY</span>
  return <span className="text-[10px] font-bold text-orange-400">D-{days}</span>
}

export default function Sidebar({ todos }) {
  const total = todos.length
  const completed = todos.filter(t => t.completed).length
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100)

  const priorityCounts = PRIORITY_OPTIONS.filter(o => o.value).map(opt => ({
    ...opt,
    count: todos.filter(t => t.priority === opt.value && !t.completed).length,
  }))

  const upcoming = todos
    .filter(t => !t.completed && t.dueDate)
    .map(t => ({ ...t, days: getDaysUntilDue(t.dueDate) }))
    .filter(t => t.days !== null && t.days <= 3)
    .sort((a, b) => a.days - b.days)

  return (
    <aside className="space-y-4">
      {/* 통계 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">통계</h2>

        <div className="flex items-end justify-between mb-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{rate}%</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{completed} / {total}개 완료</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gray-900 dark:bg-white rounded-full transition-all"
            style={{ width: `${rate}%` }}
          />
        </div>

        <div className="space-y-2">
          {priorityCounts.map(opt => (
            <div key={opt.value} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{opt.label}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{opt.count}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0 border-2 border-gray-300 dark:border-gray-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">우선순위 없음</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {todos.filter(t => !t.priority && !t.completed).length}
            </span>
          </div>
        </div>
      </div>

      {/* 마감 임박 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">마감 임박</h2>

        {upcoming.length === 0 ? (
          <p className="text-xs text-gray-300 dark:text-gray-600 text-center py-3">임박한 할 일 없음</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map(t => (
              <li key={t.id} className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-200 truncate">{t.title}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatDueDate(t.dueDate)}</p>
                </div>
                <DDayChip days={t.days} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
