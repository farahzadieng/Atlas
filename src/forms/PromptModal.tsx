import { type Prompt, type Project, uid, db } from '../db'
import { useState, type FormEvent } from 'react'
import {
  getPromptTagSuggestions,
  parsePromptTags,
  selectPromptTag,
} from '../promptTags'
import { Modal } from '../ui'

export function PromptModal({
  initial,
  projects,
  prompts,
  onClose,
  onSaved,
}: {
  initial: Prompt | null
  projects: Project[]
  prompts: Prompt[]
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(initial?.title || ''),
    [description, setDescription] = useState(initial?.description || ''),
    [body, setBody] = useState(initial?.body || ''),
    [tags, setTags] = useState(initial?.tags.join(', ') || ''),
    [projectId, setProjectId] = useState(initial?.projectId || ''),
    [favorite, setFavorite] = useState(!!initial?.isFavorite)
  const tagSuggestions = getPromptTagSuggestions(prompts, tags)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    const now = Date.now()
    const p: Prompt = {
      id: initial?.id || uid(),
      title: title.trim(),
      description: description.trim(),
      body: body.trim(),
      tags: parsePromptTags(tags),
      isFavorite: favorite,
      projectId: projectId || undefined,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
    }
    await db.prompts.put(p)
    onSaved()
  }
  return (
    <Modal title={initial ? 'ویرایش پرامپت' : 'پرامپت جدید'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label>
          عنوان پرامپت
          <input
            required
            maxLength={130}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          توضیح مختصر
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          بدنه پرامپت
          <textarea
            className="code-editor"
            dir="auto"
            rows={10}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="متن کامل پرامپت را اینجا بنویس..."
          />
        </label>
        <div className="prompt-tag-picker">
          <label>
            تگ‌ها (جداشده با کاما)
            <input
              dir="auto"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="تگ تازه بنویس یا تگ‌های قبلی را جست‌وجو کن..."
            />
          </label>
          {tagSuggestions.length > 0 && (
            <ul className="prompt-tag-suggestions" aria-label="تگ‌های پیشنهادی">
              {tagSuggestions.map((tag) => (
                <li key={tag}>
                  <button
                    type="button"
                    className="soft-button"
                    onClick={() => setTags(selectPromptTag(tags, tag))}
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label>
          پروژه مرتبط (اختیاری)
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">بدون پروژه</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
          />{' '}
          افزودن به علاقه‌مندی‌ها
        </label>
        <div className="form-footer">
          <button type="button" className="soft-button" onClick={onClose}>
            انصراف
          </button>
          <button className="primary" type="submit">
            ذخیره پرامپت
          </button>
        </div>
      </form>
    </Modal>
  )
}
