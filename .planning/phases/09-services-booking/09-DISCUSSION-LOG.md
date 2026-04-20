# Phase 9: Services & Booking - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 09-services-booking
**Areas discussed:** Service page depth, Step context & guidance, Service visibility in wizard, Mobile rendering audit, Coming-soon toggle mode, Newsletter infrastructure, Empty/edge states

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Service page depth | BOOK-08 — enrich master-detail or switch to /services/[slug]? What sections? | ✓ |
| Step context & guidance | BOOK-07 — persistent summary? Step subtitles? Terms placement? | ✓ |
| Service visibility in wizard | BOOK-06 v2 — rich Step 1 tiles or minimal? Non-bookable handling? | ✓ |
| Mobile rendering audit | Criterion #4 — audit during planning vs execution vs as-I-go? | ✓ |

**User's choice:** All four areas selected.

---

## Service Page Depth

### Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Enrich master-detail | Keep single /services with tile grid + expanded detail panel | ✓ |
| Dedicated /services/[slug] pages | Each service becomes its own page | |
| Hybrid: panel + 'Read more' deep page | Detail panel summary + optional full page | |

**User's choice:** Enrich master-detail (recommended).

### What sections to add

| Option | Description | Selected |
|--------|-------------|----------|
| Duration & what's included | From durationMinutes + deliverables list | ✓ |
| Process / timeline | Step-by-step prep → session → revisions → delivery | ✓ |
| Example work / portfolio snippet | 2-3 items from portfolio tied to service | ✓ |
| Policies (deposit, cancellation, refund) | From serviceBookingConfig | ✓ |

**User's choice:** All four sections — plus a major scope addition (see below).

### User-introduced scope: Coming-soon mode

The user added context not covered by the original gray areas: the studio is not yet operational. Full text:

> "as of right now the actual services is like unavailable so we don't have a studio yet so I don't want to confuse people. The services tab I feel like I want it there but like we should have a way to turn off like the services part and the admin dashboard on the sense that if we turn it off the tab will still be there, the thing will still be there, but once you click it, it gives you a cool explanation of what's coming. We're building a studio, a creative studio, all this stuff. Explanation. Then when we turn on the services, on the actual admin dashboard, all the services come back into it. Just so we don't confuse the new clients. better give them a page rich page explaining what we're building you know explaining what the whole glitch studio thing is about first and then promote it and then once the services is out and we have the location and everything set up we turn it on but let's have everything ready"

**Notes:** Captured as D-01 through D-06, D-09, D-18, D-19 in CONTEXT.md. This is core Phase 9 scope — not deferred.

---

## Coming-soon Toggle Mode

### Toggle granularity

| Option | Description | Selected |
|--------|-------------|----------|
| Global toggle | Single `booking_live` flag; controls /services AND /book | ✓ |
| Per-service toggle | Each service has its own live flag | |
| Two separate toggles | One for /services mode, one for /book availability | |

**User's choice:** Global toggle (recommended).

### Coming-soon content style

| Option | Description | Selected |
|--------|-------------|----------|
| Mission-driven manifesto | Bold cyberpunk hero, what's coming, newsletter signup | ✓ |
| Behind-the-scenes preview | Studio photos, gear, team, weekly updates | |
| Minimal teaser | Tight one-pager with email signup | |

**User's choice:** Mission-driven manifesto (recommended).

### Book CTA behavior when toggle OFF

| Option | Description | Selected |
|--------|-------------|----------|
| All redirect to coming-soon | Every Book CTA lands on the manifesto | ✓ |
| Change CTA text dynamically | Become 'Get Notified' / 'Coming Soon' | |
| Hide Book CTAs entirely | Every Book button disappears | |

**User's choice:** All redirect to coming-soon (recommended).

### Newsletter capture

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — prominent 'Notify me' form | Email input + Notify me button, focal point of manifesto | ✓ |
| Yes, but subtle link | Small 'Get notified' link | |
| No capture — manifesto only | Pure content, no form | |

**User's choice:** Prominent 'Notify me' form (recommended).

### Admin toggle location

| Option | Description | Selected |
|--------|-------------|----------|
| Settings page | New site-settings page in admin | |
| Services admin page | Toggle at top of services list | |
| Environment variable | BOOKING_LIVE env flag, no UI | |

**User's choice:** Free-text — "SETTINGS BUT ALSO ON THE SERVICES section in the dashboard wherever the bookings or the services live with a toggle and a warning we need to approve to turn off or on, is off by default as of now cause studio not ready"

**Notes:** Locked as D-04 — two surfaces (Settings AND services/bookings admin), confirmation modal required before applying, off by default.

---

## Step Context & Guidance

### Persistent booking summary

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent sidebar | Right-side panel on desktop, collapsible top on mobile | ✓ |
| Summary shown at top of each step | Thin recap bar | |
| Only on payment step | Full summary at end | |

**User's choice:** Persistent sidebar (recommended).

### Step subtitles/descriptions

| Option | Description | Selected |
|--------|-------------|----------|
| Short subtitle per step | One line under step heading | ✓ |
| Longer help text block | Full paragraph per step | |
| No — self-explanatory | Trust stepper + labels | |

**User's choice:** Short subtitle per step (recommended).

### Deposit/cancellation terms placement

| Option | Description | Selected |
|--------|-------------|----------|
| Inline on DETAILS step | Before payment, from serviceBookingConfig | ✓ |
| Tooltip/info icon only | (i) icon with hover/tap reveal | |
| Only on payment step | With Stripe checkout | |

**User's choice:** Inline on DETAILS step (recommended).

---

## Service Visibility in Wizard

### Step 1 tile richness

| Option | Description | Selected |
|--------|-------------|----------|
| Rich tiles with price + duration | Name, desc, priceLabel, duration — full context | ✓ |
| Minimal tile + expandable | Name + duration, click to expand | |
| Tile + 'Learn more' link to /services | Link opens service detail in new tab | |

**User's choice:** Rich tiles (recommended).

### Non-bookable service handling

| Option | Description | Selected |
|--------|-------------|----------|
| Hide entirely | Only show bookable services in wizard | ✓ |
| Show disabled with Contact CTA | All shown, non-bookable greyed with quote link | |
| Show with custom booking path | Swap to quote-request form for non-bookable | |

**User's choice:** Hide entirely (recommended — matches current inner-join).

---

## Mobile Rendering Audit

### Audit timing

| Option | Description | Selected |
|--------|-------------|----------|
| Playwright audit during planning | Screenshots at 375px, specific break list in plan | ✓ |
| Audit during execution | Generic 'mobile polish' task, find during coding | |
| Trust me to find & fix as I go | No explicit audit, fix opportunistically | |

**User's choice:** Playwright audit during planning (recommended).

---

## Empty / Edge States

### Copy tone

| Option | Description | Selected |
|--------|-------------|----------|
| Brand-voiced & pragmatic | Short, confident, cyberpunk — matches mono-uppercase aesthetic | ✓ |
| Warm & conversational | Friendlier, longer | |
| Functional / utilitarian | Minimum words | |

**User's choice:** Brand-voiced & pragmatic (recommended).

### Zero bookable services

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-fall back to coming-soon | Same manifesto as toggle OFF | ✓ |
| Dedicated 'no services available' screen | Separate empty state | |
| Redirect to /services | Redirect /book when nothing bookable | |

**User's choice:** Auto-fall back to coming-soon (recommended).

---

## Newsletter Infrastructure

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse existing newsletter infra | Scout for newsletter form component, reuse if present | |
| Build minimal notify-list in Phase 9 | New table for launch-notify emails | |
| Claude's discretion during planning | Planner scouts, reuses or escalates | ✓ |

**User's choice:** Claude's discretion during planning.

**Scout result (post-decision):** `newsletter_subscribers` table exists at [src/db/schema.ts:193](src/db/schema.ts), and a newsletter form component exists at [src/components/forms/newsletter-form.tsx](src/components/forms/newsletter-form.tsx). Planner will reuse these; a source/tag field may be added to distinguish launch-notify signups if not already present.

---

## Empty State Copy Baselines

Captured as D-17:
- No dates available in month: "No slots this month — try next."
- No time slots on date: "Session closed. Grab one next week."
- Payment failed: "Payment didn't land. Retry or try another card."

---

## Claude's Discretion

Areas where the user deferred implementation specifics to Claude/planner:
- Exact copy for mission manifesto (must match cyberpunk brand voice)
- Visual layout details of persistent summary sidebar + mobile collapsible
- Specific icons/visuals for empty states
- Exact wording of the admin toggle confirmation modal
- Whether process/timeline is per-service-type or generic template
- Location of "Notify me" form within manifesto
- Whether `newsletter_subscribers` needs a source/tag field for launch-notify

---

## Deferred Ideas

- Per-service `is_live` toggle — global chosen instead
- Dedicated `/services/[slug]` pages — master-detail enrichment chosen
- Behind-the-scenes / progress-feed coming-soon content — manifesto chosen
- Quote-request form for non-bookable services — out of Phase 9 scope
- Admin service CRUD UX improvements — separate phase
- Per-service process/timeline editor in admin — may escalate during planning

---
