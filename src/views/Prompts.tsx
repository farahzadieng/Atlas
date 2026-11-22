import {
  Plus,
  Search,
  BookOpen,
  Star,
  Edit3,
  Trash2,
  Clipboard,
} from 'lucide-react'
import { textMatches } from '../presentation'
import { db, type Prompt } from '../db'
import { Empty } from '../ui'
import { type Dispatch, type SetStateAction } from 'react'

interface PromptsProps {
  setPromptForm: Dispatch<SetStateAction<Prompt | null | undefined>>
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  promptTag: string
  setPromptTag: Dispatch<SetStateAction<string>>
  prompts: Prompt[]
  toast: (s: string) => void
}

export function Prompts({
  setPromptForm,
  query,
  setQuery,
  promptTag,
  setPromptTag,
  prompts,
  toast,
}: PromptsProps) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PROMPT LIBRARY</span>
          <h1>کتابخانه پرامپت‌ها</h1>
          <p>پرامپت‌های شخصی‌ات را نگه دار، پیدا کن و سریع کپی کن.</p>
        </div>
        <button className="primary" onClick={() => setPromptForm(null)}>
          <Plus size={18} /> پرامپت جدید
        </button>
      </div>
      <div className="toolbar">
        <div className="searchbox">
          <Search size={18} />
          <input
            placeholder="جست‌وجو در عنوان، توضیح، متن و تگ‌ها..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          value={promptTag}
          onChange={(e) => setPromptTag(e.target.value)}
        >
          <option value="all">همه تگ‌ها</option>
          <option value="fav">علاقه‌مندی‌ها</option>
          {[...new Set(prompts.flatMap((p) => p.tags))].sort().map((t) => (
            <option value={t} key={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="prompt-grid">
        {prompts
          .filter(
            (p) =>
              (promptTag === 'all' ||
                (promptTag === 'fav'
                  ? p.isFavorite
                  : p.tags.includes(promptTag))) &&
              textMatches(
                `${p.title} ${p.description} ${p.body} ${p.tags.join(' ')}`,
                query,
              ),
          )
          .sort(
            (a, b) =>
              Number(b.isFavorite) - Number(a.isFavorite) ||
              b.updatedAt - a.updatedAt,
          )
          .map((p) => (
            <article className="prompt-tile" key={p.id}>
              <div className="prompt-top">
                <span className="prompt-glyph">
                  <BookOpen size={19} />
                </span>
                <div className="card-actions">
                  <button
                    title="علاقه‌مندی"
                    onClick={() =>
                      db.prompts.update(p.id, { isFavorite: !p.isFavorite })
                    }
                  >
                    <Star
                      size={17}
                      fill={p.isFavorite ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button title="ویرایش" onClick={() => setPromptForm(p)}>
                    <Edit3 size={17} />
                  </button>
                  <button
                    title="حذف"
                    onClick={() => {
                      if (window.confirm('پرامپت حذف شود؟'))
                        void db.prompts.delete(p.id)
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <h3>{p.title}</h3>
              <p>{p.description || 'بدون توضیح'}</p>
              <div className="tag-row">
                {p.tags.map((t) => (
                  <button
                    className="tag"
                    key={t}
                    onClick={() => setPromptTag(t)}
                  >
                    #{t}
                  </button>
                ))}
              </div>
              <button
                className="copy-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(p.body)
                    toast('متن پرامپت کپی شد.')
                  } catch {
                    toast('کپی در این مرورگر مجاز نیست.')
                  }
                }}
              >
                <Clipboard size={16} /> کپی متن پرامپت
              </button>
            </article>
          ))}
      </div>
      {!prompts.length && <Empty text="اولین پرامپت خودت را ثبت کن." />}
    </>
  )
}
