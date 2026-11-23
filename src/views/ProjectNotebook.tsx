import { ArrowLeft, Edit3, Download, Plus, Search } from 'lucide-react'
import { statusText, typeText } from '../presentation'
import { Empty } from '../ui'
import { KnowledgeCard } from './KnowledgeCard'
import { type Project, type Card } from '../db'
import { type Page } from '../navigation'
import { useEffect, type Dispatch, type SetStateAction } from 'react'

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
  focusedCardId: string | null
  clearFocusedCard: () => void
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
  focusedCardId,
  clearFocusedCard,
  updateCard,
  removeCard,
  toggleChecklist,
}: ProjectNotebookProps) {
  const focusedCardVisible = cardList.some((card) => card.id === focusedCardId)
  useEffect(() => {
    if (!focusedCardId || !focusedCardVisible) return
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(`card-${focusedCardId}`)
        ?.scrollIntoView({ block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusedCardId, focusedCardVisible])
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
      {focusedCardId && (
        <button className="soft-button focus-back" onClick={clearFocusedCard}>
          نمایش همه کارت‌های پروژه
        </button>
      )}
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
          <KnowledgeCard
            key={c.id}
            card={c}
            project={project}
            setCardForm={setCardForm}
            updateCard={updateCard}
            removeCard={removeCard}
            toggleChecklist={toggleChecklist}
          />
        ))}
        {!cardList.length && (
          <Empty text="کارتی با این مشخصات پیدا نشد. اولین کارت پروژه را بساز." />
        )}
      </div>
    </>
  )
}
