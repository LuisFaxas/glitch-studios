export function getSiteUrl(fallback = "https://glitchstudios.io"): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || fallback).replace(/\\n/g, "").trim()
}
