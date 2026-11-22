import type { Prompt } from './db'
import { textMatches } from './presentation'

const tagSeparator = /[,،]/
const tagLimit = 30

const cleanTag = (tag: string) => tag.trim().replace(/^#/, '').trim()

export function parsePromptTags(input: string) {
  return [
    ...new Set(input.split(tagSeparator).map(cleanTag).filter(Boolean)),
  ].slice(0, tagLimit)
}

export function getPromptTagSuggestions(
  prompts: readonly Pick<Prompt, 'tags'>[],
  input: string,
) {
  const entries = input.split(tagSeparator)
  const query = cleanTag(entries.pop() ?? '')
  const selected = parsePromptTags(entries.join(',')).map((tag) =>
    tag.toLocaleLowerCase('fa'),
  )
  if (selected.length >= tagLimit) return []

  const available = new Map<string, string>()
  for (const tag of prompts.flatMap((prompt) => prompt.tags)) {
    const key = tag.toLocaleLowerCase('fa')
    if (
      !selected.includes(key) &&
      textMatches(tag, query) &&
      !available.has(key)
    ) {
      available.set(key, tag)
    }
  }
  return [...available.values()]
    .sort((a, b) => a.localeCompare(b, 'fa'))
    .slice(0, 8)
}

export function selectPromptTag(input: string, tag: string) {
  const entries = input.split(tagSeparator)
  entries.pop()
  return [...parsePromptTags(entries.join(',')), tag, ''].join(', ')
}
