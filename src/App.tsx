import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  BookOpen,
  Inbox as InboxIcon,
  Settings2,
  X,
  Menu,
  Moon,
  Sun,
  Check,
} from 'lucide-react'
import {
  db,
  logActivity,
  importBackup,
  saveDownload,
  type Project,
  type Card,
  type Prompt,
} from './db'
import { matchesCardFilter, textMatches, typeText } from './presentation'
import { Inbox } from './views/Inbox'
import { ProjectModal } from './forms/ProjectModal'
import { CardModal } from './forms/CardModal'
import { PromptModal } from './forms/PromptModal'
import { Dashboard } from './views/Dashboard'
import { Projects } from './views/Projects'
import { ProjectNotebook } from './views/ProjectNotebook'
import { Planner } from './views/Planner'
import { Prompts } from './views/Prompts'
import { Settings } from './views/Settings'

import type { Page } from './navigation'

function App() {
  const [page, setPage] = useState<Page>('dashboard'),
    [selected, setSelected] = useState<string>(''),
    [drawer, setDrawer] = useState(false),
    [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
      const saved = localStorage.getItem('atlas-theme-mode')
      return saved === 'light' || saved === 'dark' ? saved : 'system'
    }),
    [systemDark, setSystemDark] = useState(
      () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    ),
    [notice, setNotice] = useState('')
  const [projectForm, setProjectForm] = useState<Project | null | undefined>(
      undefined,
    ),
    [cardForm, setCardForm] = useState<Card | null | undefined>(undefined),
    [promptForm, setPromptForm] = useState<Prompt | null | undefined>(undefined)
  const [dashQuery, setDashQuery] = useState(''),
    [newCategory, setNewCategory] = useState(''),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('all'),
    [promptTag, setPromptTag] = useState('all')
  const fileRef = useRef<HTMLInputElement>(null)
  const projects = useLiveQuery(() => db.projects.toArray(), []) ?? []
  const projectTypes = useLiveQuery(() => db.projectTypes.toArray(), []) ?? []
  const cards = useLiveQuery(() => db.cards.toArray(), []) ?? []
  const prompts = useLiveQuery(() => db.prompts.toArray(), []) ?? []
  const inbox = useLiveQuery(() => db.inbox.toArray(), []) ?? []
  const activities =
    useLiveQuery(
      () => db.activity.orderBy('createdAt').reverse().limit(60).toArray(),
      [],
    ) ?? []
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches)
    setSystemDark(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  const resolvedTheme =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    localStorage.setItem('atlas-theme-mode', theme)
  }, [theme, resolvedTheme])
  const toast = (s: string) => {
    setNotice(s)
    window.setTimeout(() => setNotice(''), 3500)
  }
  const go = (p: Page, id = '') => {
    setPage(p)
    setSelected(id)
    setDrawer(false)
    setQuery('')
    setFilter('all')
  }
  const activeProjects = projects.filter((p) => !p.archivedAt)
  const project = projects.find((p) => p.id === selected)
  const cardList = cards
    .filter((c) => c.projectId === selected)
    .filter((c) => matchesCardFilter(c, filter))
    .filter((c) =>
      textMatches(
        `${c.title} ${c.markdownBody} ${(c.checklistItems || []).map((i) => i.text).join(' ')}`,
        query,
      ),
    )
    .sort(
      (a, b) =>
        Number(b.isPinned) - Number(a.isPinned) ||
        (
          b.eventDate ?? new Date(b.createdAt).toISOString().slice(0, 10)
        ).localeCompare(
          a.eventDate ?? new Date(a.createdAt).toISOString().slice(0, 10),
        ) ||
        b.createdAt - a.createdAt,
    )
  const mainTasks = cards
    .filter(
      (c) =>
        c.type === 'task' &&
        c.isMainTask &&
        c.taskStatus !== 'done' &&
        !projects.find((p) => p.id === c.projectId)?.archivedAt,
    )
    .sort((a, b) => b.updatedAt - a.updatedAt)
  const navigation: [Page, string, typeof LayoutDashboard][] = [
    ['dashboard', 'داشبورد', LayoutDashboard],
    ['projects', 'پروژه‌ها', FolderKanban],
    ['planner', 'برنامه و کارها', CalendarDays],
    ['prompts', 'مدیریت پرامپت', BookOpen],
    ['inbox', 'اینباکس', InboxIcon],
    ['settings', 'تنظیمات', Settings2],
  ]
  async function removeProject(p: Project) {
    if (
      !window.confirm(
        `پروژه «${p.title}» همراه با تمام کارت‌ها و سوابقش حذف شود؟`,
      )
    )
      return
    await db.transaction('rw', db.projects, db.cards, db.activity, async () => {
      await db.cards.where('projectId').equals(p.id).delete()
      await db.activity.where('projectId').equals(p.id).delete()
      await db.projects.delete(p.id)
    })
    toast('پروژه حذف شد.')
    go('projects')
  }
  async function removeCard(c: Card) {
    if (!window.confirm('این کارت حذف شود؟')) return
    await db.cards.delete(c.id)
    await logActivity(c.projectId, 'delete', `کارت «${c.title}» حذف شد`)
    toast('کارت حذف شد.')
  }
  async function updateCard(c: Card, patch: Partial<Card>, msg: string) {
    await db.cards.update(c.id, { ...patch, updatedAt: Date.now() })
    await logActivity(c.projectId, 'update', msg, c.id)
  }
  async function toggleChecklist(c: Card, index: number) {
    const items = [...(c.checklistItems || [])]
    if (!items[index]) return
    items[index] = { ...items[index], done: !items[index].done }
    await updateCard(
      c,
      { checklistItems: items },
      `آیتم چک‌لیست «${c.title}» به‌روزرسانی شد`,
    )
  }
  async function importFile(file?: File) {
    if (!file) return
    if (
      !window.confirm(
        'اطلاعات بکاپ با اطلاعات فعلی ادغام شود؟ شناسه‌های مشترک جایگزین خواهند شد.',
      )
    )
      return
    try {
      const n = await importBackup(file)
      toast(
        `${n.projects} پروژه، ${n.cards} کارت و ${n.prompts} پرامپت بازیابی شد.`,
      )
    } catch (e) {
      toast(e instanceof Error ? e.message : 'خطای بازیابی')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }
  function exportProject(p: Project) {
    const c = cards
      .filter((x) => x.projectId === p.id)
      .sort((a, b) => a.createdAt - b.createdAt)
    const md =
      `# ${p.title}\n\n${p.description}\n\n` +
      c
        .map(
          (x) =>
            `## ${x.title}\n\nنوع: ${typeText[x.type]} | تاریخ: ${x.eventDate || new Date(x.createdAt).toISOString().slice(0, 10)}\n\n${x.markdownBody}\n\n${(x.checklistItems || []).map((i) => `- [${i.done ? 'x' : ' '}] ${i.text}`).join('\n')}`,
        )
        .join('\n\n---\n\n')
    saveDownload(
      new Blob([md], { type: 'text/markdown;charset=utf-8' }),
      `atlas-${p.id}.md`,
    )
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${drawer ? 'open' : ''}`}>
        <div className="brand">
          <img
            className="brand-icon"
            src="/icon-192.png"
            alt="آیکون Atlas"
            width={42}
            height={42}
          />
          <div>
            <strong>
              اطلس<span className="brand-dot">.</span>
            </strong>
            <small>دفتر پروژه‌های شخصی</small>
          </div>
          <button
            className="icon-button close-nav"
            onClick={() => setDrawer(false)}
          >
            <X size={19} />
          </button>
        </div>
        <p className="side-label">فضای کار</p>
        <nav>
          {navigation.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`nav-entry ${page === id || (page === 'project' && id === 'projects') ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === 'inbox' && inbox.length > 0 && (
                <span className="mini-count">{inbox.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="offline-label">
            <span className="online-dot" /> فقط ذخیره محلی{' '}
            <small>Cloud Sync هنوز فعال نشده</small>
          </div>
          <small dir="ltr" className="atlas-release-label">
            Atlas v{__ATLAS_VERSION__} · tetha
          </small>
        </div>
      </aside>
      {drawer && (
        <button
          className="nav-shade"
          onClick={() => setDrawer(false)}
          aria-label="بستن منو"
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <div className="head-crumb">
            <button
              className="icon-button menu"
              onClick={() => setDrawer(true)}
            >
              <Menu size={22} />
            </button>
            <span>Atlas</span>
            <span className="divider-slash">/</span>
            <b>
              {page === 'project'
                ? project?.title || 'پروژه'
                : navigation.find((n) => n[0] === page)?.[1]}
            </b>
          </div>
          <div className="head-actions">
            <span className="local-status">
              <span className="online-dot" /> محلی
            </span>
            <button
              className="icon-button"
              aria-label="تغییر تم"
              onClick={() =>
                setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
              }
            >
              {resolvedTheme === 'light' ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </button>
          </div>
        </header>
        <div className="content">
          {page === 'dashboard' && (
            <Dashboard
              dashQuery={dashQuery}
              setDashQuery={setDashQuery}
              activeProjects={activeProjects}
              go={go}
              setFilter={setFilter}
              mainTasks={mainTasks}
              projects={projects}
              activities={activities}
              cards={cards}
              setProjectForm={setProjectForm}
            />
          )}
          {page === 'projects' && (
            <Projects
              setProjectForm={setProjectForm}
              query={query}
              setQuery={setQuery}
              filter={filter}
              setFilter={setFilter}
              projects={projects}
              cards={cards}
              go={go}
            />
          )}
          {page === 'project' && project && (
            <ProjectNotebook
              go={go}
              project={project}
              setProjectForm={setProjectForm}
              exportProject={exportProject}
              cards={cards}
              selected={selected}
              setCardForm={setCardForm}
              query={query}
              setQuery={setQuery}
              filter={filter}
              setFilter={setFilter}
              cardList={cardList}
              updateCard={updateCard}
              removeCard={removeCard}
              toggleChecklist={toggleChecklist}
            />
          )}
          {page === 'planner' && (
            <Planner
              cards={cards}
              updateCard={updateCard}
              go={go}
              projects={projects}
            />
          )}
          {page === 'prompts' && (
            <Prompts
              setPromptForm={setPromptForm}
              query={query}
              setQuery={setQuery}
              promptTag={promptTag}
              setPromptTag={setPromptTag}
              prompts={prompts}
              toast={toast}
            />
          )}
          {page === 'inbox' && (
            <Inbox projects={projects} toast={toast} inbox={inbox} />
          )}
          {page === 'settings' && (
            <Settings
              newCategory={newCategory}
              projectTypes={projectTypes}
              toast={toast}
              setNewCategory={setNewCategory}
              projects={projects}
              theme={theme}
              setTheme={setTheme}
              fileRef={fileRef}
              importFile={importFile}
            />
          )}
        </div>
      </main>
      {projectForm !== undefined && (
        <ProjectModal
          projectTypes={projectTypes}
          initial={projectForm}
          onClose={() => setProjectForm(undefined)}
          onSaved={(p) => {
            setProjectForm(undefined)
            toast('پروژه ذخیره شد.')
            go('project', p.id)
          }}
          onDelete={removeProject}
        />
      )}
      {cardForm !== undefined && selected && (
        <CardModal
          projectId={selected}
          initial={cardForm}
          onClose={() => setCardForm(undefined)}
          onSaved={() => {
            setCardForm(undefined)
            toast('کارت ذخیره شد.')
          }}
        />
      )}
      {promptForm !== undefined && (
        <PromptModal
          initial={promptForm}
          projects={projects}
          prompts={prompts}
          onClose={() => setPromptForm(undefined)}
          onSaved={() => {
            setPromptForm(undefined)
            toast('پرامپت ذخیره شد.')
          }}
        />
      )}
      {notice && (
        <div className="toast">
          <Check size={17} />
          {notice}
        </div>
      )}
      <nav className="mobile-tabs">
        {navigation.slice(0, 5).map(([id, label, Icon]) => (
          <button
            key={id}
            className={
              page === id || (page === 'project' && id === 'projects')
                ? 'active'
                : ''
            }
            onClick={() => go(id)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
