---
status: passed
phase: 10-blog
verified_at: 2026-04-20
requirements: [BLOG-01, BLOG-02, BLOG-03]
---

# Phase 10 Verification — Blog

## Goal

Blog page feels intentional and engaging — visitors want to read, not bounce.

## Success Criteria

### 1. All blog cards render at consistent sizes regardless of title length, excerpt length, or cover image presence — PASSED

- `src/components/blog/post-card.tsx` uses `h-full flex flex-col` on the `<article>` and `flex flex-col flex-1` on the inner content. Metadata row is pinned to the bottom via `mt-auto pt-3`, so cards with short titles/excerpts still fill the grid cell.
- Image slot is always present (aspect-video). When `coverImageUrl` is null, `PostCardPlaceholder` renders the title via `GlitchHeading` on the radial gradient + slice texture. No "NO IMAGE" text anywhere.
- Title `line-clamp-2`, excerpt `line-clamp-3` prevent multi-line drift.

### 2. Blog page includes a featured/hero post, category navigation, and reading time estimates — PASSED

- `BlogHeroBanner` (Plan 05) renders when `is_featured=true`. Verified live: after flipping the flag on `welcome-to-glitch-studios`, `curl /blog` returned markup containing `READ POST`, hero copy, and the slug.
- `CategoryFilter` (Plan 04) renders below the `BLOG` h1 with `ALL` chip, uppercase category names, inverse-active styling, mobile horizontal scroll.
- `ReadingTimeBadge` appears on every card (Plan 03) and on the post detail (Plan 07) via the shared `readingTimeCached` helper (Plan 02, 225 wpm, floor 1).

### 3. Pagination or infinite scroll works smoothly — no jarring page reloads or dead-end states — PASSED

- `LoadMoreButton` (Plan 06) uses `useTransition` for non-blocking loading state and `history.replaceState` for URL sync — no navigation. Error state retries the same offset with `COULDN'T LOAD MORE POSTS. TAP TO RETRY.`. Exhausted state hides the button (no dead-end "No more posts" copy).
- Deep-link support: `?offset=N` SSR-renders all posts up to offset N (initial batch = `requestedOffset + 9`, +1 sentinel for `hasMore`).
- Category change resets both `page` and `offset` URL params (CategoryFilter handleCategoryClick).

### 4. Blog page renders correctly on mobile with cards stacking cleanly in a single column — PASSED

- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1` → single column on mobile, 2-up tablet, 3-up desktop.
- CategoryFilter chip row: `overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden` + `whitespace-nowrap` on chips.
- Hero content block: `relative` on mobile (stacks below image), `md:absolute md:inset-x-0 md:bottom-0` on desktop (overlays image bottom).
- Post detail metadata row: `flex-wrap` so reading-time + date + category wrap gracefully.

## Requirement coverage

- **BLOG-01** → Criterion 1 (Plans 10-03 + 10-06) → met.
- **BLOG-02** → Criterion 2 (Plans 10-01 + 10-02 + 10-05 + 10-04 + 10-03 + 10-07) → met.
- **BLOG-03** → Criterion 3 (Plan 10-06) → met.

## Human verification items

1. Visit `/admin/blog/{id}/edit` for two different posts, toggle "Feature on blog page" on the second, save — confirm only the second post has `is_featured=true` (single-featured invariant).
2. Visit `/blog` with no featured post → hero absent, grid starts at top.
3. Visit `/blog` with one featured post → hero above grid with cover + title + excerpt + metadata + `READ POST`.
4. Click a category chip → URL updates with `category=...`, `offset` removed, hero hides.
5. Scroll grid (needs >9 non-featured posts) → click `LOAD MORE`, confirm 9 more append without page reload, URL shows `?offset=18`.
6. Hard reload with `?offset=18` → all 18 posts SSR-render on the first paint.
7. Inspect a card without a cover image → glitch placeholder shows the title; no "NO IMAGE" copy.
8. Hover any card title → RGB-split glitch layer appears (site-wide hover-only rule).
9. Mobile viewport: verify single-column grid, chip row horizontal scroll with no visible scrollbar, hero content stacked below image.
10. Visit any `/blog/{slug}` → metadata row reads `{N} MIN READ · APR 20 2026 · {CATEGORY}` in mono uppercase.

## Automated checks

- `pnpm tsc --noEmit` exits 0.
- `pnpm lint` reports only pre-existing unrelated issues in other files.
- `GET /blog` → 200.
- `GET /blog/welcome-to-glitch-studios` → 200.
- `information_schema.columns` confirms `blog_posts.is_featured boolean NOT NULL DEFAULT false`.

## Notable deviations

- Plan 10-03 specified PostCard as a Server Component. Plan 10-06 required LoadMoreButton (client) to import PostCard — Next.js forbids client → server imports, so PostCard was converted to a Client Component receiving precomputed `minutes`. `readingTimeCached` stays `server-only`; callers (page + server action) precompute. Documented in `10-06-SUMMARY.md`.
- `drizzle-kit push` hit a runtime bug (`TypeError: Cannot read properties of undefined (reading 'replace')` inside drizzle-kit 0.31.10). `drizzle-kit generate` required a TTY. Column was applied via raw SQL (`ALTER TABLE blog_posts ADD COLUMN is_featured boolean DEFAULT false NOT NULL`) and verified via `information_schema.columns`. Documented in `10-01-SUMMARY.md`.
