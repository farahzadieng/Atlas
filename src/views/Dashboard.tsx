import { Search, FolderKanban, ArrowLeft, History } from 'lucide-react'
import { textMatches, statusText, timeFmt } from '../presentation'
import {
  type ProjectStatus,
  type Project,
  type Card,
  type Activity,
} from '../db'
import { Empty, ProjectTile } from '../ui'
import { type Page } from '../navigation'
import { type Dispatch, type SetStateAction } from 'react'

interface DashboardProps {
  dashQuery: string
  setDashQuery: Dispatch<SetStateAction<string>>
  activeProjects: Project[]
  go: (p: Page, id?: string) => void
  setFilter: Dispatch<SetStateAction<string>>
  mainTasks: Card[]
  projects: Project[]
  activities: Activity[]
  cards: Card[]
  setProjectForm: Dispatch<SetStateAction<Project | null | undefined>>
}

export function Dashboard({
  dashQuery,
  setDashQuery,
  activeProjects,
  go,
  setFilter,
  mainTasks,
  projects,
  activities,
  cards,
  setProjectForm,
}: DashboardProps) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PERSONAL WORKSPACE</span>
          <h1>
            خوش آمدی به اطلس <span className="wave">✦</span>
          </h1>
          <p>همه چیزهایی که باید به خاطر بسپاری، در یک فضای آرام و منظم.</p>
        </div>
        <div className="dash-search">
          <div className="searchbox">
            <Search size={18} />
            <input
              aria-label="جست‌وجوی زنده پروژه‌ها"
              placeholder="جست‌وجوی پروژه‌ها..."
              value={dashQuery}
              onChange={(e) => setDashQuery(e.target.value)}
            />
          </div>
          {dashQuery.trim() && (
            <div className="dash-suggestions">
              {activeProjects
                .filter((p) => textMatches(p.title, dashQuery))
                .slice(0, 8)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setDashQuery('')
                      go('project', p.id)
                    }}
                  >
                    <FolderKanban size={16} />
                    {p.title}
                    <ArrowLeft size={15} />
                  </button>
                ))}
              {!activeProjects.some((p) => textMatches(p.title, dashQuery)) && (
                <span>پروژه‌ای پیدا نشد.</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="stats-grid">
        {(['active', 'rest', 'suspended', 'completed'] as ProjectStatus[]).map(
          (s) => (
            <button
              className="stat-card"
              key={s}
              onClick={() => {
                go('projects')
                setFilter(s)
              }}
            >
              <small>{statusText[s]}</small>
              <strong>
                {activeProjects
                  .filter((p) => p.status === s)
                  .length.toLocaleString('fa')}
              </strong>
              <span className={`status-dot ${s}`} />
            </button>
          ),
        )}
      </div>
      <div className="dash-grid">
        <section className="panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">FOCUS</span>
              <h2>تسک‌های اصلی</h2>
            </div>
            <span className="muted">
              {mainTasks.length.toLocaleString('fa')} مورد
            </span>
          </div>
          {mainTasks.length ? (
            mainTasks.slice(0, 12).map((c) => (
              <button
                key={c.id}
                className="task-row"
                onClick={() => go('project', c.projectId)}
              >
                <span className="task-indicator" />
                <span>
                  <b>{c.title}</b>
                  <small>
                    {projects.find((p) => p.id === c.projectId)?.title ||
                      'پروژه'}
                  </small>
                </span>
                <ArrowLeft size={16} />
              </button>
            ))
          ) : (
            <Empty text="هنوز تسک اصلی تعریف نشده است." />
          )}
        </section>
        <section className="panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">RECENT</span>
              <h2>آخرین فعالیت‌ها</h2>
            </div>
          </div>
          {activities.length ? (
            activities.slice(0, 8).map((a) => (
              <button
                key={a.id}
                className="activity-row"
                onClick={() => go('project', a.projectId)}
              >
                <History size={16} />
                <span>
                  {a.message}
                  <small>{timeFmt(a.createdAt)}</small>
                </span>
              </button>
            ))
          ) : (
            <Empty text="فعالیت‌های پروژه اینجا دیده خواهند شد." />
          )}
        </section>
      </div>
      <section className="panel">
        <div className="section-title">
          <h2>پروژه‌های فعال</h2>
          <button className="text-button" onClick={() => go('projects')}>
            مشاهده همه <ArrowLeft size={15} />
          </button>
        </div>
        <div className="project-grid">
          {activeProjects
            .filter((p) => p.status === 'active')
            .slice(0, 6)
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
        {!activeProjects.some((p) => p.status === 'active') && (
          <Empty text="اولین پروژه‌ات را بساز." />
        )}
      </section>
    </>
  )
}
