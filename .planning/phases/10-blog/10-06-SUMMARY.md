---
phase: 10-blog
plan: 06
status: complete
---

# Plan 10-06 Summary — Blog page integration

## What shipped

- `src/actions/public-blog.ts` — server action `loadMoreBlogPosts({ offset, categorySlug })` returns `{ posts, hasMore }`. Excludes featured via `ne(blogPosts.isFeatured, true)`, batch size 9, fetches +1 to detect `hasMore` without a count query. Each returned post includes `category` + precomputed `readingTime`.
- `src/components/blog/load-more-button.tsx` — Client Component with `useTransition`. Appends to in-memory state, renders through `<PostCard post minutes={post.readingTime} />`, syncs URL via `history.replaceState({}, "", url)`. States: idle / loading (`animate-pulse`) / error / exhausted (hidden).
- `src/app/(public)/blog/page.tsx` — Rewritten. Reads `offset` search param (numeric pagination removed). Fetches featured post separately (only when no category filter). Grid query excludes featured. Initial SSR batch = `requestedOffset + 9` (+1 sentinel) so deep-links to `?offset=N` render all posts up to that offset. Empty states use UI-SPEC copy (`NO POSTS YET`, `NO POSTS IN THIS CATEGORY`). Page h1 wrapped in `GlitchHeading`.

## Deviation from plan — PostCard became a Client Component

Plan 10-03 converted PostCard to a Server Component that called `readingTimeCached` internally. Plan 10-06 then required LoadMoreButton (a Client Component) to `import { PostCard }` and render it dynamically. Next.js App Router forbids Client Components from importing Server Components, so the plans as-written were mutually incompatible.

Resolution:
- `PostCard` now has `"use client"` and takes `{ post, minutes: number }`.
- `readingTimeCached` stays `"server-only"` (pure function + `react.cache` wrapper).
- Callers (the server-rendered grid + the server action) precompute `minutes` and pass it as a prop.

Semantically equivalent (same markup, same behavior); `readingTimeCached` still dedupes within a single server render.

## Query shape

- Featured: `and(eq(status, "published"), eq(isFeatured, true))` limit 1, skipped when `categorySlug` is set.
- Grid: `and(eq(status, "published"), ne(isFeatured, true), [eq(categoryId, X)?])` order by `publishedAt desc`, limit `requestedOffset + 10` for initial SSR.

## Runtime verification

- `pnpm tsc --noEmit` exits 0.
- `pnpm lint` reports only pre-existing unrelated warnings/errors.
- `GET /blog` → 200 (dev server).
- `GET /blog/welcome-to-glitch-studios` → 200.
- After flipping `is_featured=true` on a post, the hero renders with `READ POST` CTA and reading-time badges.

## Key files

created:
  - src/actions/public-blog.ts
  - src/components/blog/load-more-button.tsx
modified:
  - src/app/(public)/blog/page.tsx
  - src/components/blog/post-card.tsx  (client-component conversion, minutes prop)
