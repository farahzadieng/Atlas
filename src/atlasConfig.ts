<<<<<<< HEAD
// Atlas configuration comes from device-local IndexedDB, not a build-time JSON file.
// This module is only imported AFTER deviceSettings.loadSettings() has completed.
import { getBootSettings } from './deviceSettings'
const settings = getBootSettings()
if (!settings) throw new Error('Atlas has not been configured on this device')
export const allowedEmail = settings.email
export const cloudUrl = settings.dexieCloudUrl
export const cloudReady = true
=======
import settings from '../atlas.config.json'

// These settings are included in the browser build. Never put passwords, API secrets or tokens here.
export const allowedEmail = settings.allowedEmail.trim().toLowerCase()
export const cloudUrl = settings.dexieCloudUrl.trim()
export const cloudReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(allowedEmail)
  && allowedEmail !== 'change_me@example.com'
  && /^https:\/\/[a-z0-9-]+\.dexie\.cloud\/?$/i.test(cloudUrl)
  && !cloudUrl.includes('YOUR_DATABASE_ID')
>>>>>>> 95254a9 (first deploy)
