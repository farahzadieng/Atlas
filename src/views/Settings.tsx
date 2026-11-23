import {
  db,
  uid,
  exportBackup,
  type Project,
  type ProjectCategory,
} from '../db'
import {
  Plus,
  Trash2,
  Sun,
  Moon,
  Settings2,
  Download,
  Upload,
  Archive,
  Edit3,
  Check,
  X,
} from 'lucide-react'
import { allowedEmail, cloudUrl } from '../atlasConfig'
import { saveSettings } from '../deviceSettings'
import {
  useState,
  type Dispatch,
  type SetStateAction,
  type RefObject,
} from 'react'

interface SettingsProps {
  newCategory: string
  projectTypes: ProjectCategory[]
  toast: (s: string) => void
  setNewCategory: Dispatch<SetStateAction<string>>
  projects: Project[]
  theme: 'light' | 'dark' | 'system'
  setTheme: Dispatch<SetStateAction<'light' | 'dark' | 'system'>>
  fileRef: RefObject<HTMLInputElement | null>
  importFile: (file?: File | undefined) => Promise<void>
}

export function Settings({
  newCategory,
  projectTypes,
  toast,
  setNewCategory,
  projects,
  theme,
  setTheme,
  fileRef,
  importFile,
}: SettingsProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  async function saveCategory(id: string) {
    const title = editedTitle.trim()
    if (!title) return
    if (
      projectTypes.some(
        (type) =>
          type.id !== id &&
          type.title.toLocaleLowerCase('fa') === title.toLocaleLowerCase('fa'),
      )
    ) {
      toast('این نوع قبلاً وجود دارد.')
      return
    }
    await db.projectTypes.update(id, { title })
    setEditingCategory(null)
    toast('نوع پروژه ویرایش شد.')
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PREFERENCES</span>
          <h1>تنظیمات</h1>
          <p>ظاهر برنامه و حفاظت از اطلاعات شخصی.</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <div className="section-title">
            <h2>نوع پروژه‌های دلخواه</h2>
          </div>
          <p className="muted">
            برای هر موضوعی مثل نوشتن رمان، عنوان جدید بساز. دسته‌ای که پروژه
            دارد قابل حذف نیست.
          </p>
          <form
            className="category-add"
            onSubmit={async (e) => {
              e.preventDefault()
              const name = newCategory.trim()
              if (!name) return
              if (
                projectTypes.some(
                  (t) =>
                    t.title.toLocaleLowerCase('fa') ===
                    name.toLocaleLowerCase('fa'),
                )
              ) {
                toast('این نوع قبلاً وجود دارد.')
                return
              }
              await db.projectTypes.add({
                id: uid(),
                title: name,
                createdAt: Date.now(),
              })
              setNewCategory('')
              toast('نوع پروژه اضافه شد.')
            }}
          >
            <input
              placeholder="مثلاً نوشتن رمان"
              value={newCategory}
              maxLength={60}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button className="primary" type="submit">
              <Plus size={16} /> افزودن
            </button>
          </form>
          <div className="category-list">
            {projectTypes.map((t) => (
              <div className="category-item" key={t.id}>
                {editingCategory === t.id ? (
                  <form
                    className="category-edit"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void saveCategory(t.id)
                    }}
                  >
                    <input
                      aria-label="نام نوع پروژه"
                      value={editedTitle}
                      maxLength={60}
                      autoFocus
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />
                    <button
                      className="icon-button"
                      type="submit"
                      title="ذخیره نوع پروژه"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      title="انصراف"
                      onClick={() => setEditingCategory(null)}
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <>
                    <span>{t.title}</span>
                    <button
                      className="icon-button"
                      title="ویرایش نوع پروژه"
                      onClick={() => {
                        setEditingCategory(t.id)
                        setEditedTitle(t.title)
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                  </>
                )}
                <button
                  className="icon-button"
                  title="حذف نوع پروژه"
                  disabled={
                    projectTypes.length <= 1 ||
                    projects.some((p) => p.type === t.id)
                  }
                  onClick={async () => {
                    if (
                      projectTypes.length > 1 &&
                      window.confirm(`نوع «${t.title}» حذف شود؟`)
                    ) {
                      await db.projectTypes.delete(t.id)
                      toast('نوع پروژه حذف شد.')
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>ظاهر</h2>
          </div>
          <p className="muted">
            تم انتخابی روی همین دستگاه به خاطر سپرده می‌شود.
          </p>
          <div className="segmented">
            <button
              className={theme === 'light' ? 'chosen' : ''}
              onClick={() => setTheme('light')}
            >
              <Sun size={18} /> روشن
            </button>
            <button
              className={theme === 'dark' ? 'chosen' : ''}
              onClick={() => setTheme('dark')}
            >
              <Moon size={18} /> تاریک
            </button>
            <button
              className={theme === 'system' ? 'chosen' : ''}
              onClick={() => setTheme('system')}
            >
              <Settings2 size={18} /> خودکار (سیستم)
            </button>
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>نسخه پشتیبان</h2>
          </div>
          <p className="muted">
            اطلاعات پروژه‌ها، کارت‌ها، پرامپت‌ها و اینباکس در یک فایل JSON ذخیره
            می‌شوند.
          </p>
          <div className="action-row">
            <button className="primary" onClick={() => void exportBackup()}>
              <Download size={18} /> دریافت بکاپ
            </button>
            <button
              className="soft-button"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={17} /> بازیابی بکاپ
            </button>
            <input
              ref={fileRef}
              hidden
              type="file"
              accept="application/json,.json"
              onChange={(e) => void importFile(e.target.files?.[0])}
            />
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>وضعیت Sync</h2>
          </div>
          <p>
            نسخه فعلی Local-First است. اطلاعات تا زمان فعال‌سازی Dexie Cloud فقط
            روی دستگاه نگهداری می‌شوند.
          </p>
          <span className="callout">
            <Archive size={17} /> تا پیش از فعال شدن Sync، حتماً فایل بکاپ بگیر.
          </span>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>اتصال به Dexie Cloud</h2>
          </div>
          <p className="muted">
            تنظیمات اتصال فقط روی این دستگاه ذخیره شده‌اند و در GitHub منتشر
            نمی‌شوند.
          </p>
          <p className="muted" dir="ltr">
            {allowedEmail}
          </p>
          <p className="muted" dir="ltr">
            {cloudUrl}
          </p>
          <button
            className="soft-button"
            onClick={async () => {
              if (
                !window.confirm(
                  'قبل از تغییر دیتابیس، از اطلاعات نسخه فعلی پشتیبان بگیر. تغییر اتصال، داده‌های فضای ابری قبلی را منتقل نمی‌کند. ادامه می‌دهی؟',
                )
              )
                return
              const nextEmail = window.prompt('ایمیل حساب جدید:', allowedEmail)
              if (nextEmail === null) return
              const nextUrl = window.prompt('آدرس Dexie Cloud جدید:', cloudUrl)
              if (nextUrl === null) return
              try {
                await saveSettings({ email: nextEmail, dexieCloudUrl: nextUrl })
                window.location.reload()
              } catch (e) {
                window.alert(
                  e instanceof Error ? e.message : 'تنظیمات نامعتبر است.',
                )
              }
            }}
          >
            تغییر اتصال (پس از بکاپ)
          </button>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>درباره اطلس</h2>
          </div>
          <div className="atlas-version-info">
            <span>نسخه نصب‌شده / در حال اجرا</span>
            <strong dir="ltr">v{__ATLAS_VERSION__} · tetha</strong>
            <span>
              این عدد نسخه‌ای است که اکنون بارگذاری شده، نه لزوماً آخرین نسخه
              منتشرشده در GitHub.
            </span>
            <span>
              برای دریافت نسخه جدید، پس از انتشار دوباره برنامه را باز کن یا
              صفحه را Reload کن. اگر نسخه تغییر نکرد، یک‌بار برنامه را ببند و
              دوباره اجرا کن.
            </span>
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>اپل کلندر و ریمایندر</h2>
          </div>
          <p className="muted">
            در Safari آیفون و مک، دکمه‌های تقویم و یادآورها دو میانبر Atlas
            Calendar و Atlas Reminder را اجرا می‌کنند. میانبرها باید ورودی JSON
            (شامل عنوان، پروژه، تاریخ و توضیحات) را بخوانند، آیتم را در مقصد
            پیش‌فرض بسازند و سپس اپ Calendar یا Reminders را باز کنند. تنظیم و
            مجوز اولیه در هر دستگاه لازم است. این اتصال یک‌طرفه است و ثبت موفق
            به وب‌اپ گزارش نمی‌شود.
          </p>
        </section>
      </div>
    </>
  )
}
