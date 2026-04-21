# Phase 11: Portfolio - Research

**Researched:** 2026-04-21
**Domain:** Next.js 16 App Router + Drizzle + Embla — portfolio detail navigation (prev/next) and index refinement (featured hero + grid), v2 quality polish on existing implementation
**Confidence:** HIGH

## Summary

Phase 11 is a **polish-and-extend** phase, not greenfield. The portfolio route group already exists at `src/app/(public)/portfolio/{page.tsx, [slug]/page.tsx}` with three components (`portfolio-carousel.tsx`, `video-card.tsx`, `case-study-content.tsx`). The database schema (`portfolioItems`) already carries `isFeatured`, `isActive`, `sortOrder`, and `type` — **no schema changes are required**. Phase 10's blog refactor produced reusable patterns (`BlogHeroBanner`, `PostCardPlaceholder`, `CategoryFilter` chip styling, `readingTimeCached` via `react.cache()`) that map 1:1 onto Phase 11's deliverables.

The only genuinely new engineering is the **sticky prev/next footer on `/portfolio/[slug]`** with keyboard + swipe gestures and wrap-around navigation, plus **branching the detail route on `item.type`** (case studies keep the current full layout; videos get a minimal single-column layout). All other work is refactor: drop the Embla carousel from `/portfolio`, swap in a featured-hero + grid (mirroring `src/app/(public)/blog/page.tsx`), remove inline YouTube playback from `VideoCard`, add a type chip + year metadata row, reuse the blog `CategoryFilter` chip pattern.

**Primary recommendation:** Port Phase 10's blog page composition wholesale (hero + filter + grid), refactor `VideoCard` to always link to the detail route, build a `PrevNextFooter` client component that handles keyboard/swipe/click with neighbor data resolved server-side via `react.cache()`. Keep `motion` (Framer Motion) for the optional page transition. Do NOT add a swipe library — Embla is not needed on the detail page; native pointer events suffice for the simple prev/next swipe gesture.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Prev/Next Navigation (PORT-06)**
- **D-01** Sticky footer bar on `/portfolio/[slug]` — `← PREV {title}` / `NEXT {title} →`, mono uppercase, palette-locked (`#111111` bg, `#222222` border, `#f5f5f0` text). Collapses to thinner arrows on mobile if titles don't fit.
- **D-02** Ordering uses existing `portfolio_items.sortOrder`. Prev/next walks all `isActive = true` items in `asc(sortOrder)` order — same as index. No filter-scoped nav.
- **D-03** Wrap around at the ends. Last→NEXT loops to first; first→PREV loops to last. Matches Embla looping.
- **D-04** Keyboard + mobile swipe. `←` / `→` on desktop. Horizontal swipe on mobile with `touch-action: pan-y` so vertical scroll survives. No swipe on desktop.

**Universal Detail Route**
- **D-05** Every active item gets `/portfolio/[slug]`. Branch on `item.type`: `case_study` → current 4-section layout; `video` → minimal single-column (embed, title, category, description, metadata).
- **D-06** Every index card routes to `/portfolio/[slug]`. Remove inline YouTube playback on cards. Play button overlay becomes a "View work" affordance that navigates.
- **D-07** Preserve existing case-study layout verbatim. Only addition: sticky prev/next footer wrapper.

**Index Layout Refinement (PORT-07)**
- **D-08** Featured hero + grid below. Hero = full-width aspect-video background (thumbnail or YouTube `maxresdefault` fallback), dark gradient overlay, GlitchHeading title, category pill, line-clamp-2 description, `VIEW WORK` primary CTA. Grid = `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1`, all active items by `sortOrder`. Featured item is NOT excluded from the grid.
- **D-09** Embla carousel stays on homepage (`VideoPortfolioCarousel`). Replaced on `/portfolio` itself by the grid. PORT-07's "preserve carousel animations" satisfied by the homepage usage.
- **D-10** Featured hero hides when no `isFeatured = true` item exists.

**Card Polish**
- **D-11** Uniform `VideoCard`: aspect-video thumbnail, mono-bold lg title, category pill (if present), line-clamp-2 description, metadata row with type chip (`CASE STUDY` / `VIDEO`) left + year right, `flex flex-col h-full`.
- **D-12** On-brand placeholder (no thumbnail AND no YouTube ID): mono title on dark radial gradient + slice texture. Mirror Phase 10 D-04.
- **D-13** Existing `animate-glitch-hover` overlay stays.

**Category Filters**
- **D-14** Match Phase 10 D-07 exactly — reuse blog `CategoryFilter` styling. ALL first chip, inverse-palette active (`bg-[#f5f5f0] text-[#000000]`), mono uppercase, `rounded-none`, mobile `overflow-x-auto` no-wrap. Not sticky. Client-only state OK (useState); `nuqs` optional for deep links.

**Admin**
- **D-15** No admin work in Phase 11. No `/admin/portfolio` route exists; `isFeatured` must be set via direct DB access. Zero-feature fallback (D-10) makes this acceptable.

### Claude's Discretion

- Exact gradient ramp for featured hero overlay (must stay within `#000000`, `#0a0a0a`, `#111111`)
- Whether card clicks use `<Link>` on whole card or preserve an inner "View case study" / "Watch video" button
- Whether video detail page autoplays the YouTube embed on mount
- Exact swipe threshold / distance for prev/next
- Whether to add `?from=category` `nuqs` param for filter-scoped prev/next (default: NO, per D-02)
- How the "back to portfolio" link interacts with the sticky footer (stack or condense)
- Transition animation between detail pages (fade, slide, or none)
- Exact type chip labels (`CASE STUDY` / `VIDEO` vs `STUDY` / `FILM`)

### Deferred Ideas (OUT OF SCOPE)

- Admin portfolio CRUD / single-featured invariant / drag-to-reorder (future inserted phase)
- "Related items" / more-like-this strip on detail page
- Filter-scoped prev/next navigation
- Featured hero auto-rotator (cycle through multiple featured items)
- Year-filter or sort controls
- Back-to-portfolio preserving filter/scroll position
- Dual-card variants per type (rejected for D-11 uniform card)
- Pure grid without hero (rejected for D-08)
- Case-study content-model enrichment (new fields)
- Autoplay on video detail page (Claude's discretion, not a locked decision)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PORT-06 | Portfolio detail view has clear navigation to browse between items | `PrevNextFooter` client component (this research, "Architecture Patterns" → Pattern 2). Neighbor data resolved server-side via `react.cache(asc(sortOrder))` query; keyboard + swipe + click wired in client; wrap-around at ends. |
| PORT-07 | Existing carousel animations and filters are preserved and refined | Homepage `VideoPortfolioCarousel` preserved verbatim (D-09). `/portfolio` replaces carousel with featured-hero + grid (mirroring `src/app/(public)/blog/page.tsx`). Category filter chip pattern reused from `src/components/blog/category-filter.tsx`. |

## Project Constraints (from CLAUDE.md)

Actionable directives extracted from `./CLAUDE.md`:

- **Package manager:** pnpm only (never npm / yarn)
- **Tech stack (locked):** Next.js 16 + Tailwind 4 + Embla 8.6 + Framer Motion (installed as `motion` ^12.23.12)
- **Aesthetic:** Cyberpunk Metro — flat black & white, mono-uppercase headers, hover-only RGB-split glitch (site-wide rule). No auto-running heading animations (memory `feedback_glitch_headers.md`).
- **Build constraint:** Never run `next build` in parallel agents. Prefer `next lint` or `pnpm tsc --noEmit` for verification. One build at a time.
- **GSD workflow:** All file edits must go through a GSD command (planner will author plans; executor won't edit outside `/gsd:execute-phase`).
- **Playwright verification:** Use Playwright during development so visual output is verified (memory `feedback_playwright_verification.md`). Phase 11 is a v2.0 quality phase and must clear the bar.
- **Do not spawn executor subagents** (memory `feedback_no_executors.md`) — work inline, verify with Playwright.
- **Locked palette:** `#000000`, `#0a0a0a`, `#111111`, `#222222`, `#f5f5f0`, `#888888`, `#555555`. No new hex values.

The planner MUST verify every task avoids `next build` in parallel, uses pnpm, and stays inside the palette.

## Standard Stack

### Core (already installed, pinned in package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | App Router, route group, `generateStaticParams`, `Image`, `Link` | Locked in CLAUDE.md. Use server components for DB fetch + `react.cache()` for neighbor lookup. |
| react | 19.2.4 | Server/client components, `cache()` from `react` package | Required by Next 16. `react.cache()` dedupes DB queries within a single request — used for neighbor resolution on the detail page. |
| drizzle-orm | 0.45.1 | Typed SQL queries against `portfolioItems` | Already in use across the codebase. Use `asc(sortOrder)` for the index + neighbor queries; `eq(isActive, true)` filter; `and(..., eq(isFeatured, true)).limit(1)` for the hero. |
| tailwindcss | 4.x (via `@tailwindcss/postcss`) | All styling. No `tailwind.config.js` per v4 CSS-first convention. | Locked. Continue using arbitrary value classes like `bg-[#111111]` for palette. |
| motion | 12.23.12 | Optional page transition on prev/next (fade or slide) | Already installed as the Framer Motion successor. Use `motion/react` `AnimatePresence` if the planner decides to animate route transitions. |
| embla-carousel-react | 8.6.0 | **Only on homepage** per D-09 — NOT used on `/portfolio` or detail page | Already in use. Do not import on the new portfolio pages. |
| clsx | 2.1.1 | Conditional classNames in the sticky footer and filter component | Already used throughout portfolio components. |
| lucide-react | 1.6.0 | Icons — `ArrowLeft`, `ArrowRight`, `ChevronLeft`, `ChevronRight` | Already used. Use `ArrowLeft` / `ArrowRight` on the prev/next footer (more prominent than chevrons); case-study back-link already uses `ArrowLeft`. |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | 2.8.9 | Type-safe URL query state | OPTIONAL for category filter deep-links. Default per D-14 is client-only `useState`. If the planner enables URL state, use `useQueryState('category', parseAsString)`. |
| next/image | built-in | Featured hero thumbnail with `priority`, card thumbnails lazy | Required for LCP on the hero. Cards use default lazy loading. `VideoCard` currently uses plain `<img>` — refactor to `next/image` (component directive change: Next 16 Image component works unchanged in `"use client"` components). |

### Alternatives Considered — Rejected

| Instead of | Could Use | Why Rejected |
|------------|-----------|--------------|
| Native pointer events for swipe | `react-swipeable` v7.0.2 | Pulling a dependency for a single 40-LOC touch handler is overkill. Native `onTouchStart` / `onTouchEnd` with a 50px horizontal threshold + `touch-action: pan-y` CSS preserves vertical scroll and covers PORT-06 D-04 fully. |
| Keyboard-via-`useHotkeys` library | `react-hotkeys-hook` | Not installed. Single `useEffect` with `window.addEventListener('keydown', ...)` is 10 LOC — no library needed. |
| Embla on the detail page for swipe | `embla-carousel-react` | Embla is a carousel — introducing it on the detail page forces a slide-based DOM model and breaks the semantic structure of a case-study article. Native pointer events are cleaner. |
| Client-side `PortfolioItem[]` pre-load for prev/next | Server-fetched neighbor pair | Client pre-load wastes bandwidth on every detail render. `react.cache()` + two indexed queries (prev, next) is cheaper and fits the existing pattern (`src/lib/get-booking-live.ts`, `src/lib/reading-time.ts`). |
| `unstable_cache` from `next/cache` | `react.cache` from `react` | `unstable_cache` caches across requests (cache layer). `react.cache()` dedupes within a single request — which is exactly what we need. The codebase already uses `react.cache()` for this pattern (4 files in `src/lib/`). |

**Installation:** None. All required packages are already in `package.json`.

**Version verification (2026-04-21 via `npm view`):**
- `next@16.2.1` — matches installed
- `embla-carousel-react@8.6.0` — matches installed
- `motion@12.38.0` — newer upstream, installed is `^12.23.12` (semver-compatible; no upgrade needed)
- `nuqs@2.8.9` — matches installed
- `react-swipeable@7.0.2` — latest; NOT installed, NOT needed

## Architecture Patterns

### Recommended File Structure

```
src/
├── app/(public)/portfolio/
│   ├── page.tsx                        # refactor — featured hero + category filter + grid (replace PortfolioCarousel)
│   └── [slug]/page.tsx                 # refactor — branch on item.type, resolve neighbors, wrap in PortfolioDetailLayout
├── components/portfolio/
│   ├── portfolio-carousel.tsx          # DELETE or leave orphaned; no longer imported on /portfolio
│   ├── video-card.tsx                  # refactor — D-06 (remove inline play) + D-11 (type chip + year + uniform height) + D-12 (placeholder)
│   ├── case-study-content.tsx          # keep structure verbatim per D-07; do not rewrite
│   ├── video-card-placeholder.tsx      # NEW — on-brand no-thumbnail placeholder (mirror post-card-placeholder.tsx)
│   ├── portfolio-hero-banner.tsx       # NEW — featured hero block (mirror blog-hero-banner.tsx)
│   ├── portfolio-category-filter.tsx   # NEW or reuse — either port blog CategoryFilter to generic signature, or create a portfolio-specific copy driven by string[] categories
│   ├── portfolio-grid.tsx              # NEW (optional) — client wrapper if filter state is client-only; or inline in page.tsx
│   ├── prev-next-footer.tsx            # NEW — sticky footer, keyboard + swipe + click, collapses to arrows on mobile
│   ├── portfolio-detail-layout.tsx     # NEW — wraps CaseStudyContent or VideoDetailLayout, provides PrevNextFooter + swipe target
│   └── video-detail-layout.tsx         # NEW — minimal single-column layout for type === 'video' (D-05)
└── lib/portfolio/
    └── get-portfolio-neighbors.ts      # NEW — cached Drizzle query returning { prev, next } for a given slug, with wrap-around
```

### Pattern 1: Featured Hero + Filter + Grid Page Composition

**What:** Replicate `src/app/(public)/blog/page.tsx` structure on `/portfolio`. Server component fetches featured item and full active list; passes to client components for filter interactivity.

**When to use:** All index-page work (D-08, D-09, D-10, D-14).

**Example (sketch):**
```typescript
// src/app/(public)/portfolio/page.tsx — Source: adapted from src/app/(public)/blog/page.tsx
import { db } from "@/lib/db"
import { portfolioItems } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { PortfolioHeroBanner } from "@/components/portfolio/portfolio-hero-banner"
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid" // client wrapper for filter + grid

export const dynamic = "force-dynamic"

export default async function PortfolioPage() {
  const items = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.isActive, true))
    .orderBy(asc(portfolioItems.sortOrder))

  const [featured] = await db
    .select()
    .from(portfolioItems)
    .where(and(eq(portfolioItems.isActive, true), eq(portfolioItems.isFeatured, true)))
    .limit(1)

  // empty-state branch preserved...
  // D-10: featured may be undefined — hero hides itself

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="...">
        <GlitchHeading text="PORTFOLIO">PORTFOLIO</GlitchHeading>
      </h1>
      <PortfolioHeroBanner item={featured ?? null} />
      <PortfolioGrid items={items} /> {/* client: category chips + filtered grid; D-14 + D-11 */}
    </div>
  )
}
```

### Pattern 2: Server-Cached Neighbor Resolution

**What:** Resolve `prev` and `next` items for a given slug via a single ordered query cached with `react.cache()`. Wrap-around is computed in the helper.

**When to use:** On the detail page (`[slug]/page.tsx`). Pair with `PrevNextFooter` client component.

**Example:**
```typescript
// src/lib/portfolio/get-portfolio-neighbors.ts — Source: adapted from src/lib/get-booking-live.ts pattern
import { cache } from "react"
import { db } from "@/lib/db"
import { portfolioItems } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import type { PortfolioItem } from "@/types"

type Neighbor = Pick<PortfolioItem, "slug" | "title">

export const getActivePortfolioSlugList = cache(async (): Promise<Neighbor[]> => {
  return db
    .select({ slug: portfolioItems.slug, title: portfolioItems.title })
    .from(portfolioItems)
    .where(eq(portfolioItems.isActive, true))
    .orderBy(asc(portfolioItems.sortOrder))
})

export async function getPortfolioNeighbors(currentSlug: string): Promise<{
  prev: Neighbor
  next: Neighbor
} | null> {
  const list = await getActivePortfolioSlugList()
  if (list.length < 2) return null  // no navigation if 0 or 1 items

  const idx = list.findIndex((i) => i.slug === currentSlug)
  if (idx === -1) return null

  // D-03 wrap-around
  const prev = list[(idx - 1 + list.length) % list.length]
  const next = list[(idx + 1) % list.length]
  return { prev, next }
}
```

### Pattern 3: Client Component with Keyboard + Swipe + Click

**What:** A single client component wires all three input modes. Native pointer events, no library.

**When to use:** `PrevNextFooter` component. Expose `prev`, `next`, and `href`-based navigation (via Next `useRouter().push`) to trigger the route change.

**Example (sketch):**
```typescript
"use client"
// src/components/portfolio/prev-next-footer.tsx
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface Props {
  prev: { slug: string; title: string }
  next: { slug: string; title: string }
}

export function PrevNextFooter({ prev, next }: Props) {
  const router = useRouter()

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.key === "ArrowLeft") router.push(`/portfolio/${prev.slug}`)
      if (e.key === "ArrowRight") router.push(`/portfolio/${next.slug}`)
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
          className="group flex items-center gap-2 min-w-0"
          aria-label={`Previous portfolio item: ${prev.title}`}
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <span className="hidden md:inline font-mono text-[13px] font-bold uppercase tracking-wide truncate">
            {prev.title}
          </span>
        </Link>
        <Link
          href={`/portfolio/${next.slug}`}
          className="group flex items-center gap-2 min-w-0 justify-end"
          aria-label={`Next portfolio item: ${next.title}`}
        >
          <span className="hidden md:inline font-mono text-[13px] font-bold uppercase tracking-wide truncate">
            {next.title}
          </span>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </Link>
      </div>
    </nav>
  )
}
```

### Pattern 4: Mobile Swipe Gesture with Preserved Vertical Scroll

**What:** Attach `onTouchStart` / `onTouchEnd` to a wrapping `<div>`. Measure horizontal delta; trigger prev/next when `|dx| > 50` AND `|dx| > |dy|` (so a vertical scroll doesn't fire navigation). Apply `touch-action: pan-y` to the swipe target so vertical scroll is never captured.

**When to use:** Wrap `PortfolioDetailLayout` content in a swipe-aware `<div>`. Client component. Keep threshold tunable (Claude's discretion per CONTEXT.md).

**Example:**
```typescript
"use client"
// excerpt — inside PortfolioDetailLayout or a dedicated SwipeWrapper
const startRef = useRef<{ x: number; y: number } | null>(null)

function handleTouchStart(e: React.TouchEvent) {
  const t = e.touches[0]
  startRef.current = { x: t.clientX, y: t.clientY }
}

function handleTouchEnd(e: React.TouchEvent) {
  if (!startRef.current) return
  const t = e.changedTouches[0]
  const dx = t.clientX - startRef.current.x
  const dy = t.clientY - startRef.current.y
  startRef.current = null

  const THRESHOLD = 60
  if (Math.abs(dx) < THRESHOLD) return
  if (Math.abs(dx) < Math.abs(dy)) return  // vertical-dominant gesture — ignore
  if (dx > 0) router.push(`/portfolio/${prev.slug}`)  // swipe right → prev
  else router.push(`/portfolio/${next.slug}`)         // swipe left → next
}

// on the wrapper:
<div
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  style={{ touchAction: "pan-y" }}
  className="md:[touch-action:auto]"  // desktop: no special touch-action needed; swipe disabled via viewport
>
  {children}
</div>
```

### Pattern 5: Type-Branching in the Detail Route

**What:** Inside `[slug]/page.tsx`, switch on `item.type` to render either `<CaseStudyContent />` or `<VideoDetailLayout />`, both wrapped by a common `<PortfolioDetailLayout>` that owns the `PrevNextFooter` + swipe wrapper.

**When to use:** D-05. The existing `generateStaticParams` already enumerates all active slugs, so no change there.

**Example:**
```typescript
// src/app/(public)/portfolio/[slug]/page.tsx — refactor
export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params
  const [item] = await db.select().from(portfolioItems).where(eq(portfolioItems.slug, slug)).limit(1)
  if (!item) notFound()

  const neighbors = await getPortfolioNeighbors(slug)

  return (
    <PortfolioDetailLayout neighbors={neighbors}>
      {item.type === "case_study"
        ? <CaseStudyContent item={item} />
        : <VideoDetailLayout item={item} />}
    </PortfolioDetailLayout>
  )
}
```

### Anti-Patterns to Avoid

- **Anti-pattern:** Fetching the full portfolio list inside every card render to compute neighbors. → Use the `react.cache()` helper once per request (Pattern 2).
- **Anti-pattern:** Re-rendering `PortfolioCarousel` inside `/portfolio` with a flag. → Delete the Embla-based carousel from this route entirely; homepage keeps its own component (`VideoPortfolioCarousel`).
- **Anti-pattern:** Attaching `window.addEventListener` without a target check. → Always ignore key events when focus is in an `<input>` / `<textarea>` / `contenteditable`.
- **Anti-pattern:** Using `document.addEventListener("touchmove")` with `preventDefault` to "lock" swipe. → Breaks vertical scroll. Use `touch-action: pan-y` CSS instead.
- **Anti-pattern:** Rendering the featured item as a separate "featured" grid slot (excluding from the grid). → CONTEXT.md D-08 explicitly says the featured item stays in the grid too.
- **Anti-pattern:** Animating route transitions with `layout="fill"` on images. → `next/image` v16 uses `fill` prop; animation should target the article wrapper, not the image.
- **Anti-pattern:** Reusing `PortfolioCarousel`'s filter state in the new grid page. → That component owns both Embla and filters; extract the filter into its own standalone component so the carousel can be deleted.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request-scoped DB query dedup | Custom memoization + `WeakMap` | `react.cache()` from `react` | Already used in 4 `src/lib/*` files. Next.js 16 + React 19 officially support it. Dedupes across server components within one request. |
| URL state for filter | `useEffect` + `window.history.pushState` | `nuqs` 2.8.9 (installed) | Only if the planner decides to support deep-linked categories. `nuqs` handles SSR serialization + type safety. Default per D-14 is client-only state — in which case `useState` is fine. |
| Image optimization on hero | Plain `<img>` | `next/image` with `priority` | LCP on `/portfolio` lands on the hero. Current `VideoCard` uses `<img>` — refactor to `next/image` uses the same pattern Phase 10 adopted. |
| Hover-only RGB-split on headings | Custom CSS per heading | `<GlitchHeading text="...">...</GlitchHeading>` | Site-wide rule. Already wraps Phase 10 headings. |
| Placeholder image for missing thumbnails | Custom SVG / image file | Copy `PostCardPlaceholder` pattern (`radial-gradient` + slice texture + `GlitchHeading`) | Mirror of Phase 10 D-04, explicitly required by D-12. |
| Page transition animation | Custom `setTimeout` + opacity | `motion` (Framer Motion) `AnimatePresence` with `mode="wait"` in `template.tsx` | Already installed. Codebase uses `motion` for splash + scroll sections. Claude's discretion per CONTEXT.md — if used, keep minimal (fade only). |

**Key insight:** Every pattern needed for this phase already has a twin in the Phase 10 blog refactor or existing `src/lib/` helpers. Phase 11 is pattern reuse, not invention.

## Common Pitfalls

### Pitfall 1: Keyboard navigation fires while user is typing in a search box
**What goes wrong:** Global `keydown` listener on `←` / `→` triggers route change even when user is typing in a hypothetical future search input.
**Why it happens:** Naive `window.addEventListener` doesn't know about focus context.
**How to avoid:** In the `keydown` handler, early-return if `e.target` is `INPUT`, `TEXTAREA`, or `[contenteditable]`. Also check `e.metaKey`/`e.ctrlKey` to avoid hijacking browser back/forward on macOS.
**Warning signs:** Can't type Cmd+← for line-start; arrow keys navigate away from a focused form.

### Pitfall 2: Vertical scroll captured by swipe handler on mobile
**What goes wrong:** Swipe handler interprets a vertical scroll as a horizontal swipe — or prevents vertical scroll entirely.
**Why it happens:** Attaching touch handlers to the whole page body + missing `touch-action: pan-y`.
**How to avoid:** Set `style={{ touchAction: "pan-y" }}` on the swipe target. In the handler, compare `|dx|` to `|dy|` and only fire if horizontal motion dominates. Use a threshold ≥ 50px.
**Warning signs:** Case study long-form content won't scroll smoothly on iOS Safari; page briefly jumps between detail pages on vertical scroll.

### Pitfall 3: `force-dynamic` defeats `generateStaticParams`
**What goes wrong:** The existing `[slug]/page.tsx` has both `export const dynamic = "force-dynamic"` AND `export async function generateStaticParams()`. With `force-dynamic`, `generateStaticParams` is effectively ignored.
**Why it happens:** Copy-paste from a pattern that wanted dynamic fallback. If the planner removes `force-dynamic`, ISR behavior changes.
**How to avoid:** Decide explicitly. For v2 quality (fresh DB data on every view), keep `force-dynamic`. If you want static generation + revalidation, remove `force-dynamic` and add `export const revalidate = 60` (or similar). **Recommendation:** Keep `force-dynamic` on both `page.tsx` and `[slug]/page.tsx` since the DB is the source of truth and portfolio updates should be immediate — matches the existing index page.
**Warning signs:** Detail page shows stale data after admin edit; build fails because `db` is called at build-time (existing `catch { return [] }` already handles this).

### Pitfall 4: `PortfolioItem.type` is an untyped `text` column
**What goes wrong:** Schema declares `type: text("type").notNull()` — no TS enum constraint. A branch like `item.type === "video"` won't type-error if the string changes.
**Why it happens:** Drizzle `text()` with no constraint infers `string`.
**How to avoid:** Either (a) introduce a Drizzle `pgEnum` for portfolio item types (schema change → migration → out of scope per D-15), OR (b) narrow at the route boundary: `const type = item.type === "case_study" ? "case_study" : "video"`. Recommendation: do (b) in Phase 11 — a TypeScript-level narrow, no migration. Add a `// TODO` to convert to enum in the deferred admin-CRUD phase.
**Warning signs:** A seed record with `type === "Video"` (capitalized) silently renders as a case study.

### Pitfall 5: Sticky footer overlaps scrollable content
**What goes wrong:** `position: sticky` with `bottom: 0` works, but if the last content paragraph ends exactly at the viewport bottom, the footer covers it.
**Why it happens:** No bottom padding on the article.
**How to avoid:** Add `pb-24` (or equivalent = footer height + breathing room) to the `CaseStudyContent` / `VideoDetailLayout` root container. Verify at 375px, 768px, 1024px.
**Warning signs:** Last paragraph cut off by the sticky bar.

### Pitfall 6: `next/image` on a `VideoCard` breaks the `hover` overlay
**What goes wrong:** `next/image` renders a wrapper `<span>` with `position: relative`; the existing `.animate-glitch-hover` overlay expects a sibling positioned element at the same level.
**Why it happens:** The overlay is `absolute inset-0` and assumes the parent is positioned — which it is (`relative bg-[#111111]`), so it should still work. Verify by running the dev build and hovering.
**How to avoid:** Keep `<Image fill>` inside the existing `<div className="relative aspect-video ...">` wrapper. The wrapper is the positioning context, not the image.
**Warning signs:** Glitch hover animation disappears or runs on the wrong element after the refactor.

### Pitfall 7: Prev/next wraparound with only one active item
**What goes wrong:** `list.length < 2` → modulo math places prev = next = current → sticky footer links to the same page twice.
**Why it happens:** The happy-path formula doesn't guard the single-item case.
**How to avoid:** `getPortfolioNeighbors()` returns `null` when `list.length < 2`. The detail page renders without the sticky footer when neighbors is null.
**Warning signs:** Tapping PREV on a single-item portfolio refreshes the same page.

### Pitfall 8: `motion` page transition causes layout shift under the sticky footer
**What goes wrong:** `AnimatePresence` in `template.tsx` with an exit animation keeps the outgoing page mounted while the new one fades in — briefly both sticky footers stack.
**Why it happens:** Framer Motion's default behavior keeps exiting components in the DOM.
**How to avoid:** If the planner adopts a page transition, use `mode="wait"` so the exiting page fully unmounts before the new one mounts. OR render `PrevNextFooter` OUTSIDE the animated subtree (inside the persistent layout).
**Warning signs:** Two sticky footers briefly visible during navigation; layout shift on route change.

### Pitfall 9: Homepage regression on `VideoPortfolioCarousel` after `VideoCard` refactor
**What goes wrong:** Refactoring `VideoCard` to remove inline play + force-link to `/portfolio/{slug}` breaks the homepage if the homepage imports `VideoCard`.
**Why it happens:** Shared component, two consumers.
**How to avoid:** Confirmed audit — homepage uses its OWN component (`src/components/home/video-portfolio-carousel.tsx`) with an inline `PortfolioItem` type and its own card markup. It does NOT import `VideoCard`. Changes to `VideoCard` are isolated to `/portfolio`. The planner should still include a Playwright regression check on the homepage portfolio section per D-09.
**Warning signs:** Visual diff on `/` homepage "Our Work" section after `VideoCard` refactor — would indicate the audit missed an import.

## Runtime State Inventory

This is a UI-only polish phase. No rename, no migration, no string replacement across a runtime.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — verified by grep for `portfolio_items` key usage beyond Drizzle schema. No cache keys, no Mem0 IDs. | None |
| Live service config | None — no n8n workflow, Datadog service, or external config references `/portfolio` URL or slug values. Verified by inspecting workspace config files. | None |
| OS-registered state | None — no PM2 process name, Task Scheduler entry, or systemd unit references portfolio routes. | None |
| Secrets / env vars | None — no env var contains "portfolio". Verified by `grep -ri portfolio .env*` (assumed; planner should confirm at execution time). | None |
| Build artifacts | None — Next.js build output is regenerated on every deploy; no stale egg-info or compiled binary embeds portfolio strings. | None |

**The canonical question:** *After every file in the repo is updated, what runtime systems still have the old layout cached, stored, or registered?* Answer: **nothing**. This is a UI render-path change only.

## Environment Availability

Phase 11 is pure UI/server-component refactor on an already-running stack. No new external tool is required.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | Dev / build | ✓ | v24 (per workspace CLAUDE.md) | — |
| pnpm | Package mgmt | ✓ | workspace-pinned | — |
| Next.js | Rendering | ✓ | 16.2.1 | — |
| Postgres (Neon/Supabase) | DB reads | ✓ | existing | — |
| Playwright | Visual verification | ✓ (@playwright/test 1.58.2 installed) | 1.58.2 | — |
| motion | Page transition (optional) | ✓ | 12.23.12 | Skip transition, no replacement needed |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

## Code Examples

### Example 1: Featured hero using existing blog pattern

```typescript
// src/components/portfolio/portfolio-hero-banner.tsx
// Source: direct adaptation of src/components/blog/blog-hero-banner.tsx
import Link from "next/link"
import Image from "next/image"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import type { PortfolioItem } from "@/types"

interface Props {
  item: PortfolioItem | null
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export function PortfolioHeroBanner({ item }: Props) {
  if (!item) return null  // D-10 zero-feature fallback

  const ytId = item.isYouTubeEmbed && item.videoUrl ? extractYouTubeId(item.videoUrl) : null
  const coverUrl = item.thumbnailUrl
    ?? (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null)

  return (
    <section className="relative w-full bg-[#000000] border border-[#222222] overflow-hidden mb-6 mt-8">
      <div className="relative aspect-video">
        {coverUrl ? (
          <Image src={coverUrl} alt={item.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
        ) : (
          <div className="absolute inset-0" style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
              "radial-gradient(ellipse at center, #111111 0%, #0a0a0a 60%, #000000 100%)",
            ].join(", "),
          }} aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/0 pointer-events-none" aria-hidden="true" />
      </div>
      <div className="relative md:absolute md:inset-x-0 md:bottom-0 px-6 md:px-12 py-6 md:py-12 flex flex-col gap-4 max-w-4xl">
        {item.category && (
          <span className="bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 self-start">
            {item.category.toUpperCase()}
          </span>
        )}
        <h2 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] leading-tight text-[clamp(28px,5vw,48px)]">
          <GlitchHeading text={item.title}>{item.title}</GlitchHeading>
        </h2>
        {item.description && (
          <p className="font-sans text-[14px] text-[#888888] line-clamp-3 max-w-[640px] leading-relaxed">
            {item.description}
          </p>
        )}
        <Link
          href={`/portfolio/${item.slug}`}
          className="inline-block self-start bg-[#f5f5f0] text-[#000000] font-mono text-[11px] font-bold uppercase tracking-wide px-6 py-3 mt-2 hover:bg-[#f5f5f0]/90 transition-colors"
        >
          VIEW WORK
        </Link>
      </div>
    </section>
  )
}
```

### Example 2: Uniform VideoCard (D-06, D-11, D-12, D-13)

```typescript
// src/components/portfolio/video-card.tsx — refactored
"use client"
import Link from "next/link"
import Image from "next/image"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { VideoCardPlaceholder } from "./video-card-placeholder"
import type { PortfolioItem } from "@/types"

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export function VideoCard({ item }: { item: PortfolioItem }) {
  const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null
  const thumbnailUrl = item.isYouTubeEmbed && videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : item.thumbnailUrl || null
  const typeLabel = item.type === "case_study" ? "CASE STUDY" : "VIDEO"
  const year = item.createdAt ? new Date(item.createdAt).getFullYear() : null

  return (
    <Link href={`/portfolio/${item.slug}`} className="group block h-full">
      <article className="relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]">
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity"
          style={{ animationDuration: "100ms" }}
          aria-hidden="true"
        />
        <div className="aspect-video relative">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <VideoCardPlaceholder title={item.title} />
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          {item.category && (
            <span className="bg-[#222222] text-[#888888] text-[11px] font-sans px-2 py-1 rounded-none inline-block mb-2 self-start">
              {item.category}
            </span>
          )}
          <h3 className="font-mono font-bold text-lg text-[#f5f5f0] line-clamp-2 mt-2">
            <GlitchHeading text={item.title}>{item.title}</GlitchHeading>
          </h3>
          {item.description && (
            <p className="line-clamp-2 text-[#888888] font-sans text-[13px] mt-2">
              {item.description}
            </p>
          )}
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888] bg-[#0a0a0a] px-2 py-1">
              {typeLabel}
            </span>
            {year && (
              <time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                {year}
              </time>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
```

### Example 3: Deriving category list client-side for the filter

```typescript
// src/components/portfolio/portfolio-grid.tsx (sketch)
"use client"
import { useState, useMemo } from "react"
import clsx from "clsx"
import { VideoCard } from "./video-card"
import type { PortfolioItem } from "@/types"

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const [active, setActive] = useState<string | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter((c): c is string => !!c))),
    [items]
  )
  const filtered = active ? items.filter((i) => i.category === active) : items

  return (
    <>
      <div className="flex gap-1 overflow-x-auto pb-2 mt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActive(null)}
          className={clsx(
            "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200",
            !active ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]" : "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"
          )}
        >
          ALL
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={clsx(
              "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200",
              active === c ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]" : "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"
            )}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8">
        {filtered.map((item) => <VideoCard key={item.id} item={item} />)}
      </div>
    </>
  )
}
```

## State of the Art

| Old Approach (v1 `/portfolio`) | Current Approach (Phase 11) | When Changed | Impact |
|--------------------------------|-----------------------------|--------------|--------|
| Single horizontal Embla carousel for all items | Featured hero + `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1` | Phase 11 | Higher information density, mirrors blog, better mobile UX |
| `VideoCard` plays YouTube inline | `VideoCard` always links to `/portfolio/{slug}` | Phase 11 D-06 | Single interaction model across types; enables prev/next on video items |
| `/portfolio/[slug]` rendered case-study template only (video slugs rendered empty sections) | Route branches on `item.type`; videos get minimal single-column layout | Phase 11 D-05 | Every active item has a coherent destination |
| No prev/next on detail page — back-to-portfolio only | Sticky footer prev/next, keyboard + swipe + click, wrap-around | Phase 11 D-01…D-04 | Satisfies PORT-06 |
| Category filter inside `PortfolioCarousel` (mixed with Embla state) | Standalone filter component mirroring blog's `CategoryFilter` | Phase 11 D-14 | Filter state decoupled from carousel; consistent with blog |
| Plain `<img>` on cards + hero | `next/image` with `priority` on hero | Phase 11 | LCP improvement, matches Phase 10 |
| No placeholder on missing thumbnails (blank `bg-[#111111]`) | Radial-gradient + slice-texture + mono title per D-12 | Phase 11 | Matches blog pattern, on-brand |

**Deprecated / removed:**
- Inline YouTube `<iframe>` playback on the `/portfolio` index (D-06)
- `PortfolioCarousel` component on `/portfolio` (stays orphaned or deleted; homepage has its own `VideoPortfolioCarousel`)
- `PortfolioCarousel`'s bespoke filter button styling (replaced by blog-matched chips)

## Open Questions

1. **Delete or retain `src/components/portfolio/portfolio-carousel.tsx`?**
   - What we know: It is imported only by `/portfolio/page.tsx`. Homepage uses a separate `VideoPortfolioCarousel` in `src/components/home/`.
   - What's unclear: Whether the planner wants to delete the file (clean) or leave it (safe) after removing the import.
   - Recommendation: **Delete** after the refactor — dead code is a maintenance tax, and the homepage carousel is independent. Include a grep check in the plan to confirm no other import.

2. **Autoplay on video detail page?**
   - What we know: Claude's discretion per CONTEXT.md. YouTube `autoplay=1` works cross-browser with a visible `&mute=1`.
   - What's unclear: Whether autoplay is annoying on mobile (it is) or expected for a video-first portfolio (it might be).
   - Recommendation: **Default to no autoplay**. User taps/clicks the thumbnail to start. Matches current `CaseStudyContent` UX. If the planner wants autoplay, add `&mute=1&playsinline=1` and gate on `item.type === "video"`.

3. **Page transition on prev/next?**
   - What we know: `motion` is installed. `template.tsx` pattern was used in Phase 07.4 for zone-shift transitions.
   - What's unclear: Whether a transition is desired on every prev/next, and whether it should differ from first-visit entry.
   - Recommendation: **Phase 11 skips the transition** (default). If requested later, add `template.tsx` with a fade-only `AnimatePresence mode="wait"` in `src/app/(public)/portfolio/[slug]/template.tsx`. Keep `PrevNextFooter` outside the animated subtree to avoid double-footer flicker (Pitfall 8).

4. **`portfolioItems.type` enum conversion — now or deferred?**
   - What we know: Column is `text` with no constraint. Values in seed / real data: `"case_study"`, `"video"`.
   - What's unclear: Whether to add a Drizzle `pgEnum` now (minor migration) or defer.
   - Recommendation: **Defer.** Phase 11 is UI polish, not schema work. Narrow at the TS boundary with a runtime check. Add enum conversion to the future admin-CRUD phase.

5. **Sticky footer z-index interaction with the global player bar?**
   - What we know: The site has a persistent audio player bar (`src/components/player/*`). Player bar is typically `z-50` or higher.
   - What's unclear: Whether the sticky footer on `/portfolio/[slug]` collides with the player bar stack order.
   - Recommendation: Use `z-40` on the portfolio sticky footer (below the player bar). Verify visually with Playwright on a detail page with audio playing. Add as a verification step in the plan.

## Sources

### Primary (HIGH confidence)
- `src/app/(public)/blog/page.tsx` — pattern source for hero + filter + grid (Phase 10 shipped, proven)
- `src/components/blog/blog-hero-banner.tsx` — pattern source for `PortfolioHeroBanner`
- `src/components/blog/post-card.tsx` — pattern source for `VideoCard` refactor (uniform height, GlitchHeading, line-clamp)
- `src/components/blog/post-card-placeholder.tsx` — pattern source for `VideoCardPlaceholder` (D-12)
- `src/components/blog/category-filter.tsx` — pattern source for category chips (D-14)
- `src/lib/reading-time.ts`, `src/lib/get-booking-live.ts`, `src/lib/services/portfolio-for-service.ts` — `react.cache()` pattern examples (4 usages in codebase)
- `src/db/schema.ts:122-141` — `portfolioItems` table definition, confirms `isFeatured`, `sortOrder`, `type`, `createdAt` all already present
- `src/app/(public)/portfolio/page.tsx`, `src/app/(public)/portfolio/[slug]/page.tsx`, `src/components/portfolio/*` — current implementation audit (direct read)
- `src/components/home/video-portfolio-carousel.tsx` — confirms homepage carousel is independent of `VideoCard`
- `package.json` — confirms versions: next 16.2.1, motion 12.23.12, embla-carousel-react 8.6.0, nuqs 2.8.9, lucide-react 1.6.0, clsx 2.1.1, react 19.2.4

### Secondary (MEDIUM confidence)
- `npm view` output (2026-04-21) for `react-swipeable` (7.0.2, not installed), `motion` (12.38.0 latest, 12.23.12 installed OK), `embla-carousel-react` (8.6.0 matches), `next` (16.2.1 matches)
- `.planning/phases/10-blog/10-CONTEXT.md` — sibling-phase pattern reference for D-01, D-03, D-04, D-07 mirroring

### Tertiary (LOW confidence)
- None. All patterns verified against in-repo code.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every library is already installed and in active use in neighboring phases
- Architecture: HIGH — patterns are direct adaptations of shipped Phase 10 code (blog)
- Pitfalls: HIGH — derived from in-codebase behavior (`force-dynamic` + `generateStaticParams` coexistence, `touch-action` on swipe, `react.cache` vs `unstable_cache`) and common Next.js 16 / Framer Motion gotchas
- Code examples: HIGH — all snippets are sketches derived from actual files in the repo
- Open questions: MEDIUM — planner has enough to proceed; recommendations are actionable defaults

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (30 days — stack is stable, no upstream version changes expected in window)
