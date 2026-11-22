import { type ReactNode } from 'react'
import { X, FileText, FolderKanban, Edit3 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type Project } from './db'
import { statusText, timeFmt } from './presentation'

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="بستن">
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export function Markdown({
  value,
  onToggle,
}: {
  value: string
  onToggle?: (index: number) => void
}) {
  let checkIndex = 0
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          input: ({ type, checked }) => {
            if (type === 'checkbox') {
              const at = checkIndex++
              return (
                <input
                  type="checkbox"
                  checked={!!checked}
                  disabled={!onToggle}
                  onChange={() => onToggle?.(at)}
                  aria-label="تغییر وضعیت چک‌لیست"
                />
              )
            }
            return null
          },
        }}
      >
        {value || '_'}
      </ReactMarkdown>
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <FileText size={25} />
      <p>{text}</p>
    </div>
  )
}

export function ProjectTile({
  p,
  count,
  onOpen,
  onEdit,
}: {
  p: Project
  count: number
  onOpen: () => void
  onEdit: () => void
}) {
  return (
    <article className="project-tile">
      <button className="tile-main" onClick={onOpen}>
        <div className="tile-head">
          <span className="tile-icon">
            <FolderKanban size={21} />
          </span>
          <span className={`status-pill ${p.status}`}>
            {statusText[p.status]}
            {p.archivedAt ? ' · بایگانی' : ''}
          </span>
        </div>
        <h3>{p.title}</h3>
        <p>{p.description || 'هنوز توضیحی ثبت نشده است.'}</p>
        <div className="tile-footer">
          <span>{count.toLocaleString('fa')} کارت</span>
          <span>{timeFmt(p.updatedAt)}</span>
        </div>
      </button>
      <button className="tile-edit" title="ویرایش پروژه" onClick={onEdit}>
        <Edit3 size={16} />
      </button>
    </article>
  )
}
