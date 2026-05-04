// Single source of truth for hostname -> brand mapping.
// Consumed by middleware AND (auth)/layout.tsx server component.
// Mirrors the fall-through behavior of src/middleware.ts:
// unknown hosts (localhost, codebox.local, Vercel preview) -> 'studios'.

export type Brand = "studios" | "tech"

export const BRAND_DISPLAY_NAMES: Record<Brand, string> = {
  studios: "Glitch Studios",
  tech: "GlitchTech",
}

export const BRAND_HOME_URLS: Record<Brand, string> = {
  studios: "https://glitchstudios.io",
  tech: "https://glitchtech.io",
}

export const STUDIOS_HOSTS = new Set([
  "glitchstudios.io",
  "www.glitchstudios.io",
])

export const TECH_HOSTS = new Set(["glitchtech.io", "www.glitchtech.io"])

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

export function getBrandFromUrl(url: string): Brand {
  try {
    const parsed = new URL(url, BRAND_HOME_URLS.studios)
    const explicitBrand = parsed.searchParams.get("brand")
    if (explicitBrand === "tech" || explicitBrand === "studios") {
      return explicitBrand
    }

    const callbackUrl = parsed.searchParams.get("callbackURL")
    if (callbackUrl) {
      return getBrandFromUrl(callbackUrl)
    }

    return getBrandFromHost(parsed.hostname)
  } catch {
    return "studios"
  }
}
