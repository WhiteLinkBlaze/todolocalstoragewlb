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
