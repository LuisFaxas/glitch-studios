# Phase 9: Services & Booking - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the existing `/services` page and booking wizard (`/book`) so they feel comprehensive, guide users clearly at each step, and give visitors enough info to book confidently. Adds a **"studio coming soon" mode** — the studio is not yet operational, so Phase 9 must also deliver an admin-toggleable manifesto experience that replaces bookable services until launch.

**In scope:**
- Admin toggle (`booking_live`) + confirmation flow to enable/disable booking globally
- Mission-driven "coming soon" manifesto shown on `/services` and `/book` when toggle is OFF
- Launch-notify email capture on the manifesto (reuses existing `newsletter_subscribers`)
- Service detail panel enriched with duration, process/timeline, policies, and example work
- Booking wizard polish: persistent summary sidebar, per-step subtitles, terms surfaced before payment
- Rich Step 1 service tiles (price + duration) in the wizard
- Mobile rendering audit with Playwright (concrete fix list baked into plan)
- Brand-voiced empty/error states across the wizard
- Sitewide Book CTA redirect behavior when toggle is OFF

**Out of scope:**
- New booking features (recurring, packages, multi-room — already shipped in Phase 3)
- Dedicated `/services/[slug]` routes (kept as master-detail)
- Per-service toggles (global flag only)
- Quote-request form for non-bookable services (deferred)
- Admin service CRUD improvements (separate phase if needed)

</domain>

<decisions>
## Implementation Decisions

### Coming-soon mode & admin toggle
- **D-01:** Global admin toggle `booking_live` (boolean). **Off by default — studio not operational yet.** Stored in existing `site_settings` table as `key = "booking_live"`, `value = "true" | "false"`.
- **D-02:** When `booking_live = false` → `/services` and `/book` both render the same mission-driven manifesto page. When `true` → normal service detail + booking wizard.
- **D-03:** All "Book Session" / "Book Now" CTAs sitewide (hero CTA, sidebar tile, beat card, footer, wherever they appear) redirect to `/services` (the coming-soon page) when toggle is OFF. Link text is unchanged — the destination is what changes.
- **D-04:** Toggle is exposed in **two admin surfaces**: (a) new admin Settings page control at [src/app/admin/settings/](src/app/admin/settings/), (b) the admin services/bookings section. Both update the same underlying flag. Toggling either direction (ON→OFF or OFF→ON) **requires a confirmation modal** ("Are you sure? This affects every Book CTA on the site.") before applying.
- **D-05:** Coming-soon page is a **mission-driven manifesto** — cyberpunk-styled hero ("We're building Glitch Studios."), sections on what's coming (music production, video, creative services), and a prominent "Notify me when we launch" email capture. Uses existing brand aesthetic (mono-uppercase headings, hover-only glitch, monochrome palette).
- **D-06:** Fallback — if toggle is ON but zero services have `service_booking_config` rows (no bookable services), `/book` and `/services` auto-render the manifesto (same content as OFF state). Zero dead-ends.

### Service page depth (BOOK-08)
- **D-07:** Keep single `/services` page with master-detail layout (tile grid + expanded detail panel). **No** dedicated `/services/[slug]` routes in Phase 9.
- **D-08:** Detail panel is **enriched with four new sections** beyond the current (name, description, priceLabel, features):
  1. **Duration & what's included** — session length (from `durationMinutes`) and a short deliverables list
  2. **Process / timeline** — step-by-step (prep → session → revisions → delivery). Generic template vs per-service-type is Claude's discretion based on service data diversity
  3. **Policies** — deposit amount, cancellation window, refund policy, all pulled from `service_booking_config`
  4. **Example work / portfolio snippet** — 2–3 items from existing portfolio tied to this service (tagged or service-matched)
- **D-09:** When coming-soon mode is active, the detail panel is replaced entirely by the manifesto. No "service preview" mini-view.

### Booking wizard step context (BOOK-07)
- **D-10:** **Persistent booking summary sidebar** on desktop — right-side panel always visible across all 5 steps, showing: selected service, date, time, deposit amount as each is chosen. On mobile, a collapsible summary pinned at the top.
- **D-11:** Each wizard step gets a **short one-line subtitle** under the step heading. Examples: "Pick your service — we'll show matching availability", "Choose a date — greyed out means unavailable". Claude's discretion on exact copy matching brand tone.
- **D-12:** **Deposit + cancellation terms surface inline on the DETAILS step** (before payment), pulled from `service_booking_config`. Example: "Deposit: $X (50% of $Y). Cancel up to 48h before for full refund."

### Service visibility in wizard (BOOK-06 v2)
- **D-13:** Step 1 service tiles are **rich**: name, 1-line description, `priceLabel`, duration (from `durationMinutes`). Enough info to decide without leaving the wizard.
- **D-14:** Non-bookable services (no `service_booking_config`) remain **hidden from the wizard**. They exist only on `/services` (when toggle ON) with a "Contact for quote" CTA. Keep current inner-join behavior in [src/app/(public)/book/page.tsx](src/app/(public)/book/page.tsx).

### Mobile rendering (success criterion #4)
- **D-15:** **Playwright audit during planning**, not execution. Capture screenshots at 375px viewport of `/services` and `/book` in all 5 wizard steps. Produce a specific break list (overflow, overlap, small tap targets). Fixes baked into the plan as concrete tasks — no generic "mobile polish pass" task.

### Empty / edge states
- **D-16:** Copy tone is **brand-voiced & pragmatic** — short, confident, cyberpunk-styled. Matches mono-uppercase aesthetic of the rest of the site.
- **D-17:** Empty/error state copy baselines (executor may adjust within the tone):
  - No dates available in month: "No slots this month — try next."
  - No time slots on date: "Session closed. Grab one next week."
  - Payment failed: "Payment didn't land. Retry or try another card."
  - Session load error / network: Claude's discretion, same tone
- **D-18:** Zero bookable services → **auto-fallback to coming-soon mode** (D-06). Not a separate empty state.

### Newsletter / notify-me
- **D-19:** Reuse existing `newsletter_subscribers` table and the newsletter form component at [src/components/forms/newsletter-form.tsx](src/components/forms/newsletter-form.tsx). Planner scouts the existing flow, wires the manifesto form to it, and tags the signup source so launch-notify list is distinguishable from general newsletter. If tagging requires a schema touch, planner includes that as a task.

### Claude's Discretion
- Exact copy for the mission manifesto (must match cyberpunk brand voice, reference what Glitch Studios is building)
- Visual layout details of the persistent summary sidebar on desktop and collapsible summary on mobile
- Specific icons/visuals for empty states
- Exact wording of the admin toggle confirmation modal
- Whether process/timeline is per-service-type or a generic template
- Where the "Notify me" form sits within the manifesto layout (hero, mid-page, footer)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prior phase decisions (carry-forward)
- [.planning/phases/03-booking-system/03-CONTEXT.md](.planning/phases/03-booking-system/03-CONTEXT.md) — All Phase 3 booking decisions (D-01 through D-27). Service-first flow, master-detail pattern, 5-step stepper, deep-link `/book?service=slug`, Stripe embedded checkout.
- [.planning/phases/01.2-design-language-overhaul/01.2-CONTEXT.md](.planning/phases/01.2-design-language-overhaul/01.2-CONTEXT.md) — Cyberpunk Metro tile aesthetic, monochrome palette, mono-uppercase typography, hover-only glitch rule.
- [.planning/phases/08-auth-navigation/08-CONTEXT.md](.planning/phases/08-auth-navigation/08-CONTEXT.md) — Recent sidebar/mobile nav patterns, auth guards on `/dashboard`.

### Existing services & booking code
- [src/app/(public)/services/page.tsx](src/app/(public)/services/page.tsx) — Server component, queries `services` + `service_booking_config`. Currently unconditionally renders `ServiceGrid`. D-02 adds toggle-aware rendering.
- [src/app/(public)/book/page.tsx](src/app/(public)/book/page.tsx) — Server component, inner-joins services with `service_booking_config`. D-06/D-18 add manifesto fallback.
- [src/components/services/service-grid.tsx](src/components/services/service-grid.tsx) — Master-detail component. D-08 adds four new sections to detail panel.
- [src/components/booking/booking-flow.tsx](src/components/booking/booking-flow.tsx) — 5-step wizard. D-10 adds persistent summary sidebar. D-11/D-12 add step subtitles and terms display.
- [src/components/booking/booking-flow-stepper.tsx](src/components/booking/booking-flow-stepper.tsx) — Step indicator. D-15 audit will check mobile rendering here specifically.
- [src/components/booking/service-selector.tsx](src/components/booking/service-selector.tsx) — Step 1 tiles. D-13 enriches tile content.

### Schema (existing — no migrations required for core scope)
- [src/db/schema.ts](src/db/schema.ts) — Key tables:
  - `siteSettings` (L534) — key/value store for `booking_live` flag (D-01)
  - `services` — service metadata (name, slug, description, priceLabel, features)
  - `serviceBookingConfig` — per-service booking config (durationMinutes, depositType/Value, cancellationWindowHours, refundPolicy, prepInstructions)
  - `newsletterSubscribers` (L193) — reuse for notify-me (D-19)
  - `portfolioItems` — for example-work section (D-08 section 4)

### Admin surfaces
- [src/app/admin/settings/](src/app/admin/settings/) — Existing admin settings area. D-04 (a) adds booking toggle here.
- [src/app/admin/services/](src/app/admin/services/) — Existing services admin. D-04 (b) adds a secondary toggle control here.

### Memory constraints (user feedback)
- `feedback_glitch_headers` — every header uses hover-only RGB-split glitch; no auto-running animations on headings. Manifesto + step headings must comply.
- `feedback_design_quality` — site rated 4/10 in audit; polish bar is high. No generic "skeleton" screens.
- `feedback_playwright_verification` — use Playwright during dev so AI verifies visual output. D-15 enforces this.
- `feedback_no_executors` — never spawn gsd-executor; work inline, verify with Playwright.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ServiceGrid` component — master-detail layout already handles desktop and mobile accordion. Just extend the `ServiceDetailPanel` with the four new sections.
- `BookingFlow` — 5-step wizard with state machine already built. Add sidebar layout without rewriting state logic.
- `siteSettings` key-value table — no schema change needed for `booking_live` flag. Standard read/write pattern elsewhere in admin.
- `newsletterSubscribers` table + `newsletter-form.tsx` — ready to reuse for notify-me; may need a source/tag field if not present.
- `Tile` component (with glitch hover overlay) — use for rich Step 1 tiles in wizard.
- Existing Playwright test scaffolding in `tests/` — homepage and mobile menu tests already exist as a pattern.

### Established Patterns
- Server components for pages, client components for interactive wizards (matches App Router conventions)
- Drizzle ORM for all DB access; `src/actions/` holds server actions for mutations
- `motion/react` for transitions; `clsx` for conditional classes
- Mono-uppercase + tracking-[0.05em] for all headings
- Hover-only glitch overlays (no always-on animations)
- `/book?service=slug` deep-link pattern (preserved)

### Integration Points
- `booking_live` flag read:
  - `/services/page.tsx` and `/book/page.tsx` — server components read flag and branch
  - `/components/home/hero-section.tsx`, `sidebar tile-nav`, footer, any Book CTA — consult the flag (via a shared `getBookingLive()` util or React context provider hydrated from server)
  - Must not cause hydration mismatches — fetch once server-side per request
- Admin toggle write:
  - New server action (e.g., `src/actions/settings/set-booking-live.ts`) that updates `siteSettings` and revalidates public paths (`revalidatePath("/services")`, `/book`, `/`)
  - Confirmation modal pattern: follows existing admin modal style (see admin-sidebar, admin-services)
- Manifesto component — shared between `/services` and `/book` when toggle is OFF; extract to `src/components/services/coming-soon-manifesto.tsx` or similar

</code_context>

<specifics>
## Specific Ideas

- User framed the manifesto as: "a cool explanation of what's coming. We're building a studio, a creative studio, all this stuff. Explanation. Then when we turn on the services, on the actual admin dashboard, all the services come back into it."
- User intent: avoid confusing new clients with bookable services before the studio is operational. Keep everything built/ready, toggle it on at launch.
- Studio is being built — the "coming soon" content should feel like progress/ambition, not an apology.
- Admin wants toggles in both Settings AND the services/bookings admin section for discoverability, with a confirmation guard.

</specifics>

<deferred>
## Deferred Ideas

- **Per-service `is_live` toggle** — considered (gray area option), but global toggle chosen. Future phase if granular rollout is needed post-launch.
- **Dedicated `/services/[slug]` pages** — considered for depth, but master-detail enrichment chosen. Can be revisited in a future SEO/content phase.
- **Behind-the-scenes content feed** (studio build photos, team intros, progress updates) — manifesto chosen over this. Could be a Phase 10+ addition.
- **Quote-request form for non-bookable services** — non-bookable services currently rely on "Contact" CTA; formalizing a quote form is a separate scope, likely Phase 13 (Contact) or its own phase.
- **Admin service CRUD UX improvements** — not in BOOK-06/07/08 scope. Separate phase if needed.
- **Per-service process/timeline editor in admin** — if process copy needs to be per-service-editable rather than generic, that's a schema + admin UI addition. Deferred; Phase 9 planner decides generic-vs-per-service-type based on service data.

</deferred>

---

*Phase: 09-services-booking*
*Context gathered: 2026-04-20*
