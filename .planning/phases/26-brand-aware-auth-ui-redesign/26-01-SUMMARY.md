---
phase: 26-brand-aware-auth-ui-redesign
plan: 01
status: complete
requirements: [AUTH-01, AUTH-30]
completed: 2026-04-24
---

## What Was Built

Brand-detection foundation for Phase 26. Lifted hostname → brand mapping into a single source of truth (`src/lib/brand.ts`), refactored middleware to consume it, converted `(auth)/layout.tsx` into a server component that resolves brand from the host header and renders a `<div data-brand={brand}>` wrapper, and finalized the AUTH-01..AUTH-32 requirement IDs in REQUIREMENTS.md.

## Tasks

1. Created `src/lib/brand.ts` exporting `Brand`, `STUDIOS_HOSTS`, `TECH_HOSTS`, `getHostname`, `getBrandFromHost` (default 'studios' for any host not in TECH_HOSTS).
2. Refactored `src/middleware.ts` to import brand sets and `getHostname` from `@/lib/brand`. Removed duplicated declarations. `APPAREL_HOSTS` and `REVIEWS_HOSTS` left in place (not brand-related).
3. Replaced `src/app/(auth)/layout.tsx` with an async server component that calls `headers()`, resolves brand via `getBrandFromHost`, and wraps children in `<div data-brand={brand} className="min-h-screen bg-black text-white">`.
4. Appended `### Auth UI Redesign (AUTH-*) — Phase 26` section to REQUIREMENTS.md with all 32 IDs and replaced the placeholder traceability row.

## Key Files

### Created
- `src/lib/brand.ts`

### Modified
- `src/middleware.ts`
- `src/app/(auth)/layout.tsx`
- `.planning/REQUIREMENTS.md`

## Verification

- `pnpm tsc --noEmit` exits 0 after each task.
- `grep -c "AUTH-" .planning/REQUIREMENTS.md` → 34 hits (32 IDs + section header + traceability row).
- Layout has no `"use client"` and uses `await headers()`.
- Middleware no longer declares STUDIOS_HOSTS / TECH_HOSTS locally.

## Notes / Deviations

None. Plan followed verbatim. AuthShell wiring deferred to Plan 26-02 as specified.
