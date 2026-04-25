---
phase: 27-media-video-strategy-foundation
plan: 06
subsystem: ui
tags: [admin, home-features, dnd-kit, alert-dialog]

requires:
  - phase: 27-media-video-strategy-foundation
    provides: setHomeFeatures + pinToHomeFeatures + removeMediaItem actions (Plan 27-04), getAllHomeFeatureMedia query (Plan 27-04), shadcn alert-dialog primitive (Plan 27-05)
provides:
  - <HomeFeaturesAdmin> client component
  - Mounted home-features picker section in /admin/settings/homepage
affects: [27-07]

tech-stack:
  added: []
  patterns:
    - HARD_CAP=3 visualized via "Live on home" chip on top-3 rows + cap warning when >3 pinned
    - Pinnable sources query excludes attached_to_type='home_feature' (so admin doesn't pin a pin)

key-files:
  created:
    - src/components/media/home-features-admin.tsx
  modified:
    - src/app/admin/settings/homepage/page.tsx

key-decisions:
  - "Mounted in /admin/settings/homepage rather than /admin/homepage — the latter doesn't exist in this codebase. Same admin context, just different URL."
  - "Pinnable sources fetched server-side with simple title-asc sort. Future: scope by attached_to_type with a tab switcher if list grows past ~50."

patterns-established:
  - "Read-time hard cap (Pitfall 9) — admin picker shows all rows, public read .limit(3) enforces visible cap"

requirements-completed: [D-10, D-11, D-12, D-17]

duration: 5min
completed: 2026-04-25
---

# Phase 27-06: Home Features Admin Picker Summary

**Admin can pin existing media_items to the home_feature attachment type, reorder via dnd-kit, and remove via AlertDialog confirm — top-3 rows tagged 'Live on home' (matches the public read .limit(3)).**

## Performance

- **Duration:** ~5 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- HomeFeaturesAdmin component with pin / reorder / remove flows
- Verbatim UI-SPEC empty state + cap warning copy
- "Live on home" chip on top-3 rows (read-time cap visualization)
- Mounted in existing /admin/settings/homepage page below HomepageEditor

## Task Commits

1. **Tasks 1-2 bundled:** `8e97c02` (feat) — HomeFeaturesAdmin + page mount

## Files Created/Modified
- `src/components/media/home-features-admin.tsx` — created
- `src/app/admin/settings/homepage/page.tsx` — added home features section + queries

## Decisions Made
- Mount path adjusted from /admin/homepage (plan) to /admin/settings/homepage (actual) — no functional change, plan path was stale.

## Deviations from Plan
- Mount path correction (see above).

## Issues Encountered
None.

## Next Phase Readiness
- Plan 27-07 home grid will read getHomeFeatureMedia() (limit 3) — what this admin curates becomes what the public sees.
- Operator action D-13 (post-deploy): paste a Trap-Snyder-style YouTube URL via the admin attach flow on a portfolio item, then pin it from this surface. No code seeds the URL.

---
*Phase: 27-media-video-strategy-foundation*
*Completed: 2026-04-25*
