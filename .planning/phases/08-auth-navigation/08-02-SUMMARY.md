---
phase: 08-auth-navigation
plan: 02
subsystem: ui
tags: [tile-nav, mobile-nav, useSession, initials-avatar, my-account]

requires:
  - phase: 07.3-mobile-menu-overhaul
    provides: mobile-nav-overlay component
provides:
  - Desktop sidebar logged-in row with initials avatar + MY ACCOUNT link + sign-out icon (collapsed + expanded)
  - Mobile overlay My Account tile (logged-in state) linking to /dashboard
  - getInitials helper for deriving avatar initials from name or email
affects: [08-03]

tech-stack:
  added: []
  patterns:
    - "useSession hook in client nav components for auth-aware UI swaps"
    - "Initials derivation: 2 words → first letter of each; 1 word → first letter; fallback → first letter of email prefix"

key-files:
  created: []
  modified:
    - src/components/layout/tile-nav.tsx
    - src/components/layout/mobile-nav-overlay.tsx

key-decisions:
  - "Mobile overlay does NOT show Sign Out tile (per RESEARCH.md Open Question 1 resolution) — sign out is desktop sidebar only in Phase 8"
  - "Removed unused LogOut, signOut, useRouter imports from mobile-nav-overlay.tsx"

patterns-established:
  - "Avatar = inline span with rounded-full, no separate Avatar component (lighter than @base-ui Avatar)"

requirements-completed:
  - NAV-02

duration: 4min
completed: 2026-04-17
---

# Phase 08 Plan 02: Sidebar + Mobile Overlay Logged-In Swap Summary

**Desktop sidebar now shows initials avatar + MY ACCOUNT link + sign-out icon when logged in (collapsed + expanded). Mobile overlay logged-in tile becomes My Account → /dashboard. Logged-out states unchanged.**

## Performance
- **Duration:** ~4 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Sidebar collapsed state (logged in): initials circle navigating to /admin (admin/owner) or /dashboard (else)
- Sidebar expanded state (logged in): two-pane row with [initials + MY ACCOUNT link] + [sign-out icon button]
- Mobile overlay logged-in left slot: My Account tile linking to /dashboard
- getInitials helper added (handles 2-word, 1-word, and email-prefix fallback per D-07)

## Task Commits
1. tile-nav.tsx upgrade — `42df2a9`
2. mobile-nav-overlay.tsx upgrade — `76a00bc`

## Files Modified
- `src/components/layout/tile-nav.tsx` — added getInitials, replaced both collapsed and expanded auth blocks
- `src/components/layout/mobile-nav-overlay.tsx` — Sign Out tile → My Account tile (logged in), removed unused LogOut/signOut/useRouter imports

## Decisions Made
- Mobile overlay does NOT show Sign Out per RESEARCH.md Open Question 1 — desktop sidebar provides sign-out path. Mobile users sign out via desktop or session timeout.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Cleanup unused imports in mobile-nav-overlay.tsx**
- **Found during:** Task 2 (lint check)
- **Issue:** Removing the Sign Out tile orphaned `LogOut` (lucide), `signOut` (auth-client), and `useRouter` (next/navigation) imports
- **Fix:** Removed all three from imports
- **Verification:** `pnpm tsc --noEmit` clean for mobile-nav-overlay.tsx; lint won't flag unused imports
- **Committed in:** `76a00bc`

---

**Total deviations:** 1 auto-fixed (unused imports cleanup).
**Impact on plan:** Functional output unchanged.

## Issues Encountered
None.

## User Setup Required
None.

## Next Phase Readiness
- Plan 03 (dashboard landing page) — this plan provides the user with a clickable path to /dashboard via desktop MY ACCOUNT link and mobile My Account tile. Plan 03 fills /dashboard/page.tsx.

---
*Phase: 08-auth-navigation*
*Completed: 2026-04-17*

## Self-Check: PASSED
- [x] Both files modified, 2 commits matching 08-02 in git log
- [x] tsc --noEmit clean for both files
- [x] My Account = 1 in mobile-nav, /dashboard href = 1, Sign Out = 0
- [x] No Self-Check: FAILED marker
