import {
  CheckCircle2,
  Star,
  CalendarPlus,
  Clock3,
  Archive,
  RotateCcw,
} from 'lucide-react'
import { useState } from 'react'
import { dueFmt, sendToApple } from '../presentation'
import { Empty } from '../ui'
import { type Project, type Card } from '../db'
import { type Page } from '../navigation'

interface PlannerProps {
  cards: Card[]
  updateCard: (c: Card, patch: Partial<Card>, msg: string) => Promise<void>
  go: (p: Page, id?: string, cardId?: string) => void
  projects: Project[]
}

export function Planner({ cards, updateCard, go, projects }: PlannerProps) {
  const [hideCompleted, setHideCompleted] = useState(
    () => localStorage.getItem('atlas-hide-completed-tasks') === 'true',
  )
  const taskCards = cards.filter(
    (c) => c.type === 'task' && (!hideCompleted || c.taskStatus !== 'done'),
  )
  function toggleCompleted() {
    const next = !hideCompleted
    setHideCompleted(next)
    localStorage.setItem('atlas-hide-completed-tasks', String(next))
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR TASKS</span>
          <h1>برنامه و کارها</h1>
          <p>کارها و موعدهای تمام پروژه‌ها، یکجا.</p>
        </div>
        <button
          className="soft-button"
          title="تسک‌ها فقط از این فهرست پنهان می‌شوند و قابل بازگردانی هستند"
          onClick={toggleCompleted}
        >
          {hideCompleted ? <RotateCcw size={16} /> : <Archive size={16} />}
          {hideCompleted
            ? 'نمایش سوابق انجام‌شده'
            : 'پاک کردن سوابق کارهای انجام‌شده'}
        </button>
      </div>
      <div className="panel">
        <div className="section-title">
          <h2>تسک‌های پروژه‌ها</h2>
          <span className="muted">
            {taskCards.length.toLocaleString('fa')} کار
          </span>
        </div>
        {taskCards
          .sort(
            (a, b) =>
              Number(a.taskStatus === 'done') -
                Number(b.taskStatus === 'done') ||
              (a.dueAt || '9999').localeCompare(b.dueAt || '9999'),
          )
          .map((c) => (
            <div className="planner-row" key={c.id}>
              <button
                className="check-task"
                aria-label="تغییر تکمیل"
                onClick={() =>
                  updateCard(
                    c,
                    {
                      taskStatus: c.taskStatus === 'done' ? 'todo' : 'done',
                      completedAt:
                        c.taskStatus === 'done' ? undefined : Date.now(),
                    },
                    `وضعیت «${c.title}» تغییر کرد`,
                  )
                }
              >
                {c.taskStatus === 'done' ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <span className="unchecked" />
                )}
              </button>
              <button
                className="planner-title"
                onClick={() => go('project', c.projectId, c.id)}
              >
                <b className={c.taskStatus === 'done' ? 'finished' : ''}>
                  {c.title}
                </b>
                <small>
                  {projects.find((p) => p.id === c.projectId)?.title ||
                    'پروژه حذف‌شده'}
                </small>
              </button>
              {c.isMainTask && <Star className="accent-icon" size={17} />}
              <span className="due-text">{dueFmt(c.dueAt)}</span>
              {c.dueAt && (
                <>
                  <button
                    className="icon-button"
                    title="ساخت رویداد با Deep Link به Apple Shortcuts"
                    onClick={() =>
                      sendToApple(
                        c,
                        projects.find((p) => p.id === c.projectId)?.title ||
                          'پروژه',
                        'calendar',
                      )
                    }
                  >
                    <CalendarPlus size={17} />
                  </button>
                  <button
                    className="icon-button"
                    title="ساخت یادآور با Deep Link به Apple Shortcuts"
                    onClick={() =>
                      sendToApple(
                        c,
                        projects.find((p) => p.id === c.projectId)?.title ||
                          'پروژه',
                        'reminder',
                      )
                    }
                  >
                    <Clock3 size={17} />
                  </button>
                </>
              )}
            </div>
          ))}
        {!taskCards.length && (
          <Empty
            text={
              hideCompleted
                ? 'تسک انجام‌نشده‌ای برای نمایش وجود ندارد.'
                : 'هنوز تسکی ثبت نشده است.'
            }
          />
        )}
      </div>
    </>
  )
}
