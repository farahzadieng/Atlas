import {
  Edit3,
  BarChart3,
  Scale,
  CheckSquare,
  StickyNote,
  CheckCircle2,
  Clock3,
  Star,
  Pin,
  Trash2,
  CalendarPlus,
} from 'lucide-react'
import { type Card, type Project, type TaskStatus } from '../db'
import { typeText, dateFmt, taskText, sendToApple } from '../presentation'
import { Markdown } from '../ui'

interface KnowledgeCardProps {
  card: Card
  project: Project
  setCardForm: (card: Card) => void
  updateCard: (
    card: Card,
    patch: Partial<Card>,
    message: string,
  ) => Promise<void>
  removeCard: (card: Card) => Promise<void>
  toggleChecklist: (card: Card, index: number) => Promise<void>
}

export function KnowledgeCard({
  card: c,
  project,
  setCardForm,
  updateCard,
  removeCard,
  toggleChecklist,
}: KnowledgeCardProps) {
  return (
    <article
      id={`card-${c.id}`}
      data-completed={
        c.type === 'task' && c.taskStatus === 'done' ? 'true' : undefined
      }
      className={`knowledge-card card-kind-${c.type} ${c.isPinned ? 'pinned' : ''}`}
    >
      <div className="card-top">
        <div className="meta-row">
          <span className="type-label">
            {c.type === 'log' ? (
              <BarChart3 size={15} />
            ) : c.type === 'decision' ? (
              <Scale size={15} />
            ) : c.type === 'checklist' ? (
              <CheckSquare size={15} />
            ) : c.type === 'note' ? (
              <StickyNote size={15} />
            ) : (
              <CheckCircle2 size={15} />
            )}{' '}
            {typeText[c.type]}
          </span>
          <span>
            <Clock3 size={14} />
            {dateFmt(
              c.eventDate || new Date(c.createdAt).toISOString().slice(0, 10),
            )}
          </span>
          {c.isMainTask && (
            <span className="main-tag">
              <Star size={13} fill="currentColor" /> تسک اصلی
            </span>
          )}
          {c.isPinned && (
            <span>
              <Pin size={13} /> سنجاق‌شده
            </span>
          )}
        </div>
        <div className="card-actions">
          <button
            title="سنجاق کارت"
            onClick={() =>
              updateCard(
                c,
                { isPinned: !c.isPinned },
                `سنجاق کارت «${c.title}» تغییر کرد`,
              )
            }
          >
            <Pin size={16} />
          </button>
          <button title="ویرایش" onClick={() => setCardForm(c)}>
            <Edit3 size={16} />
          </button>
          <button title="حذف" onClick={() => removeCard(c)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <h3>{c.title}</h3>
      {c.type === 'task' && c.taskStatus === 'done' && (
        <span className="completed-task-label">انجام‌شده</span>
      )}
      <Markdown value={c.markdownBody} />
      {c.type === 'log' && typeof c.progress === 'number' && (
        <div className="log-progress">
          <div>
            <span>پیشرفت ثبت‌شده</span>
            <b>{c.progress.toLocaleString('fa')}٪</b>
          </div>
          <div className="progress-track">
            <span style={{ width: `${c.progress}%` }} />
          </div>
        </div>
      )}
      {c.type === 'decision' && (
        <div className="decision-mark">
          <Scale size={16} /> تصمیم ثبت‌شده در دفتر پروژه
        </div>
      )}
      {c.type === 'checklist' && (
        <div className="checklist-view">
          {(c.checklistItems || []).map((item, index) => (
            <label key={item.id} className={item.done ? 'completed' : ''}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => void toggleChecklist(c, index)}
              />
              <span>{item.text}</span>
            </label>
          ))}
          {!(c.checklistItems || []).length && (
            <span className="muted">
              برای افزودن آیتم‌ها، کارت را ویرایش کن.
            </span>
          )}
        </div>
      )}
      {c.type === 'task' && (
        <div className="card-footer">
          <select
            value={c.taskStatus || 'todo'}
            onChange={(e) => {
              const next = e.target.value as TaskStatus
              void updateCard(
                c,
                {
                  taskStatus: next,
                  completedAt: next === 'done' ? Date.now() : undefined,
                },
                `وضعیت «${c.title}» به ${taskText[next]} تغییر کرد`,
              )
            }}
          >
            {Object.entries(taskText).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button
            className={`small-toggle ${c.isMainTask ? 'marked' : ''}`}
            onClick={() =>
              updateCard(
                c,
                { isMainTask: !c.isMainTask },
                `تسک «${c.title}» ${c.isMainTask ? 'از داشبورد حذف' : 'به داشبورد اضافه'} شد`,
              )
            }
          >
            <Star size={15} fill={c.isMainTask ? 'currentColor' : 'none'} />
            {c.isMainTask ? 'تسک اصلی' : 'انتخاب به‌عنوان تسک اصلی'}
          </button>
          {c.dueAt && (
            <>
              <button
                className="small-toggle"
                onClick={() => sendToApple(c, project.title, 'calendar')}
              >
                <CalendarPlus size={15} /> تقویم اپل
              </button>
              <button
                className="small-toggle"
                onClick={() => sendToApple(c, project.title, 'reminder')}
              >
                <Clock3 size={15} /> یادآور اپل
              </button>
            </>
          )}
        </div>
      )}
    </article>
  )
}
