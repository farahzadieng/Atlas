import {
  type ProjectStatus,
  type CardType,
  type TaskStatus,
  type Card,
} from './db'

export const statusText: Record<ProjectStatus, string> = {
  active: 'فعال',
  rest: 'استراحت',
  suspended: 'معلق',
  completed: 'تکمیل‌شده',
}

export const typeText: Record<CardType, string> = {
  task: 'تسک',
  log: 'گزارش پیشرفت',
  note: 'یادداشت',
  checklist: 'چک‌لیست',
  decision: 'تصمیم',
}

export const taskText: Record<TaskStatus, string> = {
  todo: 'انجام‌نشده',
  doing: 'در حال انجام',
  done: 'انجام‌شده',
}

export const timeFmt = (n: number) =>
  new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(n))

export const dateFmt = (d?: string) =>
  d
    ? new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeZone: 'UTC',
      }).format(new Date(`${d.slice(0, 10)}T12:00:00Z`))
    : 'بدون تاریخ'

export const dueFmt = (d?: string) =>
  !d
    ? 'بدون موعد'
    : d.includes('T')
      ? new Intl.DateTimeFormat('fa-IR', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(d))
      : dateFmt(d)

export const textMatches = (text: string, q: string) =>
  text.toLocaleLowerCase('fa').includes(q.trim().toLocaleLowerCase('fa'))

export function sendToApple(
  card: Card,
  project: string,
  target: 'calendar' | 'reminder',
) {
  // Apple provides no documented Calendar/Reminders URL that directly creates a record.
  // Use the official Shortcuts deep link as the bridge, on both macOS and iOS Safari.
  const name = target === 'calendar' ? 'Atlas Calendar' : 'Atlas Reminder'
  const due = card.dueAt || ''
  const payload = JSON.stringify({
    title: card.title,
    project,
    notes: card.markdownBody,
    id: card.id,
    dueAt: due, // local YYYY-MM-DD or YYYY-MM-DDTHH:mm (never reinterpret as UTC)
    hasTime: due.includes('T'),
    durationMinutes: 60,
    source: 'Atlas',
  })
  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(name)}&input=text&text=${encodeURIComponent(payload)}`
  // Must be invoked directly by a user click; Safari may request confirmation.
  window.location.assign(url)
}

export function matchesCardFilter(
  card: Pick<Card, 'type' | 'taskStatus' | 'isMainTask'>,
  filter: string,
) {
  if (filter === 'all') return true
  if (filter === 'main') return card.isMainTask
  if (filter === 'unfinished')
    return card.type === 'task' && card.taskStatus !== 'done'
  return card.type === filter
}
