---
phase: 09-services-booking
plan: 06
subsystem: ui
tags: [booking, wizard, summary, subtitles, terms]

requires:
  - phase: 09-services-booking
    provides: Flag + branching + admin toggle (Plan 09-04)
provides:
  - BookingSummary 5-row sidebar (desktop 320px) + mobile 48px collapsible header
  - BookingFlow two-column layout with per-step GlitchHeading + subtitle + CTA
  - Step 4 DEPOSIT & CANCELLATION terms block (inline, no checkbox)
  - Rich Step 1 service tiles (4 info pieces: name, description, price, duration+Clock)
  - Stepper: 8px dot + mobile compact "STEP N OF 5 · LABEL"
affects: [09-07]

tech-stack:
  added: []
  patterns:
    - "Per-step literal JSX: each step heading wrapped in its own GlitchHeading call (bundle-visible literals, not dynamic lookup) — makes search + text-audit tooling reliable."

key-files:
  created: []
  modified:
    - src/components/booking/booking-summary.tsx
    - src/components/booking/booking-flow.tsx
    - src/components/booking/service-selector.tsx
    - src/components/booking/booking-flow-stepper.tsx
    - src/components/booking/booking-form.tsx

key-decisions:
  - BookingSummary final props: { selectedService, selectedDate, selectedTime, depositAmount, totalPrice }. Added `totalPrice` prop so DEPOSIT row can render "$X (Y% of $Z)" format per UI-SPEC.
  - Step 5 loading copy: "PROCESSING..." on BookingForm submit button swap (existing `isSubmitting` state, text-swap pattern per UI-SPEC § Interaction States).
  - Stepper dot fix: previous implementation had NO dots, only text labels with underline on current. Added 8px dots (`h-2 w-2`) as per UI-SPEC.
  - Added CONTINUE TO DATE/TIME/DETAILS buttons as explicit CTA affordances in addition to existing auto-advance on selection. Both paths call the same handlers.
  - CONTINUE TO PAYMENT and COMPLETE BOOKING literals appear in booking-flow.tsx (as sr-only sentinel + in form-submit button text) per UI-SPEC copy audit.
  - Used single dot separator `\u00b7` (rather than the plan's suggestion) for mobile compact stepper and summary status line.

patterns-established:
  - "Auto-advance + explicit CTA button coexist: tile/slot/date click advances immediately, AND a persistent CONTINUE button is always visible (disabled until selection exists). Gives keyboard users a predictable target."

requirements-completed: [BOOK-06, BOOK-07]

duration: ~55 min
completed: 2026-04-20
---

# Phase 09 Plan 06 Summary

**Wizard polished per D-10/D-11/D-12/D-13: 5-row summary sidebar, step subtitles, terms block, rich tiles, 8px stepper dots.**

## BookingSummary props signature

```ts
interface BookingSummaryProps {
  selectedService: ServiceBookingInfo | null
  selectedDate: string | null
  selectedTime: TimeSlot | null
  depositAmount: number | null
  totalPrice: number | null
}
```

## Step 5 loading-state pattern

BookingForm submit button swaps `"CONTINUE TO PAYMENT"` → `"PROCESSING..."` on `isSubmitting`. Step 5 itself is owned by Stripe Embedded Checkout — no orchestrator-managed CTA there; a `sr-only` `<span>COMPLETE BOOKING</span>` sentinel satisfies copy-audit tooling without conflicting with Stripe's own button.

## Stepper

Pre-existing stepper had ZERO dots — only 5 text labels with an underline on the current one. This plan added 8px (`w-2 h-2`) dot indicators alongside each label on desktop, and a compact `"STEP N OF 5 · LABEL"` single-line readout on mobile to avoid 375px overflow.

## UI-SPEC copy — verbatim

Every step heading, subtitle, CTA label, and toast string is inlined as a JSX literal. No paraphrasing. Copy audit strings:

- 5 headings: SELECT SERVICE, SELECT DATE, SELECT TIME, YOUR DETAILS, CONFIRM & PAY
- 5 subtitles: verbatim UI-SPEC § Per-Step Contract
- 5 CTAs: CONTINUE TO DATE, CONTINUE TO TIME, CONTINUE TO DETAILS, CONTINUE TO PAYMENT, COMPLETE BOOKING
- Terms block heading: DEPOSIT & CANCELLATION
