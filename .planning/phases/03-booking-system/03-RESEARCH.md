# Phase 3: Booking System - Research

**Researched:** 2026-03-26
**Domain:** Calendar-based booking system with deposit payments, recurring sessions, multi-room management, SMS/email notifications
**Confidence:** HIGH

## Summary

Phase 3 builds a full booking system on top of established Phase 2 infrastructure (Stripe Embedded Checkout, Resend email, Drizzle ORM, Better Auth). The core challenge is a multi-step booking flow (service > date > time > details > payment) styled as Cyberpunk Metro tiles, plus comprehensive admin configuration (rooms, availability, policies, packages). The existing `services` table provides the service catalog; new tables for rooms, bookings, availability, packages, and recurring series extend the schema.

The Stripe deposit pattern is straightforward: create a Checkout Session with a single line item whose `unit_amount` equals the computed deposit (percentage or flat), storing the full price and deposit amount in metadata for webhook reconciliation. The existing webhook handler at `src/app/api/webhooks/stripe/route.ts` extends cleanly with a new `checkout.session.completed` branch keyed on metadata type. SMS notifications via Twilio are a new dependency; ICS calendar file generation uses the `ics` npm package.

**Primary recommendation:** Build the schema and admin config surfaces first (rooms, availability, service booking config), then the public booking flow, then notifications. This ordering ensures the booking flow has real data to query from day one.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Service-first booking flow -- user picks service type first, then sees only dates/times where that service can be booked (Calendly-style pattern)
- **D-02:** Month calendar grid to pick a date (unavailable days greyed out), then vertical list of available time slots for that day
- **D-03:** Calendar rendered as Cyberpunk Metro tiles -- flat monochrome date squares with glitch hover effects. Available = light tile, booked = dark/strikethrough. Consistent with tile nav and beat catalog.
- **D-04:** Time slot granularity is fixed per service type -- admin defines duration per service (e.g., studio session: 2hr, mixing: 4hr, video production: full day). Claude's discretion on defaults.
- **D-05:** Full deposit management -- admin can configure deposit as percentage OR flat amount per service type. Both options available from admin dashboard.
- **D-06:** Guest booking with optional account creation -- book with name/email/phone, offer account creation after booking for dashboard access. Same pattern as beat store guest checkout (Phase 2).
- **D-07:** Stripe Embedded Checkout for deposit payment (reuses Phase 2 Stripe infrastructure).
- **D-08:** Booking form fields -- Claude's discretion on the right balance between minimal and detailed, based on studio booking norms.
- **D-09:** Fully configurable cancellation policy -- admin sets cancellation window (hours before session), refund rules (full/partial/none), and rescheduling policy per service type.
- **D-10:** Self-service cancellation/rescheduling from client dashboard within policy window. Outside the window, deposit forfeited or fee applies per admin config.
- **D-11:** Admin can override any cancellation/rescheduling regardless of policy window.
- **D-12:** Full recurring booking support -- clients can book weekly recurring sessions (e.g., every Tuesday 2-4pm for N weeks).
- **D-13:** Package pricing for recurring bookings -- discounted rates for session bundles (e.g., "4-session pack at 15% off", "8-session pack at 25% off"). Admin configures packages per service.
- **D-14:** Recurring bookings create linked individual booking records (series concept) -- can cancel/modify individual sessions or the entire series.
- **D-15:** Full room management from admin dashboard -- create, edit, delete rooms with name, description, features, photos, and per-room pricing overrides.
- **D-16:** Bookings are tied to specific rooms. Room availability factored into calendar display.
- **D-17:** Data model built for multiple rooms from the start. Launch with however many rooms the studio has.
- **D-18:** Weekly recurring schedule as default availability -- admin sets hours per day of week. Date-specific overrides for holidays/special hours.
- **D-19:** Confirmation mode configurable per service -- some services auto-confirm, others require admin approval.
- **D-20:** Buffer/prep time between sessions -- admin-configurable per room. Hidden from clients.
- **D-21:** Admin dashboard shows booking calendar view with color-coding by service type/room, plus list view with status filters.
- **D-22:** Dashboard layout -- Claude's discretion based on existing `/dashboard/purchases` structure.
- **D-23:** Rich branded confirmation email with service details, room info, date/time, studio address, prep instructions, add-to-calendar link (.ics), social links.
- **D-24:** Email + SMS notifications -- confirmation at booking, reminder 24hr before session, admin notification on new booking.
- **D-25:** SMS via Twilio or similar service (new dependency).
- **D-26:** Both dedicated `/book` route AND "Book Now" CTAs on services page.
- **D-27:** `/book` gets its own nav tile in the sidebar navigation.

### Claude's Discretion
- Database schema design for bookings, rooms, availability, packages, recurring series
- Buffer time implementation details
- Default service durations
- Booking form field selection (minimal vs detailed balance)
- Dashboard tab layout for bookings alongside purchases
- Admin availability UI patterns (weekly schedule editor)
- SMS provider selection (Twilio recommended)
- Calendar .ics file generation approach
- Admin booking calendar component selection

### Deferred Ideas (OUT OF SCOPE)
- SaaS multi-tenant platform (v2.0 milestone)
- Analytics dashboard for booking trends/revenue (Phase 4 or v2)
- Waiting list for fully booked time slots (future enhancement)
- Client file sharing/review portal for mix feedback (explicitly out of scope)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BOOK-02 | Calendar-based booking with available time slot selection | Schema design (rooms, availability, bookings), date-fns for calendar logic, Tile component extension for day/slot tiles, availability query pattern |
| BOOK-03 | Service type selection during booking flow | Service-first flow using existing `services` table + new `serviceBookingConfig` table for duration/deposit/policy per service |
| BOOK-04 | Deposit/prepayment collection at booking via Stripe/PayPal | Stripe Embedded Checkout with deposit-amount line item, webhook extension for booking confirmation, existing Stripe singleton reuse |
| AUTH-04 | Client dashboard showing upcoming and past bookings | Dashboard tabs (purchases + bookings), `ClientBookingList` + `ClientBookingCard` components, cancel/reschedule actions |
| MAIL-02 | Booking confirmation emails with session details | React Email template following `PurchaseReceiptEmail` pattern, Resend send, .ics attachment generation via `ics` package |
| ADMN-02 | Booking management -- view, confirm, cancel, reschedule bookings | Admin calendar view (weekly grid), list view with filters, room/availability/package CRUD, service booking config |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | Full-stack framework | Already installed, App Router |
| Drizzle ORM | 0.45.x | Database ORM | Already installed, extends existing schema |
| Stripe | 20.4.1 | Deposit payment processing | Already installed, reuse Embedded Checkout pattern |
| @stripe/react-stripe-js | 5.6.1 | Client-side Stripe | Already installed |
| Resend | 6.9.4 | Email delivery | Already installed |
| @react-email/components | 1.0.10 | Email templates | Already installed |
| date-fns | 4.1.0 | Date manipulation | Already installed, use for calendar arithmetic |
| zod | 4.3.6 | Schema validation | Already installed |
| sonner | 2.0.7 | Toast notifications | Already installed |
| motion | 12.38.0 | Animations | Already installed |

### New Dependencies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| twilio | 5.13.1 | SMS notifications (confirmation + 24hr reminder) | De facto standard for programmable SMS. Simple API: `client.messages.create()`. Env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER. |
| ics | 3.11.0 | ICS calendar file generation | Most actively maintained ICS generator. 93 dependents on npm. Simple API: `createEvent()` returns string. Zero dependencies. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| twilio | MessageBird/Vonage | Twilio has best Node.js SDK, largest docs surface, user recommended it |
| ics | ical-generator | ical-generator is more feature-rich but heavier; `ics` is simpler for single-event generation which is all we need |
| Custom calendar grid | react-day-picker / shadcn calendar | shadcn calendar uses react-day-picker under the hood but doesn't match Cyberpunk Metro tile aesthetic; custom grid built on Tile component gives full visual control |

**Installation:**
```bash
pnpm add twilio ics
pnpm add -D @types/ics
```

**shadcn components to add:**
```bash
npx shadcn@latest add calendar popover switch textarea radio-group alert accordion
```

Note: The shadcn `calendar` component is useful as reference but the booking calendar will be a custom Tile-based grid. The shadcn calendar may be used for admin date-override picker.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (public)/
│   │   ├── book/
│   │   │   └── page.tsx                    # Booking flow (server component, loads services)
│   │   └── dashboard/
│   │       ├── page.tsx                    # Redirect (update to show tabs)
│   │       ├── purchases/page.tsx          # Existing
│   │       └── bookings/page.tsx           # NEW: client booking list
│   ├── admin/
│   │   ├── bookings/
│   │   │   └── page.tsx                    # Admin booking calendar + list
│   │   ├── rooms/
│   │   │   ├── page.tsx                    # Room list
│   │   │   └── [id]/page.tsx              # Room edit
│   │   ├── availability/
│   │   │   └── page.tsx                    # Weekly schedule + overrides
│   │   └── services/
│   │       └── [id]/booking-config/page.tsx # Per-service booking config
│   └── api/
│       ├── bookings/
│       │   ├── create/route.ts             # Create booking + Stripe session
│       │   ├── cancel/route.ts             # Cancel with policy check
│       │   ├── reschedule/route.ts         # Reschedule with policy check
│       │   └── slots/route.ts              # GET available slots for date+service
│       ├── cron/
│       │   └── booking-reminders/route.ts  # 24hr reminder cron (Vercel Cron)
│       └── webhooks/stripe/route.ts        # EXTEND existing handler
├── components/
│   ├── booking/
│   │   ├── booking-calendar.tsx            # Month grid of day tiles
│   │   ├── calendar-day-tile.tsx           # Individual day tile
│   │   ├── time-slot-list.tsx              # Slot list for selected day
│   │   ├── time-slot-tile.tsx              # Individual slot tile
│   │   ├── booking-flow-stepper.tsx        # 5-step indicator
│   │   ├── service-selector.tsx            # Service tile grid (step 1)
│   │   ├── booking-form.tsx                # Guest details form (step 4)
│   │   ├── booking-summary.tsx             # Summary sidebar tile
│   │   ├── booking-confirmation.tsx        # Post-payment success
│   │   ├── recurring-booking-selector.tsx  # Recurring options UI
│   │   ├── client-booking-list.tsx         # Dashboard booking list
│   │   └── client-booking-card.tsx         # Individual booking card
│   └── admin/
│       ├── admin-booking-calendar.tsx       # Weekly calendar view
│       ├── admin-booking-list.tsx           # Table view with filters
│       ├── admin-room-manager.tsx           # Room CRUD
│       ├── admin-availability-editor.tsx    # Weekly schedule + overrides
│       ├── admin-service-booking-config.tsx # Per-service config
│       └── admin-package-manager.tsx        # Package CRUD
├── db/
│   └── schema.ts                           # EXTEND with booking tables
├── lib/
│   ├── booking/
│   │   ├── availability.ts                 # Core availability calculation logic
│   │   ├── slots.ts                        # Time slot generation from availability
│   │   ├── deposit.ts                      # Deposit calculation (% or flat)
│   │   ├── policy.ts                       # Cancellation/reschedule policy checks
│   │   ├── recurring.ts                    # Recurring series generation
│   │   └── ics.ts                          # ICS file generation wrapper
│   ├── sms.ts                              # Twilio client singleton
│   └── email/
│       ├── booking-confirmation.tsx         # Confirmation email template
│       └── booking-reminder.tsx             # 24hr reminder email template
└── types/
    └── booking.ts                          # Shared booking types
```

### Pattern 1: Schema Design (Claude's Discretion)

**Recommended tables to add to `src/db/schema.ts`:**

```typescript
// === Booking System (Phase 3) ===

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",      // Awaiting admin confirmation (if manual confirm)
  "confirmed",    // Confirmed (auto or manual)
  "cancelled",    // Cancelled by client or admin
  "completed",    // Session happened
  "no_show",      // Client didn't show up
])

export const depositTypeEnum = pgEnum("deposit_type", [
  "percentage",
  "flat",
])

export const refundPolicyEnum = pgEnum("refund_policy", [
  "full",
  "partial",
  "none",
])

// Rooms
export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  features: text("features").array(),
  photos: text("photos").array(),            // R2 keys
  hourlyRateOverride: numeric("hourly_rate_override", { precision: 10, scale: 2 }),
  bufferMinutes: integer("buffer_minutes").default(15),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Per-service booking configuration
export const serviceBookingConfig = pgTable("service_booking_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "cascade" }).notNull().unique(),
  durationMinutes: integer("duration_minutes").notNull(),  // e.g., 120 for 2hr
  depositType: depositTypeEnum("deposit_type").notNull().default("percentage"),
  depositValue: numeric("deposit_value", { precision: 10, scale: 2 }).notNull(), // 50 = 50% or $50
  autoConfirm: boolean("auto_confirm").default(true),
  cancellationWindowHours: integer("cancellation_window_hours").default(48),
  refundPolicy: refundPolicyEnum("refund_policy").default("full"),
  maxAdvanceBookingDays: integer("max_advance_booking_days").default(90),
  prepInstructions: text("prep_instructions"), // Included in confirmation email
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Weekly default availability (per-room)
export const weeklyAvailability = pgTable("weekly_availability", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  startTime: text("start_time").notNull(),     // "09:00" (HH:mm)
  endTime: text("end_time").notNull(),         // "21:00"
  isActive: boolean("is_active").default(true),
})

// Date-specific overrides (holidays, special hours)
export const availabilityOverrides = pgTable("availability_overrides", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
  date: text("date").notNull(),                // "2026-12-25" (YYYY-MM-DD)
  isClosed: boolean("is_closed").default(false),
  startTime: text("start_time"),               // null if closed
  endTime: text("end_time"),                   // null if closed
  reason: text("reason"),                      // "Christmas"
})

// Recurring booking series
export const bookingSeries = pgTable("booking_series", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  guestEmail: text("guest_email"),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  roomId: uuid("room_id").references(() => rooms.id).notNull(),
  packageId: uuid("package_id"),
  totalSessions: integer("total_sessions").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  stripeSessionId: text("stripe_session_id"),
  totalPaid: numeric("total_paid", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Individual bookings (both standalone and part of series)
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  seriesId: uuid("series_id").references(() => bookingSeries.id, { onDelete: "set null" }),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  roomId: uuid("room_id").references(() => rooms.id).notNull(),
  userId: text("user_id"),                     // Better Auth user ID (nullable for guests)
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone").notNull(),
  notes: text("notes"),
  date: text("date").notNull(),                // "2026-04-15" (YYYY-MM-DD)
  startTime: text("start_time").notNull(),     // "14:00"
  endTime: text("end_time").notNull(),         // "16:00"
  status: bookingStatusEnum("status").default("pending"),
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: text("cancelled_by"),           // "client" | "admin"
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Session packages (recurring booking discounts)
export const sessionPackages = pgTable("session_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),                // "4-Session Pack"
  sessionCount: integer("session_count").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

**Key schema decisions:**
- `date` and `startTime`/`endTime` stored as text (ISO format strings) to avoid timezone conversion issues. All times in studio's local timezone.
- `bookingSeries` links recurring sessions. Individual bookings reference it via `seriesId`.
- `serviceBookingConfig` is 1:1 with `services` (one config row per service). This keeps the existing services table clean.
- `weeklyAvailability` is per-room per-day-of-week, supporting different hours per room.
- `availabilityOverrides` allows date-specific closures or altered hours per room.

### Pattern 2: Availability Calculation

**Core algorithm in `src/lib/booking/availability.ts`:**

```typescript
// For a given service + date:
// 1. Find all rooms that support this service (initially all rooms)
// 2. For each room, get weekly availability for that day of week
// 3. Check for date-specific overrides (closed or altered hours)
// 4. Get existing bookings for that room on that date
// 5. Generate time slots based on service duration
// 6. Subtract booked slots + buffer time
// 7. Return available slots [{roomId, startTime, endTime}]
```

This is server-side only logic. The `/api/bookings/slots` endpoint calls it and returns JSON.

### Pattern 3: Deposit Payment via Stripe

```typescript
// In /api/bookings/create/route.ts:
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  ui_mode: "embedded",
  line_items: [{
    price_data: {
      currency: "usd",
      product_data: {
        name: `${serviceName} - Deposit`,
        description: `${date} at ${startTime} - ${roomName}`,
      },
      unit_amount: depositAmountCents, // Computed from config
    },
    quantity: 1,
  }],
  metadata: {
    type: "booking_deposit",  // Key differentiator in webhook
    bookingId: booking.id,
    serviceId: service.id,
    roomId: room.id,
    date: date,
    startTime: startTime,
  },
  return_url: `${siteUrl}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
})
```

The webhook handler adds a branch: `if (session.metadata?.type === "booking_deposit")` to handle booking confirmation separately from beat purchases.

### Pattern 4: Twilio SMS Client

```typescript
// src/lib/sms.ts
import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
)

export async function sendSms(to: string, body: string) {
  if (!process.env.TWILIO_ACCOUNT_SID) return // Skip in dev
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  })
}
```

### Pattern 5: ICS File Generation

```typescript
// src/lib/booking/ics.ts
import { createEvent, type EventAttributes } from "ics"

export function generateBookingIcs(booking: {
  serviceName: string
  date: string      // "2026-04-15"
  startTime: string // "14:00"
  endTime: string   // "16:00"
  roomName: string
  address: string
}): string {
  const [year, month, day] = booking.date.split("-").map(Number)
  const [startH, startM] = booking.startTime.split(":").map(Number)
  const [endH, endM] = booking.endTime.split(":").map(Number)

  const event: EventAttributes = {
    start: [year, month, day, startH, startM],
    end: [year, month, day, endH, endM],
    title: `${booking.serviceName} - Glitch Studios`,
    location: booking.address,
    description: `Studio session in ${booking.roomName}`,
  }

  const { value } = createEvent(event)
  return value ?? ""
}
```

The ICS string is returned as a downloadable file from an API route or generated client-side for the download button.

### Pattern 6: 24hr Reminder Cron (Vercel Cron Jobs)

```typescript
// src/app/api/cron/booking-reminders/route.ts
// Vercel Cron: runs every hour, checks for bookings 24hr out
// vercel.json: { "crons": [{ "path": "/api/cron/booking-reminders", "schedule": "0 * * * *" }] }

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Find bookings 23-25 hours from now (window to catch hourly cron)
  // Send email + SMS reminder
  // Mark booking as reminder_sent to avoid duplicates
}
```

### Anti-Patterns to Avoid
- **Timezone confusion:** Store all times as strings in studio's local timezone (e.g., "America/New_York"). Do NOT store UTC and convert -- the studio has one timezone. Use date-fns `format` and `parse` with explicit timezone awareness.
- **Race conditions on booking:** Two clients could select the same slot simultaneously. Use a database-level unique constraint or `INSERT ... ON CONFLICT` pattern. Create the booking row with "pending_payment" status BEFORE redirecting to Stripe, then confirm on webhook.
- **Overfetching availability:** Don't load all bookings for all rooms for the whole month. Query per-room per-date only when the user selects a date.
- **Hardcoded business logic:** All policy values (deposit %, cancellation window, buffer time, etc.) must come from database config, never hardcoded constants.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ICS calendar files | Manual VCALENDAR string concatenation | `ics` npm package (3.11.0) | RFC 5545 compliance, proper escaping, edge cases with timezones |
| SMS delivery | HTTP-to-carrier integration | Twilio SDK (5.13.1) | Delivery tracking, number validation, carrier compliance |
| Date arithmetic | Manual date math | date-fns (4.1.0, already installed) | Leap years, month boundaries, DST transitions |
| Payment processing | Custom card handling | Stripe Embedded Checkout (already set up) | PCI compliance, fraud detection, dispute handling |
| Email templates | Raw HTML strings | React Email (already set up) | Consistent rendering across email clients |

**Key insight:** The booking system's complexity is in business logic (availability calculation, policy enforcement, recurring series management), not in infrastructure. All infrastructure pieces already exist or have battle-tested npm packages.

## Common Pitfalls

### Pitfall 1: Slot Double-Booking Race Condition
**What goes wrong:** Two clients select the same time slot, both proceed to payment, both complete -- double-booked.
**Why it happens:** No reservation mechanism between slot selection and payment completion.
**How to avoid:** Create the booking row with status `pending` immediately when the client reaches the payment step. Set a 15-minute TTL. The availability query excludes `pending` and `confirmed` bookings. A cleanup cron or webhook timeout handler removes stale pending bookings.
**Warning signs:** Multiple bookings with identical room+date+time in the database.

### Pitfall 2: Buffer Time Off-By-One
**What goes wrong:** A 15-minute buffer between sessions gets miscalculated, allowing overlapping bookings.
**Why it happens:** Buffer is applied only to the start or end, not both. Or buffer is forgotten when checking availability.
**How to avoid:** When generating available slots, extend each existing booking's time range by `bufferMinutes` on both sides before checking for overlap. The buffer is a property of the room (not the service), stored in `rooms.bufferMinutes`.
**Warning signs:** Bookings that start exactly when the previous one ends with no gap.

### Pitfall 3: Recurring Series Partial Failure
**What goes wrong:** A 4-week recurring booking partially fails (e.g., week 3 conflicts with an existing booking) but the series is created anyway.
**Why it happens:** Individual slot availability not checked for ALL dates in the series before creating.
**How to avoid:** Before creating any booking rows, validate ALL dates in the series for availability. If any date conflicts, show the conflicting dates to the user and let them adjust. Use a database transaction for the entire series creation.
**Warning signs:** Recurring series with missing sessions that the client didn't cancel.

### Pitfall 4: Stripe Webhook Idempotency
**What goes wrong:** Stripe sends the webhook twice (retries), booking gets confirmed twice, duplicate emails sent.
**Why it happens:** Webhook handler doesn't check if the event was already processed.
**How to avoid:** Check `stripeSessionId` uniqueness before processing. The existing webhook already uses `stripeSessionId` as unique on orders -- apply the same pattern to bookings.
**Warning signs:** Duplicate confirmation emails, booking status toggling.

### Pitfall 5: Calendar Month Boundary
**What goes wrong:** Calendar grid shows wrong number of days, or doesn't properly pad the first/last week.
**Why it happens:** Manual calendar grid math errors.
**How to avoid:** Use date-fns `startOfMonth`, `endOfMonth`, `startOfWeek`, `endOfWeek`, `eachDayOfInterval` to generate the full calendar grid including padding days from adjacent months.
**Warning signs:** Calendar missing days or showing 28 days for a 31-day month.

### Pitfall 6: Deposit Refund Mismatch
**What goes wrong:** Client cancels within policy window but the Stripe refund amount doesn't match what was charged.
**Why it happens:** Deposit amount stored in booking row doesn't match what Stripe actually charged (rounding, currency conversion).
**How to avoid:** Store `depositAmount` in booking row AND retrieve the actual `payment_intent` amount from Stripe before refunding. Always refund via `stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId })` for full refund, or specify `amount` for partial.
**Warning signs:** Refund amounts that don't match deposit amounts in the database.

## Code Examples

### Calendar Grid Generation with date-fns
```typescript
// Verified pattern using date-fns 4.x
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isBefore, startOfDay
} from "date-fns"

function getCalendarDays(month: Date) {
  const start = startOfWeek(startOfMonth(month))
  const end = endOfWeek(endOfMonth(month))
  const days = eachDayOfInterval({ start, end })

  return days.map(day => ({
    date: format(day, "yyyy-MM-dd"),
    dayNumber: format(day, "d"),
    isCurrentMonth: isSameMonth(day, month),
    isPast: isBefore(day, startOfDay(new Date())),
  }))
}
```

### Stripe Refund for Cancellation
```typescript
// Source: Stripe API docs
import { stripe } from "@/lib/stripe"

async function refundBookingDeposit(
  paymentIntentId: string,
  policy: "full" | "partial" | "none",
  depositAmountCents: number,
) {
  if (policy === "none") return null
  const amount = policy === "partial"
    ? Math.floor(depositAmountCents * 0.5) // 50% refund for partial
    : undefined // undefined = full refund

  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount && { amount }),
  })
}
```

### React Email Booking Confirmation Pattern
```typescript
// Follows existing PurchaseReceiptEmail pattern in src/lib/email/purchase-receipt.tsx
import {
  Html, Head, Body, Container, Section, Heading, Text, Link, Hr
} from "@react-email/components"

export function BookingConfirmationEmail({
  clientName, serviceName, roomName, date, time,
  depositAmount, totalPrice, address, prepInstructions, icsUrl,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#000", color: "#f5f5f0", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Heading style={{ fontFamily: "monospace", fontSize: "24px", fontWeight: "700" }}>
            GLITCH STUDIOS
          </Heading>
          <Heading style={{ fontFamily: "monospace", fontSize: "20px" }}>
            SESSION BOOKED
          </Heading>
          {/* Service, date, time, room, deposit, balance, prep instructions */}
          {/* Add to Calendar link pointing to icsUrl */}
        </Container>
      </Body>
    </Html>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Cal.com embed | Custom booking UI | Project decision | Full visual control with Cyberpunk Metro tiles |
| Auth.js | Better Auth | Sept 2025 | Already migrated in Phase 1 |
| Prisma | Drizzle ORM | Project decision | Lighter serverless, already in use |
| Uploadthing for files | R2 direct upload | Phase 2 decision | No egress fees, already in use |

## Open Questions

1. **Studio timezone**
   - What we know: All times stored as strings, no UTC conversion needed
   - What's unclear: Which timezone the studio operates in (needed for cron job scheduling and ICS file timezone field)
   - Recommendation: Default to "America/New_York" (or make it an env var `STUDIO_TIMEZONE`). Planner should include a task to set this.

2. **Twilio phone number provisioning**
   - What we know: Twilio SDK is straightforward to install and use
   - What's unclear: Whether a Twilio account and phone number are already set up
   - Recommendation: SMS sending should gracefully degrade (like Resend -- `if (!process.env.TWILIO_ACCOUNT_SID) return`). Planner should note this as a manual setup step.

3. **PayPal for booking deposits**
   - What we know: D-07 specifies Stripe Embedded Checkout. CLAUDE.md mentions "Must support both Stripe and PayPal at checkout."
   - What's unclear: Whether PayPal is needed for booking deposits specifically (Phase 2 used Stripe only for beat purchases)
   - Recommendation: Implement Stripe only for booking deposits (matching Phase 2 pattern). PayPal can be added as a future enhancement if needed.

4. **Default service durations**
   - What we know: Admin configures duration per service (D-04)
   - What's unclear: What defaults to seed
   - Recommendation: Studio Session: 120min, Mixing: 240min, Mastering: 120min, Video Production: 480min (full day), SFX: 120min, Graphic Design: 240min

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | v24 | -- |
| pnpm | Package management | Yes | Latest | -- |
| Stripe account | Payment processing | Yes | Already configured | -- |
| Resend account | Email delivery | Yes | Already configured | -- |
| Twilio account | SMS notifications | Unknown | -- | Graceful skip (env var check) |
| Vercel Cron | 24hr reminders | Yes (on deploy) | -- | Manual reminder or skip |
| Neon Postgres | Database | Yes | Already configured | -- |

**Missing dependencies with no fallback:**
- None (all critical dependencies are available or have graceful degradation)

**Missing dependencies with fallback:**
- Twilio: SMS sending skipped if env vars not set. Email still sends. Manual Twilio account setup documented as a post-implementation step.

## Project Constraints (from CLAUDE.md)

- **pnpm only** -- never npm or yarn
- **Next.js 16.2.x** with App Router (no Pages Router)
- **Tailwind CSS 4.x** -- CSS-first config, no tailwind.config.js
- **Drizzle ORM** -- extend existing schema in `src/db/schema.ts`
- **Better Auth** -- server/client split pattern (`auth.ts` / `auth-client.ts`)
- **Stripe Embedded Checkout** -- `ui_mode: "embedded"`, not redirect
- **Resend + React Email** -- for all transactional email
- **shadcn/ui** -- base-nova preset, components copied into project
- **Monochrome only** -- no accent colors, Cyberpunk Metro tile aesthetic
- **date-fns** for date manipulation (already installed)
- **force-dynamic** on DB-querying pages
- **motion/react** import path (not framer-motion)
- **No `next build` in parallel** -- CodeBox resource constraint
- **GSD workflow** -- all work through GSD commands

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/db/schema.ts`, `src/lib/stripe.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/lib/email/purchase-receipt.tsx` -- existing patterns to extend
- Project docs: `CLAUDE.md` technology stack, `.planning/DESIGN-LANGUAGE.md`, `03-CONTEXT.md`, `03-UI-SPEC.md` -- locked decisions and visual spec
- [Stripe Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions/create) -- deposit payment pattern
- [ics npm](https://www.npmjs.com/package/ics) -- v3.11.0, ICS file generation
- [twilio npm](https://www.npmjs.com/package/twilio) -- v5.13.1, SMS delivery

### Secondary (MEDIUM confidence)
- [date-fns documentation](https://date-fns.org/) -- calendar grid generation functions
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) -- 24hr reminder scheduling

### Tertiary (LOW confidence)
- Default service durations -- based on general studio booking norms, should be validated with user

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all core libraries already installed and proven in Phase 2; new deps (twilio, ics) are well-established
- Architecture: HIGH -- extends proven Phase 2 patterns (Stripe webhook, React Email, Drizzle schema, guest checkout flow)
- Pitfalls: HIGH -- race conditions and timezone issues are well-documented in booking system literature
- Schema design: MEDIUM -- reasonable design but complex (9 new tables); may need adjustments during implementation

**Research date:** 2026-03-26
**Valid until:** 2026-04-25 (stable stack, no fast-moving dependencies)
