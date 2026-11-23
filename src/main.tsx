<<<<<<< HEAD
import React, { useEffect, useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { loadSettings, normalizeSettings, saveSettings, setBootSettings, type DeviceSettings } from './deviceSettings'
import './style.css'

type AuthComponent = React.ComponentType

function Bootstrap() {
  const [status, setStatus] = useState<'loading' | 'setup' | 'ready' | 'storage-error' | 'module-error'>('loading')
  const [Auth, setAuth] = useState<AuthComponent | null>(null)
  const [email, setEmail] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void loadSettings().then(async saved => {
      if (!active) return
      if (!saved) { setStatus('setup'); return }
      setBootSettings(saved)
      // Import AuthGate only after the URL is known. Its db dependency configures
      // Dexie Cloud before the first DB request, and never gets a placeholder URL.
      try {
        const loaded = await import('./AuthGate')
        if (active) { setAuth(() => loaded.default); setStatus('ready') }
      } catch (e) {
        if (active) { setError(e instanceof Error ? e.message : String(e)); setStatus('module-error') }
      }
    }).catch(e => { if (active) { setError(e instanceof Error ? e.message : String(e)); setStatus('storage-error') } })
    return () => { active = false }
  }, [])

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    try {
      const saved: DeviceSettings = normalizeSettings(email, url)
      await saveSettings(saved)
      // A full reload guarantees that Dexie initializes once against the
      // selected cloud URL. No config import can have happened before this.
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ذخیره تنظیمات ناموفق بود.')
      setBusy(false)
    }
  }

  async function refreshAppFiles() {
    setBusy(true)
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map(registration => registration.unregister()))
      }
      if ('caches' in window) {
        const names = await caches.keys()
        await Promise.all(names.map(name => caches.delete(name)))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      window.location.reload()
    }
  }

  if (status === 'ready' && Auth) return <Auth />
  return <main className="atlas-auth-screen" dir="rtl"><section className="atlas-auth-panel">
    <div className="atlas-auth-logo">A</div>
    {status === 'loading' ? <><h1>اطلس</h1><p role="status">در حال بارگذاری تنظیمات دستگاه…</p></> :
      status === 'storage-error' ? <><h1>خطای ذخیره‌سازی</h1><p>خواندن تنظیمات ذخیره‌شده روی این دستگاه ناموفق بود. دسترسی مرورگر به IndexedDB را بررسی کن.</p></> :
      status === 'module-error' ? <><h1>خطای بارگذاری برنامه</h1><p>بخشی از برنامه بارگذاری نشد. اتصال اینترنت را بررسی کن و دوباره تلاش کن. اگر خطا ادامه دارد، فایل‌های برنامه را دوباره دریافت کن؛ این کار داده‌های ذخیره‌شده را پاک نمی‌کند.</p><button className="primary" type="button" onClick={() => window.location.reload()}>تلاش دوباره</button><button className="soft-button" type="button" disabled={busy} onClick={() => void refreshAppFiles()}>{busy ? 'در حال بازنشانی…' : 'دریافت دوباره فایل‌های برنامه'}</button></> :
      <><h1>راه‌اندازی اطلس</h1><p>یک بار ایمیل و آدرس دیتابیس شخصی Dexie Cloud را وارد کن. اطلاعات فقط روی همین دستگاه ذخیره می‌شوند.</p>
        <form onSubmit={e => void submit(e)} className="atlas-setup-form">
          <label>ایمیل حساب<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" dir="ltr"/></label>
          <label>آدرس Dexie Cloud<input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.dexie.cloud" dir="ltr"/></label>
          <button className="primary" type="submit" disabled={busy}>{busy ? 'در حال ذخیره…' : 'ذخیره و ادامه به ورود'}</button>
        </form><small>برای استفاده، ابتدا دیتابیس خودت را در Dexie Cloud بساز و دامنه Atlas را در Whitelist آن ثبت کن.</small></>}
    {error && <p role="alert" className="atlas-auth-error">{error}</p>}
  </section></main>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><Bootstrap /></React.StrictMode>)
=======
import React from 'react'
import {createRoot} from 'react-dom/client'
import AuthGate from './AuthGate'
import './style.css'
createRoot(document.getElementById('root')!).render(<React.StrictMode><AuthGate/></React.StrictMode>)
>>>>>>> 95254a9 (first deploy)
