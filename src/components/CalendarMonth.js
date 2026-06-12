'use client'

import { toDateStr, buildTasksByDate } from '@/utils/todo'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export default function CalendarMonth({ todos, calendarDate, setCalendarDate }) {
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const today = toDateStr(new Date())
  const tasksByDate = buildTasksByDate(todos)

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  function prevMonth() { setCalendarDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCalendarDate(new Date(year, month + 1, 1)) }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          ←
        </button>
        <span className="font-semibold text-gray-900">{year}년 {MONTHS[month]}</span>
        <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        {cells.map((day, idx) => {
          const col = idx % 7
          const isLastRow = idx >= cells.length - 7
          const dateStr = day
            ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : null
          const items = dateStr ? (tasksByDate[dateStr] ?? []) : []
          const isToday = dateStr === today

          return (
            <div
              key={idx}
              className={`min-h-20 p-1.5 ${!isLastRow ? 'border-b' : ''} ${col !== 6 ? 'border-r' : ''} border-gray-50 ${!day ? 'bg-gray-50/40' : ''}`}
            >
              {day && (
                <>
                  <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    isToday ? 'bg-gray-900 text-white' : col === 0 ? 'text-red-400' : col === 6 ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {items.slice(0, 3).map(item => (
                      <div
                        key={item.id}
                        className={`text-xs truncate rounded px-1 py-0.5 leading-tight ${
                          item.completed ? 'line-through text-gray-300' : ''
                        } ${
                          item.isSubTask
                            ? 'pl-2.5 text-gray-500'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.isSubTask && <span className="text-gray-300 mr-0.5">└</span>}
                        {item.title}
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-xs text-gray-400 pl-1">+{items.length - 3}개</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
