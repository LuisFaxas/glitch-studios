---
phase: 27-media-video-strategy-foundation
plan: 04
subsystem: api
tags: [server-actions, oembed, drizzle, revalidate, zod, permissions]

requires:
  - phase: 27-media-video-strategy-foundation
    provides: media_item table + Drizzle bindings (Plan 27-01)
provides:
  - server-only fetchYouTubeOEmbed (5s timeout, null-on-error)
  - getMediaForEntity / getHomeFeatureMedia (.limit(3)) / getAllHomeFeatureMedia
  - 7 admin server actions: attachMediaItem, updateMediaItem, removeMediaItem, reorderMediaItems, setPrimaryMediaItem, pinToHomeFeatures, setHomeFeatures
  - HOME_FEATURE_SENTINEL_ID constant
affects: [27-05, 27-06, 27-07]

tech-stack:
  added: []
  patterns:
    - oEmbed cached in media_item row at attach time (no public-render oEmbed calls)
    - sortOrder = max(existing) + 1 within (attached_to_type, attached_to_id) on insert
    - revalidatePath helper switches by AttachType (every change touches /, plus type-specific routes)
    - Sentinel UUID 0000-... for home_feature.attached_to_id (Option A modeling — no separate join table)

key-files:
  created:
    - src/lib/media/youtube-oembed.ts
    - src/lib/media/queries.ts
    - src/actions/admin-media-items.ts
  modified: []

key-decisions:
  - "oEmbed failure is non-fatal — title falls back to 'Untitled video', admin can edit"
  - "First attached row to an entity becomes is_primary=true automatically (D-08 default)"
  - "Reorder + setPrimary use db.transaction (atomic) — sortOrder rewrites all rows in declared order"
  - "Home cap of 3 enforced at READ (.limit(3)) not WRITE — admin can over-pin and reorder freely (Pitfall 9)"

patterns-established:
  - "Server action file naming: src/actions/admin-{domain}.ts with 'use server' as line 1"
  - "Every mutating server action calls requirePermission('manage_content') as first line"
  - "Verbatim copy strings live in the action that throws (matches UI-SPEC) rather than imported"

requirements-completed: [D-14, D-15, D-16, D-18]

duration: 6min
completed: 2026-04-25
---

# Phase 27-04: Media Server Actions Summary

**7 admin server actions, server-only oEmbed fetcher, and entity/home query helpers ready for admin UI (Plans 05, 06) and public surfaces (Plan 07).**

## Performance

- **Duration:** ~6 min
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Server-only fetchYouTubeOEmbed with 5s AbortController timeout
- 3 query helpers (entity-scoped, home-public-3, home-admin-all)
- 7 server actions with consistent permissions guard + revalidation
- HOME_FEATURE_SENTINEL_ID enables uniform polymorphic schema for home features

## Task Commits

1. **Tasks 1-3 bundled:** `34d61e6` (feat) — oembed + queries + actions

## Files Created/Modified
- `src/lib/media/youtube-oembed.ts` — created
- `src/lib/media/queries.ts` — created
- `src/actions/admin-media-items.ts` — created

## Decisions Made
None — plan executed exactly as written.

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None.

## Next Phase Readiness
- Plan 05 imports attachMediaItem, removeMediaItem, reorderMediaItems, setPrimaryMediaItem, pinToHomeFeatures
- Plan 06 imports getAllHomeFeatureMedia, setHomeFeatures, removeMediaItem, pinToHomeFeatures
- Plan 07 imports getMediaForEntity, getHomeFeatureMedia for public reads

---
*Phase: 27-media-video-strategy-foundation*
*Completed: 2026-04-25*
