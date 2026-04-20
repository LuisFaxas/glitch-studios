---
phase: 09-services-booking
plan: 03
subsystem: infra
tags: [server-action, feature-flag, cache, newsletter]

requires:
  - phase: 03-booking-system
    provides: site_settings table and existing admin-settings.ts pattern
  - phase: 04-admin-dashboard-email
    provides: requirePermission + newsletterSubscribers.tags[] column
provides:
  - getBookingLive() per-request cached flag reader
  - setBookingLive(value) server action with 5-path revalidation
  - subscribeNewsletter source-aware (upsert-tags existing subscribers)
  - NewsletterForm optional source prop
affects: [09-04, 09-05, 09-06]

tech-stack:
  added: []
  patterns:
    - React.cache() for per-request Server Component flag reads
    - Optional-prop defaulting in Client Component (source defaults to undefined, server action defaults to "footer")

key-files:
  created:
    - src/lib/get-booking-live.ts
    - src/actions/settings/set-booking-live.ts
  modified:
    - src/actions/newsletter.ts
    - src/components/forms/newsletter-form.tsx

key-decisions:
  - Used 5 revalidatePath calls (/, /services, /book, /admin/settings, /admin/services) — matches D-03 sitewide CTA impact and Plan 09-04 consumer expectations.
  - NewsletterSource union = "footer" | "launch-notify" | "blog" — only "launch-notify" is actively consumed this phase; "blog" preserved for future Phase 10 use.
  - No schema migration required — reused existing newsletter_subscribers.tags text[] per D-19.

patterns-established:
  - "Server-only + React.cache() flag reader — swap for any new site_settings key with a 3-line file."

requirements-completed: [BOOK-06, BOOK-07, BOOK-08]

duration: ~25 min
completed: 2026-04-20
---

# Phase 09 Plan 03 Summary

**Booking-live flag infrastructure live: getBookingLive, setBookingLive, source-aware newsletter. Wave 2 can consume immediately.**

## Final TypeScript signatures

```ts
// src/lib/get-booking-live.ts
export const getBookingLive: () => Promise<boolean>

// src/actions/settings/set-booking-live.ts
"use server"
export async function setBookingLive(
  value: boolean
): Promise<{ success: boolean; value: boolean }>

// src/actions/newsletter.ts
export type NewsletterSource = "footer" | "launch-notify" | "blog"
export async function subscribeNewsletter(
  email: string,
  source?: NewsletterSource
): Promise<{ success: boolean; message: string }>

// src/components/forms/newsletter-form.tsx
interface NewsletterFormProps {
  source?: NewsletterSource
}
export function NewsletterForm({ source }: NewsletterFormProps = {})
```

## Schema touchpoints

- `site_settings` columns used: `id`, `key`, `value`, `updatedAt`. Column naming matches existing `updateSettings` action (camelCase in Drizzle schema, snake_case in pg column).
- `newsletter_subscribers.tags` (text[]) used as source tag store — NO migration required.

## Behavior notes

- `getBookingLive()` returns `false` when the `booking_live` row is missing OR when its value is any string other than `"true"`. This matches D-01 (OFF by default).
- `setBookingLive(true)` upserts row + revalidates. `setBookingLive(false)` writes `"false"` and revalidates same set.
- Calling `subscribeNewsletter(email)` (no source) defaults to `"footer"` — every existing callsite remains semantically identical. Verified: only callsite is `newsletter-form.tsx` which now passes `source` (undefined → server default).
- Existing subscriber + "launch-notify" source: upsert-tags the row AND returns UI-SPEC-verbatim "You're on the list. We'll email you when bookings open." copy for both new and existing rows with launch-notify source. Existing "footer" source on existing subscriber still returns "You are already subscribed." (preserves prior UX).

## No UI shipped

This plan adds no visible UI. Wave 2 (Plan 09-04) builds the ComingSoonManifesto component that consumes `<NewsletterForm source="launch-notify" />` and the admin toggle that consumes `setBookingLive`.
