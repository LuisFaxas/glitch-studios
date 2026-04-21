---
phase: 12-artists-team
plan: 05
status: complete
requirements: [TEAM-01, TEAM-03]
---

## Delivered

`src/components/artists/artists-section.tsx` — client component.

## Chip strings (verbatim from PortfolioGrid)

```ts
const chipBase = "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200"
const chipActive = "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
const chipInactive = "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"
```

## Empty-state conditions

1. `members.length === 0` → "Coming soon." (whole-section placeholder).
2. `filtered.length === 0` (with members present + chip selected) → "NO MEMBERS WITH THIS SPECIALTY" + fallback nudge.

## className prop usage

Consumer (Plan 12-06 page) passes e.g. `className="mt-16 pt-8 border-t border-[#222222]"` to the COLLABORATORS section to separate it visually from the TEAM section above.

## Verification

- `pnpm tsc --noEmit` passes.
