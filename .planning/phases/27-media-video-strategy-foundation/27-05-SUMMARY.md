---
phase: 27-media-video-strategy-foundation
plan: 05
subsystem: ui
tags: [admin, dnd-kit, shadcn, alert-dialog, dialog, base-ui]

requires:
  - phase: 27-media-video-strategy-foundation
    provides: MediaEmbed (Plan 27-03) and admin server actions (Plan 27-04)
provides:
  - shadcn alert-dialog primitive (base-ui based, not radix)
  - <AddVideoDialog> paste-validate-attach dialog
  - <MediaItemAttachmentList> dnd-kit reorder list with remove + set-primary
  - Videos section mounted in beat / service / tech_review edit pages
affects: [27-06, 27-07]

tech-stack:
  added: ["@base-ui/react/alert-dialog (via shadcn alert-dialog primitive)"]
  patterns:
    - dnd-kit PointerSensor + KeyboardSensor + sortableKeyboardCoordinates pattern reused from src/components/admin/homepage-editor.tsx
    - Inline + toast dual-channel error UX with isInlineMessage guard to avoid duplication
    - window.location.reload() after attach (not optimistic — server already revalidated)

key-files:
  created:
    - src/components/ui/alert-dialog.tsx (shadcn primitive)
    - src/components/media/add-video-dialog.tsx
    - src/components/media/media-item-attachment-list.tsx
  modified:
    - src/app/admin/beats/[id]/edit/page.tsx
    - src/app/admin/services/[id]/edit/page.tsx
    - src/app/admin/tech/reviews/[id]/edit/page.tsx

key-decisions:
  - "Portfolio admin edit page does not exist in this codebase — Videos section NOT mounted there. Per plan instruction: do not fabricate edit pages. Portfolio media attachments still ship via Plan 27-01 backfill rows; future phase can add portfolio admin if needed."
  - "shadcn alert-dialog now uses base-ui (not Radix) under the hood — TooltipTrigger likewise. Verified by reading existing newsletter-list-table usage."
  - "After successful attach, full reload triggered to show new server-revalidated state. Optimistic upsert deferred."

patterns-established:
  - "Edit-page mount template: getMediaForEntity(type, id) at server level → map to MediaItemRow shape → pass as initialItems prop"
  - "Verbatim UI-SPEC error strings live where they throw (server action) and where they display (client) — not centralized"

requirements-completed: [D-14, D-15, D-16, D-18]

duration: 12min
completed: 2026-04-25
---

# Phase 27-05: Admin Attach Video UX Summary

**Admin can paste a YouTube URL, validate, and attach to a beat / service / review — with reorder, remove (AlertDialog confirmation), and set-primary; portfolio admin doesn't exist as a standalone edit page so that mount was deferred.**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- shadcn alert-dialog primitive added (base-ui underneath)
- AddVideoDialog with verbatim UI-SPEC error/success copy + dual inline/toast error guard
- MediaItemAttachmentList with dnd-kit a11y reorder (KeyboardSensor + sortableKeyboardCoordinates) and Tooltip-wrapped set-primary
- Videos section live in beat, service, and tech_review edit pages

## Task Commits

1. **Tasks 1-2 bundled:** `7a92147` (feat) — alert-dialog + AddVideoDialog + MediaItemAttachmentList + 3 admin page mounts

## Files Created/Modified
- `src/components/ui/alert-dialog.tsx` — created via shadcn CLI
- `src/components/media/add-video-dialog.tsx` — created
- `src/components/media/media-item-attachment-list.tsx` — created
- `src/app/admin/beats/[id]/edit/page.tsx` — added Videos section
- `src/app/admin/services/[id]/edit/page.tsx` — added Videos section
- `src/app/admin/tech/reviews/[id]/edit/page.tsx` — added Videos section after ReviewEditor

## Decisions Made
- **Portfolio admin mount deferred** — `src/app/admin/portfolio/` directory does not exist; portfolio items are seeded and managed indirectly via the homepage editor. Per plan instruction not to fabricate, the portfolio edit-page mount is omitted. Backfilled portfolio_item media_items still appear publicly via Plan 27-07 reads.

## Deviations from Plan
- **Skipped:** Plan listed `src/app/admin/portfolio/[id]/edit/page.tsx` as a target — file does not exist. Rather than create a new admin surface (which is a larger phase), this mount is intentionally omitted and documented here.

## Issues Encountered
- shadcn CLI prompted to overwrite `button.tsx`; answered no via stdin (`echo "n" | pnpm dlx shadcn@latest add alert-dialog --yes`) so only alert-dialog was added.
- TooltipTrigger from base-ui (not radix) doesn't support asChild/render in the same shape — used direct child wrapping per existing newsletter-list-table.tsx convention.

## Next Phase Readiness
- Plan 27-06 has the same primitives (AlertDialog, dnd-kit) to copy from
- Plan 27-07 can read media_item rows for any of the three entity types that admin can now manage
- Portfolio media attachments will only show backfilled rows until a portfolio admin surface is built (out of scope)

---
*Phase: 27-media-video-strategy-foundation*
*Completed: 2026-04-25*
