# Phase 3: Booking System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 03-booking-system
**Areas discussed:** Calendar & time slots, Booking flow & checkout, Admin booking management, Client dashboard & emails, Buffer & prep time, Recurring bookings, Multi-room / resource booking, Notifications & reminders, Style & UX/UI

---

## Calendar & Time Slots

| Option | Description | Selected |
|--------|-------------|----------|
| Week view with time grid | 7-day grid with hourly rows, Google Calendar style | |
| Day picker + time list | Month calendar to pick date, then vertical time slot list. Calendly pattern. | |
| Service-first flow | Pick service first, then filtered dates/times for that service | ✓ (via research) |

**User's choice:** "RESEARCH, AND LOOK FOR THE ABSOLUTE BEST SOLUTION"
**Notes:** Web research conducted on studio booking UX best practices. Recommended service-first flow with day picker + time list (hybrid of options 2 & 3) — the Calendly/CozyCal pattern that dominates studio booking. Mobile-first, service-aware, familiar.

## Time Slot Granularity

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed per service type | Admin defines duration per service (studio: 2hr, mixing: 4hr, etc.) | ✓ |
| Uniform 1-hour blocks | Every slot is 1 hour, book multiple for longer sessions | |
| You decide | Claude picks | ✓ |

**User's choice:** "You decide"
**Notes:** Claude selected fixed per service type as best approach for studio services.

## Deposit / Payment

| Option | Description | Selected |
|--------|-------------|----------|
| Deposit upfront, balance later | Collect percentage deposit at booking | |
| Full payment upfront | Charge full price at booking | |
| Free booking, pay at studio | No online payment | |

**User's choice:** "full deposit management % and flat options in admin dashboard"
**Notes:** User wants admin-configurable deposit — both percentage-based AND flat amount options per service type. More flexible than any presented option.

## Guest vs Account Booking

| Option | Description | Selected |
|--------|-------------|----------|
| Account required | Must sign in before booking | |
| Guest booking + optional account | Book with name/email/phone, offer account after | ✓ |

**User's choice:** Guest booking + optional account
**Notes:** Matches beat store checkout pattern from Phase 2.

## Booking Form Fields

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal — name, email, phone | Just contact info | |
| Detailed — project brief included | Contact info + project description, references, equipment needs | |
| You decide | Claude picks balance | ✓ |

**User's choice:** "You decide"

## Cancellation & Rescheduling

| Option | Description | Selected |
|--------|-------------|----------|
| Self-service with policy window | Client can cancel/reschedule up to X hours before | |
| Admin-only changes | Client must contact studio | |
| You decide | Claude picks | |

**User's choice:** "both this is a full system, there should be options to customize everything including this"
**Notes:** User wants fully configurable system — admin sets policy, clients self-service within policy, admin overrides everything.

## Admin Availability

| Option | Description | Selected |
|--------|-------------|----------|
| Weekly recurring schedule | Default hours per day of week + date overrides | ✓ |
| Day-by-day calendar | Manually open/block slots | |
| You decide | Claude picks | ✓ |

**User's choice:** "You decide"
**Notes:** Claude selected weekly recurring schedule as simplest for daily operation.

## Booking Confirmation Mode

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-confirm (instant) | Payment = confirmed immediately | |
| Admin approval required | Goes to pending, admin reviews | |
| Configurable per service | Admin chooses per service type | ✓ |

**User's choice:** Configurable per service

## Buffer & Prep Time

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden — slots just don't appear | Admin sets buffer, clients never see it | ✓ |
| Visible — show as "setup time" | Clients see buffer noted between slots | |
| You decide | Claude picks | ✓ |

**User's choice:** "You decide"
**Notes:** Claude selected hidden approach for cleaner UX.

## Recurring Bookings

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — weekly recurring | Book recurring weekly slots | ✓ |
| No — one-off only for v1 | Each booking standalone | |
| You decide | Claude picks | |

**User's choice:** "full recurring with special price packages for bundles etc"
**Notes:** User wants full recurring support PLUS package pricing — discounted rates for session bundles (e.g., 4-session pack, 8-session pack).

## Multi-Room / Resource Management

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — multiple rooms | Each room has own availability, bookings tied to rooms | |
| Single room, plan for multi | Data model supports multi, launch with one | |
| Single room only | No room concept | |

**User's choice:** "again allow to configure rooms in the admin dashboard! full room configure, creation with features and prices."
**Notes:** Full room CRUD from admin — create rooms with name, description, features, photos, pricing.

## Notifications & Reminders

| Option | Description | Selected |
|--------|-------------|----------|
| Email only | Confirmation + 24hr reminder via Resend | |
| Email + SMS | Both email and SMS reminders | ✓ |
| You decide | Claude picks | |

**User's choice:** Email + SMS

## Calendar Style

| Option | Description | Selected |
|--------|-------------|----------|
| Tile-based calendar | Metro tiles for dates/slots with glitch hovers | ✓ |
| Minimal clean calendar | Standard shadcn calendar with subtle cyberpunk touches | |
| You decide | Claude picks | |

**User's choice:** Tile-based calendar

## Navigation / Routing

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated /book route | Top-level booking page, gets nav tile | |
| Inline on services page | Book Now on each service, no separate page | |
| Both — /book + service CTAs | Dedicated page + service page CTAs with pre-selection | ✓ |

**User's choice:** Both — /book + service CTAs

## Client Dashboard

| Option | Description | Selected |
|--------|-------------|----------|
| Separate tabs | Purchases \| Bookings tabs | |
| Unified timeline | Single chronological feed | |
| You decide | Claude picks | ✓ |

**User's choice:** "You decide"

## Confirmation Email Style

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal — details + calendar link | Clean, functional, matches purchase receipt style | |
| Rich — with studio branding | Branded header, service details, address, prep instructions, social links | ✓ |
| You decide | Claude picks | |

**User's choice:** Rich — with studio branding

---

## Claude's Discretion

- Time slot granularity defaults
- Buffer time implementation
- Booking form field selection
- Dashboard tab layout
- Admin availability UI
- SMS provider selection
- Calendar .ics generation
- Database schema design

## Deferred Ideas

- **SaaS Multi-Tenant Platform** — User wants to explore turning Glitch Studios into a SaaS for studios/producers (like Toast/Owner.com) with custom domains, multi-tenancy, Stripe Connect. Recommended as v2.0 milestone after v1 single-tenant completion.
- Analytics dashboard for booking trends — Phase 4 or v2
- Waiting list for fully booked slots — future enhancement
