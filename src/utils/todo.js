export function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDueDate(dateStr) {
  if (!dateStr) return null
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(new Date(dateStr + 'T00:00:00'))
}

export function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') < today
}

export function getDaysUntilDue(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(dateStr + 'T00:00:00') - today) / (1000 * 60 * 60 * 24))
}

export function buildTasksByDate(todos) {
  const map = {}
  todos.forEach(todo => {
    if (todo.dueDate) {
      if (!map[todo.dueDate]) map[todo.dueDate] = []
      map[todo.dueDate].push({ ...todo, isSubTask: false })
    }
    todo.subTasks?.forEach(sub => {
      if (sub.dueDate) {
        if (!map[sub.dueDate]) map[sub.dueDate] = []
        map[sub.dueDate].push({ ...sub, isSubTask: true, parentId: todo.id })
      }
    })
  })
  return map
}

export function sortTodos(todos, sortKey) {
  if (sortKey === 'default') return todos
  const sorted = [...todos]
  if (sortKey === 'dueDate') {
    return sorted.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
  }
  if (sortKey === 'name') return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
  if (sortKey === 'priority') {
    const order = { high: 0, medium: 1, low: 2 }
    return sorted.sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3))
  }
  return sorted
}

export function getNextRepeatDate(dueDate, repeat) {
  if (!dueDate || !repeat || repeat === 'none') return null
  const d = new Date(dueDate + 'T00:00:00')
  if (repeat === 'daily') d.setDate(d.getDate() + 1)
  if (repeat === 'weekly') d.setDate(d.getDate() + 7)
  if (repeat === 'monthly') d.setMonth(d.getMonth() + 1)
  return toDateStr(d)
}

export const PRIORITY_OPTIONS = [
  { value: null, label: '없음' },
  { value: 'high', label: '높음', dot: 'bg-red-400', ring: 'ring-red-300' },
  { value: 'medium', label: '보통', dot: 'bg-yellow-400', ring: 'ring-yellow-300' },
  { value: 'low', label: '낮음', dot: 'bg-blue-400', ring: 'ring-blue-300' },
]

export const REPEAT_OPTIONS = [
  { value: 'none', label: '반복 없음' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
]
