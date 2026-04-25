import "server-only"

/**
 * YouTube oEmbed response — fields actually returned (verified from
 * https://oembed.com/#section7.4 and a live probe of www.youtube.com/oembed).
 *
 * IMPORTANT: oEmbed does NOT return duration. Per RESEARCH Pitfall 3,
 * media_item.duration_sec stays nullable; admin can populate it manually
 * via the AddVideoDialog edit form, or it stays null.
 */
export interface YouTubeOEmbedResponse {
  title: string
  author_name: string
  author_url: string
  thumbnail_url: string
  thumbnail_width: number
  thumbnail_height: number
  provider_name: string
  type: string
  html: string
}

const OEMBED_URL = "https://www.youtube.com/oembed"
const TIMEOUT_MS = 5000

/**
 * Fetch oEmbed metadata for a YouTube video URL.
 *
 * - Times out at 5s (oEmbed normally responds <500ms; treat slow as failure).
 * - Returns null on any error so callers can degrade gracefully (per
 *   UI-SPEC error copy: "Couldn't load video info from YouTube. The link
 *   is saved — you can edit the title and description below.")
 * - No retry. If a paste fails, admin re-pastes.
 * - cache: "no-store" — we cache in the media_item row instead.
 */
export async function fetchYouTubeOEmbed(
  url: string,
): Promise<YouTubeOEmbedResponse | null> {
  const target = new URL(OEMBED_URL)
  target.searchParams.set("url", url)
  target.searchParams.set("format", "json")

  const ctl = new AbortController()
  const timeout = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(target.toString(), {
      signal: ctl.signal,
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as YouTubeOEmbedResponse
    return data
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
