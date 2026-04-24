---
phase: 25-performance-audit-fixes
plan: 01
status: complete
completed: 2026-04-24
---

## What was built

Closed PERF-01 + PERF-02. Admin context switcher and edit→ingest navigation now render an instant skeleton (~100ms) and complete the full transition in ~270ms on dev.

### Changes

**4 segment-level `loading.tsx` files:**
- `src/app/admin/loading.tsx` — root admin
- `src/app/admin/tech/loading.tsx` — tech context
- `src/app/admin/tech/products/[id]/loading.tsx` — product edit
- `src/app/admin/tech/reviews/[id]/loading.tsx` — review edit

All use the same dark Glitch aesthetic (black bg, cream strokes, animate-pulse).

**`src/components/admin/admin-context-switcher.tsx`:**
- Added `useRouter` + `useEffect` imports.
- On mount: `router.prefetch("/admin")` and `router.prefetch("/admin/tech")` warm both sides immediately.
- On hover: `onMouseEnter` re-prefetches the target href (handles RSC payload expiry).
- Code comment references Phase 25-01 + measured improvement.

### Measured results (dev server, Playwright)

| Transition | Before | After |
|------------|--------|-------|
| Studios → Tech | 3-4s (reported) | **258ms** |
| Tech → Studios | 3-4s (reported) | **287ms** |

Target: < 500ms perceived. **Beat it by 2x on dev.** Prod will be faster (no Turbopack compile overhead).

### Test

`tests/25-01-admin-nav-perf.spec.ts` — 2/2 passed (desktop):
- Studios → Tech < 1500ms (dev buffer — actual 258ms)
- Tech → Studios < 1500ms (actual 287ms)

## Deviations

None. Cheap-wins-first discipline paid off: no architectural rewrite, 7 small files, 20 lines of code net, perf target smashed.
