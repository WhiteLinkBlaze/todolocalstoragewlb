'use client'

import { toDateStr, buildTasksByDate } from '@/utils/todo'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function getWeekStart(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

export default function CalendarWeek({ todos, calendarDate, setCalendarDate }) {
  const weekStart = getWeekStart(calendarDate)
  const today = toDateStr(new Date())
  const tasksByDate = buildTasksByDate(todos)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setCalendarDate(d)
  }

  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setCalendarDate(d)
  }

  const fmt = d => new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(d)
  const endDay = new Date(weekStart)
  endDay.setDate(endDay.getDate() + 6)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevWeek} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          ←
        </button>
        <span className="font-semibold text-gray-900 dark:text-white">{fmt(weekStart)} – {fmt(endDay)}</span>
        <button onClick={nextWeek} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const dateStr = toDateStr(day)
          const items = tasksByDate[dateStr] ?? []
          const isToday = dateStr === today

          return (
            <div key={dateStr} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-2 min-h-28">
              <div className={`flex flex-col items-center justify-center w-8 h-8 rounded-full mb-2 mx-auto ${
                isToday ? 'bg-gray-900 dark:bg-white' : ''
              }`}>
                <span className={`text-[9px] font-medium ${
                  isToday ? 'text-white dark:text-gray-900' : i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {WEEKDAYS[i]}
                </span>
                <span className={`text-xs font-semibold leading-none ${
                  isToday ? 'text-white dark:text-gray-900' : i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {day.getDate()}
                </span>
              </div>

              <div className="space-y-1">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`text-xs rounded px-1.5 py-1 truncate leading-tight ${
                      item.completed ? 'line-through text-gray-300 dark:text-gray-600' : ''
                    } ${
                      item.isSubTask
                        ? 'pl-3 text-gray-500 dark:text-gray-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {item.isSubTask && <span className="text-gray-300 dark:text-gray-500 mr-0.5">└</span>}
                    {item.title}
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-gray-300 dark:text-gray-600 text-center mt-2">없음</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
