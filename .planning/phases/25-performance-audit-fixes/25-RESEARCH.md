# Phase 25: Performance Audit + Fixes — Research

**Date:** 2026-04-24
**Mode:** Inline research (CONTEXT.md decisions locked; cheap-wins-first discipline)

## Scout findings (via grep)

### PERF-05 — Native `<img>` offenders: 3 occurrences
- `src/components/admin/tech/review-editor.tsx:375, 402` — admin review hero + gallery thumbs
- `src/components/admin/tech/product-form.tsx:235` — admin product hero

All 3 are **admin-only**. Public surfaces are clean. Low user impact but zero risk to fix.

### PERF-01/02 — No `loading.tsx` under `src/app/admin/`
Every admin route forces a full server round-trip with no skeleton. This is the primary cause of the 3-4s perceived latency on the context switcher + ingest wizard nav. Adding segment-level `loading.tsx` gives instant skeleton feedback while the RSC renders.

### PERF-07 — Zero `.index()` calls in `src/db/schema.ts`
Drizzle schema has no explicit indexes. Every query that filters by a foreign key (orders.user_id, bookings.user_id, blog_posts.category_id, tech_product.category_id, etc.) does a full table scan. With the current data volume this may not be the bottleneck yet, but it WILL be before launch. Adding a single migration of ~15 indexes is low-risk.

**Candidate indexes (from grep):**

| Table | Column | Reason |
|-------|--------|--------|
| `account` | `userId` | Better Auth session lookups |
| `session` | `userId` | same |
| `blog_posts` | `categoryId` | `/blog/category/[slug]` filter |
| `blog_posts` | `brand` | Studios vs Tech filter |
| `beats` | `artistId` (if exists) | artist page queries |
| `order_items` | `orderId` | order detail joins |
| `order_items` | `beatId` | reverse lookup |
| `bundle_beats` | `bundleId` | bundle detail |
| `bundle_beats` | `beatId` | reverse lookup |
| `orders` | `userId` | client detail page |
| `bookings` | `userId` | dashboard bookings |
| `bookings` | `serviceId` | admin service detail |
| `reviews` | `productId` | product detail |
| `reviews` | `categoryId` | category rankings |
| `benchmark_runs` | `productId` | BPR recompute |

### PERF-04 — Dither hero WebGL + hero image
- Hero imagery: confirm `priority` prop on `<Image>` where hero is first paint.
- Dither WebGL (per user memory, locked): defer init to `requestIdleCallback` or `after LCP`. Do NOT remove.

### PERF-06 — Bundle audit
- Need one `next build --profile` run to produce stats. Look for client components above 200KB gzipped.
- Likely suspects (from code scout): WaveSurfer on beat cards (client-only), Recharts (admin), Framer Motion in leaf components.
- Fix pattern: `next/dynamic(() => import(...), { ssr: false })` for non-critical client islands.

## Strategy (cheap-wins-first)

Four plans, ordered by expected ROI:

1. **25-01 — Admin nav perf (PERF-01, PERF-02)**: `loading.tsx` under `/admin` + `router.prefetch` on context switcher pills + hover-prefetch on edit-page "Import benchmarks" CTA. Baseline measure: click duration from pointer-down to new-page-interactive via Playwright perf trace. Target: perceived < 500ms.

2. **25-02 — DB index migration (PERF-07)**: single Drizzle migration adding ~15 indexes to the schema for all foreign keys currently un-indexed. Minimal behavior risk. Capture before/after EXPLAIN ANALYZE on the 3 slowest admin pages.

3. **25-03 — Image pipeline audit (PERF-05) + mobile LCP (PERF-04)**: fix 3 native `<img>` in admin, audit hero `<Image>` for `priority` + correct `sizes`, defer Dither WebGL init to after LCP. Lighthouse mobile run before/after.

4. **25-04 — Bundle audit (PERF-06)**: run `next build`, identify > 200KB client bundles, apply `next/dynamic` splits. Document remaining heavy bundles with rationale if they must stay. Report bundle-size diff.

PERF-03 (public cold-nav TTFB < 1.5s) is intentionally deferred to Phase 46 deploy hardening — measuring it properly requires prod Vercel Analytics data and per-route analysis. Most pages already use RSC + static imports so baseline should be OK; we'll revisit if Vercel Analytics shows p95 > 1.5s after 25-01..25-04 land.

## Measurement tooling

- **Admin nav perf**: Playwright `page.tracing` + timestamps on pointer-down vs `page.waitForLoadState('networkidle')`. Emit JSON before/after to plan SUMMARY.md.
- **DB query perf**: Drizzle query logger (`LOGGER=true`) plus Postgres `EXPLAIN ANALYZE` on prod via Neon SQL editor or `psql`. User-owned.
- **LCP**: Chrome DevTools Lighthouse mobile preset against prod URL.
- **Bundle**: `next build` output (Next 16 Turbopack emits route-level bundle sizes in terminal).

## Non-goals this phase

- Replacing Turbopack with Webpack: out of scope.
- Cloudflare caching layer in front of Vercel: Phase 46.
- React Server Component refactors for correctness: out of scope unless a specific component is both heavy and wrongly client-rendered.
