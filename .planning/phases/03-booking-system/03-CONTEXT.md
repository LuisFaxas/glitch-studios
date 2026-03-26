# Phase 3: Booking System - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Clients can book studio services through a calendar interface, pay a configurable deposit, and manage their bookings. Admin can manage rooms, availability, services, booking policies, and view/confirm/cancel/reschedule all bookings. Supports recurring bookings with package pricing, multi-room configuration, and Email + SMS notifications.

Requirements: BOOK-02, BOOK-03, BOOK-04, AUTH-04, MAIL-02, ADMN-02

</domain>

<decisions>
## Implementation Decisions

### Calendar & Time Slots
- **D-01:** Service-first booking flow — user picks service type first, then sees only dates/times where that service can be booked (Calendly-style pattern)
- **D-02:** Month calendar grid to pick a date (unavailable days greyed out), then vertical list of available time slots for that day
- **D-03:** Calendar rendered as Cyberpunk Metro tiles — flat monochrome date squares with glitch hover effects. Available = light tile, booked = dark/strikethrough. Consistent with tile nav and beat catalog.
- **D-04:** Time slot granularity is fixed per service type — admin defines duration per service (e.g., studio session: 2hr, mixing: 4hr, video production: full day). Claude's discretion on defaults.

### Booking Flow & Checkout
- **D-05:** Full deposit management — admin can configure deposit as percentage OR flat amount per service type. Both options available from admin dashboard.
- **D-06:** Guest booking with optional account creation — book with name/email/phone, offer account creation after booking for dashboard access. Same pattern as beat store guest checkout (Phase 2).
- **D-07:** Stripe Embedded Checkout for deposit payment (reuses Phase 2 Stripe infrastructure).
- **D-08:** Booking form fields — Claude's discretion on the right balance between minimal and detailed, based on studio booking norms.

### Cancellation & Rescheduling
- **D-09:** Fully configurable cancellation policy — admin sets cancellation window (hours before session), refund rules (full/partial/none), and rescheduling policy per service type.
- **D-10:** Self-service cancellation/rescheduling from client dashboard within policy window. Outside the window, deposit forfeited or fee applies per admin config.
- **D-11:** Admin can override any cancellation/rescheduling regardless of policy window.

### Recurring Bookings & Packages
- **D-12:** Full recurring booking support — clients can book weekly recurring sessions (e.g., every Tuesday 2-4pm for N weeks).
- **D-13:** Package pricing for recurring bookings — discounted rates for session bundles (e.g., "4-session pack at 15% off", "8-session pack at 25% off"). Admin configures packages per service.
- **D-14:** Recurring bookings create linked individual booking records (series concept) — can cancel/modify individual sessions or the entire series.

### Multi-Room / Resource Management
- **D-15:** Full room management from admin dashboard — create, edit, delete rooms with name, description, features, photos, and per-room pricing overrides.
- **D-16:** Bookings are tied to specific rooms. Room availability factored into calendar display.
- **D-17:** Data model built for multiple rooms from the start. Launch with however many rooms the studio has.

### Admin Booking Management
- **D-18:** Weekly recurring schedule as default availability — admin sets hours per day of week (e.g., Mon-Fri 9am-9pm, Sat 10am-6pm, Sun closed). Date-specific overrides for holidays/special hours. Claude's discretion on implementation.
- **D-19:** Confirmation mode configurable per service — some services auto-confirm (e.g., studio sessions), others require admin approval (e.g., video production). Admin toggles per service type.
- **D-20:** Buffer/prep time between sessions — admin-configurable per room. Hidden from clients (slots simply don't appear). Claude's discretion on implementation.
- **D-21:** Admin dashboard shows booking calendar view with color-coding by service type/room, plus list view of upcoming/past bookings with status filters.

### Client Dashboard & Emails
- **D-22:** Dashboard layout — Claude's discretion based on existing `/dashboard/purchases` structure. Bookings section added alongside purchases.
- **D-23:** Rich branded confirmation email — branded header, service details, room info, date/time, studio address, prep instructions per service type, add-to-calendar link (.ics), social links. Follows React Email patterns from Phase 2 but with richer content.
- **D-24:** Email + SMS notifications — confirmation at booking, reminder 24hr before session (both email and SMS), admin notification on new booking.
- **D-25:** SMS via Twilio or similar service (new dependency for this phase).

### Navigation & Routing
- **D-26:** Both dedicated `/book` route AND "Book Now" CTAs on services page — service page CTAs link to `/book?service=mixing` pre-selecting the service type. Multiple entry points to booking.
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.planning/DESIGN-LANGUAGE.md` — Cyberpunk Metro tile grid spec, monochrome palette, typography, spacing tokens. Calendar tiles must follow this.

### Technology Stack
- `CLAUDE.md` §Technology Stack — Full stack decisions. Note: date-fns for date manipulation, shadcn/ui components, Stripe for payments.
- `CLAUDE.md` §Booking & Calendar — Custom booking system rationale (not Cal.com embed). shadcn/ui date picker + custom availability logic backed by DB.

### Existing Payment & Email Infrastructure
- `src/lib/stripe.ts` — Stripe server client singleton (reuse for booking deposits)
- `src/lib/stripe-client.ts` — Stripe client-side setup
- `src/app/api/webhooks/` — Existing Stripe webhook handler (extend for booking payments)
- `src/lib/email/purchase-receipt.tsx` — React Email template pattern to follow for booking confirmation email
- `src/lib/r2.ts` — R2 storage client (if room photos stored in R2)

### Existing Schema & Auth
- `src/db/schema.ts` — Current Drizzle schema with services, orders, users. Booking tables extend this.
- `src/lib/auth.ts` / `src/lib/auth-client.ts` — Better Auth server/client split. Admin + client roles.

### Phase 2 Patterns
- `.planning/phases/02-beat-store/02-CONTEXT.md` — Guest checkout + optional account pattern (D-16), Stripe Embedded Checkout pattern (D-15)

### Requirements
- `.planning/REQUIREMENTS.md` — BOOK-02, BOOK-03, BOOK-04, AUTH-04, MAIL-02, ADMN-02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/stripe.ts` — Stripe server client singleton, reuse for booking deposit sessions
- `src/lib/stripe-client.ts` — Client-side Stripe, reuse for embedded checkout
- `src/app/api/webhooks/` — Stripe webhook handler, extend for booking payment events
- `src/lib/email/purchase-receipt.tsx` — React Email template, use as pattern for booking confirmation
- `src/lib/r2.ts` — R2 client for room photos
- `src/components/tiles/tile.tsx` — Base Tile component for calendar day/slot tiles
- `src/components/ui/` — Full shadcn/ui component library (dialog, sheet, drawer, tabs, table, badge, skeleton, etc.)
- `src/components/forms/` — Existing form patterns (contact form)

### Established Patterns
- Stripe Embedded Checkout flow (create session → embed → webhook confirmation)
- Guest checkout with optional account creation (beat store)
- force-dynamic for DB-querying pages
- Server component slot pattern (async components passed as ReactNode props)
- Drizzle ORM with Supabase pooler connection
- Admin route group at `/admin` with role-based access
- Client dashboard at `/dashboard` with tab structure
- Resend for transactional email with React Email templates

### Integration Points
- `src/app/(public)/layout.tsx` — Add `/book` to navigation tile config
- `src/components/layout/tile-nav.tsx` — Add booking nav tile
- `src/components/services/service-grid.tsx` — Add "Book Now" CTA linking to `/book?service=X`
- `src/app/(public)/dashboard/` — Add bookings view alongside purchases
- `src/db/schema.ts` — New tables: bookings, rooms, availability, packages, recurring_series
- `src/app/api/webhooks/` — Extend webhook handler for booking payment events
- `src/app/admin/` — New admin pages for room management, booking management, availability config

</code_context>

<specifics>
## Specific Ideas

- Calendar tiles should match the Cyberpunk Metro tile grid aesthetic — flat monochrome squares with glitch hover effect on available dates
- Time slot list also tile-styled — flat rectangles with the same hover treatment
- "I want a full system" — admin should be able to configure everything: deposit amounts, cancellation windows, room features, service durations, package pricing, confirmation modes
- Package pricing for recurring bookings modeled similarly to beat bundles (Phase 2) with discount percentages
- Multiple entry points: dedicated `/book` page + "Book Now" CTAs on services page with pre-selected service query param

</specifics>

<deferred>
## Deferred Ideas

### SaaS Multi-Tenant Platform
User expressed interest in converting Glitch Studios into a SaaS platform (like Toast/Owner.com) for studios and independent producers — each customer gets their own branded page with custom domain, booking, beat store, all running through Glitch. This would require:
- Multi-tenant database architecture (row-level security or schema-per-tenant)
- 3-tier auth (platform admin → studio owner → client)
- Stripe Connect for per-studio payment accounts
- Customizable theming per studio
- Custom domain routing

**Recommendation:** Complete v1 as single-tenant Glitch Studios site. SaaS pivot becomes v2.0 milestone. Everything built in v1 becomes the "studio template" that gets wrapped in multi-tenancy.

### Additional Deferred Items
- Analytics dashboard for booking trends, revenue by service — belongs in Phase 4 or v2
- Waiting list for fully booked time slots — future enhancement
- Client file sharing/review portal for mix feedback — explicitly out of scope (REQUIREMENTS.md)

</deferred>

---

*Phase: 03-booking-system*
*Context gathered: 2026-03-26*
