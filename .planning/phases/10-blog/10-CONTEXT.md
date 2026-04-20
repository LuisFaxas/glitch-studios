# Phase 10: Blog - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Quality overhaul of the existing `/blog` page. Ship a featured/hero post, uniform card sizing, category navigation polish, reading-time estimates, and a smoother pagination interaction so visitors want to read instead of bounce.

In scope:
- Blog index (`/blog`) presentation polish
- New `is_featured` boolean + admin flag UX
- Reading-time compute helper (content → minutes)
- Hero banner component + integration
- Card consistency refactor (PostCard)
- "Load More" button replacing numeric pagination
- Category chip polish (reuse existing CategoryFilter component)

Out of scope (future phases or backlog):
- Post detail page redesign (only the reading-time badge lands there)
- Author display / bio
- Related posts section
- Social share buttons
- Comments / reactions
- RSS / newsletter wiring
- Blog admin rewrite (only the `is_featured` toggle + featured-post guard land in admin this phase)

</domain>

<decisions>
## Implementation Decisions

### Featured Post

- **D-01 — Admin-flagged featured post.** Add `is_featured boolean default false` to `blog_posts`. Admin UI exposes a toggle; saving it as `true` un-flags any currently-featured post so only ONE post is featured at a time. If no post is flagged, the blog page hides the hero banner and goes directly to the grid (zero-feature fallback).

- **D-02 — Full-width hero banner above the grid.** The featured post renders as a dominant hero block ABOVE the card grid, not inside it. Structure:
  - Large cover image (16:9) with a dark gradient overlay for text legibility
  - Category badge (if any)
  - Big headline in `<GlitchHeading>` (display token: `clamp(28px, 5vw, 48px)` mono bold uppercase; hover-only glitch, not auto-running)
  - Excerpt (Inter 14px, max-width 640px, line-clamp 3)
  - Reading time + date metadata row
  - Primary CTA button "READ POST" linking to `/blog/{slug}`
  - Mobile: same structure, full-width, stacks vertically before the grid

### Card Consistency (BLOG-01)

- **D-03 — Fixed card structure, uniform height across all cards.** Every `PostCard` renders:
  - Image slot: aspect-video (16:9) — always present (placeholder per D-04 when `coverImageUrl` is null)
  - Category badge (if post has category) — mono 11px, bg `#222222`
  - Title: mono bold text-xl, `line-clamp-2`
  - Excerpt: sans 13px muted, `line-clamp-3`
  - Metadata row: reading time + date, separated by `·`, mono 11px muted
  - Padding: `p-4`
  Use `flex flex-col` inside the card so content stacks predictably and the card can optionally use `h-full` when placed in a grid row. Grid is `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1` (as today), unchanged.

- **D-04 — On-brand placeholder when a post has no cover image.** Replace the current "NO IMAGE" text placeholder with: post title rendered in GlitchHeading-style mono (smaller size — `text-[clamp(18px,3vw,28px)]`) on a dark radial gradient. Uses the same slice/line-repeat texture currently in the placeholder for tactile feel. Every card has SOMETHING in the image slot, on-brand, no apologetic "No Image" label.

### Pagination / Scrolling (BLOG-03)

- **D-05 — "LOAD MORE" button, no full reload.** Initial render: 9 posts. Button at the bottom of the grid labelled `LOAD MORE` (mono bold uppercase) appends the next 9 without navigating away. URL updates to `?offset=N` using `nuqs` or `history.replaceState` so deep-links work. Loading state: button text swaps to `LOADING...` with a subtle pulse. When no more posts: button disappears and the sticky "Back to top" gradient (if any) is the only cue (optional — planner decides if that's worth the complexity). On page reload with `?offset=N`, the initial batch includes all posts up to that offset so direct links land where expected.

### Reading Time + Category Nav (BLOG-02)

- **D-06 — Auto reading time at 225 wpm.** Compute reading time from `post.content` at session render time (cached via `react.cache()`). Algorithm: strip HTML/markdown tags, count whitespace-separated tokens, divide by 225, `Math.ceil`. Display format: `{N} MIN READ` (mono uppercase). Visible on: every card, the hero banner, AND the post detail page (`/blog/[slug]` metadata row). No admin field — fully derived. Minimum floor = 1 (never show `0 MIN READ`).

- **D-07 — Horizontal category chips under the h1.** Keep the existing CategoryFilter component but polish:
  - Row of chips directly below the "BLOG" h1
  - "ALL" as the first chip (clears filter)
  - Active chip = inverse styling (`bg-[#f5f5f0] text-[#000000]`)
  - Not sticky — keeps simple, doesn't intrude on reading
  - Mobile: horizontal scroll on overflow (`overflow-x-auto`), no wrap — lets many categories live without pushing cards down
  - No category descriptions / counts in the chip (optional future polish)

### Mobile Rendering (criterion 4)

Not a separate decision — covered by the above:
- Hero banner full-width → stacks naturally on mobile
- Cards: `grid-cols-1` on mobile (single column) per D-03
- "Load More" button same on mobile
- Category chips horizontal-scroll on mobile per D-07

### Claude's Discretion

- Exact color values for the hero gradient overlay (keep within the locked dark palette: `#000000`, `#0a0a0a`, `#111111`)
- Whether to use `nuqs` (already in stack) or plain `history.replaceState` for `?offset=N`
- Transition animation when "Load More" appends (fade-up, or none)
- Whether to use Next.js Server Actions or a fetch route for the load-more request
- Exact post-detail-page reading-time badge placement (top of content vs. adjacent to date)
- HTML stripping library for reading-time (simple regex vs. `strip-markdown`)
- Whether the zero-posts empty state gets polished in this phase or stays as-is

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` — Phase 10 section (goal + success criteria + BLOG-01/02/03 requirements)
- `.planning/REQUIREMENTS.md` — BLOG-01, BLOG-02, BLOG-03 entries

### Existing implementation (polish, don't rebuild)
- `src/app/(public)/blog/page.tsx` — current blog index with pagination
- `src/components/blog/post-card.tsx` — card component to refactor per D-03/D-04
- `src/components/blog/category-filter.tsx` — category chips to polish per D-07
- `src/app/(public)/blog/[slug]/` — post detail page (reading-time badge lands here per D-06)

### Schema
- `src/db/schema.ts` §144-165 — `blogCategories` + `blogPosts` tables (new `is_featured` column lands in `blog_posts`)

### Site-wide rules to honor
- `src/components/ui/glitch-heading.tsx` — GlitchHeading component for all headers (site-wide rule: hover-only glitch)
- `src/components/layout/glitch-logo.tsx` — reference for glitch animation timing patterns
- Memory `feedback_glitch_headers.md` — no auto-running animations on headings

### Admin integration
- `src/actions/admin-settings.ts` — pattern for admin setting writes (permission-gated)
- `src/app/admin/` — where the `is_featured` toggle UI will live (Phase 10 admin work is limited to this one toggle, per scope)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`GlitchHeading`** — Used sitewide for headers with hover-only glitch. Hero title + post-card title variants should both wrap with it.
- **`PostCard`** (src/components/blog/post-card.tsx) — Already has glitch-hover animation overlay, category badge, cover image via next/image, date formatting. Refactor for D-03/D-04 rather than rewrite.
- **`CategoryFilter`** (src/components/blog/category-filter.tsx) — Already works as a client component with active-chip styling. Polish per D-07.
- **`nuqs`** — Already in stack for URL state (used in beats filter). Reusable for `?offset=N` query-state in D-05.
- **`Image`** from next/image — Already used in PostCard; reuse for hero banner with `priority` prop so the hero image LCP is fast.

### Established Patterns
- **Server Components query the DB directly via Drizzle** — current blog page does this. Keep the pattern for initial render, use a server action or route for load-more appends.
- **`react.cache()` for per-request dedupe** — used in services/portfolio lookup (`src/lib/services/portfolio-for-service.ts`). Reuse the pattern for reading-time compute so the same post rendered twice doesn't recompute.
- **Tailwind 4 locked palette** — `#000000`, `#0a0a0a`, `#111111`, `#222222`, `#f5f5f0`, `#888888`, `#555555`. Every color in this phase must come from this palette (hero gradient included).
- **JetBrains Mono for headers/labels, Inter for body** — already configured via next/font. Use the existing font classes.

### Integration Points
- **Admin**: new `is_featured` toggle on the post-edit form. Save handler must un-flag existing featured posts before setting this one (single-featured invariant).
- **DB migration**: `ALTER TABLE blog_posts ADD COLUMN is_featured BOOLEAN DEFAULT FALSE` — single-column migration via Drizzle-kit.
- **Blog page**: fetches the featured post separately (top-level query), then grid fetches non-featured published posts with offset/limit.

</code_context>

<specifics>
## Specific Ideas

- Hero banner visual reference: big image + gradient + big GlitchHeading headline + CTA button — same pattern as the coming-soon manifesto landed in Phase 09, adapted for blog content.
- Category chip active-state: inverse palette (`#f5f5f0` bg on `#000` text), matches existing Phase 09 service tile selected-state.
- Reading-time badge formatting: `{N} MIN READ` (mono 11px uppercase, muted color) — matches the metadata row treatment of other phases (Phase 09 service detail POLICIES/PROCESS labels).

</specifics>

<deferred>
## Deferred Ideas

- **Author display / bio** — not in Phase 10 requirements; candidate for a future "Author profile" phase.
- **Related posts at bottom of post detail** — engagement hook for post detail, but phase 10 scope is the blog INDEX. Future polish.
- **Social share buttons** — not requested.
- **Comments / reactions** — new capability; separate phase.
- **RSS feed / newsletter signup on blog** — not in phase scope; newsletter signup already exists elsewhere (Phase 09 launch-notify).
- **Admin blog post composer polish** — limit Phase 10 admin work strictly to the `is_featured` toggle. Full admin UX is separate.
- **Post detail page redesign** — only the reading-time badge lands there this phase.
- **Infinite scroll + back-to-top** — considered but rejected in favor of explicit "Load More" (D-05) for SEO + predictable UX.
- **Per-category color accents** — considered for D-04 placeholder; rejected in favor of on-brand glitch gradient (no new schema).

</deferred>

---

*Phase: 10-blog*
*Context gathered: 2026-04-20*
