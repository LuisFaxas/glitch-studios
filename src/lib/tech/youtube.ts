const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase().replace(/^www\./, "")

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v")
        return id && ID_PATTERN.test(id) ? id : null
      }
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.slice("/embed/".length).split("/")[0]
        return ID_PATTERN.test(id) ? id : null
      }
      return null
    }

    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0]
      return ID_PATTERN.test(id) ? id : null
    }
    return null
  } catch {
    return null
  }
}
