<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react'
import { useObservable } from 'dexie-react-hooks'
import { db } from './db'
import { allowedEmail } from './atlasConfig'
import App from './App'

// Read the persisted Dexie Cloud user only after the database has opened.
// A single explicit login action owns the OTP flow; never start login from render/effects.
function CloudAuthGate() {
  const user = useObservable(db.cloud.currentUser)
  const [databaseReady, setDatabaseReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const loginPending = useRef(false)

  useEffect(() => {
    let live = true
    void db.open().then(() => {
      if (live) setDatabaseReady(true)
    }).catch(e => {
      if (live) setError(e instanceof Error ? e.message : 'باز کردن پایگاه داده ناموفق بود.')
    })
    return () => { live = false }
  }, [])

  const email = user?.email?.trim().toLowerCase()
  const authorized = databaseReady && user?.isLoggedIn === true && email === allowedEmail
  const wrongAccount = databaseReady && user?.isLoggedIn === true && email !== allowedEmail

  useEffect(() => {
    if (!authorized || !navigator.storage?.persist) return
    // Best effort only; WebKit may refuse or ignore persistent storage requests.
    void navigator.storage.persist().catch(() => {})
  }, [authorized])

  async function login() {
    if (loginPending.current || !databaseReady || user === undefined) return
    loginPending.current = true
    setBusy(true)
=======
import { useState } from 'react'
import { useObservable } from 'dexie-react-hooks'
import { db } from './db'
import { allowedEmail, cloudReady } from './atlasConfig'
import App from './App'

// UI filtering is not a backend allowlist: Dexie Cloud verifies OTP and enforces data ownership.
function CloudAuthGate() {
  const user = useObservable(db.cloud.currentUser)
  const [error, setError] = useState('')
  const activeEmail = user?.email?.trim().toLowerCase()
  const authorized = user?.isLoggedIn && activeEmail === allowedEmail

  async function login() {
>>>>>>> 95254a9 (first deploy)
    setError('')
    try {
      await db.cloud.login({ email: allowedEmail, grant_type: 'otp' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ورود انجام نشد. دوباره تلاش کن.')
<<<<<<< HEAD
    } finally {
      loginPending.current = false
      setBusy(false)
    }
  }

  async function logout() {
    if (loginPending.current) return
    setBusy(true)
    setError('')
    try { await db.cloud.logout() }
    catch (e) { setError(e instanceof Error ? e.message : 'خروج انجام نشد.') }
    finally { setBusy(false) }
=======
    }
  }
  async function logout() {
    setError('')
    try { await db.cloud.logout() }
    catch (e) { setError(e instanceof Error ? e.message : 'خطا هنگام خروج') }
>>>>>>> 95254a9 (first deploy)
  }

  if (authorized) return <App />
  return <main className="atlas-auth-screen" dir="rtl">
    <section className="atlas-auth-panel">
      <div className="atlas-auth-logo">A</div>
      <h1>ورود به اطلس</h1>
<<<<<<< HEAD
      <p>فضای کاری شخصی شما، با کد یک‌بارمصرف ایمیلی</p>
      <div className="atlas-auth-email" dir="ltr">{allowedEmail}</div>
      {!databaseReady || user === undefined ?
        <p role="status">در حال بازیابی نشست قبلی…</p> : <>
          {wrongAccount && <p className="atlas-auth-error">حساب فعلی با ایمیل تعریف‌شده متفاوت است. ابتدا خارج شو.</p>}
          <button className="primary" type="button" onClick={login} disabled={busy || wrongAccount}>
            {busy ? 'در حال انجام ورود…' : 'ارسال کد ورود به ایمیل'}
          </button>
          {wrongAccount && <button className="soft-button" type="button" onClick={logout} disabled={busy}>خروج از حساب دیگر</button>}
        </>}
      {error && <p role="alert" className="atlas-auth-error">{error}</p>}
      <small>تا وقتی داده‌های سایت روی دستگاه باقی بمانند، Dexie Cloud نشست را ذخیره می‌کند.</small>
=======
      <p>فضای کاری شخصی شما، با تأیید کد یک‌بارمصرف ایمیلی</p>
      <div className="atlas-auth-email" dir="ltr">{allowedEmail}</div>
      {user === undefined ? <p>در حال بررسی ورود قبلی…</p> : <>
        {user?.isLoggedIn && !authorized && <p className="atlas-auth-error">حساب فعلی مجاز نیست. برای ورود با ایمیل تعیین‌شده، از حساب فعلی خارج شو.</p>}
        <button className="primary" onClick={login} disabled={Boolean(user?.isLoggedIn && !authorized)}>ارسال کد ورود به ایمیل</button>
        {user?.isLoggedIn && <button className="soft-button" onClick={logout}>خروج از حساب فعلی</button>}
      </>}
      {error && <p role="alert" className="atlas-auth-error">{error}</p>}
      <small>ورود معتبر معمولاً روی همین دستگاه حفظ می‌شود. کد و نشست را Dexie Cloud مدیریت می‌کند.</small>
>>>>>>> 95254a9 (first deploy)
    </section>
  </main>
}

<<<<<<< HEAD
export default function AuthGate() { return <CloudAuthGate /> }
=======
export default function AuthGate() {
  if (!cloudReady) {
    if (import.meta.env.DEV) return <><div className="atlas-dev-warning" dir="rtl">حالت توسعه محلی: احراز هویت و همگام‌سازی فعال نیستند. برای انتشار، فایل atlas.config.json را تکمیل کن.</div><App /></>
    return <main className="atlas-auth-screen" dir="rtl"><section className="atlas-auth-panel"><h1>پیکربندی اطلس کامل نیست</h1><p>پیش از انتشار، allowedEmail و dexieCloudUrl را در atlas.config.json تنظیم کن و دوباره Build بگیر.</p></section></main>
  }
  return <CloudAuthGate />
}
>>>>>>> 95254a9 (first deploy)
