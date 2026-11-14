import settings from '../atlas.config.json'

// These settings are included in the browser build. Never put passwords, API secrets or tokens here.
export const allowedEmail = settings.allowedEmail.trim().toLowerCase()
export const cloudUrl = settings.dexieCloudUrl.trim()
export const cloudReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(allowedEmail)
  && allowedEmail !== 'change_me@example.com'
  && /^https:\/\/[a-z0-9-]+\.dexie\.cloud\/?$/i.test(cloudUrl)
  && !cloudUrl.includes('YOUR_DATABASE_ID')
