import { RUBRIC_V1_1 } from "./rubric-map"

export function slugFromRubricKey(key: string): string {
  return key.replace(/[:_]/g, "-")
}

const SLUG_TO_KEY: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  for (const key of Object.keys(RUBRIC_V1_1)) {
    m[slugFromRubricKey(key)] = key
  }
  return m
})()

export function rubricKeyFromSlug(slug: string): string | null {
  return SLUG_TO_KEY[slug] ?? null
}

export function getAllBenchmarkSlugs(): string[] {
  return Object.keys(SLUG_TO_KEY)
}
