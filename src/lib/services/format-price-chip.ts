// Concise price chip for the B2.9 mono-stack rows (Phase 48.4).
// - "/project" is the implicit default unit → dropped (it just adds noise).
// - Hourly / per-track units carry the meaning → drop the "From " qualifier.
//   "From $50/hr" → "$50/HR", "From $75/track" → "$75/TRACK".
// - Project / flat ranges keep the "FROM" qualifier: "From $500/project" → "FROM $500".
export function formatPriceChip(priceLabel: string): string {
  const s = priceLabel.trim().replace(/\/project$/i, "")
  const lower = s.toLowerCase()
  if (lower.includes("/hr") || lower.includes("/track")) {
    return s.replace(/^from\s+/i, "").toUpperCase()
  }
  return s.toUpperCase()
}
