import { describe, expect, it } from 'vitest'
import {
  getPromptTagSuggestions,
  parsePromptTags,
  selectPromptTag,
} from './promptTags'

const prompts = [
  { tags: ['SEO', 'Research', 'تولید محتوا'] },
  { tags: ['seo', 'Image Research', 'عکاسی'] },
]

describe('prompt tag suggestions', () => {
  it('searches the current tag in Persian or Latin text', () => {
    expect(getPromptTagSuggestions(prompts, 'SEO، reSEArch')).toEqual(
      expect.arrayContaining(['Research', 'Image Research']),
    )
    expect(getPromptTagSuggestions(prompts, 'تولید')).toEqual(['تولید محتوا'])
  })

  it('deduplicates suggestions and hides tags that are already attached', () => {
    const all = getPromptTagSuggestions(prompts, '')
    expect(all.filter((tag) => tag.toLowerCase() === 'seo')).toEqual(['SEO'])
    expect(getPromptTagSuggestions(prompts, 'seo, ')).not.toContain('SEO')
  })

  it('only replaces the unfinished tag when a suggestion is selected', () => {
    const next = selectPromptTag('SEO، re', 'Research')
    expect(next).toBe('SEO, Research, ')
    expect(parsePromptTags(next + 'تگ تازه')).toEqual([
      'SEO',
      'Research',
      'تگ تازه',
    ])
  })
})
