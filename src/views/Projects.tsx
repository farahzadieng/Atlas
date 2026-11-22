import { Plus, Search } from 'lucide-react'
import { statusText, textMatches } from '../presentation'
import { ProjectTile } from '../ui'
import { type Project, type Card } from '../db'
import { type Page } from '../navigation'
import { type Dispatch, type SetStateAction } from 'react'

interface ProjectsProps {
  setProjectForm: Dispatch<SetStateAction<Project | null | undefined>>
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  filter: string
  setFilter: Dispatch<SetStateAction<string>>
  projects: Project[]
  cards: Card[]
  go: (p: Page, id?: string) => void
}

export function Projects({
  setProjectForm,
  query,
  setQuery,
  filter,
  setFilter,
  projects,
  cards,
  go,
}: ProjectsProps) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR NOTEBOOKS</span>
          <h1>پروژه‌های من</h1>
          <p>هر پروژه یک دفتر، هر کارت یک قدم رو به جلو.</p>
        </div>
        <button className="primary" onClick={() => setProjectForm(null)}>
          <Plus size={18} /> پروژه جدید
        </button>
      </div>
      <div className="toolbar">
        <div className="searchbox">
          <Search size={18} />
          <input
            placeholder="جست‌وجوی پروژه‌ها..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">همه وضعیت‌ها</option>
          {Object.entries(statusText).map(([id, t]) => (
            <option key={id} value={id}>
              {t}
            </option>
          ))}
          <option value="archived">بایگانی‌شده</option>
        </select>
      </div>
      <div className="project-grid">
        {projects
          .filter((p) =>
            filter === 'archived'
              ? !!p.archivedAt
              : !p.archivedAt && (filter === 'all' || p.status === filter),
          )
          .filter((p) => textMatches(p.title + ' ' + p.description, query))
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((p) => (
            <ProjectTile
              key={p.id}
              p={p}
              count={cards.filter((c) => c.projectId === p.id).length}
              onOpen={() => go('project', p.id)}
              onEdit={() => setProjectForm(p)}
            />
          ))}
      </div>
    </>
  )
}
