/** Device-only configuration. No personal data is embedded in the public bundle. */
export interface DeviceSettings {
  email: string
  dexieCloudUrl: string
}

const DATABASE = 'atlas-device-settings'
const STORE = 'connection'
const KEY = 'current'
let bootSettings: DeviceSettings | null = null

function openSettingsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB is unavailable'))
  })
}

export function normalizeSettings(email: string, url: string): DeviceSettings {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUrl = url.trim().replace(/\/$/, '')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('ایمیل معتبر وارد کن.')
  }
  if (!/^https:\/\/[a-z0-9-]+\.dexie\.cloud$/i.test(normalizedUrl)) {
    throw new Error('آدرس دیتابیس باید شبیه https://example.dexie.cloud باشد.')
  }
  return { email: normalizedEmail, dexieCloudUrl: normalizedUrl }
}

export async function loadSettings(): Promise<DeviceSettings | null> {
  const database = await openSettingsDb()
  try {
    const result: unknown = await new Promise((resolve, reject) => {
      const tx = database.transaction(STORE, 'readonly')
      const request = tx.objectStore(STORE).get(KEY)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    if (!result || typeof result !== 'object') return null
    const value = result as Partial<DeviceSettings>
    if (typeof value.email !== 'string' || typeof value.dexieCloudUrl !== 'string') return null
    try { return normalizeSettings(value.email, value.dexieCloudUrl) } catch { return null }
  } finally { database.close() }
}

export async function saveSettings(settings: DeviceSettings): Promise<void> {
  const value = normalizeSettings(settings.email, settings.dexieCloudUrl)
  const database = await openSettingsDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(value, KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    bootSettings = value
  } finally { database.close() }
}

export function setBootSettings(settings: DeviceSettings): void { bootSettings = settings }
export function getBootSettings(): DeviceSettings | null { return bootSettings }
