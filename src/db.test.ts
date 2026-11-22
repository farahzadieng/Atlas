import 'fake-indexeddb/auto'
import { afterAll, describe, expect, it, vi } from 'vitest'

// Exercise the real IndexedDB tables and transactions without starting cloud sync.
vi.mock('dexie-cloud-addon', () => ({
  default: (database: { cloud?: { configure: () => void } }) => {
    database.cloud = { configure: () => {} }
  },
}))
vi.mock('./atlasConfig', () => ({
  cloudUrl: 'https://atlas-example.dexie.cloud',
}))

import { db, importBackup } from './db'

afterAll(async () => {
  await db.delete()
})

function backup(data: object) {
  return new File([JSON.stringify(data)], 'atlas-backup.json')
}

describe('backup import', () => {
  it('merges v1 projects and normalizes legacy archive status', async () => {
    await db.projects.put({
      id: 'keep',
      title: 'Existing',
      description: '',
      type: 'personal',
      status: 'active',
      createdAt: 1,
      updatedAt: 1,
    })
    const result = await importBackup(
      backup({
        format: 'atlas-backup',
        version: 1,
        inbox: [],
        projects: [
          {
            id: 'legacy',
            title: 'Legacy',
            description: '',
            type: 'personal',
            status: 'archived',
            createdAt: 1,
            updatedAt: 42,
          },
        ],
      }),
    )
    expect(result.projects).toBe(1)
    expect(await db.projects.get('legacy')).toMatchObject({
      status: 'rest',
      archivedAt: 42,
    })
    expect(await db.projects.get('keep')).toBeDefined()
  })

  it('rejects malformed records before writing to IndexedDB', async () => {
    await expect(
      importBackup(
        backup({
          format: 'atlas-backup',
          version: 3,
          projects: [{ id: 'do-not-import' }],
          cards: [{ id: 7 }],
          prompts: [],
          inbox: [],
          activity: [],
          projectTypes: [],
        }),
      ),
    ).rejects.toThrow(/cards/)
    expect(await db.projects.get('do-not-import')).toBeUndefined()
  })
})
