---
phase: 11-portfolio
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/portfolio/get-portfolio-neighbors.ts
  - src/components/portfolio/prev-next-footer.tsx
  - src/components/portfolio/video-detail-layout.tsx
  - src/components/portfolio/portfolio-detail-layout.tsx
  - src/app/(public)/portfolio/[slug]/page.tsx
autonomous: true
requirements: [PORT-06]
must_haves:
  truths:
    - "On /portfolio/[slug] a sticky footer is visible at the bottom of the viewport with a PREV link on the left and a NEXT link on the right"
    - "Pressing the Left Arrow key on desktop navigates to the previous portfolio item; Right Arrow navigates to the next"
    - "Horizontal swipe on mobile (>60px, horizontal-dominant) navigates prev/next; vertical scroll is preserved"
    - "Last item's NEXT loops to the first item; first item's PREV loops to the last item (wrap-around)"
    - "When item.type === 'video' the detail page renders a minimal single-column layout (no case-study sections); when item.type === 'case_study' the existing CaseStudyContent renders unchanged"
    - "Case-study layout from case-study-content.tsx is preserved verbatim (only wrapped, not rewritten)"
    - "Neighbor resolution uses react.cache() so repeated calls within a request hit DB once"
  artifacts:
    - path: "src/lib/portfolio/get-portfolio-neighbors.ts"
      provides: "Cached Drizzle query returning { prev, next } neighbors for a given slug, with wrap-around"
      exports: ["getActivePortfolioSlugList", "getPortfolioNeighbors"]
    - path: "src/components/portfolio/prev-next-footer.tsx"
      provides: "Sticky footer with keyboard + swipe + click navigation"
      exports: ["PrevNextFooter"]
    - path: "src/components/portfolio/video-detail-layout.tsx"
      provides: "Minimal single-column detail layout for type === 'video' items"
      exports: ["VideoDetailLayout"]
    - path: "src/components/portfolio/portfolio-detail-layout.tsx"
      provides: "Wrapper that composes content + sticky PrevNextFooter + swipe gesture target"
      exports: ["PortfolioDetailLayout"]
    - path: "src/app/(public)/portfolio/[slug]/page.tsx"
      provides: "Detail route that branches on item.type and wires neighbors into PortfolioDetailLayout"
  key_links:
    - from: "src/app/(public)/portfolio/[slug]/page.tsx"
      to: "src/lib/portfolio/get-portfolio-neighbors.ts"
      via: "Server-side call to getPortfolioNeighbors(slug)"
      pattern: "getPortfolioNeighbors"
    - from: "src/app/(public)/portfolio/[slug]/page.tsx"
      to: "src/components/portfolio/portfolio-detail-layout.tsx"
      via: "Wraps CaseStudyContent or VideoDetailLayout with PortfolioDetailLayout and passes neighbors"
      pattern: "PortfolioDetailLayout"
    - from: "src/components/portfolio/portfolio-detail-layout.tsx"
      to: "src/components/portfolio/prev-next-footer.tsx"
      via: "Renders PrevNextFooter with resolved neighbors"
      pattern: "PrevNextFooter"
    - from: "src/components/portfolio/prev-next-footer.tsx"
      to: "next/navigation useRouter().push"
      via: "Keyboard handler pushes /portfolio/{prev|next.slug}"
      pattern: "router.push"
---

<objective>
Deliver PORT-06 end-to-end: prev/next navigation on /portfolio/[slug] with keyboard (← / →), mobile swipe (≥60px horizontal-dominant), click navigation, wrap-around at list ends, and type-branching so both case_study and video items route to a coherent detail view.

Purpose: Visitors browse fluidly between portfolio items without returning to the grid (ROADMAP Phase 11 success criterion 1). Every active portfolio item has a working detail destination (D-05).

Output:
- New cached neighbor helper (src/lib/portfolio/get-portfolio-neighbors.ts)
- New PrevNextFooter client component (sticky, keyboard + swipe + click)
- New VideoDetailLayout (minimal type === 'video' layout per D-05)
- New PortfolioDetailLayout wrapper (owns swipe target + sticky footer)
- Refactored /portfolio/[slug]/page.tsx that branches on item.type and wires neighbors
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

@src/app/(public)/portfolio/[slug]/page.tsx
@src/components/portfolio/case-study-content.tsx
@src/lib/reading-time.ts
@src/lib/get-booking-live.ts
@src/db/schema.ts

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From src/types/index.ts:
```typescript
import type { InferSelectModel } from "drizzle-orm"
import { portfolioItems } from "@/db/schema"
export type PortfolioItem = InferSelectModel<typeof portfolioItems>
```

From src/db/schema.ts (portfolioItems fields used this plan):
```typescript
{
  id: uuid
  title: text notNull
  slug: text notNull unique
  type: text notNull          // values: "case_study" | "video"
  category: text nullable
  description: text nullable
  thumbnailUrl: text nullable
  videoUrl: text nullable
  isYouTubeEmbed: boolean default true
  clientName: text nullable
  challenge: text nullable
  approach: text nullable
  result: text nullable
  sortOrder: integer default 0
  isActive: boolean default true
  isFeatured: boolean default false
  createdAt: timestamp notNull
}
```

From src/lib/get-booking-live.ts — reference pattern for react.cache() + Drizzle:
```typescript
import { cache } from "react"
// cached helper exported at module scope; used by multiple server components
```

Existing CaseStudyContent signature (preserve verbatim per D-07):
```typescript
// src/components/portfolio/case-study-content.tsx
export function CaseStudyContent({ item }: { item: PortfolioItem }): JSX.Element
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create cached neighbor helper</name>
  <files>src/lib/portfolio/get-portfolio-neighbors.ts</files>
  <read_first>
    - src/lib/get-booking-live.ts (reference react.cache() + Drizzle pattern in this codebase)
    - src/lib/reading-time.ts (confirms `import { cache } from "react"` pattern + "server-only" import)
    - src/db/schema.ts (lines 122-141 — portfolioItems columns, confirm isActive + sortOrder + slug + title exist)
    - src/app/(public)/portfolio/page.tsx (confirms the existing eq(isActive, true) / asc(sortOrder) query pattern that this helper must match)
    - .planning/phases/11-portfolio/11-RESEARCH.md (Pattern 2 "Server-Cached Neighbor Resolution", Pitfall 7 "Prev/next wraparound with only one active item")
  </read_first>
  <action>
    Create `src/lib/portfolio/get-portfolio-neighbors.ts` with this exact content:

    ```typescript
    import "server-only"
    import { cache } from "react"
    import { db } from "@/lib/db"
    import { portfolioItems } from "@/db/schema"
    import { eq, asc } from "drizzle-orm"

    export type PortfolioNeighbor = {
      slug: string
      title: string
    }

    /**
     * Cached list of every active portfolio item's slug+title, ordered by
     * asc(sortOrder) — same ordering as the index page. react.cache() dedupes
     * repeat calls within a single server request.
     */
    export const getActivePortfolioSlugList = cache(
      async (): Promise<PortfolioNeighbor[]> => {
        return db
          .select({
            slug: portfolioItems.slug,
            title: portfolioItems.title,
          })
          .from(portfolioItems)
          .where(eq(portfolioItems.isActive, true))
          .orderBy(asc(portfolioItems.sortOrder))
      }
    )

    /**
     * Resolve prev/next neighbors for a given slug with wrap-around (D-03).
     * Returns null when the list has fewer than 2 items (nothing to navigate to,
     * prevents prev === next === current, Pitfall 7) or when the slug isn't found.
     */
    export async function getPortfolioNeighbors(
      currentSlug: string
    ): Promise<{ prev: PortfolioNeighbor; next: PortfolioNeighbor } | null> {
      const list = await getActivePortfolioSlugList()
      if (list.length < 2) return null

      const idx = list.findIndex((item) => item.slug === currentSlug)
      if (idx === -1) return null

      // Modulo wrap-around per D-03 (mirrors Embla looping on the homepage carousel)
      const prev = list[(idx - 1 + list.length) % list.length]
      const next = list[(idx + 1) % list.length]
      return { prev, next }
    }
    ```

    Notes:
    - `import "server-only"` is the first line (matches src/lib/reading-time.ts pattern). Prevents accidental client-bundle import.
    - `export const` at module scope so react.cache() dedupes across multiple server components within the same request.
    - Returns `null` when `list.length < 2` per Pitfall 7 — caller then skips rendering PrevNextFooter.
    - No try/catch — let DB errors bubble to Next.js error boundary (matches existing patterns in src/lib/get-booking-live.ts).
  </action>
  <verify>
    <automated>test -f src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; grep -q '^import "server-only"' src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; grep -q 'import { cache } from "react"' src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; grep -q 'export const getActivePortfolioSlugList = cache' src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; grep -q 'export async function getPortfolioNeighbors' src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; grep -q 'asc(portfolioItems.sortOrder)' src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; grep -q 'eq(portfolioItems.isActive, true)' src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; grep -q 'if (list.length &lt; 2) return null' src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; grep -q '(idx - 1 + list.length) % list.length' src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; grep -q '(idx + 1) % list.length' src/lib/portfolio/get-portfolio-neighbors.ts &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `src/lib/portfolio/get-portfolio-neighbors.ts`
    - First line is exactly `import "server-only"`
    - Imports `cache` from `"react"` (grep: `import { cache } from "react"`)
    - Imports `db` from `@/lib/db` and `portfolioItems` from `@/db/schema`
    - Imports `eq, asc` from `drizzle-orm`
    - Exports `getActivePortfolioSlugList` as `export const ... = cache(async () => ...)` (grep: `export const getActivePortfolioSlugList = cache`)
    - Exports `getPortfolioNeighbors` as an async function
    - Query uses `eq(portfolioItems.isActive, true)` and `asc(portfolioItems.sortOrder)`
    - Query selects only `{ slug, title }` (not `select().from()` — verify via grep: `select({` followed by both `slug: portfolioItems.slug` and `title: portfolioItems.title`)
    - Contains the single-item guard literal `if (list.length &lt; 2) return null` (or `list.length < 2`)
    - Contains the wrap-around formulas `(idx - 1 + list.length) % list.length` and `(idx + 1) % list.length`
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Server-only cached helper exports getActivePortfolioSlugList and getPortfolioNeighbors. Wrap-around math handles both directions. Single-item fallback returns null.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create PrevNextFooter client component</name>
  <files>src/components/portfolio/prev-next-footer.tsx</files>
  <read_first>
    - src/components/portfolio/case-study-content.tsx (confirms existing ArrowLeft from lucide-react pattern used on the back-link; match icon usage)
    - .planning/phases/11-portfolio/11-CONTEXT.md (D-01 palette/copy rules, D-04 keyboard behavior)
    - .planning/phases/11-portfolio/11-UI-SPEC.md (Color section: `bg-[#111111] border-t border-[#222222] text-[#f5f5f0]`; Typography section: 13px mono bold titles on desktop; Copywriting Contract for ← PREV / NEXT → labels and arrows-only mobile fallback)
    - .planning/phases/11-portfolio/11-RESEARCH.md (Pattern 3 "Client Component with Keyboard + Swipe + Click", Pitfall 1 "Keyboard nav fires in input")
    - src/lib/portfolio/get-portfolio-neighbors.ts (Task 1 output — PortfolioNeighbor type to import)
  </read_first>
  <action>
    Create `src/components/portfolio/prev-next-footer.tsx` with this exact content:

    ```typescript
    "use client"

    import { useEffect } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { ArrowLeft, ArrowRight } from "lucide-react"
    import type { PortfolioNeighbor } from "@/lib/portfolio/get-portfolio-neighbors"

    interface PrevNextFooterProps {
      prev: PortfolioNeighbor
      next: PortfolioNeighbor
    }

    /**
     * Sticky prev/next navigation footer on /portfolio/[slug].
     * Implements D-01 (visual), D-03 (wrap-around via prop inputs), D-04 (keyboard).
     *
     * Mobile swipe is handled by PortfolioDetailLayout (the swipe target wraps
     * more DOM than this footer). This component owns keyboard + click only.
     *
     * z-40 keeps it below the global player bar (typically z-50) — Pitfall 5 /
     * RESEARCH Open Question 5.
     */
    export function PrevNextFooter({ prev, next }: PrevNextFooterProps) {
      const router = useRouter()

      useEffect(() => {
        function onKey(e: KeyboardEvent) {
          // Pitfall 1: ignore if user is typing in a form field or contenteditable
          const target = e.target as HTMLElement | null
          if (target) {
            const tag = target.tagName
            if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
              return
            }
          }
          // Don't hijack modifier combos (macOS Cmd+← / Alt+← = browser back)
          if (e.metaKey || e.ctrlKey || e.altKey) return

          if (e.key === "ArrowLeft") {
            router.push(`/portfolio/${prev.slug}`)
          } else if (e.key === "ArrowRight") {
            router.push(`/portfolio/${next.slug}`)
          }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
      }, [prev.slug, next.slug, router])

      return (
        <nav
          aria-label="Portfolio navigation"
          className="sticky bottom-0 z-40 bg-[#111111] border-t border-[#222222] text-[#f5f5f0]"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-4 md:py-6 flex items-center justify-between gap-4">
            <Link
              href={`/portfolio/${prev.slug}`}
              aria-label={`Previous portfolio item: ${prev.title}`}
              className="group flex items-center gap-2 min-w-0 hover:text-[#f5f5f0]/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline font-mono text-[13px] font-bold uppercase tracking-wide truncate">
                PREV · {prev.title}
              </span>
            </Link>
            <Link
              href={`/portfolio/${next.slug}`}
              aria-label={`Next portfolio item: ${next.title}`}
              className="group flex items-center gap-2 min-w-0 justify-end hover:text-[#f5f5f0]/80 transition-colors"
            >
              <span className="hidden md:inline font-mono text-[13px] font-bold uppercase tracking-wide truncate">
                {next.title} · NEXT
              </span>
              <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      )
    }
    ```

    Concrete values (non-negotiable):
    - Root classes: `sticky bottom-0 z-40 bg-[#111111] border-t border-[#222222] text-[#f5f5f0]` — palette-locked per UI-SPEC Color section.
    - Inner container: `max-w-7xl mx-auto px-4 md:px-12 py-4 md:py-6 flex items-center justify-between gap-4`.
    - Title labels: hidden on mobile (`hidden md:inline`) — mobile collapses to arrows-only per D-01.
    - Icon size: `w-5 h-5` using ArrowLeft / ArrowRight from lucide-react (already installed and used on case-study-content.tsx back-link).
    - Keyboard listener attaches to `window` inside a single useEffect; cleanup in the return.
    - Keyboard listener checks e.target.tagName against "INPUT" / "TEXTAREA" AND `isContentEditable` before firing (Pitfall 1).
    - Modifier-key early-return (`e.metaKey || e.ctrlKey || e.altKey`) so browser shortcuts keep working.
    - aria-label on each Link ("Previous portfolio item: {title}" / "Next portfolio item: {title}").
    - aria-label on the nav ("Portfolio navigation").
  </action>
  <verify>
    <automated>test -f src/components/portfolio/prev-next-footer.tsx &amp;&amp; head -1 src/components/portfolio/prev-next-footer.tsx | grep -q '^"use client"' &amp;&amp; grep -q 'export function PrevNextFooter' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'ArrowLeft' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'ArrowRight' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'sticky bottom-0 z-40 bg-\[#111111\] border-t border-\[#222222\] text-\[#f5f5f0\]' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'useRouter' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'ArrowLeft' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'e.key === "ArrowLeft"' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'e.key === "ArrowRight"' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'tag === "INPUT"' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'isContentEditable' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'e.metaKey' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'aria-label="Portfolio navigation"' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'hidden md:inline' src/components/portfolio/prev-next-footer.tsx &amp;&amp; grep -q 'PortfolioNeighbor' src/components/portfolio/prev-next-footer.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `src/components/portfolio/prev-next-footer.tsx`
    - First line is `"use client"` (grep on line 1)
    - Named export `PrevNextFooter` with props `{ prev: PortfolioNeighbor; next: PortfolioNeighbor }`
    - Imports `PortfolioNeighbor` from `@/lib/portfolio/get-portfolio-neighbors`
    - Imports `useRouter` from `next/navigation`
    - Imports `ArrowLeft` and `ArrowRight` from `lucide-react`
    - Imports `Link` from `next/link` and uses `<Link href={`/portfolio/${prev.slug}`}>` and `<Link href={`/portfolio/${next.slug}`}>` (BOTH as Link elements, not just router.push)
    - Root `<nav>` contains exact classes `sticky bottom-0 z-40 bg-[#111111] border-t border-[#222222] text-[#f5f5f0]`
    - Inner container uses `max-w-7xl mx-auto px-4 md:px-12 py-4 md:py-6 flex items-center justify-between gap-4`
    - Title text nodes use `hidden md:inline` so mobile collapses to arrows-only (D-01)
    - Keyboard handler checks `e.key === "ArrowLeft"` and `e.key === "ArrowRight"`
    - Keyboard handler early-returns if target tagName is `INPUT` or `TEXTAREA` (literal strings)
    - Keyboard handler checks `isContentEditable`
    - Keyboard handler checks at least one of `e.metaKey`, `e.ctrlKey`, `e.altKey` and early-returns
    - `aria-label="Portfolio navigation"` on `<nav>`
    - `aria-label` on both prev Link (contains "Previous portfolio item") and next Link (contains "Next portfolio item")
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>PrevNextFooter sticks to bottom with z-40, shows arrows on mobile and arrows+title on desktop, wires keyboard ← / → with modifier-safe handling, links are real Next.js Link elements.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Create VideoDetailLayout</name>
  <files>src/components/portfolio/video-detail-layout.tsx</files>
  <read_first>
    - src/components/portfolio/case-study-content.tsx (extractYouTubeId helper + hero media + back link pattern — replicate structure for consistency, drop the 4-section block)
    - src/components/ui/glitch-heading.tsx (confirm API: does it accept children only, or text + children?)
    - .planning/phases/11-portfolio/11-CONTEXT.md (D-05: video layout is "minimal single-column: embedded player, title, category pill, description, metadata row with year + client if present")
    - .planning/phases/11-portfolio/11-UI-SPEC.md (Interaction Contract "Video detail minimal layout" row; Color palette)
  </read_first>
  <action>
    Create `src/components/portfolio/video-detail-layout.tsx` with this exact content:

    ```typescript
    "use client"

    import { useState } from "react"
    import Link from "next/link"
    import { ArrowLeft, Play } from "lucide-react"
    import { GlitchHeading } from "@/components/ui/glitch-heading"
    import type { PortfolioItem } from "@/types"

    function extractYouTubeId(url: string): string | null {
      const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      )
      return match ? match[1] : null
    }

    /**
     * Minimal single-column detail layout for items with type === "video" (D-05).
     * Structure: embedded YouTube player (click-to-play), back link, title (GlitchHeading),
     * category pill, description, metadata row (year + client if present).
     * Does NOT render case-study sections (client/challenge/approach/result).
     */
    export function VideoDetailLayout({ item }: { item: PortfolioItem }) {
      const [playing, setPlaying] = useState(false)
      const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null
      const year = item.createdAt ? new Date(item.createdAt).getFullYear() : null

      return (
        <div>
          {/* Hero media — same pattern as case-study-content.tsx */}
          <div className="relative aspect-video max-h-[70vh] w-full bg-[#111111]">
            {playing && videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <>
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : videoId ? (
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#111111]" />
                )}
                {videoId && (
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label={`Play ${item.title}`}
                  >
                    <div className="w-20 h-20 rounded-none bg-[#000000]/60 hover:bg-[#000000]/80 border border-[#222222] flex items-center justify-center transition-colors">
                      <Play className="w-8 h-8 text-[#f5f5f0] ml-1" fill="#f5f5f0" />
                    </div>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Text body — single column, no case-study sections */}
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-[#888888] hover:text-[#f5f5f0] transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-mono">Back to Portfolio</span>
            </Link>

            <h1 className="font-mono font-bold text-4xl md:text-5xl uppercase tracking-tight mb-4 text-[#f5f5f0]">
              <GlitchHeading text={item.title}>{item.title}</GlitchHeading>
            </h1>

            {item.category && (
              <span className="inline-block bg-[#222222] text-[#888888] text-[11px] font-sans px-2 py-1 rounded-none mb-6">
                {item.category}
              </span>
            )}

            {item.description && (
              <p className="text-[#f5f5f0] leading-relaxed text-lg mb-8">
                {item.description}
              </p>
            )}

            {/* Metadata row: type chip + year + client (if present) */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#222222]">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888] bg-[#0a0a0a] px-2 py-1">
                VIDEO
              </span>
              {year && (
                <>
                  <span className="text-[#555555]" aria-hidden="true">·</span>
                  <time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                    {year}
                  </time>
                </>
              )}
              {item.clientName && (
                <>
                  <span className="text-[#555555]" aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                    {item.clientName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }
    ```

    Concrete values (non-negotiable):
    - File has `"use client"` on line 1 — same as case-study-content.tsx (needs useState for play toggle).
    - Embed URL format: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` (matches case-study-content.tsx; DO NOT add `mute=1` — autoplay on video detail page is explicitly Claude's discretion per RESEARCH Open Question 2, default is no autoplay via click-to-play).
    - Title wrapped in `<GlitchHeading text={item.title}>{item.title}</GlitchHeading>` — the literal prop pattern used in blog-hero-banner.tsx and post-card.tsx.
    - Type chip uses `bg-[#0a0a0a]` (distinguishable from category's `bg-[#222222]` per UI-SPEC "type chip treatment" + CONTEXT.md D-11).
    - Metadata row is separated from description by `border-t border-[#222222] pt-6` (bottom-padding safe; sticky-footer container adds pb-24 in Task 4).
    - All colors from locked palette: `#000000, #0a0a0a, #111111, #222222, #f5f5f0, #888888, #555555`.
  </action>
  <verify>
    <automated>test -f src/components/portfolio/video-detail-layout.tsx &amp;&amp; head -1 src/components/portfolio/video-detail-layout.tsx | grep -q '^"use client"' &amp;&amp; grep -q 'export function VideoDetailLayout' src/components/portfolio/video-detail-layout.tsx &amp;&amp; grep -q 'GlitchHeading' src/components/portfolio/video-detail-layout.tsx &amp;&amp; grep -q 'extractYouTubeId' src/components/portfolio/video-detail-layout.tsx &amp;&amp; grep -q 'Back to Portfolio' src/components/portfolio/video-detail-layout.tsx &amp;&amp; grep -q 'VIDEO' src/components/portfolio/video-detail-layout.tsx &amp;&amp; grep -q 'bg-\[#0a0a0a\]' src/components/portfolio/video-detail-layout.tsx &amp;&amp; ! grep -q 'challenge\|approach\|result\|clientName.*Section' src/components/portfolio/video-detail-layout.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `src/components/portfolio/video-detail-layout.tsx`
    - Line 1 is `"use client"`
    - Named export `VideoDetailLayout` accepting `{ item: PortfolioItem }`
    - Imports `PortfolioItem` from `@/types`
    - Imports `GlitchHeading` from `@/components/ui/glitch-heading`
    - Title renders inside `<GlitchHeading text={item.title}>{item.title}</GlitchHeading>`
    - Includes `extractYouTubeId` helper function
    - Contains YouTube embed URL pattern `youtube.com/embed/${videoId}?autoplay=1&rel=0`
    - Contains "Back to Portfolio" link pointing to `/portfolio`
    - Type chip renders literal text `VIDEO` (uppercase) with classes including `bg-[#0a0a0a]`
    - Does NOT render case-study section titles (grep must NOT find "The Client", "The Challenge", "Our Approach", "The Result" as headings, nor a `Section` helper component)
    - All hex values fall within the locked palette (no color audit automated — reviewer verifies; but grep must NOT match any `#f` hex other than `#f5f5f0`; executor confirms manually)
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>VideoDetailLayout renders a minimal single-column detail view for type === 'video' items with hero media + click-to-play, GlitchHeading title, back link, category pill, description, and a type+year+client metadata row.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Create PortfolioDetailLayout wrapper with swipe gesture</name>
  <files>src/components/portfolio/portfolio-detail-layout.tsx</files>
  <read_first>
    - src/components/portfolio/prev-next-footer.tsx (Task 2 output — to know PrevNextFooter's exact prop shape)
    - src/lib/portfolio/get-portfolio-neighbors.ts (Task 1 output — PortfolioNeighbor type)
    - .planning/phases/11-portfolio/11-CONTEXT.md (D-04 swipe rules; "touch-action: pan-y" requirement)
    - .planning/phases/11-portfolio/11-RESEARCH.md (Pattern 4 "Mobile Swipe Gesture with Preserved Vertical Scroll" — threshold 60px, horizontal-dominant check; Pitfall 2 touch-action; Pitfall 5 pb-24)
  </read_first>
  <action>
    Create `src/components/portfolio/portfolio-detail-layout.tsx` with this exact content:

    ```typescript
    "use client"

    import { useRef, type ReactNode } from "react"
    import { useRouter } from "next/navigation"
    import { PrevNextFooter } from "./prev-next-footer"
    import type { PortfolioNeighbor } from "@/lib/portfolio/get-portfolio-neighbors"

    interface PortfolioDetailLayoutProps {
      neighbors: { prev: PortfolioNeighbor; next: PortfolioNeighbor } | null
      children: ReactNode
    }

    // Swipe threshold per Claude's discretion (CONTEXT.md) + RESEARCH Pattern 4
    const SWIPE_THRESHOLD_PX = 60

    /**
     * Wrapper for /portfolio/[slug] content. Provides:
     *   - Bottom padding so the sticky footer doesn't overlap final content (Pitfall 5)
     *   - Mobile swipe gesture target with touch-action: pan-y (Pitfall 2)
     *   - Sticky PrevNextFooter at the bottom (D-01)
     *
     * When neighbors is null (fewer than 2 active items, Pitfall 7), renders
     * children with the bottom padding and swipe wrapper but WITHOUT the footer.
     */
    export function PortfolioDetailLayout({
      neighbors,
      children,
    }: PortfolioDetailLayoutProps) {
      const router = useRouter()
      const touchStart = useRef<{ x: number; y: number } | null>(null)

      function handleTouchStart(e: React.TouchEvent) {
        const t = e.touches[0]
        touchStart.current = { x: t.clientX, y: t.clientY }
      }

      function handleTouchEnd(e: React.TouchEvent) {
        if (!neighbors || !touchStart.current) return
        const t = e.changedTouches[0]
        const dx = t.clientX - touchStart.current.x
        const dy = t.clientY - touchStart.current.y
        touchStart.current = null

        if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
        // Horizontal-dominant check — if vertical motion is larger, treat as scroll
        if (Math.abs(dx) < Math.abs(dy)) return

        if (dx > 0) {
          router.push(`/portfolio/${neighbors.prev.slug}`)
        } else {
          router.push(`/portfolio/${neighbors.next.slug}`)
        }
      }

      return (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          {/* pb-24 (96px) = sticky-footer height (~72px on desktop, ~56px on mobile) + breathing room */}
          <div className="pb-24">
            {children}
          </div>
          {neighbors && (
            <PrevNextFooter prev={neighbors.prev} next={neighbors.next} />
          )}
        </div>
      )
    }
    ```

    Concrete values (non-negotiable):
    - `SWIPE_THRESHOLD_PX = 60` — module constant (matches RESEARCH Pattern 4 recommendation).
    - Horizontal-dominant guard: `Math.abs(dx) < Math.abs(dy)` returns early — prevents vertical scroll being interpreted as swipe (Pitfall 2).
    - Swipe right (`dx > 0`) navigates to PREV; swipe left (`dx < 0`) navigates to NEXT — matches the universal "swipe content in the direction you want it to move" mental model.
    - `style={{ touchAction: "pan-y" }}` on the wrapper — inline style, not a Tailwind arbitrary class, because Tailwind v4 `touch-pan-y` may not be declared (safer as inline).
    - Inner content wrapper has `pb-24` (96px) — prevents sticky footer from overlapping last paragraph (Pitfall 5).
    - When `neighbors === null`, the footer is NOT rendered; content still gets pb-24 + swipe wrapper (swipe gesture becomes a no-op because the guard `if (!neighbors || !touchStart.current) return` early-exits).
  </action>
  <verify>
    <automated>test -f src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; head -1 src/components/portfolio/portfolio-detail-layout.tsx | grep -q '^"use client"' &amp;&amp; grep -q 'export function PortfolioDetailLayout' src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; grep -q 'SWIPE_THRESHOLD_PX = 60' src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; grep -q 'touchAction: "pan-y"' src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; grep -q 'Math.abs(dx) &lt; Math.abs(dy)' src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; grep -q 'pb-24' src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; grep -q 'PrevNextFooter' src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; grep -q 'neighbors &amp;&amp;' src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; grep -q 'handleTouchStart' src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; grep -q 'handleTouchEnd' src/components/portfolio/portfolio-detail-layout.tsx &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `src/components/portfolio/portfolio-detail-layout.tsx`
    - Line 1 is `"use client"`
    - Named export `PortfolioDetailLayout` with props `{ neighbors: { prev, next } | null; children: ReactNode }`
    - Imports `PrevNextFooter` from `./prev-next-footer`
    - Imports `PortfolioNeighbor` type from `@/lib/portfolio/get-portfolio-neighbors`
    - Imports `useRouter` from `next/navigation`
    - Contains module constant `SWIPE_THRESHOLD_PX = 60`
    - Wrapper div has inline style `touchAction: "pan-y"` (grep: `touchAction: "pan-y"`)
    - Inner content wrapper uses `pb-24` class (grep confirms)
    - Swipe handler contains horizontal-dominant guard `Math.abs(dx) < Math.abs(dy)` (grep)
    - Swipe handler contains threshold check `Math.abs(dx) < SWIPE_THRESHOLD_PX`
    - Swipe right (dx > 0) pushes `/portfolio/${neighbors.prev.slug}`; swipe left pushes `/portfolio/${neighbors.next.slug}`
    - Renders `<PrevNextFooter ...>` only when `neighbors` is truthy (grep: `neighbors &&`)
    - `onTouchStart` and `onTouchEnd` handlers attached to root wrapper div
    - `pnpm tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>PortfolioDetailLayout wraps children with pb-24, attaches touchstart/touchend handlers with 60px threshold + horizontal-dominant check + touch-action:pan-y, and renders PrevNextFooter when neighbors exist.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 5: Refactor /portfolio/[slug] route to branch on item.type and wire neighbors</name>
  <files>src/app/(public)/portfolio/[slug]/page.tsx</files>
  <read_first>
    - src/app/(public)/portfolio/[slug]/page.tsx (current implementation — preserve force-dynamic + generateStaticParams + generateMetadata + notFound logic)
    - src/lib/portfolio/get-portfolio-neighbors.ts (Task 1 output)
    - src/components/portfolio/portfolio-detail-layout.tsx (Task 4 output)
    - src/components/portfolio/video-detail-layout.tsx (Task 3 output)
    - src/components/portfolio/case-study-content.tsx (preserve as-is per D-07; confirm export signature)
    - .planning/phases/11-portfolio/11-CONTEXT.md (D-05 branching rule, D-07 preserve case-study verbatim)
    - .planning/phases/11-portfolio/11-RESEARCH.md (Pattern 5 "Type-Branching in the Detail Route", Pitfall 4 "type is untyped text column")
  </read_first>
  <action>
    Replace the contents of `src/app/(public)/portfolio/[slug]/page.tsx` with:

    ```typescript
    export const dynamic = "force-dynamic"

    import { db } from "@/lib/db"
    import { portfolioItems } from "@/db/schema"
    import { eq } from "drizzle-orm"
    import { notFound } from "next/navigation"
    import { CaseStudyContent } from "@/components/portfolio/case-study-content"
    import { VideoDetailLayout } from "@/components/portfolio/video-detail-layout"
    import { PortfolioDetailLayout } from "@/components/portfolio/portfolio-detail-layout"
    import { getPortfolioNeighbors } from "@/lib/portfolio/get-portfolio-neighbors"
    import type { Metadata } from "next"

    type Props = {
      params: Promise<{ slug: string }>
    }

    export async function generateMetadata({ params }: Props): Promise<Metadata> {
      const { slug } = await params
      const [item] = await db
        .select()
        .from(portfolioItems)
        .where(eq(portfolioItems.slug, slug))
        .limit(1)

      if (!item) {
        return { title: "Not Found" }
      }

      return {
        title: item.title,
        description: item.description || `${item.title} - Glitch Studios portfolio`,
      }
    }

    export async function generateStaticParams() {
      try {
        const items = await db
          .select({ slug: portfolioItems.slug })
          .from(portfolioItems)
          .where(eq(portfolioItems.isActive, true))

        return items.map((item) => ({ slug: item.slug }))
      } catch {
        // Database not available at build time -- use dynamic rendering
        return []
      }
    }

    export default async function PortfolioDetailPage({ params }: Props) {
      const { slug } = await params
      const [item] = await db
        .select()
        .from(portfolioItems)
        .where(eq(portfolioItems.slug, slug))
        .limit(1)

      if (!item) {
        notFound()
      }

      // Resolve prev/next neighbors in parallel with content render.
      // getActivePortfolioSlugList inside is react.cache()-wrapped so repeat
      // calls within this request hit DB once.
      const neighbors = await getPortfolioNeighbors(slug)

      // Pitfall 4: narrow item.type (text column, no enum) at the route boundary
      const isCaseStudy = item.type === "case_study"

      return (
        <PortfolioDetailLayout neighbors={neighbors}>
          {isCaseStudy ? (
            <CaseStudyContent item={item} />
          ) : (
            <VideoDetailLayout item={item} />
          )}
        </PortfolioDetailLayout>
      )
    }
    ```

    Key changes from the current file:
    - PRESERVE: `export const dynamic = "force-dynamic"` (Pitfall 3 — keep for immediate DB updates).
    - PRESERVE: `generateMetadata` and `generateStaticParams` verbatim (no logic change).
    - PRESERVE: `notFound()` call when item missing.
    - ADD: imports for `VideoDetailLayout`, `PortfolioDetailLayout`, `getPortfolioNeighbors`.
    - ADD: `const neighbors = await getPortfolioNeighbors(slug)` after the item query.
    - ADD: branching via `item.type === "case_study"` — renders `CaseStudyContent` or `VideoDetailLayout`.
    - ADD: wrap whichever content with `<PortfolioDetailLayout neighbors={neighbors}>`.
    - DO NOT modify CaseStudyContent or VideoDetailLayout from this task — they're already built.
  </action>
  <verify>
    <automated>grep -q 'export const dynamic = "force-dynamic"' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'import { CaseStudyContent }' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'import { VideoDetailLayout }' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'import { PortfolioDetailLayout }' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'import { getPortfolioNeighbors }' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'getPortfolioNeighbors(slug)' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'item.type === "case_study"' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'PortfolioDetailLayout neighbors={neighbors}' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'generateStaticParams' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'generateMetadata' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; grep -q 'notFound()' src/app/\(public\)/portfolio/\[slug\]/page.tsx &amp;&amp; pnpm tsc --noEmit &amp;&amp; pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - File `src/app/(public)/portfolio/[slug]/page.tsx` contains `export const dynamic = "force-dynamic"` (preserved)
    - Imports `CaseStudyContent`, `VideoDetailLayout`, `PortfolioDetailLayout`, and `getPortfolioNeighbors`
    - Still contains `generateMetadata` async function
    - Still contains `generateStaticParams` async function with the `try { ... } catch { return [] }` shape
    - Still calls `notFound()` when the item lookup fails
    - Default export function calls `await getPortfolioNeighbors(slug)`
    - Branches using the exact literal `item.type === "case_study"` (grep)
    - Renders `<PortfolioDetailLayout neighbors={neighbors}>` as the outermost return element
    - Renders either `<CaseStudyContent item={item} />` or `<VideoDetailLayout item={item} />` inside
    - `pnpm tsc --noEmit` exits 0
    - `pnpm lint` exits 0 (or warnings-only)
  </acceptance_criteria>
  <done>Detail route fetches item + neighbors, branches on item.type (case_study vs video), and wraps the chosen content in PortfolioDetailLayout so every active item gets prev/next navigation with wrap-around, keyboard, and swipe.</done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0 across all 5 new/modified files
- `pnpm lint` exits 0 (or warnings-only)
- Manual smoke test (or Playwright from Plan 07): visit `/portfolio/{any-active-slug}`, sticky footer visible at bottom with PREV/NEXT links, ← and → keys navigate, last→NEXT loops to first, first→PREV loops to last, video-type items render VideoDetailLayout (no case-study sections), case-study items render CaseStudyContent unchanged
- Grep for any accidental removal of `force-dynamic` or `generateStaticParams` in `src/app/(public)/portfolio/[slug]/page.tsx` — both must still be present
</verification>

<success_criteria>
- PORT-06 delivered end-to-end: visible sticky prev/next navigation, keyboard on desktop, swipe on mobile, wrap-around at list ends
- Every active portfolio item has a coherent destination — case_study → full layout; video → minimal single-column layout (D-05)
- Case-study layout preserved verbatim (D-07) — no visual regressions on existing case studies
- Neighbor resolution is request-scoped-cached (react.cache) — no duplicate DB queries within a request
- Single-item portfolios still render without error (footer hidden when neighbors = null)
- All colors from locked palette
</success_criteria>

<output>
After completion, create `.planning/phases/11-portfolio/11-01-SUMMARY.md` documenting:
- The PortfolioNeighbor type shape (for downstream Playwright plan to reference)
- The PortfolioDetailLayout + PrevNextFooter prop surface
- Swipe threshold used (60px) and whether tuning was needed
- Any GlitchHeading API adjustments that had to be made in VideoDetailLayout
- Confirmation that the route branches on `item.type === "case_study"` (literal used)
</output>
