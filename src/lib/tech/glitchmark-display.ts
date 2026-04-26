/**
 * Convert a stored GlitchMark score (numeric(7,2), base-100 reference) to its
 * user-visible display string (base-1000 reference, integer rounded).
 *
 * Phase 29.1 D-19/D-20/D-21 — display convention only. Schema unchanged.
 *
 * Lives in its own module (NOT in glitchmark.ts) because the score-recompute
 * module is `import "server-only"` — client components (leaderboard-table.tsx
 * and leaderboard-card.tsx) need access to the formatter without dragging the
 * server-only db client into the client bundle.
 *
 * @param score raw numeric(7,2) value from tech_reviews.glitchmark_score, or null.
 * @param options.partial if true, append " · partial" suffix per existing card pattern.
 * @returns "—" when score is null, otherwise the integer string of (score × 10) with optional partial suffix.
 *
 * Examples:
 *   formatGlitchmarkDisplay(100)             → "1000"
 *   formatGlitchmarkDisplay(142.50)          → "1425"
 *   formatGlitchmarkDisplay(165.32, { partial: true }) → "1653 · partial"
 *   formatGlitchmarkDisplay(null)            → "—"
 */
export function formatGlitchmarkDisplay(
  score: number | null,
  options: { partial?: boolean } = {},
): string {
  if (score === null) return "—"
  const scaled = Math.round(score * 10)
  return options.partial ? `${scaled} · partial` : String(scaled)
}
