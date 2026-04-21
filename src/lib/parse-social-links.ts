// TODO(Phase 14): replace Lucide icon map with brand SVGs (POLISH-01)

export type SocialLink = { platform: string; url: string }

export function parseSocialLinks(json: string | null): SocialLink[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) return parsed
    if (typeof parsed === "object") {
      return Object.entries(parsed)
        .filter(([, url]) => Boolean(url))
        .map(([platform, url]) => ({ platform, url: url as string }))
    }
    return []
  } catch {
    return []
  }
}
