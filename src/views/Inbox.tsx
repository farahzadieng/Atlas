import { InboxComposer } from '../forms/InboxComposer'
import { timeFmt } from '../presentation'
import {
  db,
  uid,
  today,
  logActivity,
  type Project,
  type InboxItem,
} from '../db'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Empty } from '../ui'

interface InboxProps {
  projects: Project[]
  toast: (s: string) => void
  inbox: InboxItem[]
}

export function Inbox({ projects, toast, inbox }: InboxProps) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">QUICK CAPTURE</span>
          <h1>اینباکس</h1>
          <p>فکرها را سریع ثبت کن و بعداً دسته‌بندی کن.</p>
        </div>
      </div>
      <InboxComposer
        projects={projects}
        onDone={() => toast('در اینباکس ذخیره شد.')}
      />
      <div className="panel inbox-panel">
        <div className="section-title">
          <h2>موارد ثبت‌شده</h2>
          <span className="muted">
            {inbox.length.toLocaleString('fa')} مورد
          </span>
        </div>
        {[...inbox]
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((i) => (
            <div key={i.id} className="inbox-row">
              <div>
                <span className="muted small">
                  {i.kind === 'idea'
                    ? 'ایده'
                    : i.kind === 'task'
                      ? 'کار'
                      : 'یادداشت'}{' '}
                  · {timeFmt(i.createdAt)}
                </span>
                <p>{i.content}</p>
                <small>
                  {projects.find((p) => p.id === i.projectId)?.title ||
                    'بدون پروژه'}
                </small>
              </div>
              <div className="inbox-actions">
                {i.projectId && projects.some((p) => p.id === i.projectId) && (
                  <button
                    className="soft-button"
                    onClick={async () => {
                      const now = Date.now()
                      await db.cards.add({
                        id: uid(),
                        projectId: i.projectId!,
                        type: i.kind === 'task' ? 'task' : 'note',
                        title: i.content.slice(0, 70),
                        markdownBody: i.content,
                        eventDate: today(),
                        taskStatus: i.kind === 'task' ? 'todo' : undefined,
                        isMainTask: false,
                        isPinned: false,
                        createdAt: now,
                        updatedAt: now,
                      })
                      await db.inbox.delete(i.id)
                      await logActivity(
                        i.projectId!,
                        'create',
                        'مورد اینباکس به کارت تبدیل شد',
                      )
                      toast('به کارت پروژه تبدیل شد.')
                    }}
                  >
                    <ArrowLeft size={15} /> تبدیل به کارت
                  </button>
                )}
                <button
                  className="icon-button"
                  aria-label="حذف"
                  onClick={() => {
                    if (window.confirm('این مورد حذف شود؟'))
                      void db.inbox.delete(i.id)
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        {!inbox.length && <Empty text="صندوق ورودی خالی است." />}
      </div>
    </>
  )
}
