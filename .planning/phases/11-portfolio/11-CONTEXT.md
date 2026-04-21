# Phase 11: Portfolio - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Quality overhaul of the portfolio browsing flow. Ship prev/next navigation on the detail view (PORT-06) and refine the index page (PORT-07) so visitors can move between items fluidly and every item has a coherent destination.

In scope:
- Universal portfolio detail route (`/portfolio/[slug]`) — every active item routes here, videos and case studies alike
- Sticky prev/next footer navigation on the detail page (keyboard + swipe + wrap-around)
- Index page restructure: featured hero + responsive grid, replacing the single Embla carousel
- Filter chip polish aligned with Phase 10 D-07 (inverse active state, mobile horizontal scroll)
- Uniform `VideoCard` layout with type chip + year metadata
- Remove inline YouTube playback on index cards — card clicks route to detail

Out of scope (future phases or backlog):
- Any admin UI for portfolio items (no `/admin/portfolio` exists yet — documented as a known constraint below)
- "Related items" / "more like this" strip on the detail page
- Autoplay on detail page (optional polish left to planner)
- Homepage portfolio section redesign (it already uses the Embla carousel; PORT-07 is honored there)
- Case-study content model changes (client/challenge/approach/result stays as-is)

</domain>

<decisions>
## Implementation Decisions

### Prev/Next Navigation (PORT-06)

- **D-01 — Sticky footer bar on `/portfolio/[slug]`.** A bar pinned to the bottom of the viewport showing `← PREV {title}` on the left and `NEXT {title} →` on the right. Always visible while reading the case study. Mono uppercase, palette-locked (`#111111` bg, `#222222` border, `#f5f5f0` text). Collapses to thinner arrows on mobile if the titles don't fit.
- **D-02 — Ordering uses the existing `portfolio_items.sortOrder`.** Prev/next walks all `isActive = true` items in `asc(sortOrder)` order — same order as the index. No filter-scoped navigation, no featured-first reshuffle. Predictable, admin-controlled via the existing column, no new URL state to maintain.
- **D-03 — Wrap around at the ends.** Last item's NEXT loops to the first; first item's PREV loops to the last. Matches the looping behavior of the existing Embla carousel. No dead-end UI.
- **D-04 — Keyboard + mobile swipe shortcuts.** `←` / `→` arrow keys on desktop advance prev/next. On mobile, horizontal swipe on the page body advances prev/next. Use `touch-action: pan-y` on the swipe target so vertical scroll is preserved. No swipe on desktop — keyboard covers it.

### Universal Detail Route (supports PORT-06)

- **D-05 — Every active portfolio item gets `/portfolio/[slug]`.** Route currently exists; rendering must branch on `item.type`:
  - `type === 'case_study'` → current full layout (hero media + 4 sections: client/challenge/approach/result)
  - `type === 'video'` → minimal single-column layout: embedded player, title, category pill, description, metadata row (year + client if present). No case-study sections rendered.
- **D-06 — Clicking any index card routes to `/portfolio/[slug]`.** Inline YouTube playback on the video card is removed. The play button overlay becomes a "View work" affordance that navigates. This simplifies interaction (one model for every card) and is what makes prev/next coherent across all items.
- **D-07 — Preserve existing case-study layout verbatim.** Do not redesign [case-study-content.tsx](src/components/portfolio/case-study-content.tsx) content structure. Only add the sticky footer prev/next and ensure the back-to-portfolio link still works.

### Index Layout Refinement (PORT-07)

- **D-08 — Featured hero + grid below.** `/portfolio` renders in two stacked regions:
  1. **Featured hero** — full-width, aspect-video background using the featured item's `thumbnailUrl` (fall back to YouTube `maxresdefault` when `isYouTubeEmbed` is true). Dark gradient overlay. Big mono-uppercase title wrapped in `GlitchHeading` (hover-only, site-wide rule). Category pill. Short description (line-clamp-2). Primary CTA button `VIEW WORK` → `/portfolio/{slug}`.
  2. **Grid** — `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1`. All active items ordered by `sortOrder`. The featured item is NOT excluded from the grid (it appears both in the hero and in its normal grid slot — users expect it to still be in the list).
- **D-09 — Embla carousel is preserved on the homepage portfolio section, not on `/portfolio`.** PORT-07's "preserve carousel animations" requirement is satisfied by keeping the carousel on the homepage (where it already lives). On `/portfolio` itself, the grid replaces the carousel. Verify the homepage portfolio section still works during Playwright pass (regression check).
- **D-10 — Featured hero hides when no item is flagged.** If `WHERE is_featured = true LIMIT 1` returns nothing, the page renders h1 + filters + grid with no hero. Mirrors Phase 10 D-01 zero-feature fallback.

### Card Polish

- **D-11 — Uniform `VideoCard` layout with type chip + year.**
  - Aspect-video thumbnail (16:9) — always rendered (placeholder per D-12 when neither `thumbnailUrl` nor YouTube fallback exists)
  - Title: `font-mono font-bold text-lg` (match Phase 10 D-03)
  - Category pill (if present): mono 11px, `#222222` bg
  - Description: `line-clamp-2`, sans 13px, `#888888`
  - Metadata row at the bottom: small type chip (`CASE STUDY` or `VIDEO`) on the left, year (derived from `createdAt`) on the right. Mono 11px uppercase, `#888888`.
  - `flex flex-col h-full` so all grid cells equal height (Phase 10 D-03 pattern)
- **D-12 — On-brand placeholder when no thumbnail AND no YouTube ID.** Mirror Phase 10 D-04: item title in mono on a dark gradient with the slice/line-repeat texture. No "NO IMAGE" label.
- **D-13 — Glitch hover overlay stays.** The existing `animate-glitch-hover` overlay on `VideoCard` is retained; it's consistent with hover-only glitch site-wide.

### Category Filters

- **D-14 — Match Phase 10 D-07 exactly.** Reuse the chip styling of `src/components/blog/category-filter.tsx`:
  - "ALL" first chip (clears filter)
  - Active chip: inverse palette (`bg-[#f5f5f0] text-[#000000]`)
  - Mono uppercase, rounded-none border
  - Mobile: `overflow-x-auto`, no wrap — horizontal scroll on overflow
  - Not sticky
  Filter state can stay client-only (useState) since the grid is server-rendered but filtered in the browser — consistent with current `PortfolioCarousel` implementation. If the planner wants URL state for deep links, use `nuqs` (already in stack).

### Admin

- **D-15 — No admin work in Phase 11.** `isFeatured` exists in the schema ([schema.ts:138](src/db/schema.ts#L138)) but there is currently **no `/admin/portfolio` route** — portfolio items are seeded/managed via direct DB access. Phase 11 does NOT build admin UI. Until a future phase delivers admin portfolio CRUD, flagging a featured item requires a DB update. The hero's hide-when-nothing-flagged fallback (D-10) makes this acceptable.

### Mobile (success criterion 3)

Not a separate decision — covered above:
- Sticky footer prev/next collapses to arrows-only on narrow viewports (D-01)
- Featured hero full-width stacks naturally on mobile (D-08)
- Grid: single column on mobile (D-08)
- Category chips horizontal-scroll (D-14)
- Swipe gesture for prev/next on detail pages (D-04)

### Claude's Discretion

- Exact gradient ramp for the featured hero overlay (must stay within `#000000`, `#0a0a0a`, `#111111`)
- Whether card clicks use `<Link>` on the whole card or preserve a "View case study" / "Watch video" button inside the card
- Whether the detail page autoplays the YouTube embed on mount for video-only items (trade-off: discoverable vs. intrusive)
- Exact swipe threshold / distance to trigger prev/next
- Whether to add a small `nuqs` `?from=category` param so prev/next could optionally scope to a filter later — default is NO (D-02 global order)
- How the "back to portfolio" link interacts with the sticky footer (stack or condense)
- Transition animation between detail pages on prev/next (fade, slide, or none)
- Whether the type chip reads `CASE STUDY` / `VIDEO` or `STUDY` / `FILM` or similar abbreviations

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` — Phase 11 section (goal + 3 success criteria + PORT-06/07)
- `.planning/REQUIREMENTS.md` §125-126 — PORT-06, PORT-07 entries
- `.planning/phases/10-blog/10-CONTEXT.md` — sibling-phase pattern for featured-hero + filter chips + zero-feature fallback (D-01, D-03, D-04, D-07)

### Existing implementation (polish + extend, don't rebuild)
- `src/app/(public)/portfolio/page.tsx` — current index, becomes featured-hero + grid per D-08
- `src/app/(public)/portfolio/[slug]/page.tsx` — current case-study-only detail route, must serve both types per D-05
- `src/components/portfolio/portfolio-carousel.tsx` — Embla carousel being replaced on /portfolio (still used on homepage per D-09)
- `src/components/portfolio/video-card.tsx` — refactor for D-06 (remove inline play) + D-11 (uniform layout + type chip + year)
- `src/components/portfolio/case-study-content.tsx` — keep structure, add sticky footer prev/next (D-01)
- `src/components/blog/category-filter.tsx` — reference pattern for D-14 chip styling
- `src/components/blog/post-card.tsx` — reference pattern for D-11 uniform card height + D-12 placeholder
- `src/app/(public)/page.tsx` — homepage portfolio section (D-09 regression target)
- `src/app/(public)/blog/page.tsx` — reference for featured-hero + grid composition

### Schema
- `src/db/schema.ts:122-141` — `portfolio_items` table. Fields in use this phase: `id`, `title`, `slug`, `type`, `category`, `description`, `thumbnailUrl`, `videoUrl`, `isYouTubeEmbed`, `clientName`, `sortOrder`, `isActive`, `isFeatured`, `createdAt`. No new columns required.

### Site-wide rules to honor
- `src/components/ui/glitch-heading.tsx` — GlitchHeading for every header (hero title, detail page h1, section labels)
- Memory `feedback_glitch_headers.md` — no auto-running animations on headings
- Memory `feedback_design_quality.md` — Phase 11 is a v2.0 quality page; must clear the bar
- Memory `feedback_playwright_verification.md` — use Playwright during dev for visual checks

### Locked palette
- `#000000`, `#0a0a0a`, `#111111`, `#222222`, `#f5f5f0`, `#888888`, `#555555` — every color in the phase must come from this list

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`GlitchHeading`** — wrap hero title, detail page h1, and any section headers. Hover-only, site-wide rule.
- **Existing `portfolio-carousel.tsx`** — keep the Embla setup for the homepage section. For the /portfolio grid, extract the category-filter chip pattern (or reuse the blog `CategoryFilter`) and drop the Embla scaffolding.
- **`case-study-content.tsx`** — the 4-section (client/challenge/approach/result) layout stays. Only change: add sticky footer prev/next wrapper.
- **`VideoCard`** — refactor target. Keep the glitch-hover overlay and YouTube-id extraction helper. Change: always link to `/portfolio/{slug}`, add type chip + year metadata row, remove inline iframe.
- **`next/image` + `Image` for thumbnails** — hero image should use `priority` so LCP stays fast (same pattern Phase 10 uses for its blog hero).
- **`nuqs`** — available if planner wants URL state for filter/prev-next scope; default is no URL state (D-02, D-14).

### Established Patterns
- **Server component fetches DB via Drizzle** on the index page ([portfolio/page.tsx:16-20](src/app/(public)/portfolio/page.tsx#L16-L20)). Pattern: fetch featured item separately (top-level query with `.limit(1)`), fetch all active items for the grid, hydrate client-side filter component.
- **`react.cache()`** — reuse for the prev/next lookup on the detail page so the slug→neighbors resolution doesn't re-hit the DB per request.
- **Fonts** — JetBrains Mono for headers/labels, Inter for body (configured via next/font). Use existing font classes.
- **Type chip pattern** — pill at 11px mono uppercase with `#222222` bg is used sitewide for category labels; extend to the type chip in D-11.

### Integration Points
- **Detail route contract change** — `/portfolio/[slug]` currently only renders case studies; generateStaticParams already iterates all active items so video slugs were technically reachable but rendered the case-study template against video-only data. D-05 makes this explicit: branch on `item.type` inside the route.
- **Prev/next data query** — on the detail page, fetch neighbors via two additional Drizzle queries or a single ordered fetch with client-side index math. Planner decides.
- **Featured query** — `db.select().from(portfolioItems).where(and(eq(isActive, true), eq(isFeatured, true))).limit(1)` for the hero; grid query is the existing `where(eq(isActive, true)).orderBy(asc(sortOrder))`.
- **Homepage regression** — /portfolio changes must NOT break the homepage portfolio section (which still uses PortfolioCarousel). Playwright check.

### Known Constraint
- **No `/admin/portfolio` route exists.** Confirmed: `src/app/admin/` contains beats, blog, bookings, bundles, clients, inbox, media, newsletter, packages, roles, rooms, services, settings, team, tech, testimonials — but no portfolio. `isFeatured` must currently be set via direct DB access. This is accepted in D-15; the zero-feature hero fallback (D-10) covers the case where admin hasn't seeded one.

</code_context>

<specifics>
## Specific Ideas

- Sticky footer prev/next visual model: Awwwards / Vercel case-study pattern (two titles, mono type, subtle border top). Stays within the locked palette.
- Featured hero visual pattern: same structure as Phase 10's blog hero — big image, dark gradient, GlitchHeading title, category pill, description, primary CTA. Reuse the component architecture if it's cleanly extractable.
- Type chip treatment: matches the category pill in weight/size but uses a slightly different tone (e.g., `#0a0a0a` bg vs `#222222`) so category and type are distinguishable at a glance. Planner decides exact divergence.
- Prev/next wrap-around matches the looping Embla feel of the homepage carousel — symmetry with the site's navigation vocabulary.

</specifics>

<deferred>
## Deferred Ideas

- **Admin portfolio CRUD** — create/edit/delete portfolio items, toggle `isFeatured`, drag-to-reorder `sortOrder`. Needed for non-DB admin ops. Candidate for its own inserted phase after v2.0 page polish.
- **Single-featured invariant (un-flag others on save)** — only relevant once admin UI exists. Mirror Phase 10 D-01 when that phase lands.
- **Related items strip on detail page** — "more like this" below the case study / video. Engagement hook, not in PORT-06.
- **Filter-scoped prev/next** — if user arrives from `?category=music-video`, navigate only within that slice. Deferred: adds URL state complexity and requires follow-through on every filter source. Revisit if UAT surfaces confusion.
- **Featured hero auto-rotator** — cycle through multiple isFeatured items via Embla on the /portfolio hero. Rejected for annoyance factor and admin cost.
- **Year-filter or sort control** — e.g., "2025", "2024", "Newest". Not in PORT-07 scope.
- **Autoplay on video detail page** — left to Claude's discretion during planning.
- **Case-study content enrichment** — adding fields (budget, duration, team, stack) to the case-study form/data model. Not in scope.
- **Back-to-portfolio preserving filter/position** — remembering which grid offset the user came from. Nice-to-have, not required.
- **Dual-card variants per type** — rejected in favor of uniform card + type chip (D-11).
- **Pure grid, no hero** — rejected in favor of featured hero + grid (D-08).

</deferred>

---

*Phase: 11-portfolio*
*Context gathered: 2026-04-20*
