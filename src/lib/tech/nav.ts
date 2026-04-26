// src/lib/tech/nav.ts
// Phase 29.1 D-23/D-24 — single source of truth for active-state highlighting
// across every tech mobile nav surface. The /tech middleware rewrites root
// paths to /tech/* internally but `usePathname()` returns the BROWSER URL
// (post-rewrite-stripped on glitchtech.io). Comparing a hardcoded /tech/foo
// itemHref against pathname='/foo' never matches. This helper normalizes both
// sides so /tech/reviews and /reviews compare equal.

/**
 * Strip a leading "/tech" segment from a path, normalising the brand-host
 * rewrite. Returns "/" for "/tech" exactly. Idempotent — paths without
 * a leading "/tech" are returned unchanged.
 */
export function stripTechPrefix(path: string): string {
  if (path === "/tech") return "/"
  if (path.startsWith("/tech/")) return path.substring(5) // 5 = "/tech".length
  return path
}

/**
 * Active-state predicate for tech nav items. Compares the item's configured
 * href (always `/tech/*` in tech-nav-config.ts) against the live pathname,
 * after normalising both sides so the comparison works on glitchtech.io
 * (where pathname is `/foo`) AND on glitchstudios.io/tech/foo previews
 * (where pathname is `/tech/foo`).
 *
 * Match rules:
 * - Exact match: pathname === itemHref (after normalisation)
 * - Prefix match: pathname starts with `${itemHref}/` so /tech/reviews/abc
 *   highlights the Reviews tab.
 *
 * Special-case: itemHref `/tech` (Home) only matches pathname `/` (root) —
 * NOT every /tech/* path. Otherwise Home would always be active.
 */
export function isTechPathActive(itemHref: string, pathname: string): boolean {
  const normalisedHref = stripTechPrefix(itemHref)
  const normalisedPath = stripTechPrefix(pathname)
  if (normalisedHref === "/") {
    return normalisedPath === "/"
  }
  return (
    normalisedPath === normalisedHref ||
    normalisedPath.startsWith(normalisedHref + "/")
  )
}
