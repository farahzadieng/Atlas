// Atlas configuration comes from device-local IndexedDB, not a build-time JSON file.
// This module is only imported AFTER deviceSettings.loadSettings() has completed.
import { getBootSettings } from './deviceSettings'
const settings = getBootSettings()
if (!settings) throw new Error('Atlas has not been configured on this device')
export const allowedEmail = settings.email
export const cloudUrl = settings.dexieCloudUrl
export const cloudReady = true
