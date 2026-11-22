import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { loadSettings, normalizeSettings, saveSettings } from './deviceSettings'

describe('device-local Dexie Cloud settings', () => {
  it('normalizes and persists the selected connection', async () => {
    expect(await loadSettings()).toBeNull()
    await saveSettings({
      email: '  User@Example.com ',
      dexieCloudUrl: ' https://atlas-example.dexie.cloud/ ',
    })
    expect(await loadSettings()).toEqual({
      email: 'user@example.com',
      dexieCloudUrl: 'https://atlas-example.dexie.cloud',
    })
  })

  it.each([
    'http://atlas-example.dexie.cloud',
    'https://atlas-example.dexie.cloud/path',
    'https://atlas-example.dexie.cloud.example.org',
    'https://atlas-example.dexie.cloud?foo=bar',
  ])('rejects invalid database origin %s', (url) => {
    expect(() => normalizeSettings('user@example.com', url)).toThrow()
  })

  it('rejects an invalid email', () => {
    expect(() =>
      normalizeSettings('invalid', 'https://atlas-example.dexie.cloud'),
    ).toThrow()
  })
})
