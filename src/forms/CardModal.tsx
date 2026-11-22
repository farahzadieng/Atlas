import {
  type Card,
  type CardType,
  today,
  type TaskStatus,
  type Priority,
  type ChecklistItem,
  uid,
  db,
  logActivity,
} from '../db'
import { useState, type FormEvent } from 'react'
import { Modal, Markdown } from '../ui'
import { typeText, taskText } from '../presentation'
import { Trash2, Plus } from 'lucide-react'

export function CardModal({
  projectId,
  initial,
  onClose,
  onSaved,
}: {
  projectId: string
  initial: Card | null
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(initial?.title || ''),
    [type, setType] = useState<CardType>(initial?.type || 'note'),
    [markdownBody, setBody] = useState(initial?.markdownBody || ''),
    [eventDate, setEventDate] = useState(initial?.eventDate || today()),
    [dueAt, setDueAt] = useState(
      initial?.dueAt
        ? initial.dueAt.includes('T')
          ? initial.dueAt
          : initial.dueAt + 'T09:00'
        : '',
    ),
    [taskStatus, setTaskStatus] = useState<TaskStatus>(
      initial?.taskStatus || 'todo',
    ),
    [priority, setPriority] = useState<Priority>(initial?.priority || 'medium'),
    [isMainTask, setMainTask] = useState(!!initial?.isMainTask),
    [isPinned, setPinned] = useState(!!initial?.isPinned),
    [preview, setPreview] = useState(false),
    [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
      initial?.checklistItems || [],
    ),
    [newCheckItem, setNewCheckItem] = useState(''),
    [progress, setProgress] = useState(initial?.progress ?? 0)
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const now = Date.now()
    const isTask = type === 'task'
    const c: Card = {
      id: initial?.id || uid(),
      projectId,
      type,
      title: title.trim(),
      markdownBody,
      checklistItems:
        type === 'checklist'
          ? [
              ...checklistItems,
              ...(newCheckItem.trim()
                ? [{ id: uid(), text: newCheckItem.trim(), done: false }]
                : []),
            ]
          : undefined,
      progress:
        type === 'log' ? Math.min(100, Math.max(0, progress)) : undefined,
      eventDate: eventDate || undefined,
      dueAt: isTask && dueAt ? dueAt : undefined,
      taskStatus: isTask ? taskStatus : undefined,
      priority: isTask ? priority : undefined,
      isMainTask: isTask && isMainTask,
      isPinned,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
      completedAt:
        isTask && taskStatus === 'done'
          ? initial?.completedAt || now
          : undefined,
    }
    await db.cards.put(c)
    await logActivity(
      projectId,
      initial ? 'update' : 'create',
      `کارت «${c.title}» ${initial ? 'ویرایش' : 'ایجاد'} شد`,
      c.id,
    )
    onSaved()
  }
  return (
    <Modal title={initial ? 'ویرایش کارت' : 'کارت جدید'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <div className="field-pair">
          <label>
            نوع کارت
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CardType)}
            >
              {Object.entries(typeText).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            تاریخ رویداد
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </label>
        </div>
        <label>
          عنوان کارت
          <input
            required
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان کوتاه و مشخص"
          />
        </label>
        <div className="editor-heading">
          <span>متن کارت (Markdown)</span>
          <div className="segmented compact">
            <button
              type="button"
              className={!preview ? 'chosen' : ''}
              onClick={() => setPreview(false)}
            >
              ویرایش
            </button>
            <button
              type="button"
              className={preview ? 'chosen' : ''}
              onClick={() => setPreview(true)}
            >
              پیش‌نمایش
            </button>
          </div>
        </div>
        {preview ? (
          <div className="markdown-preview">
            <Markdown value={markdownBody} />
          </div>
        ) : (
          <textarea
            className="code-editor"
            rows={10}
            dir="auto"
            value={markdownBody}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              '## توضیحات\n- [ ] کار اول\n- [ ] کار دوم\n\n**نکته مهم**'
            }
          />
        )}
        <div className="form-help">
          برای متن توضیحات از Markdown استفاده کن. چک‌لیست‌ها به‌صورت آیتم مستقل
          ساخته می‌شوند.
        </div>
        {type === 'checklist' && (
          <div className="checklist-editor">
            <strong>آیتم‌های چک‌لیست</strong>
            {checklistItems.map((item, index) => (
              <div key={item.id} className="check-edit-row">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(e) =>
                    setChecklistItems((old) =>
                      old.map((x, j) =>
                        j === index ? { ...x, done: e.target.checked } : x,
                      ),
                    )
                  }
                />
                <input
                  aria-label="عنوان آیتم"
                  value={item.text}
                  onChange={(e) =>
                    setChecklistItems((old) =>
                      old.map((x, j) =>
                        j === index ? { ...x, text: e.target.value } : x,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label="حذف آیتم"
                  onClick={() =>
                    setChecklistItems((old) =>
                      old.filter((_, j) => j !== index),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="check-edit-row">
              <input
                placeholder="کار جدید..."
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (newCheckItem.trim()) {
                      setChecklistItems((old) => [
                        ...old,
                        { id: uid(), text: newCheckItem.trim(), done: false },
                      ])
                      setNewCheckItem('')
                    }
                  }
                }}
              />
              <button
                type="button"
                className="soft-button"
                onClick={() => {
                  if (newCheckItem.trim()) {
                    setChecklistItems((old) => [
                      ...old,
                      { id: uid(), text: newCheckItem.trim(), done: false },
                    ])
                    setNewCheckItem('')
                  }
                }}
              >
                <Plus size={16} /> افزودن
              </button>
            </div>
          </div>
        )}
        {type === 'log' && (
          <label>
            درصد پیشرفت گزارش‌شده: {progress}٪
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </label>
        )}
        {type === 'task' && (
          <>
            <div className="field-pair">
              <label>
                وضعیت تسک
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                >
                  {Object.entries(taskText).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                اولویت
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option value="low">کم</option>
                  <option value="medium">متوسط</option>
                  <option value="high">زیاد</option>
                </select>
              </label>
            </div>
            <label>
              موعد انجام
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={isMainTask}
                onChange={(e) => setMainTask(e.target.checked)}
              />{' '}
              تسک اصلی (نمایش در داشبورد؛ چند تسک اصلی در هر پروژه مجاز است)
            </label>
          </>
        )}
        <label className="check-label">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setPinned(e.target.checked)}
          />{' '}
          سنجاق به بالای کارت‌های پروژه
        </label>
        <div className="form-footer">
          <button type="button" className="soft-button" onClick={onClose}>
            انصراف
          </button>
          <button type="submit" className="primary">
            ذخیره کارت
          </button>
        </div>
      </form>
    </Modal>
  )
}
