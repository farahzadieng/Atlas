import { type Project, type InboxKind, db, uid } from '../db'
import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'

export function InboxComposer({
  projects,
  onDone,
}: {
  projects: Project[]
  onDone: () => void
}) {
  const [text, setText] = useState(''),
    [kind, setKind] = useState<InboxKind>('idea'),
    [projectId, setProjectId] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    const now = Date.now()
    await db.inbox.add({
      id: uid(),
      content: text.trim(),
      kind,
      projectId: projectId || undefined,
      createdAt: now,
      updatedAt: now,
    })
    setText('')
    onDone()
  }
  return (
    <form className="panel capture" onSubmit={submit}>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="چه چیزی در ذهنت هست؟ همین‌جا ثبتش کن..."
        required
      />
      <div className="capture-footer">
        <div>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as InboxKind)}
          >
            <option value="idea">ایده</option>
            <option value="task">تسک</option>
            <option value="note">یادداشت</option>
          </select>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">بدون پروژه</option>
            {projects.map((p) => (
              <option value={p.id} key={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <button className="primary" type="submit">
          <Plus size={17} /> ثبت سریع
        </button>
      </div>
    </form>
  )
}
