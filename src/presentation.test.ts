import { describe, expect, it } from 'vitest'
import { dateFmt, dueFmt, matchesCardFilter, textMatches } from './presentation'

describe('displayed dates', () => {
  it('formats date-only deadlines in the Persian locale', () => {
    const expected = new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date('2026-11-21T12:00:00Z'))
    expect(dueFmt('2026-11-21')).toBe(expected)
  })

  it('formats timed deadlines using the local clock', () => {
    const local = new Date(2026, 10, 21, 9, 30)
    const expected = new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(local)
    expect(dueFmt('2026-11-21T09:30')).toBe(expected)
  })

  it('renders missing dates and deadlines separately', () => {
    expect(dateFmt()).toBe('بدون تاریخ')
    expect(dueFmt()).toBe('بدون موعد')
  })
})

describe('search text matching', () => {
  it('matches mixed Persian and Latin text case-insensitively', () => {
    expect(textMatches('پروژه Atlas', '  ATLAS  ')).toBe(true)
    expect(textMatches('پروژه Atlas', 'پروژه')).toBe(true)
    expect(textMatches('پروژه Atlas', 'Manio')).toBe(false)
  })
})

describe('unfinished task filter', () => {
  it('includes todo, doing, and legacy tasks with no explicit status', () => {
    for (const taskStatus of ['todo', 'doing', undefined] as const) {
      expect(
        matchesCardFilter(
          { type: 'task', taskStatus, isMainTask: false },
          'unfinished',
        ),
      ).toBe(true)
    }
  })

  it('excludes completed tasks and other card types', () => {
    expect(
      matchesCardFilter(
        { type: 'task', taskStatus: 'done', isMainTask: true },
        'unfinished',
      ),
    ).toBe(false)
    expect(
      matchesCardFilter({ type: 'note', isMainTask: false }, 'unfinished'),
    ).toBe(false)
  })
})
