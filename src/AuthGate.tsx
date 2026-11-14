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
    setError('')
    try {
      await db.cloud.login({ email: allowedEmail, grant_type: 'otp' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ورود انجام نشد. دوباره تلاش کن.')
    }
  }
  async function logout() {
    setError('')
    try { await db.cloud.logout() }
    catch (e) { setError(e instanceof Error ? e.message : 'خطا هنگام خروج') }
  }

  if (authorized) return <App />
  return <main className="atlas-auth-screen" dir="rtl">
    <section className="atlas-auth-panel">
      <div className="atlas-auth-logo">A</div>
      <h1>ورود به اطلس</h1>
      <p>فضای کاری شخصی شما، با تأیید کد یک‌بارمصرف ایمیلی</p>
      <div className="atlas-auth-email" dir="ltr">{allowedEmail}</div>
      {user === undefined ? <p>در حال بررسی ورود قبلی…</p> : <>
        {user?.isLoggedIn && !authorized && <p className="atlas-auth-error">حساب فعلی مجاز نیست. برای ورود با ایمیل تعیین‌شده، از حساب فعلی خارج شو.</p>}
        <button className="primary" onClick={login} disabled={Boolean(user?.isLoggedIn && !authorized)}>ارسال کد ورود به ایمیل</button>
        {user?.isLoggedIn && <button className="soft-button" onClick={logout}>خروج از حساب فعلی</button>}
      </>}
      {error && <p role="alert" className="atlas-auth-error">{error}</p>}
      <small>ورود معتبر معمولاً روی همین دستگاه حفظ می‌شود. کد و نشست را Dexie Cloud مدیریت می‌کند.</small>
    </section>
  </main>
}

export default function AuthGate() {
  if (!cloudReady) {
    if (import.meta.env.DEV) return <><div className="atlas-dev-warning" dir="rtl">حالت توسعه محلی: احراز هویت و همگام‌سازی فعال نیستند. برای انتشار، فایل atlas.config.json را تکمیل کن.</div><App /></>
    return <main className="atlas-auth-screen" dir="rtl"><section className="atlas-auth-panel"><h1>پیکربندی اطلس کامل نیست</h1><p>پیش از انتشار، allowedEmail و dexieCloudUrl را در atlas.config.json تنظیم کن و دوباره Build بگیر.</p></section></main>
  }
  return <CloudAuthGate />
}
