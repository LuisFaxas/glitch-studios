// Single source of truth for hostname -> brand mapping.
// Consumed by middleware AND (auth)/layout.tsx server component.
// Mirrors the fall-through behavior of src/middleware.ts:
// unknown hosts (localhost, codebox.local, Vercel preview) -> 'studios'.

export type Brand = "studios" | "tech"

export const STUDIOS_HOSTS = new Set([
  "glitchstudios.io",
  "www.glitchstudios.io",
])

export const TECH_HOSTS = new Set([
  "glitchtech.io",
  "www.glitchtech.io",
])

/**
 * Extract the bare hostname (no port) from a host header value.
 * Returns lowercase. Empty input returns "".
 */
export function getHostname(hostHeader: string | null | undefined): string {
  if (!hostHeader) return ""
  return hostHeader.split(":")[0].toLowerCase()
}

/**
 * Resolve a host header to a brand. Defaults to 'studios' for any host
 * not in TECH_HOSTS — matches middleware fall-through (localhost, codebox.local,
 * Vercel preview URLs all render as Studios).
 */
export function getBrandFromHost(hostHeader: string | null | undefined): Brand {
  const host = getHostname(hostHeader)
  if (TECH_HOSTS.has(host)) return "tech"
  return "studios"
}
