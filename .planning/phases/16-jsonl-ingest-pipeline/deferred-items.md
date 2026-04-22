# Phase 16 Deferred Items

## Pre-existing lint errors (out of scope for Phase 16)

Discovered while running `pnpm lint` during Plan 02 Task 2 verification.
These are **not** caused by Phase 16 changes — they pre-date this phase.

- `src/components/tiles/tech-cross-link-tile.tsx:23` — `react-hooks/set-state-in-effect` (2 occurrences, set-state inside useEffect)
- `src/components/ui/dither.jsx:251` — `react-hooks/refs` (ref accessed during render in waveUniformsRef.current)
- `src/lib/permissions.ts:6` — `@typescript-eslint/no-unused-vars` warning for `adminRolePermissions`
- `tests/09-services-booking-mobile-audit.spec.ts:15` — `@typescript-eslint/no-explicit-any`
- `tests/mobile-audit.spec.ts:34` — `@typescript-eslint/no-explicit-any`
- `tests/sidebar-collapse.spec.ts:1` — unused `expect` import
- Plus ~54 additional warnings/errors spread across other pre-existing files

**Total from `pnpm lint`:** 125 problems (60 errors, 65 warnings).

**Scope check:** `pnpm exec eslint src/actions/admin-tech-ingest.ts` returns clean — the file created in Plan 02 introduces zero lint problems.

Recommendation: triage these in a dedicated quick-fix pass (e.g. `/gsd:quick`), not inside Phase 16.
