---
phase: 27-media-video-strategy-foundation
plan: 01
subsystem: database
tags: [drizzle, postgres, polymorphic, migration, media, youtube]

requires:
  - phase: 26-artist-application-auth
    provides: idempotent SQL migration pattern (DO $$ EXCEPTION + meta-row guard) and standalone postgres-js runner
provides:
  - polymorphic media_item table with media_kind enum
  - Drizzle mediaItems + mediaKindEnum + mediaItemsRelations exports
  - phase27_migration_meta guard for one-shot backfill
  - pnpm db:migrate:phase27 runner script
  - 4 backfilled rows from portfolio_items.video_url + tech_reviews.video_url
affects: [27-03, 27-04, 27-05, 27-06, 27-07]

tech-stack:
  added: []
  patterns:
    - polymorphic attached_to_type/attached_to_id (text + uuid) — no FK, validated in zod
    - kind as pgEnum, attachment target as plain text (extensible without migration)
    - is_primary as app-level invariant (no DB constraint)

key-files:
  created:
    - src/db/migrations/0007_phase27_media.sql
    - scripts/run-phase27-migration.ts
  modified:
    - src/db/schema.ts
    - package.json

key-decisions:
  - "kind: pgEnum (closed set, two values), attached_to_type: text (open set — home_feature, future targets without migration)"
  - "Preserve portfolio_items.video_url and tech_reviews.video_url as read-time fallback for one release per CONTEXT D-07"
  - "created_by FK uses text (Better Auth user.id is text, not uuid)"
  - "is_primary enforced at app layer (admin set-primary toggle), no partial unique index"

patterns-established:
  - "Migration runner naming: scripts/run-phase{N}-migration.ts → pnpm db:migrate:phase{N}"
  - "Phase-scoped meta table (phase{N}_migration_meta) guards one-shot backfills"

requirements-completed: [D-06, D-07, D-08]

duration: 8min
completed: 2026-04-25
---

# Phase 27-01: media_item table Summary

**Polymorphic media_item table live in Postgres with Drizzle bindings; existing video_url rows backfilled via idempotent migration.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-25T11:24Z
- **Completed:** 2026-04-25T11:32Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Drizzle mediaItems + mediaKindEnum exported from src/db/schema.ts
- Idempotent SQL migration applied (4 backfilled rows from portfolio_items + tech_reviews)
- Idempotency proven: second run yields identical state (same meta timestamp, same row count)
- pnpm db:migrate:phase27 script registered

## Task Commits

1. **Tasks 1-3 bundled:** `68490a6` (feat) — schema + migration SQL + runner + script + applied

## Files Created/Modified
- `src/db/schema.ts` — appended mediaKindEnum, mediaItems table, mediaItemsRelations after artistApplications block
- `src/db/migrations/0007_phase27_media.sql` — created, idempotent enum/table/indices + backfill DO block
- `scripts/run-phase27-migration.ts` — created, postgres-js runner with assertion queries
- `package.json` — added db:migrate:phase27 script

## Decisions Made
None — plan executed exactly as written.

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None. Re-running the migration emitted Postgres `relation already exists, skipping` NOTICE for the meta table CREATE — expected and harmless (the table is wrapped in IF NOT EXISTS but Postgres still surfaces the notice).

## Next Phase Readiness
- 27-03 (MediaEmbed) can read media_item rows
- 27-04 (server actions) has the table to insert/update/delete against
- 27-05/06 (admin UX) has the data layer in place
- 27-07 (public surfaces) can query media_item joined to attachment entities

---
*Phase: 27-media-video-strategy-foundation*
*Completed: 2026-04-25*
