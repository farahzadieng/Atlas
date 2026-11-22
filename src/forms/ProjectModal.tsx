import {
  type Project,
  type ProjectCategory,
  type ProjectStatus,
  type ProjectType,
  uid,
  db,
  logActivity,
} from '../db'
import { useState, type FormEvent } from 'react'
import { Modal } from '../ui'
import { statusText } from '../presentation'
import { Trash2 } from 'lucide-react'

export function ProjectModal({
  initial,
  projectTypes,
  onClose,
  onSaved,
  onDelete,
}: {
  initial: Project | null
  projectTypes: ProjectCategory[]
  onClose: () => void
  onSaved: (p: Project) => void
  onDelete: (p: Project) => void
}) {
  const [title, setTitle] = useState(initial?.title || ''),
    [description, setDescription] = useState(initial?.description || ''),
    [status, setStatus] = useState<ProjectStatus>(initial?.status || 'active'),
    [type, setType] = useState<ProjectType>(
      initial?.type || projectTypes[0]?.id || 'other',
    ),
    [archive, setArchive] = useState(!!initial?.archivedAt)
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !type) return
    const now = Date.now()
    const p: Project = {
      id: initial?.id || uid(),
      title: title.trim(),
      description: description.trim(),
      status,
      type,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
      ...(archive ? { archivedAt: initial?.archivedAt || now } : {}),
    }
    await db.projects.put(p)
    await logActivity(
      p.id,
      initial ? 'update' : 'create',
      initial ? `پروژه «${p.title}» ویرایش شد` : `پروژه «${p.title}» ایجاد شد`,
    )
    onSaved(p)
  }
  return (
    <Modal title={initial ? 'ویرایش پروژه' : 'پروژه جدید'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label>
          عنوان پروژه
          <input
            value={title}
            required
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً طراحی سایت شخصی"
          />
        </label>
        <label>
          توضیحات
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="هدف و توضیحات کلی پروژه..."
          />
        </label>
        <div className="field-pair">
          <label>
            نوع پروژه
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProjectType)}
            >
              {projectTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
              {initial && !projectTypes.some((t) => t.id === initial.type) && (
                <option value={initial.type}>{initial.type} (حذف‌شده)</option>
              )}
            </select>
          </label>
          <label>
            وضعیت
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              {Object.entries(statusText).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={archive}
            onChange={(e) => setArchive(e.target.checked)}
          />{' '}
          بایگانی پروژه (مخفی‌کردن از لیست روزمره)
        </label>
        <div className="form-footer">
          {initial && (
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                onClose()
                onDelete(initial)
              }}
            >
              <Trash2 size={16} /> حذف پروژه
            </button>
          )}
          <button type="button" className="soft-button" onClick={onClose}>
            انصراف
          </button>
          <button type="submit" className="primary">
            ذخیره پروژه
          </button>
        </div>
      </form>
    </Modal>
  )
}
