"use client"

export type LeaderboardView = "cards" | "table"

interface LeaderboardViewToggleProps {
  value: LeaderboardView
  onChange: (next: LeaderboardView) => void
}

/**
 * Phase 29.1 D-17 — segmented [Cards | Table] control. Mobile-only host
 * decides whether to render this. nuqs URL state is owned by the parent
 * (LeaderboardTable) — this component is purely presentational.
 */
export function LeaderboardViewToggle({
  value,
  onChange,
}: LeaderboardViewToggleProps) {
  const buttonClass = (active: boolean) =>
    "px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors " +
    (active
      ? "bg-[#f5f5f0] text-[#000]"
      : "text-[#888] hover:text-[#f5f5f0]")
  return (
    <div
      data-leaderboard-view-toggle
      role="tablist"
      aria-label="View"
      className="inline-flex border border-[#222] bg-[#0a0a0a]"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "cards"}
        data-view-option="cards"
        onClick={() => onChange("cards")}
        className={buttonClass(value === "cards")}
      >
        Cards
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "table"}
        data-view-option="table"
        onClick={() => onChange("table")}
        className={buttonClass(value === "table")}
      >
        Table
      </button>
    </div>
  )
}
