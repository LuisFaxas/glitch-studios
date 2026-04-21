---
phase: 11-portfolio
plan: 06
type: execute
wave: 4
depends_on: [11-03, 11-05]
files_modified:
  - src/app/(public)/portfolio/page.tsx
autonomous: true
requirements: [PORT-07]
must_haves:
  truths:
    - "/portfolio renders as Server Component: h1 PORTFOLIO (GlitchHeading) → PortfolioHeroBanner (if featured) → PortfolioGrid with chips + cards"
    - "Server fetches both the full active items list (asc sortOrder) and the featured item (isActive=true AND isFeatured=true limit 1) in parallel"
    - "Featured item IS included in the grid (NOT excluded) per D-08"
    - "When no featured item exists, hero is hidden and the grid renders directly below the chip row"
    - "When no active items exist, the existing 'Portfolio coming soon' fallback renders (preserved from current page)"
    - "PortfolioCarousel component is no longer imported from src/app/(public)/portfolio/page.tsx"
    - "Page h1 uses GlitchHeading with the literal text 'PORTFOLIO' and fluid clamp(28px,5vw,48px) sizing"
  artifacts:
    - path: "src/app/(public)/portfolio/page.tsx"
      provides: "Refactored portfolio index: featured hero + category chip filter + VideoCard grid"
  key_links:
    - from: "src/app/(public)/portfolio/page.tsx"
      to: "src/components/portfolio/portfolio-hero-banner.tsx"
      via: "Renders <PortfolioHeroBanner item={featured} /> above the grid"
      pattern: "PortfolioHeroBanner"
    - from: "src/app/(public)/portfolio/page.tsx"
      to: "src/components/portfolio/portfolio-grid.tsx"
      via: "Renders <PortfolioGrid items={items} /> below the hero"
      pattern: "PortfolioGrid"
    - from: "src/app/(public)/portfolio/page.tsx"
      to: "db.portfolioItems"
      via: "Two Drizzle queries: full active list + featured singleton"
      pattern: "portfolioItems"
---

<objective>
Replace the legacy `PortfolioCarousel` composition on `/portfolio` with the new server-component layout: `h1` → `PortfolioHeroBanner` (featured) → `PortfolioGrid` (chips + card grid). Fetches the items list and the featured item via two Drizzle queries (the featured fetch follows the blog pattern using `eq(isActive, true) AND eq(isFeatured, true) LIMIT 1`).

Purpose: PORT-07 — delivers the refined index layout (D-08, D-09, D-10, D-14) while preserving the existing carousel on the homepage (D-09) and the "Portfolio coming soon" empty-state copy.

Output: A single rewritten `page.tsx` with two DB fetches, three components, and no client-state code.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/11-portfolio/11-CONTEXT.md
@.planning/phases/11-portfolio/11-RESEARCH.md
@.planning/phases/11-portfolio/11-UI-SPEC.md
@.planning/phases/11-portfolio/11-03-SUMMARY.md
@.planning/phases/11-portfolio/11-05-SUMMARY.md

@src/app/(public)/portfolio/page.tsx
@src/app/(public)/blog/page.tsx
@src/components/portfolio/portfolio-hero-banner.tsx
@src/components/portfolio/portfolio-grid.tsx
@src/components/ui/glitch-heading.tsx
@src/db/schema.ts

<interfaces>
<!-- Plan 03 output -->

From src/components/portfolio/portfolio-hero-banner.tsx:
```typescript
interface PortfolioHeroBannerProps { item: PortfolioItem | null }
export function PortfolioHeroBanner(props): JSX.Element | null
```

<!-- Plan 05 output -->

From src/components/portfolio/portfolio-grid.tsx:
```typescript
interface PortfolioGridProps { items: PortfolioItem[] }
export function PortfolioGrid(props): JSX.Element
```

<!-- Drizzle operators used -->

```typescript
import { eq, and, asc } from "drizzle-orm"
// eq(portfolioItems.isActive, true)
// and(eq(portfolioItems.isActive, true), eq(portfolioItems.isFeatured, true))
// .orderBy(asc(portfolioItems.sortOrder))
```

<!-- Existing empty-state copy (preserve verbatim) -->

From current page.tsx:
```typescript
// Heading: "Portfolio coming soon"
// Body: "We are curating our best work. Check back shortly."
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Rewrite /portfolio page to use hero + grid composition</name>
  <files>src/app/(public)/portfolio/page.tsx</files>
  <read_first>
    - src/app/(public)/portfolio/page.tsx (current file — note `force-dynamic`, metadata, empty-state copy to preserve)
    - src/app/(public)/blog/page.tsx (twin composition: Suspense fallback is not used here because filter state is client-only; just compose server-side)
    - src/components/portfolio/portfolio-hero-banner.tsx (Plan 03 — prop: `item: PortfolioItem | null`)
    - src/components/portfolio/portfolio-grid.tsx (Plan 05 — prop: `items: PortfolioItem[]`)
    - src/components/ui/glitch-heading.tsx (confirm `<GlitchHeading text="PORTFOLIO">PORTFOLIO</GlitchHeading>` pattern — see `src/app/(public)/blog/page.tsx` line 85 for exact match)
    - .planning/phases/11-portfolio/11-CONTEXT.md (D-08 composition; D-10 zero-feature fallback)
    - .planning/phases/11-portfolio/11-UI-SPEC.md (Typography: page h1 `clamp(28px, 5vw, 48px)`; Copywriting: page h1 literal "PORTFOLIO")
  </read_first>
  <action>
    REPLACE the full contents of `src/app/(public)/portfolio/page.tsx` with:

    ```typescript
    export const dynamic = "force-dynamic"

    import { db } from "@/lib/db"
    import { portfolioItems } from "@/db/schema"
    import { eq, and, asc } from "drizzle-orm"
    import { PortfolioHeroBanner } from "@/components/portfolio/portfolio-hero-banner"
    import { PortfolioGrid } from "@/components/portfolio/portfolio-grid"
    import { GlitchHeading } from "@/components/ui/glitch-heading"
    import type { Metadata } from "next"

    export const metadata: Metadata = {
      title: "Portfolio",
      description:
        "Video production, music videos, and creative work from Glitch Studios.",
    }

    export default async function PortfolioPage() {
      // Parallel fetch: full active list + featured singleton
      const [items, featuredRows] = await Promise.all([
        db
          .select()
          .from(portfolioItems)
          .where(eq(portfolioItems.isActive, true))
          .orderBy(asc(portfolioItems.sortOrder)),
        db
          .select()
          .from(portfolioItems)
          .where(
            and(
              eq(portfolioItems.isActive, true),
              eq(portfolioItems.isFeatured, true)
            )
          )
          .limit(1),
      ])

      // Zero-items fallback (preserved copy from v1 implementation)
      if (items.length === 0) {
        return (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <h1 className="font-mono font-bold text-4xl uppercase mb-4 text-[#f5f5f0]">
              Portfolio coming soon
            </h1>
            <p className="text-[#888888] text-lg">
              We are curating our best work. Check back shortly.
            </p>
          </div>
        )
      }

      // D-10: hero hides when no featured item; grid still renders
      const featured = featuredRows[0] ?? null

      return (
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <h1 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]">
            <GlitchHeading text="PORTFOLIO">PORTFOLIO</GlitchHeading>
          </h1>
          {featured && (
            <div className="mt-8">
              <PortfolioHeroBanner item={featured} />
            </div>
          )}
          {/* D-08: featured item is NOT excluded from the grid — it appears in both */}
          <PortfolioGrid items={items} />
        </div>
      )
    }
    ```

    Non-negotiable concrete values:
    - PRESERVE: `export const dynamic = "force-dynamic"` (Pitfall 3).
    - PRESERVE: `metadata` export with exact title/description strings from current file.
    - PRESERVE: zero-items fallback heading `Portfolio coming soon` + body copy `We are curating our best work. Check back shortly.` (existing v1 UX is acceptable for this edge case).
    - REMOVE: `import { PortfolioCarousel } from "@/components/portfolio/portfolio-carousel"` — legacy carousel no longer wired here.
    - ADD: `Promise.all` for the two DB queries (parallelism — cheaper than sequential awaits).
    - Featured query: `and(eq(isActive, true), eq(isFeatured, true))` — matches D-08 specifics.
    - Featured is `featuredRows[0] ?? null` — pass null-or-item to PortfolioHeroBanner so its internal guard handles the empty case (D-10).
    - Grid items: pass the FULL `items` array (NOT `items.filter(i => !i.isFeatured)`) — D-08 explicit: "The featured item is NOT excluded from the grid".
    - Page h1 classes: `font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]` — mirrors blog page h1 (src/app/(public)/blog/page.tsx line 117).
    - Page h1 wrapped as `<GlitchHeading text="PORTFOLIO">PORTFOLIO</GlitchHeading>` — literal string `PORTFOLIO` per UI-SPEC Copywriting Contract (NOT `Our Work` — that copy is retired).
    - Wrapper `<div className="max-w-7xl mx-auto px-4 py-16 md:py-24">` — same as current file + matches blog.
    - Hero wrapped in `<div className="mt-8">` for spacing consistency with blog page.
  </action>
  <verify>
    <automated>grep -q 'export const dynamic = "force-dynamic"' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'import { PortfolioHeroBanner }' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'import { PortfolioGrid }' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'import { GlitchHeading }' src/app/\(public\)/portfolio/page.tsx &amp;&amp; ! grep -q 'PortfolioCarousel' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'Promise.all' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'eq(portfolioItems.isFeatured, true)' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'asc(portfolioItems.sortOrder)' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'featuredRows\[0\] ?? null' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'GlitchHeading text="PORTFOLIO"' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'text-\[clamp(28px,5vw,48px)\]' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'Portfolio coming soon' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'PortfolioGrid items={items}' src/app/\(public\)/portfolio/page.tsx &amp;&amp; grep -q 'PortfolioHeroBanner item={featured}' src/app/\(public\)/portfolio/page.tsx &amp;&amp; pnpm tsc --noEmit &amp;&amp; pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - `src/app/(public)/portfolio/page.tsx` contains `export const dynamic = "force-dynamic"` (preserved)
    - Imports `PortfolioHeroBanner` from `@/components/portfolio/portfolio-hero-banner`
    - Imports `PortfolioGrid` from `@/components/portfolio/portfolio-grid`
    - Imports `GlitchHeading` from `@/components/ui/glitch-heading`
    - Does NOT import `PortfolioCarousel` (grep must NOT match)
    - Uses `Promise.all` for parallel DB fetches
    - Featured query uses `and(eq(portfolioItems.isActive, true), eq(portfolioItems.isFeatured, true))` AND `.limit(1)`
    - Full list query uses `eq(portfolioItems.isActive, true)` AND `.orderBy(asc(portfolioItems.sortOrder))`
    - `featured` variable assigned via `featuredRows[0] ?? null`
    - Page h1 wrapped as `<GlitchHeading text="PORTFOLIO">PORTFOLIO</GlitchHeading>`
    - Page h1 classes include literal `text-[clamp(28px,5vw,48px)]`
    - Zero-items fallback still renders literal `Portfolio coming soon` (preserved copy)
    - Grid receives the FULL `items` array (NOT filtered; grep finds literal `PortfolioGrid items={items}` — any filtering would break this match)
    - Hero prop is `item={featured}`
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0 (or warnings-only)
  </acceptance_criteria>
  <done>/portfolio renders h1 + optional hero + filter chips + card grid as a clean server composition. Legacy carousel import removed. Featured item fetches in parallel with the full list. Empty-state copy preserved.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- `/portfolio` loads and shows: h1 "PORTFOLIO" (hover-glitch works) → chip row (ALL + dynamic categories) → hero (only if a row has `is_featured=true`) → grid of VideoCards
- Homepage "Our Work" section still renders (it uses its own `src/components/home/video-portfolio-carousel.tsx` — unaffected by this change; verify manually or via Playwright in Plan 07)
- Manually test `is_featured` toggle: without a featured row, page has no hero; adding one makes the hero appear
</verification>

<success_criteria>
- Page composition matches Phase 10 blog pattern exactly (h1 + GlitchHeading, hero, grid)
- Featured fetch uses the correct Drizzle expression (`and(eq isActive, eq isFeatured).limit(1)`)
- Full list still ordered by `asc(sortOrder)` (matches prev/next navigation from Plan 01)
- Featured item is NOT excluded from the grid (D-08)
- PortfolioCarousel import removed from this file (dead-code cleanup tracked in Plan 07 verification)
- Zero-items empty-state preserved
</success_criteria>

<output>
After completion, create `.planning/phases/11-portfolio/11-06-SUMMARY.md` documenting:
- The exact Drizzle query for the featured fetch
- Confirmation that Promise.all is used for parallel fetch
- Confirmation that PortfolioCarousel is no longer imported
- Any Tailwind class ordering changes after lint
- Whether the legacy `src/components/portfolio/portfolio-carousel.tsx` file is left in place or deleted (Plan 07 verifies no remaining imports sitewide; deletion is optional — the file becomes orphaned and safe to remove in a later cleanup pass)
</output>
