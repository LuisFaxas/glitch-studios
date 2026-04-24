# Phase 25: Performance Audit + Fixes — Context

**Gathered:** 2026-04-24
**Status:** Ready for planning
**Mode:** --auto (recommended defaults selected)

<domain>
## Phase Boundary

Seven concrete perf bugs from the audit + REQUIREMENTS.md. Close all PERF-01..07.

**PERF-01**: Admin Studios⇄Tech context switcher: 3-4s → <500ms
**PERF-02**: Admin edit → ingest wizard: ~4s → <500ms
**PERF-03**: Public cold-nav p95 TTFB < 1.5s on Vercel
**PERF-04**: Mobile LCP on `/` and `/tech` < 2.5s on mid-tier device
**PERF-05**: Image pipeline — every `<img>` via Next `<Image>` with correct `sizes`; no unoptimized hero art
**PERF-06**: Bundle audit — remove any client-only bundle > 200KB gzipped that isn't route-critical
**PERF-07**: Query audit on 5 slowest pages — add indexes or rework queries

**Explicitly NOT this phase:**
- New perf features (edge caching design, ISR strategy) — scope is fixes to measured bugs, not architecture
- Non-critical animation polish — that's Phase 40
- CDN/Cloudflare tuning beyond Vercel defaults — Phase 46 deploy hardening

</domain>

<decisions>
## Implementation Decisions

### Measurement methodology (locked)
- **D-01 Before/after numbers required.** Each PERF-* must capture a baseline number (tool: Chrome DevTools Performance panel for TTI/LCP; Vercel Analytics for TTFB; Playwright perf tracing for admin flows) BEFORE any change lands, and a post-change number AFTER. Both go in the plan SUMMARY.md.
- **D-02 Test on real devices via Vercel preview**, not local Turbopack dev (dev mode is significantly slower than prod; measuring dev perf produces false positives).
- **D-03 Mid-tier mobile = iPhone 13 or equivalent Android (CPU slowdown 4x in Chrome DevTools)** for PERF-04.

### Admin context switcher + ingest navigation (PERF-01, PERF-02)
- **D-04 Route-segment `revalidate` + `loading.tsx` + `router.prefetch`**. Root cause almost certainly: full server round-trip on each nav + no prefetch. Fix pattern: add `loading.tsx` to admin segments, add `router.prefetch` calls on hover for the switcher pills + "Import benchmarks" CTAs, and set `revalidate` on data-fetching pages where the data is stale-tolerant.
- **D-05 NO architectural rewrite.** If adding prefetch + loading skeleton gets us to <500ms perceived, that's the fix. A full RSC-structure refactor is out of scope.

### Public cold-nav (PERF-03)
- **D-06 Measure Vercel edge cache hit rate first.** If the bottleneck is cold-compile on first hit, the fix is fluent Next config (`dynamic = 'force-static'`) or `revalidate` on read-only pages, plus cache-warming via `generateStaticParams` where feasible.
- **D-07 Don't add third-party CDN layer.** Phase 46 territory.

### Mobile LCP (PERF-04)
- **D-08 Hero image + above-the-fold audit.** Typical LCP killers on this site: background Dither WebGL on hero, large OG image preload, non-optimized font loading. Fix pattern: `priority` on hero Image, defer Dither canvas to `requestIdleCallback`, preload fonts with `display: swap`.
- **D-09 Don't remove the Dither hero** — user explicitly approved it (see user memory "Dither hero approved"). Defer its init to post-LCP.

### Image + bundle audits (PERF-05, PERF-06)
- **D-10 Image audit: grep for `<img ` (lowercase, native tag) across `src/`** — every hit is an anti-pattern. Replace with Next `<Image>` with explicit `sizes`.
- **D-11 Bundle audit via `@next/bundle-analyzer`** or `next build --profile` stats. Flag any client component over 200KB gzipped; especially watch for Framer Motion on leaf components that could be client islands, Recharts on admin pages, WaveSurfer on beat cards.
- **D-12 Code-splitting fix pattern: `dynamic(() => import(...), { ssr: false })`** for non-critical client-only modules.

### Query audit (PERF-07)
- **D-13 Use Vercel Runtime Logs + Drizzle query logger** to rank slowest queries on the 5 most-hit pages (/, /beats, /tech, /admin, /admin/beats).
- **D-14 Add indexes before rewriting queries.** Most fixes will be `CREATE INDEX` for foreign keys currently un-indexed (orders.user_id, bookings.user_id, etc.). Check `src/db/schema.ts` for missing `.index()` calls.
- **D-15 Single migration per phase.** All new indexes land in ONE Drizzle migration file to keep deploy surface small.

### Claude's Discretion
- Exact index definitions — infer from query plans.
- Whether to add `React.cache` or rely on Next's fetch dedup — pick per query type.
- Specific `dynamic()` split boundaries — measure bundle analyzer output and split where it cuts > 50KB.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §Performance (PERF-01..07) — the 7 concrete targets.
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §Performance (if such section exists) — measured baselines from the audit.

### Existing perf-critical code
- `src/components/admin/admin-context-switcher.tsx` — the 3-4s switcher (PERF-01).
- `src/components/admin/admin-sidebar.tsx` — shared admin nav.
- `src/app/admin/tech/benchmarks/[slug]/ingest/` — the ingest wizard entry (PERF-02).
- `src/db/schema.ts` — check for missing `.index()` calls on FK columns (PERF-07).
- `src/components/hero/` — hero + Dither WebGL (PERF-04).
- `next.config.ts` — Next perf settings baseline.

### User memory (locked preferences)
- Dither hero WebGL approved (user memory) — DO NOT remove; defer its init instead.
- "Do not auto-load screenshots into context" — if perf profiling produces screenshots, reference paths only.

### External docs
- https://nextjs.org/docs/app/building-your-application/optimizing — Image, Script, Font, bundle splitting.
- https://nextjs.org/learn/seo/web-performance — LCP/TTFB guidance.
- https://web.dev/articles/vitals — CWV thresholds.

</canonical_refs>

<code_context>
## Existing Code Insights

### Measurement tools available
- Playwright perf tracing via `page.route` + `page.tracing.start/stop` — can capture admin nav perf without external tooling.
- Vercel Analytics already on prod (free tier).
- Next 16 Turbopack produces bundle-size stats — use `next build` output (will need one production build locally).
- Drizzle query logger can be toggled via `LOGGER=true`.

### Known perf anti-patterns (from prior phase work)
- `admin-sidebar.tsx` uses `pathname.startsWith(href)` for active state — fine for perf, already scoped.
- Mobile overlay uses Framer Motion `useDragControls` (Phase 23-04) — lean, no perf concern.
- Dither WebGL on hero — heavyweight, already flagged. Defer init.

### Integration points
- New `loading.tsx` files under `src/app/admin/` segments.
- New Drizzle migration file for PERF-07 indexes.
- Bundle analyzer config addition to `next.config.ts` (dev-only, via env flag).

</code_context>

<specifics>
## Specific Ideas

- **Baseline-first discipline.** No fix lands without a before/after number. "Feels faster" is not acceptance criteria.
- **Cheapest wins first.** Add `loading.tsx` + prefetch (PERF-01/02) before rewriting anything. If that gets us under the target, we stop.
- **Single migration for indexes** — easier to rollback.

</specifics>

<deferred>
## Deferred Ideas

- Edge caching strategy / ISR redesign — Phase 46 deploy hardening.
- Replacing Dither with CSS — Phase 40 (public polish) or never.
- Brotli compression tuning — Vercel default already.
- Third-party CDN (Cloudflare in front of Vercel) — Phase 46.
- Query plan analyzer UI in admin — future, not needed for v4.0.

### Reviewed Todos (not folded)
None.

</deferred>

---

*Phase: 25-performance-audit-fixes*
*Context gathered: 2026-04-24 (auto mode — recommended defaults selected)*
