---
phase: 12-artists-team
plan: 05
type: execute
wave: 3
depends_on: [12-03]
files_modified:
  - src/components/artists/artists-section.tsx
autonomous: true
requirements: [TEAM-01, TEAM-03]
must_haves:
  truths:
    - "ArtistsSection renders a section h2 with the section title and member count in parentheses"
    - "ArtistsSection renders a horizontal-scrolling specialty chip filter when there are specialties"
    - "Clicking a specialty chip filters the grid to members who have that specialty"
    - "The ALL chip always appears first and resets the filter"
    - "ArtistsSection renders ArtistCards in a 1-col (mobile) / 2-col (md) / 3-col (lg) grid"
    - "When members array is empty, ArtistsSection renders a per-section empty state (not a page-level empty)"
  artifacts:
    - path: "src/components/artists/artists-section.tsx"
      provides: "ArtistsSection client component with section h2, chip filter, responsive grid"
      contains: "ArtistsSection"
  key_links:
    - from: "src/components/artists/artists-section.tsx"
      to: "src/components/artists/artist-card.tsx"
      via: "import { ArtistCard } from './artist-card' — renders each filtered member"
      pattern: "ArtistCard"
---

<objective>
Build ArtistsSection, a client component that wraps a labeled section (TEAM or COLLABORATORS) with a specialty chip filter and a responsive ArtistCard grid. This is the client-side browsing mechanism satisfying TEAM-03.

Purpose: The public artists page has two stacked sections. Each must be independently filterable by specialty. ArtistsSection encapsulates that chip-filter + grid logic, mirroring PortfolioGrid's approach (RESEARCH Q3). Addresses TEAM-01 and TEAM-03.

Output: src/components/artists/artists-section.tsx — new client component (verbatim from RESEARCH.md code example with minor refinements).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/12-artists-team/12-RESEARCH.md
@.planning/phases/12-artists-team/12-03-SUMMARY.md

<interfaces>
From src/components/portfolio/portfolio-grid.tsx (chip pattern to mirror exactly):
```typescript
const chipBase = "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200"
const chipActive = "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
const chipInactive = "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"

// Chip scroll container:
<div className="flex gap-1 overflow-x-auto pb-2 mt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
```

TeamMember type (after Plan 12-01):
```typescript
type TeamMember = {
  id: string; name: string; slug: string; role: string; bio: string
  photoUrl: string | null; socialLinks: string | null
  kind: "internal" | "collaborator"; specialties: string[]; isFeatured: boolean
  sortOrder: number | null; isActive: boolean; createdAt: Date; updatedAt: Date
}
```

ArtistCard interface (Plan 12-03 output):
```typescript
export function ArtistCard({ member }: { member: TeamMember })
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create ArtistsSection client component with chip filter and responsive grid</name>
  <files>src/components/artists/artists-section.tsx</files>
  <read_first>
    - src/components/portfolio/portfolio-grid.tsx (chip class strings to copy verbatim, scroll container pattern, grid class)
    - src/components/artists/artist-card.tsx (Plan 12-03 output — import path confirmation)
  </read_first>
  <action>
    Create src/components/artists/artists-section.tsx using the verbatim code from RESEARCH.md with these precise additions:

    1. Add aria-pressed attributes to chip buttons (matches PortfolioGrid accessibility)
    2. Change chip scroll container: use `mb-8` instead of `mt-8` to match post-h2 spacing (h2 has mb-6, so chip row adds 8 more before the grid)
    3. Add per-section empty state (RESEARCH Q9)

    ```typescript
    // src/components/artists/artists-section.tsx
    "use client"

    import { useMemo, useState } from "react"
    import clsx from "clsx"
    import { ArtistCard } from "./artist-card"
    import type { TeamMember } from "@/types"

    interface ArtistsSectionProps {
      title: string
      members: TeamMember[]
      className?: string
    }

    export function ArtistsSection({ title, members, className }: ArtistsSectionProps) {
      const [active, setActive] = useState<string | null>(null)

      // Derive unique specialties from all members in this section
      const specialties = useMemo(
        () =>
          Array.from(
            new Set(members.flatMap((m) => m.specialties ?? []))
          ).filter(Boolean),
        [members]
      )

      // Filter members by active specialty chip (null = ALL)
      const filtered = useMemo(
        () =>
          active
            ? members.filter((m) => (m.specialties ?? []).includes(active))
            : members,
        [members, active]
      )

      // Chip classes — verbatim from PortfolioGrid (src/components/portfolio/portfolio-grid.tsx)
      const chipBase =
        "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200"
      const chipActive = "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
      const chipInactive =
        "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"

      return (
        <section className={className}>
          {/* Section header — h2 with count in muted parentheses (Research Pitfall 6) */}
          <h2 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] text-[clamp(20px,3vw,32px)] leading-[1.1] border-b border-[#222222] pb-4 mb-6">
            {title}{" "}
            <span className="text-[#555555]">({members.length})</span>
          </h2>

          {/* Chip filter — only shown when there are specialties in this section */}
          {specialties.length > 0 && (
            <div className="flex gap-1 overflow-x-auto pb-2 mb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setActive(null)}
                className={clsx(chipBase, !active ? chipActive : chipInactive)}
                aria-pressed={!active}
              >
                ALL
              </button>
              {specialties.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActive(s)}
                  className={clsx(chipBase, active === s ? chipActive : chipInactive)}
                  aria-pressed={active === s}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Grid or per-section empty state (Research Q9) */}
          {members.length === 0 ? (
            <p className="text-[#555555] font-sans text-sm py-8">
              Coming soon.
            </p>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-mono font-bold uppercase text-[#f5f5f0] mb-2">
                NO MEMBERS WITH THIS SPECIALTY
              </p>
              <p className="text-[#888888] font-sans text-sm">
                Try a different specialty or tap ALL.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              {filtered.map((m) => (
                <ArtistCard key={m.id} member={m} />
              ))}
            </div>
          )}
        </section>
      )
    }
    ```

    Run typecheck:

    ```bash
    cd /home/faxas/workspaces/projects/personal/glitch_studios && pnpm tsc --noEmit
    ```
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios &amp;&amp; test -f src/components/artists/artists-section.tsx &amp;&amp; grep -q 'ArtistsSection' src/components/artists/artists-section.tsx &amp;&amp; grep -q 'chipBase' src/components/artists/artists-section.tsx &amp;&amp; grep -q 'chipActive' src/components/artists/artists-section.tsx &amp;&amp; grep -q 'aria-pressed' src/components/artists/artists-section.tsx &amp;&amp; grep -q 'members.length === 0' src/components/artists/artists-section.tsx &amp;&amp; grep -q 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' src/components/artists/artists-section.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at src/components/artists/artists-section.tsx
    - grep "ArtistsSection" exits 0 (exported function)
    - grep "chipBase" exits 0 (chip class pattern from PortfolioGrid)
    - grep "aria-pressed" exits 0 (accessibility attribute on chip buttons)
    - grep "members.length === 0" exits 0 (per-section empty state)
    - grep "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" exits 0 (responsive grid)
    - Component uses "use client" directive
    - Component accepts className prop for the COLLABORATORS section's mt-16 pt-8 border-t override
    - pnpm tsc --noEmit exits 0
  </acceptance_criteria>
  <done>ArtistsSection client component created with section h2 + count, specialty chip filter (horizontal-scroll, ALL chip first), per-section empty state, and 1/2/3 col responsive ArtistCard grid. Chips use verbatim PortfolioGrid class strings.</done>
</task>

</tasks>

<verification>
- src/components/artists/artists-section.tsx exists
- grep "ArtistsSection" exits 0
- grep "chipBase" exits 0
- grep "aria-pressed" exits 0
- pnpm tsc --noEmit exits 0
- pnpm lint exits 0
</verification>

<success_criteria>
- ArtistsSection renders a section heading with member count
- Chip filter is only shown when members have specialties
- ALL chip resets filter; specialty chips filter to matching members
- Grid is 1 col mobile, 2 col md, 3 col lg — gap-1 (matches blog/portfolio)
- Per-section empty state shown (not a page-level empty state)
- pnpm tsc --noEmit passes
</success_criteria>

<output>
After completion, create .planning/phases/12-artists-team/12-05-SUMMARY.md documenting:
- The chip class strings used (confirm they match PortfolioGrid exactly)
- The empty-state conditions (members.length === 0 vs filtered.length === 0)
- The className prop usage pattern (for the mt-16 pt-8 border-t override on COLLABORATORS)
- pnpm tsc --noEmit pass/fail
</output>
