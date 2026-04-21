import "server-only"
import { cache } from "react"

const WORDS_PER_MINUTE = 225

export function readingTime(content: string): number {
  if (!content) return 1
  const stripped = content
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`~>\[\]()!]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!stripped) return 1
  const tokens = stripped.split(" ").filter(Boolean).length
  const minutes = Math.ceil(tokens / WORDS_PER_MINUTE)
  return Math.max(1, minutes)
}

export const readingTimeCached = cache((content: string): number => readingTime(content))
