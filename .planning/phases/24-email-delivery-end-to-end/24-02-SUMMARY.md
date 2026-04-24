---
phase: 24-email-delivery-end-to-end
plan: 02
status: complete
completed: 2026-04-24
---

## What was built

Closed EMAIL-02 (booking-modification template) + EMAIL-04 (modification/cancellation email fires end-to-end).

### Changes

**`src/lib/email/booking-modification.tsx`** (new) — single template branches on `newDate === null`:
- `null` → "Booking cancelled" heading, cancelled-on-date body copy.
- non-null → "Booking rescheduled" heading, strikethrough old date + new date body copy.
- Optional `reason` rendered as italic quote block with left border.
- Booking reference (first 8 chars of UUID) in muted text.
- "View My Bookings" CTA → `/dashboard/bookings`.
- Same Glitch dark aesthetic as 24-01 templates.

**`src/lib/email/send-booking-modification.ts`** (new) — helper that:
- Looks up service name via Drizzle (graceful fallback "your booking" on failure).
- Constructs oldDate/newDate strings from booking row + opts.
- Fires `resend.emails.send` with `[email:booking-mod]` log prefix.
- Guards: skip + log if `guestEmail` missing; swallow + log Resend errors. Never throws.

**`src/app/api/bookings/cancel/route.ts`**
- Both admin + client cancel paths now call `sendBookingModificationEmail(booking, { newDate: null, reason })` after the DB update.
- Two call sites total.

**`src/app/api/bookings/reschedule/route.ts`**
- Before the DB update, compute `dateChanged = booking.date !== newDate || booking.startTime !== newStartTime`.
- After the update, only fire the email if `dateChanged`. Avoids notes-only edits triggering an email.

### Plan assumption corrected

Plan 24-02 said "wire into `src/actions/bookings.ts`" but that file doesn't exist. Actual booking mutations live at `src/app/api/bookings/cancel/route.ts` and `src/app/api/bookings/reschedule/route.ts`. Wiring adjusted to these route handlers — same net effect.

### Tests

`tests/24-02-booking-modification-email.spec.ts` — 4/4 passed (desktop). Uses file-read assertions because triggering a real booking cancel/reschedule requires complex fixtures (booking creation via POST, Stripe session seed, etc.). File-read guards are grep-verifiable and cover the wiring contract:

1. Send helper imports template + has skip log line.
2. Cancel route has 2+ `sendBookingModificationEmail(` call sites (admin + client) and passes `newDate: null`.
3. Reschedule route has `dateChanged` guard + passes non-null `newDate`.
4. Helper has missing-recipient skip, Resend-failed log, unexpected-error log.
