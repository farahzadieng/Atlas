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
    setError('')
    try {
      await db.cloud.login({ email: allowedEmail, grant_type: 'otp' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ورود انجام نشد. دوباره تلاش کن.')
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
  }

  if (authorized) return <App />
  return <main className="atlas-auth-screen" dir="rtl">
    <section className="atlas-auth-panel">
      <div className="atlas-auth-logo">A</div>
      <h1>ورود به اطلس</h1>
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
    </section>
  </main>
}

export default function AuthGate() { return <CloudAuthGate /> }
