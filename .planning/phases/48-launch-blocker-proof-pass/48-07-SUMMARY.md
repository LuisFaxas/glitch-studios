---
phase: 48-launch-blocker-proof-pass
plan: 07
subsystem: auth
tags: [typescript, eslint, playwright, drizzle, bookings, auth32]

requires:
  - phase: 48-launch-blocker-proof-pass
    provides: AUTH-32 command output identifying the overlay TypeScript blocker and explicit-any lint blockers
provides:
  - AUTH-32 overlay diagnostic no longer uses Element.offsetParent unsafely
  - Playwright mobile audit helpers use the Browser type
  - Admin client and role raw SQL rows are typed at query boundaries
  - Booking status and refund policy paths no longer use explicit any casts
affects: [AUTH-32, admin-clients, admin-roles, bookings, launch-proof]

tech-stack:
  added: []
  patterns:
    - Playwright Browser helper typing
    - Drizzle raw SQL local row interfaces
    - BookingStatus guard before Drizzle status filters

key-files:
  created:
    - .planning/phases/48-launch-blocker-proof-pass/48-07-SUMMARY.md
  modified:
    - tests/forensics-overlay-leak.spec.ts
    - tests/09-services-booking-mobile-audit.spec.ts
    - tests/mobile-audit.spec.ts
    - src/actions/admin-clients.ts
    - src/actions/admin-roles.ts
    - src/components/admin/client-list-table.tsx
    - src/app/admin/bookings/actions.ts
    - src/app/api/bookings/cancel/route.ts
    - src/app/api/bookings/reschedule/route.ts

key-decisions:
  - "Invalid admin booking status filters are ignored unless they match the BookingStatus union."
  - "Raw SQL row interfaces extend Record<string, unknown> so Drizzle RowList assertions remain TypeScript-valid without any casts."

patterns-established:
  - "Type raw SQL results once at the db.execute boundary, then consume typed rows without per-field any casts."
  - "Use runtime union guards before passing user-controlled status strings into typed Drizzle filters."

requirements-completed: [AUTH-32]

duration: 9min
completed: 2026-04-28
---

# Phase 48 Plan 07: AUTH-32 TypeScript and Typed Rows Summary

**AUTH-32 explicit-any and overlay TypeScript blockers removed from the reported Playwright, admin client, role, and booking policy files.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-28T11:36:25Z
- **Completed:** 2026-04-28T11:45:00Z
- **Tasks:** 3
- **Files modified:** 9 code files, 1 summary

## Accomplishments

- Replaced the unsafe overlay diagnostic with an `HTMLElement` guard before reading `offsetParent`.
- Replaced Playwright mobile helper `browser: any` signatures with `type Browser`.
- Added local raw SQL row interfaces for admin client and role queries, removing all reported `as any[]` casts.
- Typed admin client type tabs so the click handler no longer needs `tab.value as any`.
- Added a `BookingStatus` guard for admin booking filters and typed cancel/reschedule policy calls without explicit any casts.

## Task Commits

1. **Task 1: Fix the TypeScript overlay diagnostic and Playwright browser types** - `9a26e26`
2. **Task 2: Replace raw SQL `any[]` casts in admin client and role files** - `e776f2a`
3. **Task 2 follow-up: Align row interfaces with Drizzle RowList typing** - `d85589f`
4. **Task 3: Type booking status and refund policy casts** - `7c96031`

## Files Created/Modified

- `tests/forensics-overlay-leak.spec.ts` - Guarded `offsetParent` access with `el instanceof HTMLElement`.
- `tests/09-services-booking-mobile-audit.spec.ts` - Imported and used Playwright `Browser`.
- `tests/mobile-audit.spec.ts` - Imported and used Playwright `Browser`.
- `src/actions/admin-clients.ts` - Added local row interfaces and removed raw SQL `any[]` casts.
- `src/actions/admin-roles.ts` - Added local row interfaces, removed `ne`, and removed the unused assignRole session binding.
- `src/components/admin/client-list-table.tsx` - Typed type tabs and removed `tab.value as any`.
- `src/app/admin/bookings/actions.ts` - Added `BOOKING_STATUSES` and `isBookingStatus`.
- `src/app/api/bookings/cancel/route.ts` - Typed `BookingStatus` and `RefundPolicy` policy inputs.
- `src/app/api/bookings/reschedule/route.ts` - Typed `BookingStatus` policy input.

## Verification

- `pnpm tsc --noEmit --pretty false`
  - RED before Task 1: failed with `tests/forensics-overlay-leak.spec.ts(37,17): Property 'offsetParent' does not exist on type 'Element'.`
  - After Task 1: passed with exit 0.
  - Final run after parallel executors advanced the tree: failed only in non-owned files:
    `src/components/admin/client-detail-sheet.tsx` and `src/components/admin/tech/product-form.tsx` with `Type 'number' is not assignable to type 'Timeout'`.
- `pnpm exec eslint src/actions/admin-clients.ts src/actions/admin-roles.ts src/components/admin/client-list-table.tsx` - passed with exit 0.
- `pnpm exec eslint src/app/admin/bookings/actions.ts src/app/api/bookings/cancel/route.ts src/app/api/bookings/reschedule/route.ts` - passed with exit 0.
- Acceptance grep confirmed the guarded `offsetParent` expression, Browser imports, local row interfaces, booking status guard, and no remaining `as any`, `any[]`, or `browser: any` matches in plan-owned files.

## Decisions Made

- Invalid admin booking status filters are ignored rather than coerced, preserving typed Drizzle status filtering.
- Raw SQL interfaces extend `Record<string, unknown>` to satisfy Drizzle's raw `RowList<Record<string, unknown>[]>` overlap checks without weakening code to `any`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Drizzle raw row assertion TypeScript overlap**
- **Found during:** Task 3 full `tsc` safety check after Task 2.
- **Issue:** Direct assertions from Drizzle `RowList<Record<string, unknown>[]>` to narrow row arrays triggered TS2352.
- **Fix:** Made the local raw SQL row interfaces extend `Record<string, unknown>`.
- **Files modified:** `src/actions/admin-clients.ts`, `src/actions/admin-roles.ts`
- **Verification:** Scoped admin ESLint passed; full `tsc` no longer reports plan-owned row assertion errors.
- **Committed in:** `d85589f`

**Total deviations:** 1 auto-fixed (Rule 1).
**Impact on plan:** Required for TypeScript correctness of the planned row typing. No behavior or scope change.

## Issues Encountered

- Parallel execution advanced `HEAD` while Task 2 was being amended. The mixed amend was repaired by restoring the other executor's `48-16` docs commit (`cb6f5f9`) and committing the row-typing fix separately as `d85589f`.
- Final full `tsc` is blocked by non-owned files from parallel work: `src/components/admin/client-detail-sheet.tsx` and `src/components/admin/tech/product-form.tsx`. These are outside Plan 48-07 ownership and were not modified here.

## Deferred Issues

- Non-owned TypeScript timeout errors in:
  - `src/components/admin/client-detail-sheet.tsx:78`
  - `src/components/admin/client-detail-sheet.tsx:93`
  - `src/components/admin/tech/product-form.tsx:88`
  - `src/components/admin/tech/product-form.tsx:100`

## Known Stubs

None. Stub-pattern scan only matched legitimate UI placeholder attributes and the real API error text `Selected time slot is not available`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan-owned AUTH-32 files are typed and scoped ESLint-clean. The original overlay TypeScript blocker is gone; current full `tsc` closure depends on the separate non-owned timeout errors introduced by parallel work.

## Self-Check: PASSED

- All 9 plan-owned code files and this summary file exist.
- Commits found: `9a26e26`, `e776f2a`, `d85589f`, `7c96031`.

---
*Phase: 48-launch-blocker-proof-pass*
*Completed: 2026-04-28*
