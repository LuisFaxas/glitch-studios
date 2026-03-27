---
phase: 04-admin-dashboard-email
plan: 07
subsystem: email
tags: [newsletter, resend, react-email, tiptap, unsubscribe, hmac, broadcast]

requires:
  - phase: 04-admin-dashboard-email-01
    provides: "DB schema for newsletterSubscribers and newsletterBroadcasts"
  - phase: 04-admin-dashboard-email-02
    provides: "Admin shell, sidebar, permissions, RBAC"
provides:
  - Newsletter composer with Tiptap editor and segment-based sending
  - Resend batch API broadcast with partial failure tracking
  - HMAC-verified unsubscribe page at /unsubscribe
  - Subscriber auto-tagging via Stripe webhook hooks
  - Broadcast history table with status badges
  - Subscriber management with search, tags, and removal
affects: [04-admin-dashboard-email-08]

tech-stack:
  added: []
  patterns:
    - "Resend batch.send with chunking (100 per batch) and per-batch error tracking"
    - "HMAC-SHA256 unsubscribe token using CRON_SECRET"
    - "Radio group segment selector with live active-only counts"

key-files:
  created:
    - src/lib/email/newsletter-broadcast.tsx
    - src/actions/admin-newsletter.ts
    - src/actions/newsletter.ts
    - src/app/(public)/unsubscribe/page.tsx
    - src/app/admin/newsletter/page.tsx
    - src/app/admin/newsletter/compose/page.tsx
    - src/components/admin/newsletter-composer.tsx
    - src/components/admin/newsletter-preview-dialog.tsx
    - src/components/admin/newsletter-list-table.tsx
    - src/components/admin/subscriber-list-table.tsx
  modified:
    - src/app/api/webhooks/stripe/route.ts

key-decisions:
  - "HMAC-SHA256 with CRON_SECRET for unsubscribe token verification (reuses existing secret)"
  - "Soft-remove subscribers (isActive=false) rather than hard delete for compliance"
  - "Auto-tagging in webhook wrapped in try/catch so failures never break payment flow"

patterns-established:
  - "Newsletter broadcast pattern: chunk subscribers, batch send, track per-batch failures, record status"
  - "Public unsubscribe pattern: HMAC token in URL, verify, set isActive=false"

requirements-completed: [ADMN-06, MAIL-04]

duration: 4min
completed: 2026-03-27
---

# Phase 04 Plan 07: Newsletter & Broadcast Summary

**Newsletter composer with Tiptap editor, Resend batch broadcasting with failure tracking, HMAC-verified unsubscribe flow, and subscriber auto-tagging via Stripe webhook**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-27T08:08:12Z
- **Completed:** 2026-03-27T08:12:03Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- React Email newsletter template with per-subscriber HMAC-verified unsubscribe URLs
- Resend batch API sending with chunking (100/batch), partial failure tracking, and broadcast history recording
- Newsletter composer page with Tiptap editor, segment radio group with live active-only counts, and send confirmation dialog
- Public unsubscribe page at /unsubscribe with HMAC token verification
- Subscriber auto-tagging on Stripe checkout events (beat_buyer, studio_client)
- Broadcast history table with status badges and error tooltips for partial failures
- Subscriber management table with search, tag badges, active/inactive status, and soft-remove

## Task Commits

Each task was committed atomically:

1. **Task 1: Newsletter email template, send action with failure tracking, unsubscribe route, and subscriber auto-tagging** - `3f27449` (feat)
2. **Task 2: Newsletter pages -- compose, list, subscribers, preview** - `4ec5b3c` (feat)

## Files Created/Modified
- `src/lib/email/newsletter-broadcast.tsx` - React Email template for newsletter broadcasts with per-subscriber unsubscribe URL
- `src/actions/admin-newsletter.ts` - Server actions: getSubscribers, getSegmentCounts, sendNewsletter (batch), getBroadcasts, removeSubscriber, tagSubscriberOnEvent
- `src/actions/newsletter.ts` - Public newsletter actions: generateUnsubscribeUrl, unsubscribe (HMAC verification)
- `src/app/(public)/unsubscribe/page.tsx` - Public unsubscribe page with HMAC token verification
- `src/app/api/webhooks/stripe/route.ts` - Added auto-tagging hooks for beat_buyer and studio_client on checkout events
- `src/app/admin/newsletter/page.tsx` - Newsletter management page with Broadcasts/Subscribers tabs
- `src/app/admin/newsletter/compose/page.tsx` - Newsletter composition page with segment counts
- `src/components/admin/newsletter-composer.tsx` - Client component: Tiptap editor, segment radio, preview, send with confirmation
- `src/components/admin/newsletter-preview-dialog.tsx` - Email preview dialog simulating rendered newsletter appearance
- `src/components/admin/newsletter-list-table.tsx` - Broadcast history table with status badges and pagination
- `src/components/admin/subscriber-list-table.tsx` - Subscriber table with search, tags, status, remove action

## Decisions Made
- HMAC-SHA256 with CRON_SECRET for unsubscribe token verification (reuses existing secret, no new env vars needed)
- Soft-remove subscribers (isActive=false) rather than hard delete for compliance and audit trail
- Auto-tagging in Stripe webhook wrapped in try/catch so tagging failures never break payment processing

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all data sources are wired to real server actions and database queries.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Newsletter system complete, admin can compose, preview, and send segmented broadcasts
- Unsubscribe flow functional with HMAC verification
- Ready for Phase 04 Plan 08 (final admin polish/integration)

## Self-Check: PASSED

All 10 created files verified. Both commit hashes (3f27449, 4ec5b3c) found in git log.

---
*Phase: 04-admin-dashboard-email*
*Completed: 2026-03-27*
