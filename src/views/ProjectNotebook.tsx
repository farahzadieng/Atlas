import {
  ArrowLeft,
  Edit3,
  Download,
  Plus,
  Search,
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
import {
  statusText,
  typeText,
  dateFmt,
  taskText,
  sendToApple,
} from '../presentation'
import { Markdown, Empty } from '../ui'
import { type TaskStatus, type Project, type Card } from '../db'
import { type Page } from '../navigation'
import { type Dispatch, type SetStateAction } from 'react'

interface ProjectNotebookProps {
  go: (p: Page, id?: string) => void
  project: Project
  setProjectForm: Dispatch<SetStateAction<Project | null | undefined>>
  exportProject: (p: Project) => void
  cards: Card[]
  selected: string
  setCardForm: Dispatch<SetStateAction<Card | null | undefined>>
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  filter: string
  setFilter: Dispatch<SetStateAction<string>>
  cardList: Card[]
  updateCard: (c: Card, patch: Partial<Card>, msg: string) => Promise<void>
  removeCard: (c: Card) => Promise<void>
  toggleChecklist: (c: Card, index: number) => Promise<void>
}

export function ProjectNotebook({
  go,
  project,
  setProjectForm,
  exportProject,
  cards,
  selected,
  setCardForm,
  query,
  setQuery,
  filter,
  setFilter,
  cardList,
  updateCard,
  removeCard,
  toggleChecklist,
}: ProjectNotebookProps) {
  return (
    <>
      <button className="back-link" onClick={() => go('projects')}>
        <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} /> بازگشت
        به پروژه‌ها
      </button>
      <div className="project-banner">
        <div>
          <span className="eyebrow">PROJECT NOTEBOOK</span>
          <h1>{project.title}</h1>
          <p>
            {project.description || 'برای این پروژه هنوز توضیحی وارد نشده است.'}
          </p>
          <span className={`status-pill ${project.status}`}>
            {statusText[project.status]}
          </span>
        </div>
        <div className="banner-actions">
          <button
            className="soft-button"
            onClick={() => setProjectForm(project)}
          >
            <Edit3 size={16} /> ویرایش پروژه
          </button>
          <button
            className="soft-button"
            onClick={() => exportProject(project)}
          >
            <Download size={16} /> Markdown
          </button>
        </div>
      </div>
      <div className="section-title cards-heading">
        <div>
          <span className="eyebrow">TIMELINE</span>
          <h2>
            کارت‌های پروژه{' '}
            <span className="muted">
              (
              {cards
                .filter((c) => c.projectId === selected)
                .length.toLocaleString('fa')}
              )
            </span>
          </h2>
        </div>
        <button className="primary" onClick={() => setCardForm(null)}>
          <Plus size={17} /> کارت جدید
        </button>
      </div>
      <div className="toolbar">
        <div className="searchbox">
          <Search size={18} />
          <input
            placeholder="جست‌وجو در عنوان و متن کارت‌ها..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="فیلتر کارت‌ها"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">همه کارت‌ها</option>
          <option value="main">تسک‌های اصلی</option>
          <option value="unfinished">تسک‌های انجام‌نشده</option>
          {Object.entries(typeText).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="timeline">
        {cardList.map((c) => (
          <article
            key={c.id}
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
                    c.eventDate ||
                      new Date(c.createdAt).toISOString().slice(0, 10),
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
                  <Star
                    size={15}
                    fill={c.isMainTask ? 'currentColor' : 'none'}
                  />
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
        ))}
        {!cardList.length && (
          <Empty text="کارتی با این مشخصات پیدا نشد. اولین کارت پروژه را بساز." />
        )}
      </div>
    </>
  )
}
