# Phase 09: Services & Booking — Research

**Researched:** 2026-04-20
**Domain:** Next.js 16 App Router UX quality overhaul of an existing booking wizard + service catalog. Adds admin-toggled "coming soon" manifesto mode.
**Confidence:** HIGH (existing codebase inspected file-by-file; locked decisions constrain scope; no unverified external claims)

## Summary

Phase 09 is a **v2.0 quality polish** of code that already ships — Phase 3 delivered the full booking system (calendar, slots, Stripe Embedded Checkout, deposits, recurring, admin). This research maps exactly what exists, where the seams are, and which integration points Phase 09 touches.

The scope collapses into four tightly-bounded workstreams:
1. **Booking-live toggle + manifesto** — net-new surface area: `site_settings.booking_live` key, a shared `ComingSoonManifesto` component rendered by both `/services` and `/book`, an admin toggle card in two surfaces, a `getBookingLive()` server util consulted by every Book CTA.
2. **Service detail panel enrichment** — extend the existing `ServiceDetailPanel` inside `service-grid.tsx` with four new sections (Duration & Includes, Process, Policies, Example Work). No new routes. All data already in `serviceBookingConfig` and `portfolioItems`.
3. **Booking wizard polish** — rewrite sidebar into the 5-row persistent summary locked in UI-SPEC, add per-step subtitles, add inline Deposit & Cancellation terms block on Step 4, enrich Step 1 tiles with price + duration + description, standardize CTA copy to `CONTINUE TO {NEXT STEP}`.
4. **Mobile audit** — Playwright screenshots at 375px on `/services` (toggle ON and OFF) and `/book` (all 5 steps) **during planning**, producing a concrete break list that becomes explicit tasks rather than a vague "mobile pass."

**Primary recommendation:** Treat this as a five-wave plan. Wave 0: Playwright mobile audit of the current state, producing the concrete break list. Wave 1: Schema/infra additions (`booking_live` setting key, `newsletter_subscribers.source` tagging, `getBookingLive()` util, `set-booking-live` server action). Wave 2: Manifesto component + admin toggle card + CTA rerouting site-wide. Wave 3: Service detail panel enrichment + example-work wiring to `portfolioItems`. Wave 4: Wizard polish (summary sidebar, subtitles, terms block, rich Step 1 tiles, CTA copy). Wave 5: Mobile fixes from Wave 0 + final Playwright verification.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Coming-soon mode & admin toggle**
- **D-01:** Global admin toggle `booking_live` (boolean). **Off by default — studio not operational yet.** Stored in existing `site_settings` table as `key = "booking_live"`, `value = "true" | "false"`.
- **D-02:** When `booking_live = false` → `/services` and `/book` both render the same mission-driven manifesto page. When `true` → normal service detail + booking wizard.
- **D-03:** All "Book Session" / "Book Now" CTAs sitewide redirect to `/services` (the coming-soon page) when toggle is OFF. Link text unchanged — the destination is what changes.
- **D-04:** Toggle is exposed in **two admin surfaces**: (a) new admin Settings page control at `src/app/admin/settings/`, (b) the admin services/bookings section. Both update the same underlying flag. Toggling either direction requires a **confirmation modal** before applying.
- **D-05:** Coming-soon page is a mission-driven manifesto — cyberpunk-styled hero ("We're building Glitch Studios."), sections on what's coming, a prominent "Notify me when we launch" email capture.
- **D-06:** Fallback — if toggle is ON but zero services have `service_booking_config` rows, `/book` and `/services` auto-render the manifesto.

**Service page depth (BOOK-08)**
- **D-07:** Keep single `/services` page with master-detail layout. No `/services/[slug]` routes.
- **D-08:** Detail panel enriched with four new sections: (1) Duration & what's included, (2) Process / timeline, (3) Policies, (4) Example work / portfolio snippet.
- **D-09:** In coming-soon mode the detail panel is replaced by the manifesto. No preview.

**Booking wizard step context (BOOK-07)**
- **D-10:** Persistent booking summary sidebar — right-side on desktop across all 5 steps; mobile collapsible pinned at top.
- **D-11:** Each wizard step gets a one-line subtitle under the step heading.
- **D-12:** Deposit + cancellation terms surface inline on the DETAILS step, pulled from `service_booking_config`.

**Service visibility in wizard (BOOK-06 v2)**
- **D-13:** Step 1 service tiles are rich (name, 1-line description, priceLabel, duration).
- **D-14:** Non-bookable services remain hidden from the wizard. They exist only on `/services` with a "Contact for quote" CTA. Keep the current inner-join in `book/page.tsx`.

**Mobile rendering**
- **D-15:** **Playwright audit during planning**, not execution. Capture screenshots at 375px of `/services` and `/book` (all 5 steps). Produce specific break list baked into the plan.

**Empty / edge states**
- **D-16:** Copy tone is brand-voiced & pragmatic — short, confident, cyberpunk-styled.
- **D-17:** Empty/error state copy baselines (per UI-SPEC copywriting contract) must be used verbatim.
- **D-18:** Zero bookable services → auto-fallback to coming-soon mode (D-06).

**Newsletter / notify-me**
- **D-19:** Reuse existing `newsletter_subscribers` table and `newsletter-form.tsx` component. Tag signup source so launch-notify list is distinguishable from general newsletter. **If tagging requires a schema touch, the planner includes that as a task.**

### Claude's Discretion

- Exact copy for the mission manifesto (must match cyberpunk brand voice)
- Visual layout details of the persistent summary sidebar on desktop and collapsible summary on mobile (Drawer vs inline is open — UI-SPEC assumes inline collapsible)
- Specific icons/visuals for empty states
- Exact wording of the admin toggle confirmation modal
- Whether process/timeline is per-service-type or a generic template (UI-SPEC locks 4-step shape; body copy is open)
- Where the "Notify me" form sits within the manifesto layout (hero, mid-page, footer)
- Newsletter source-tag schema touch (add `source` column to `newsletter_subscribers` — **research recommends using existing `tags text[]` column, no schema change needed; see Runtime State Inventory**)

### Deferred Ideas (OUT OF SCOPE)

- Per-service `is_live` toggle — global toggle chosen
- Dedicated `/services/[slug]` pages — master-detail enrichment chosen
- Behind-the-scenes content feed — manifesto chosen
- Quote-request form for non-bookable services — separate phase
- Admin service CRUD UX improvements — separate phase
- Per-service process/timeline editor in admin — may escalate during planning; for now use a generic template

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **BOOK-06 (v2)** | Booking flow shows all available services and provides enough detail at each step | D-13/D-14 + existing `service-selector.tsx` + `serviceBookingConfig.durationMinutes` already queried by `book/page.tsx`. Enrich the tile, don't change the data flow. |
| **BOOK-07** | Date, time, and payment steps are clearly separated with contextual information | D-10/D-11/D-12. Existing `BookingFlow` has state for all 5 steps; persistent summary already partially exists in `booking-summary.tsx` (desktop sticky sidebar at `lg:w-[40%]`). UI-SPEC locks 320px fixed width + 5-row format. Step subtitles are net-new; terms block is net-new; both live inside the existing `AnimatePresence` per-step render. |
| **BOOK-08** | Service pages display comprehensive information (pricing, details, what's included) | D-07/D-08. Existing `ServiceDetailPanel` in `service-grid.tsx` currently renders name/description/priceLabel/features/CTAs. Extend with the four new sections. All source data already exists in `services`, `serviceBookingConfig`, and `portfolioItems`. |

---

## Standard Stack

This phase introduces **zero new dependencies**. Everything used is already installed (verified in package.json).

### Core
| Library | Version (installed) | Purpose | Why Standard |
|---------|---------------------|---------|--------------|
| Next.js | 16.2.1 | Full-stack framework | Locked in CLAUDE.md. App Router, Server Components for data pages, Client Components for the wizard. |
| React | 19.x (via Next 16) | UI runtime | Locked in CLAUDE.md. |
| Tailwind CSS | 4.x | Styling | Locked in CLAUDE.md. CSS-first config; tokens already in `src/styles/globals.css`. |
| Drizzle ORM | 0.45.1 | Database | Locked in CLAUDE.md. `siteSettings`, `newsletterSubscribers`, `services`, `serviceBookingConfig`, `portfolioItems` all typed and ready. |
| Better Auth | 1.5.6 | Auth | Session reads already present in `BookingFlow` via `useSession()` and in admin gates via `requirePermission()`. |
| motion (Framer) | 12.23.12 | Wizard step transitions | Already used for step slide + fade. `AnimatePresence` wraps step body in `booking-flow.tsx`. |
| `@stripe/react-stripe-js` | 5.6.1 | Embedded Checkout on Step 5 | Already wired in `booking-flow.tsx` (`EmbeddedCheckoutProvider`). No changes in Phase 9. |
| zod | 4.3.6 | Validation | Used by `booking-form.tsx` (Zod 4 `z.email()` in `newsletter-form.tsx`). |
| sonner | 2.0.7 | Toasts | Already used for booking error toasts + newsletter success/error. |
| lucide-react | 1.6.0 | Icons | `Clock` for duration; `ChevronDown` already used for summary accordion. Note: Lucide dropped brand icons in v1.6 (flagged in STATE.md) — not relevant for Phase 9 (no brand icons touched). |
| date-fns | 4.1.0 | Date formatting | Used in booking summary formatter. |
| shadcn/ui | — (components copied into `src/components/ui/`) | Base components | `Switch`, `AlertDialog`, `Card`, `Button`, `Input`, `Label` all already present. |

### Supporting (verified present)
| Component / Module | Path | Use In Phase 9 |
|---|---|---|
| `GlitchHeading` | `src/components/ui/glitch-heading.tsx` | Wrap every new heading (manifesto h1, detail-panel section titles if promoted to `heading` token, wizard step headings). Enforces hover-only glitch rule. |
| `GlitchLogo` | `src/components/layout/glitch-logo.tsx` | Manifesto hero. UI-SPEC leaves size (`md` vs `lg`) to planner. |
| `NewsletterForm` | `src/components/forms/newsletter-form.tsx` | Manifesto "Notify me" block. Needs an optional `source` prop to tag launch-notify signups (D-19). |
| `subscribeNewsletter` action | `src/actions/newsletter.ts` | Extend signature to accept optional `source` param; write into existing `newsletter_subscribers.tags` column (text array) — **no schema change needed**. |
| `siteSettings` table + `getSettings()` | `src/db/schema.ts` L534, `src/actions/admin-settings.ts` | Store `booking_live`. Existing `updateSettings` pattern is the template for `setBookingLive`. Note: `VALID_KEYS` array in `admin-settings.ts` currently excludes `booking_live` — either extend the allowlist or write a dedicated server action (recommended — confirmation modal wants its own action with typed direction). |
| `BookingFlow` + `BookingSummary` + `ServiceSelector` + `BookingFlowStepper` + `BookingForm` | `src/components/booking/*` | Modify in place. |
| `ServiceGrid` + `ServiceDetailPanel` | `src/components/services/service-grid.tsx` | Modify in place. Detail panel lives as an internal component; extract or expand inline (planner's call — UI-SPEC just specifies section order). |
| `portfolioItems` table | `src/db/schema.ts` L122 | Source for Example Work section. Has `category` (text) and `type` (text) columns — join to service by one of these (see Open Questions). |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Reusing `tags text[]` for launch-notify flag | Adding dedicated `source text` column to `newsletter_subscribers` | Column is simpler semantically but requires migration. Existing `tags` array absorbs the new tag `"launch-notify"` with zero schema churn — **recommended**. CONTEXT.md D-19 explicitly defers this call to the planner. |
| Extending existing `updateSettings` to accept `booking_live` | New `setBookingLive` server action | Dedicated action makes confirmation-modal + revalidation logic clearer and keeps the public-facing allowlist separate from admin site-chrome settings. **Recommended.** |
| Master-detail with accordion on mobile (current) | Dedicated `/services/[slug]` routes | Locked by D-07. Ignore. |

**Installation:** None required. All packages already installed.

**Version verification:** Skipped — no new packages. All versions read from `package.json` as of 2026-04-20.

---

## Architecture Patterns

### Recommended Project Structure (additions only)

```
src/
├── actions/
│   └── settings/
│       └── set-booking-live.ts       # NEW server action (D-01, D-04)
├── lib/
│   └── get-booking-live.ts           # NEW server util, cached per-request
├── components/
│   ├── services/
│   │   ├── service-grid.tsx          # MODIFY: extend ServiceDetailPanel (D-08)
│   │   └── coming-soon-manifesto.tsx # NEW (D-02, D-05)
│   ├── booking/
│   │   ├── booking-flow.tsx          # MODIFY: subtitles, terms block, CTA copy
│   │   ├── booking-summary.tsx       # MODIFY: 5-row format, 320px fixed, 48px collapsed mobile
│   │   ├── booking-flow-stepper.tsx  # VERIFY mobile; adjust dot diameter per UI-SPEC
│   │   └── service-selector.tsx      # MODIFY: rich tile (name/desc/price/duration)
│   ├── admin/
│   │   └── booking-live-toggle.tsx   # NEW: Switch + Save + AlertDialog confirmation
│   └── forms/
│       └── newsletter-form.tsx       # MODIFY: accept optional `source` prop
└── app/
    ├── (public)/
    │   ├── services/page.tsx         # MODIFY: read booking_live, branch
    │   └── book/page.tsx             # MODIFY: read booking_live + check bookable count, branch
    └── admin/
        ├── settings/page.tsx         # MODIFY: render BookingLiveToggle card
        └── services/page.tsx         # MODIFY: render secondary BookingLiveToggle card
```

### Pattern 1: Server-read → client-render of `booking_live` flag

**What:** Read `site_settings.booking_live` once per request in a Server Component, pass the boolean to child Client Components as a prop. Never fetch it client-side (prevents hydration mismatch, avoids flashing wrong state).

**When to use:** Every route or component that needs to know the flag value — `/services/page.tsx`, `/book/page.tsx`, and any layout chrome that wants to change CTA link destinations.

**Example:**
```typescript
// src/lib/get-booking-live.ts — NEW
import "server-only"
import { cache } from "react"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSettings } from "@/db/schema"

export const getBookingLive = cache(async (): Promise<boolean> => {
  const row = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "booking_live"))
    .limit(1)
  // OFF by default (D-01) — missing row counts as false
  return row[0]?.value === "true"
})
```

```typescript
// src/app/(public)/services/page.tsx — MODIFIED
import { getBookingLive } from "@/lib/get-booking-live"

export default async function ServicesPage() {
  const bookingLive = await getBookingLive()

  if (!bookingLive) {
    return <ComingSoonManifesto />
  }

  // ... existing service grid query + render
}
```

**Key points:**
- `react.cache()` dedupes the DB read within a single request — safe to call from multiple Server Components without hitting the DB twice.
- `server-only` import prevents accidental client-bundle inclusion (pattern from Phase 04.1).
- Missing `site_settings` row means `booking_live = false` (OFF by default per D-01) — no need to seed.

### Pattern 2: CTA rerouting without changing link text (D-03)

**What:** Every sitewide "Book" CTA consults `getBookingLive()` and picks its `href` — when OFF, route to `/services` (which itself renders the manifesto); when ON, route to `/book` as before. Link *text* never changes.

**Locations requiring edits** (verified from grep):
| File | Current href | Change |
|---|---|---|
| `src/components/home/hero-section.tsx` | `ctaLink` prop (data-driven from homepage editor; default `/services`) | **No change** — homepage editor already lets admin control this, and default is `/services` which auto-redirects via manifesto anyway. Verify default remains `/services`. |
| `src/components/beats/beats-hero-carousel.tsx` L169 | `href="/booking"` (**bug — route doesn't exist**) | Fix to dynamic: `/book` when ON, `/services` when OFF. Handle in a wrapper or Client Component receiving the flag. |
| `src/components/services/service-grid.tsx` L66 | `href={`/book?service=${slug}`}` | When OFF, this panel won't render (manifesto replaces it entirely per D-02). No change to the link itself. |
| `src/components/booking/client-booking-list.tsx` L26 | `href="/services"` (empty-state "Book a session" CTA) | No change — already routes to `/services`. |
| `src/app/(public)/book/confirmation/page.tsx` (redirects) | redirects to `/book` on failed load | Keep — guarded by confirmation-only entry. |
| `src/components/layout/public-nav-config.ts` L33 | sidebar/mobile nav "Book Session" → `/book` | When OFF, nav tile still says "Book Session" (D-03: text unchanged) but routes to `/services`. Implement via a small wrapper on the nav tile render that rewrites `/book` → `/services` when flag is OFF. |

**Important:** Since `/services` *is* the manifesto when OFF, redirecting `/book` CTAs to `/services` is correct. Don't add a third "manifesto" route.

### Pattern 3: Server action with path revalidation (D-04 toggle)

```typescript
// src/actions/settings/set-booking-live.ts — NEW
"use server"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { siteSettings } from "@/db/schema"
import { requirePermission } from "@/lib/permissions"

export async function setBookingLive(value: boolean) {
  await requirePermission("manage_settings")

  const existing = await db
    .select().from(siteSettings)
    .where(eq(siteSettings.key, "booking_live")).limit(1)

  const strValue = value ? "true" : "false"

  if (existing.length > 0) {
    await db.update(siteSettings)
      .set({ value: strValue, updatedAt: new Date() })
      .where(eq(siteSettings.key, "booking_live"))
  } else {
    await db.insert(siteSettings).values({ key: "booking_live", value: strValue })
  }

  // Revalidate every path that consults the flag
  revalidatePath("/")
  revalidatePath("/services")
  revalidatePath("/book")
  revalidatePath("/admin/settings")
  revalidatePath("/admin/services")

  return { success: true, value }
}
```

### Pattern 4: Inline collapsible mobile summary (D-10)

UI-SPEC locks: 48px collapsed header, expands inline (pushes content down; not a Drawer overlay). Existing `BookingSummary` already uses inline collapse but with different height/rows. Change: full 5-row table with `SERVICE / DATE / TIME / DURATION / DEPOSIT`, placeholder em-dashes for unfilled rows, 48px collapsed header with single-line "Mixing · Apr 23 · 2pm" status. Desktop: 320px fixed width (currently `lg:w-[40%]` at parent — change parent container to `flex` + `lg:w-[320px]` fixed on the sidebar child, matching UI-SPEC).

### Anti-Patterns to Avoid

- **Do NOT fetch `booking_live` from a Client Component.** Causes hydration mismatch (server knows truth, client briefly assumes default). Always read server-side, pass as prop.
- **Do NOT hide wizard CTAs when `booking_live = false`.** CONTEXT.md D-03 explicitly says text is unchanged — only destination changes. Hiding CTAs is a deferred gray-area option.
- **Do NOT build a new table for launch-notify emails.** D-19 + memory of `feedback_no_executors` preference say reuse `newsletter_subscribers`. Use `tags` array; add a "launch-notify" tag on signups from the manifesto.
- **Do NOT add auto-running animations to the manifesto h1 or section headings.** Memory constraint `feedback_glitch_headers` is explicit: hover-only RGB-split only. Use `GlitchHeading`.
- **Do NOT introduce a Drawer for mobile summary** unless Wave 0 audit proves inline collapsible breaks rhythm. UI-SPEC assumes inline.
- **Do NOT add a checkbox to the Step 4 Terms block.** UI-SPEC §Terms Surface Block explicitly: "No checkbox required — surfacing the terms is the contract, not explicit consent."
- **Do NOT render `ServiceDetailPanel` and manifesto simultaneously in toggle-OFF mode.** D-09 is explicit: manifesto *replaces* the detail panel when OFF. No preview.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-request flag deduplication | Module-scoped cache, singletons | `import { cache } from "react"` | React's `cache()` is the blessed Next.js App Router primitive for per-request memoization. |
| Launch-notify email list | New `launch_notify` table | `newsletter_subscribers.tags` array | Table already has a `text[]` tags column (schema L197). Tagging is a write-only concern. |
| Booking-live flag storage | Env var `BOOKING_LIVE` | `site_settings` table | Env var requires a redeploy to flip. D-01 wants an admin UI toggle. |
| Confirmation dialog | Custom modal | shadcn `AlertDialog` (already installed) | `src/components/ui/dialog.tsx` + pattern already used in admin flows. UI-SPEC specifies AlertDialog explicitly. |
| Toggle switch UI | Custom checkbox | shadcn `Switch` (already installed) | `src/components/ui/switch.tsx` exists. |
| Date formatting ("Thu, Apr 23 2026") | Manual `toLocaleDateString` | date-fns (already installed) OR the existing helper in `booking-summary.tsx` | Existing `formatDate` function in `booking-summary.tsx` already produces the desired shape. Reuse verbatim. |
| Waveform glitch on headings | Custom hover handlers | `GlitchHeading` component (already exists) | Site-wide rule enforced by this component. |
| Mobile collapsible accordion | Custom height animation | Reuse existing `BookingSummary` collapse pattern (`useState isOpen` + `motion/react`) | Pattern already proven. |

**Key insight:** This phase is a polish pass on code that already works. Resist the temptation to rewrite. Extend the existing `ServiceDetailPanel` and `BookingFlow` in place; don't refactor the state machine, Stripe integration, or availability API.

---

## Runtime State Inventory

> This phase is primarily additive (new toggle, new component, enriched sections). Some rename-style touches apply (nav href rewrites, CTA destinations), so the inventory is included.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | `site_settings.booking_live` does not yet exist as a row. Missing row = OFF (safe default per D-01). No existing data to migrate. | None — code handles absence as `false`. |
| **Stored data** | `newsletter_subscribers.tags` exists as `text[]` and may contain historical tags from other signup sources. | Verify tag namespace: `"launch-notify"` is a net-new tag string; will not conflict. Data migration is **not** required (existing subscribers stay as they are). |
| **Live service config** | None. No external service (Stripe, Resend, Twilio, n8n) stores the string `"booking_live"` or references the manifesto mode. The Stripe Embedded Checkout flow is entirely per-booking and not sensitive to the flag. | None. |
| **OS-registered state** | None. No systemd/pm2/cron job references `/book` or `/services` — **verified by grep of `src/app/api/cron/`**. The only cron job is `booking-reminders` which queries `bookings` table directly, unaffected by the flag. | None. |
| **Secrets / env vars** | None. No env var gates the booking-live flag. `NEXT_PUBLIC_SITE_URL` is used for booking confirmation absolute URLs — unchanged. | None. |
| **Build artifacts** | None. No compiled static output references service routes (Next.js App Router renders on-demand in dev; `force-dynamic` is already set on both `/services` and `/book` pages). | None. |
| **Broken existing links** | `src/components/beats/beats-hero-carousel.tsx` L169 has `href="/booking"` — **but that route does not exist** (only `/book` exists). This is a pre-existing bug revealed by the href audit. | Fix as part of Phase 9 CTA rerouting task. Route to `/book` when ON, `/services` when OFF. |

**Canonical question answered:** After every file is updated, what runtime systems still have old state? **Answer: none.** The toggle is read fresh on every request via `getBookingLive()`, `revalidatePath` runs on write, and no caching layer outside Next.js ISR is in play.

---

## Common Pitfalls

### Pitfall 1: Hydration mismatch on `booking_live` read
**What goes wrong:** Developer reads the flag from a Client Component using `useEffect` — server pre-renders assuming default, client flashes the other state for a frame.
**Why it happens:** Flag is a server-owned truth; Client Components don't know it until hydration completes.
**How to avoid:** Read in Server Component (`getBookingLive()`), pass as prop. Wrap with `cache()` so multiple server-side readers in the same request don't re-query.
**Warning signs:** "Flash of wrong mode" when toggling. Console warning: "Hydration failed because the server rendered HTML didn't match the client."

### Pitfall 2: `revalidatePath` forgetting dependent routes
**What goes wrong:** Toggle flips, `/services` updates, but `/` still shows old CTA destination because homepage wasn't revalidated.
**Why it happens:** Every route that calls `getBookingLive()` (directly or transitively via nav) is a dependent — must all be revalidated on write.
**How to avoid:** The `setBookingLive` server action revalidates `/`, `/services`, `/book`, `/admin/settings`, `/admin/services` at minimum. Add any route whose header/footer/nav consults the flag.
**Warning signs:** Manual browser refresh fixes the issue.

### Pitfall 3: Non-bookable services leaking into the wizard
**What goes wrong:** Wizard Step 1 shows a service that has no `service_booking_config` row — user picks it, Step 2 tries to query slots, 500s.
**Why it happens:** Developer changes the query in `/book/page.tsx` from inner-join to left-join, thinking "show more services."
**How to avoid:** D-14 is explicit: keep the inner-join. Non-bookable services live ONLY on `/services` with a "Contact for quote" CTA.
**Warning signs:** Slot API errors; empty time-slot lists for selected service.

### Pitfall 4: Example-work section always empty
**What goes wrong:** Service Detail Panel "Example Work" section shows placeholder for every service because the join between `services` and `portfolioItems` is ambiguous.
**Why it happens:** `portfolioItems` has `type` (text) and `category` (text); `services` has `type` (text) and `slug`. There's no FK linking portfolio to service.
**How to avoid:** Use a string-match convention (e.g., match `portfolioItems.category` against `services.slug` or match `portfolioItems.type` against `services.type`). Hide the section entirely if no items match (UI-SPEC §8: "If no matching portfolio items exist, section is hidden entirely").
**Warning signs:** Every service shows the same 3 portfolio items, or none of them show any.

### Pitfall 5: Summary sidebar causes horizontal overflow on mobile
**What goes wrong:** Desktop-first 320px fixed sidebar gets rendered on narrow viewports because a media query was missed.
**Why it happens:** Tailwind `lg:w-[320px]` applies only at `lg:` breakpoint; missing default `w-full` on mobile makes flex children squeeze.
**How to avoid:** Explicit `w-full lg:w-[320px]` on sidebar; `flex-col lg:flex-row` on parent. Playwright test at 375px catches this.
**Warning signs:** Horizontal scroll appears at 375px on `/book`.

### Pitfall 6: Admin confirmation modal confirms the wrong direction
**What goes wrong:** User toggles switch OFF, clicks Save, modal asks "Turn On Booking?" because local state is stale.
**Why it happens:** Modal reads persisted state instead of pending switch state.
**How to avoid:** Track the pending toggle value in local state; pass it to the modal. Modal copy switches based on `pendingValue !== currentValue`. UI-SPEC §Confirmation modal has both variants spelled out.
**Warning signs:** Modal title contradicts switch position.

### Pitfall 7: Step 1 rich tiles break at narrow widths
**What goes wrong:** Four stacked info pieces (name + description + price + duration) at `lg:grid-cols-3` overflow on 390px-ish viewports when description is long.
**Why it happens:** No description truncation; long `priceLabel` ("FROM $1,500/DAY") pushes width.
**How to avoid:** UI-SPEC §Step 1 Rich Service Tiles: description is single line, truncated with ellipsis at narrow widths. `truncate` on description span; `min-h` on tile; `grid-cols-2` at mobile (existing).
**Warning signs:** Long service names wrap and blow out row heights; ellipsis never shows.

### Pitfall 8: Newsletter double-subscribe from manifesto signups
**What goes wrong:** User subscribed via footer, then enters the same email at manifesto — existing `subscribeNewsletter` returns `success: false` with "You are already subscribed," user thinks notify-me failed.
**Why it happens:** `subscribeNewsletter` treats any existing row as a duplicate with a discouraging message; doesn't update `tags` to add `"launch-notify"`.
**How to avoid:** Update `subscribeNewsletter` (or wrap it) so when `source="launch-notify"` and the email already exists: (a) upsert the tag onto the existing row, (b) return success with tone-matched message ("You're on the list."). This is an explicit Wave 2/3 task.
**Warning signs:** Manifesto shows "already subscribed" toast that sounds like an error.

### Pitfall 9: Forgetting `dynamic = "force-dynamic"` on admin toggle page
**What goes wrong:** Admin toggles flag, returns to the admin settings page, sees old value because the page was cached.
**Why it happens:** Admin pages without `export const dynamic = "force-dynamic"` (existing `admin/settings/page.tsx` already has it; admin/services/page.tsx needs verification) cache their data reads.
**How to avoid:** Every admin page that renders the toggle must have `force-dynamic` OR be revalidated on mutation. Admin settings already has it; admin services must also.
**Warning signs:** Admin sees stale state after toggle.

---

## Code Examples

Verified patterns from existing codebase. All paths are absolute references within this repo.

### Example 1: Reading `booking_live` in a Server Component

```typescript
// /home/faxas/workspaces/projects/personal/glitch_studios/src/app/(public)/services/page.tsx — MODIFIED
import { getBookingLive } from "@/lib/get-booking-live"
import { ComingSoonManifesto } from "@/components/services/coming-soon-manifesto"

export const dynamic = "force-dynamic"

export default async function ServicesPage() {
  const bookingLive = await getBookingLive()

  // D-02 + D-06 fallback
  if (!bookingLive) {
    return <ComingSoonManifesto />
  }

  // Existing query (verified present)
  const servicesList = await db.select().from(services)
    .where(eq(services.isActive, true))
    .orderBy(asc(services.sortOrder))

  // D-06 second fallback: zero bookable services → manifesto
  const bookableConfigs = await db.select({ serviceId: serviceBookingConfig.serviceId })
    .from(serviceBookingConfig)
  if (bookableConfigs.length === 0) {
    return <ComingSoonManifesto />
  }

  // ... existing render
}
```

### Example 2: Admin toggle card with confirmation

```typescript
// src/components/admin/booking-live-toggle.tsx — NEW
"use client"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, /* ... */ } from "@/components/ui/dialog"
import { toast } from "sonner"
import { setBookingLive } from "@/actions/settings/set-booking-live"

export function BookingLiveToggle({ initialValue }: { initialValue: boolean }) {
  const [pendingValue, setPendingValue] = useState(initialValue)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const hasChange = pendingValue !== initialValue
  const turningOn = pendingValue === true

  async function handleConfirm() {
    setSaving(true)
    const res = await setBookingLive(pendingValue)
    setSaving(false)
    setConfirmOpen(false)
    if (res.success) {
      toast.success(turningOn
        ? "Booking turned on — wizard is live."
        : "Booking turned off — site now shows coming soon.")
    } else {
      toast.error("Couldn't save. Try again.")
    }
  }

  // ... JSX per UI-SPEC §Admin toggle card + Confirmation modal
}
```

### Example 3: Step subtitle (D-11)

```typescript
// Inside booking-flow.tsx step rendering — MODIFIED
{step === 2 && (
  <div>
    <h2 className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
      <GlitchHeading text="SELECT DATE">SELECT DATE</GlitchHeading>
    </h2>
    <p className="mt-2 font-sans text-[14px] text-[#888888]">
      Greyed-out dates are closed. Tap an open day to see times.
    </p>
    <BookingCalendar /* existing props */ />
  </div>
)}
```

### Example 4: Terms block on Step 4 (D-12)

```typescript
// Inside Step 4 body, above "CONTINUE TO PAYMENT" — NEW
{selectedService && totalPrice !== null && depositAmount !== null && (
  <div className="bg-transparent border-t border-[#222222] pt-4 mt-6">
    <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-2">
      DEPOSIT & CANCELLATION
    </h3>
    <div className="space-y-2 font-sans text-[14px] text-[#f5f5f0]">
      <p>
        Deposit: ${(depositAmount / 100).toFixed(2)}
        {selectedService.depositType === "percentage"
          && ` (${selectedService.depositValue}% of $${totalPrice.toFixed(2)})`}.
      </p>
      <p>Cancel up to {selectedService.cancellationWindowHours}h before your session for a full refund.</p>
      {selectedService.refundPolicy === "partial" && (
        <p>Partial refunds apply outside the cancellation window.</p>
      )}
    </div>
  </div>
)}
```

### Example 5: Tagging launch-notify signups

```typescript
// src/actions/newsletter.ts — MODIFIED signature
export async function subscribeNewsletter(
  email: string,
  source?: "footer" | "launch-notify" | "blog"
) {
  const normalizedEmail = email.toLowerCase().trim()
  const existing = await db.select().from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, normalizedEmail)).limit(1)

  const tag = source ?? "footer"

  if (existing.length > 0) {
    // Upsert tag into existing row (dedupe via Set)
    const currentTags = existing[0].tags ?? []
    if (!currentTags.includes(tag)) {
      await db.update(newsletterSubscribers)
        .set({ tags: [...currentTags, tag] })
        .where(eq(newsletterSubscribers.email, normalizedEmail))
    }
    return {
      success: true,
      message: source === "launch-notify"
        ? "You're on the list. We'll email you when bookings open."
        : "You are already subscribed.",
    }
  }

  await db.insert(newsletterSubscribers).values({ email: normalizedEmail, tags: [tag] })
  return { success: true, message: "You are subscribed. Welcome to the Glitch community." }
}
```

### Example 6: Service-to-portfolio matching for Example Work section

```typescript
// Inside ServiceDetailPanel — NEW section 8
async function getPortfolioForService(service: Service) {
  // Strategy: match on service.type or fall back to service.slug (category/type both text)
  const items = await db.select().from(portfolioItems)
    .where(
      and(
        eq(portfolioItems.isActive, true),
        or(
          eq(portfolioItems.type, service.type),
          eq(portfolioItems.category, service.slug),
        ),
      )
    )
    .orderBy(desc(portfolioItems.isFeatured), asc(portfolioItems.sortOrder))
    .limit(3)
  return items
}
```

Note: Since `ServiceDetailPanel` is currently a Client Component, the portfolio query must move to the parent Server Component (`services/page.tsx`) and pass results as a prop.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router + `getServerSideProps` | App Router + async Server Components | Phase 1 (pre-Phase 9) | Already adopted. `services/page.tsx` and `book/page.tsx` are async Server Components. |
| Zod v3 `z.string().email()` | Zod v4 `z.email()` | Phase 8 / zod 4.x | Newsletter form already uses v4. Booking form currently uses v3 pattern; leave as-is (not in scope). |
| Embla Carousel JSX | Embla Carousel with `embla-carousel-react` | Pre-Phase 9 | Already standard. |
| `NextAuth.js` | Better Auth 1.5 | Phase 1.1 → Phase 8 | Already adopted; used for session in `BookingFlow`. |
| Custom modal | shadcn `AlertDialog` | Phase 4 | Already standard for confirmation flows. UI-SPEC explicitly requires it. |

**Deprecated/outdated in this codebase:**
- `lucide-react` 1.6+ dropped brand icons. Not relevant here — Phase 9 uses `Clock`, `ChevronDown`, etc. (all still present).

---

## Open Questions

1. **How to match `portfolioItems` to a `service` for the Example Work section?**
   - What we know: `portfolioItems` has `type` (text) and `category` (text); `services` has `type` (text) and `slug` (text). No FK.
   - What's unclear: Does seed data have consistent values? E.g., does `portfolioItems.type` ever equal `services.type`?
   - Recommendation: In Wave 0, run a quick DB read to audit overlap. If seeds align on `type`, use that join. If not, write a simple `portfolioItems.category = services.slug` convention and document it in the service detail task. Either way, UI-SPEC §8 says hide the section when no items match, so the fallback is graceful.

2. **Launch-notify messaging for already-subscribed users.**
   - What we know: D-19 says tag signups by source. Existing newsletter action returns a discouraging "already subscribed" message.
   - What's unclear: Do we treat an already-subscribed user reaching the manifesto as a re-confirmation (add the tag, toast success) or a duplicate (toast info)?
   - Recommendation: Upsert the `launch-notify` tag and return success (see Example 5). Keeps UX positive; admin still sees the source via tags.

3. **`BookingLiveToggle` card on `/admin/services/page.tsx` vs. elsewhere.**
   - What we know: CONTEXT.md D-04 says "services/bookings admin section." UI-SPEC references `/admin/services` or `/admin/bookings`.
   - What's unclear: Which actual route(s) are most visible to the admin during daily booking management?
   - Recommendation: Put the secondary toggle on `/admin/services/page.tsx` (already the services index). If `/admin/bookings` exists as a separate page, add it there too — the toggle is lightweight. Planner audits admin sidebar structure during planning.

4. **Summary sidebar on mobile — Drawer vs inline collapsible (UI-SPEC §Open Decisions #4).**
   - What we know: UI-SPEC assumes inline collapsible.
   - What's unclear: Whether the 48px header eats too much above-the-fold room on 375px viewports during Step 2 (date picker) where vertical room matters.
   - Recommendation: Start with inline collapsible per UI-SPEC. Wave 0 mobile audit surfaces this; if Step 2 loses critical dates above fold, switch to `Drawer` (already installed at `src/components/ui/drawer.tsx`).

5. **Process/timeline generic vs per-service-type (D-08, UI-SPEC §Open Decisions #1).**
   - What we know: UI-SPEC locks 4-step shape (prep → session → revisions → delivery).
   - What's unclear: Whether generic copy reads wrong for e.g. graphic-design (no "session" in the literal sense).
   - Recommendation: Start generic. Maintain a small copy map keyed on `service.type` for the one-liner body of each step so the copy can vary per service without a schema change. Ship all services with generic first; upgrade the outlier (graphic-design, SFX) if copy feels forced.

---

## Environment Availability

> This phase has no net-new external dependencies. The audit confirms existing services required by the wizard are unchanged.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL (via Supabase) | All DB reads | ✓ (assumed — dev environment runs `/services` + `/book`) | — | — |
| Stripe (test mode) | Step 5 Embedded Checkout | ✓ (env vars verified present in Phase 04.1) | API via SDK | — |
| Resend | Booking confirmation emails | ✓ (env var verified in Phase 04.1) | — | — |
| Playwright | Wave 0 mobile audit | ✓ | `@playwright/test 1.58.2` | — |
| Node 24 | pnpm runtime | ✓ (workspace standard) | 24.x | — |
| `next` | Framework | ✓ | 16.2.1 | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

**Build command constraint:** CodeBox constraint — never run `next build` in parallel agents. Use `pnpm tsc --noEmit` or `pnpm lint` for verification.

---

## Mobile Audit Scope (D-15, Wave 0)

The planner's first wave is the Playwright mobile audit. It must produce a concrete break list before any polish tasks are written.

**Screenshots required (375px viewport, `mobile` Playwright project already configured at `playwright.config.ts`):**

| # | Route | State | Notes |
|---|-------|-------|-------|
| 1 | `/services` | toggle ON | Existing grid + detail accordion (mobile pattern) |
| 2 | `/services` | toggle OFF | Manifesto (net-new — may be placeholder at audit time) |
| 3 | `/book` | toggle OFF (manifesto) | Same manifesto instance |
| 4 | `/book` | Step 1 (Service) | Existing rich-tile grid; new 4-piece info tile needs verification |
| 5 | `/book` | Step 2 (Date) | Calendar + summary above |
| 6 | `/book` | Step 3 (Time) | Time-slot list |
| 7 | `/book` | Step 4 (Details) | Form + new terms block |
| 8 | `/book` | Step 5 (Payment) | Stripe Embedded Checkout |

**Non-negotiables audited (UI-SPEC §Mobile Rendering Contract):**
- Zero horizontal overflow on all 8 screenshots
- Stepper dots visible at 375px
- Summary sidebar → 48px collapsible top-pinned block
- Detail panel sections stack vertically with 24px gaps
- All tap targets ≥ 48px
- Manifesto 3-up tile grid → single column
- Notify-me form → input + button stack vertically, full-width each

**Existing mobile test infrastructure:** `tests/07.2-mobile-audit.spec.ts` (from Phase 07.2) uses `browser.newContext({ isMobile: true, hasTouch: true })` rather than Playwright projects — this is the reference pattern per STATE.md Phase 07.2 decisions.

**Wave 0 output:** Add a task per concrete break (overflow at X, overlap on Y, tap target too small on Z). Do not write a generic "mobile polish pass" task.

---

## Sources

### Primary (HIGH confidence)

**Codebase inspection (ground truth):**
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/app/(public)/services/page.tsx` — services page query and render
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/app/(public)/book/page.tsx` — book page inner-join query
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/services/service-grid.tsx` — master-detail pattern + existing ServiceDetailPanel
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/booking/booking-flow.tsx` — 5-step state machine, Stripe integration, step transitions
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/booking/booking-summary.tsx` — existing mobile collapsible + desktop sticky summary pattern
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/booking/service-selector.tsx` — Step 1 tile component (current state, has price + duration already)
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/booking/booking-flow-stepper.tsx` — stepper dots
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/booking/booking-form.tsx` — Step 4 form pattern
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/forms/newsletter-form.tsx` — form component + Zod 4 usage
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/actions/newsletter.ts` — existing subscribeNewsletter action (tags column available)
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/actions/admin-settings.ts` — existing getSettings/updateSettings pattern (template for setBookingLive)
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/app/admin/settings/page.tsx` — admin settings host page
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/db/schema.ts` — siteSettings L534, newsletterSubscribers L193 (tags column L197), serviceBookingConfig L354, portfolioItems L122
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/layout/public-nav-config.ts` — Book Session nav tile
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/beats/beats-hero-carousel.tsx` L169 — identified bug `/booking` (non-existent route)
- `/home/faxas/workspaces/projects/personal/glitch_studios/src/components/ui/glitch-heading.tsx` — enforces hover-only glitch rule site-wide
- `/home/faxas/workspaces/projects/personal/glitch_studios/playwright.config.ts` — mobile project preconfigured at 375×812
- `/home/faxas/workspaces/projects/personal/glitch_studios/package.json` — all versions verified present

**Phase artifacts:**
- `/home/faxas/workspaces/projects/personal/glitch_studios/.planning/phases/09-services-booking/09-CONTEXT.md` — locked decisions
- `/home/faxas/workspaces/projects/personal/glitch_studios/.planning/phases/09-services-booking/09-UI-SPEC.md` — approved UI contract
- `/home/faxas/workspaces/projects/personal/glitch_studios/.planning/phases/03-booking-system/03-CONTEXT.md` — Phase 3 carry-forward decisions (D-01 service-first flow, D-07 Stripe Embedded Checkout, D-26 `/book?service=slug` deep-link, etc.)

**Project instructions:**
- `/home/faxas/workspaces/projects/personal/glitch_studios/CLAUDE.md` — tech stack, versions, memory constraints (feedback_glitch_headers, feedback_playwright_verification, feedback_no_executors, feedback_design_quality)
- `/home/faxas/.claude/projects/-home-faxas-workspaces-projects-personal-glitch-studios/memory/MEMORY.md` — user feedback index

### Secondary (MEDIUM confidence)

- `/home/faxas/workspaces/projects/personal/glitch_studios/.planning/STATE.md` — session continuity + accumulated decisions from prior phases
- `/home/faxas/workspaces/projects/personal/glitch_studios/.planning/ROADMAP.md` — Phase 9 success criteria
- `/home/faxas/workspaces/projects/personal/glitch_studios/.planning/REQUIREMENTS.md` — BOOK-06 (v2) / BOOK-07 / BOOK-08 language

### Tertiary (LOW confidence)

- None. All recommendations sourced from direct codebase evidence or locked CONTEXT.md decisions.

---

## Project Constraints (from CLAUDE.md)

Extracted from `~/CLAUDE.md`, workspace `CLAUDE.md`, and project `CLAUDE.md`:

**Hard constraints (never violate):**
- Use **pnpm**, never npm or yarn
- Never commit `.env` files or secrets
- Node v24 (erasable TypeScript)
- **NEVER run `next build` in parallel agents** (2GB RAM each) — use `pnpm tsc --noEmit` or `pnpm lint` for verification
- Only ONE build at a time if absolutely required
- Do not auto-load screenshots into context — reference by path

**Tech stack (locked):**
- Next.js 16.2.x + React 19 + Tailwind 4.x + Drizzle ORM 0.45 + Better Auth + shadcn/ui + sonner + motion/react
- `lucide-react` 1.6+ (no brand icons — not relevant for this phase)

**GSD workflow:**
- No direct repo edits outside a GSD workflow
- Do not generate or maintain AGENTS.md files
- Do not create checkpoint.md files at workspace level

**Memory-based constraints (user feedback):**
- Every header uses hover-only RGB-split glitch (`feedback_glitch_headers`) — use `GlitchHeading`
- No auto-running animations on headings
- Use Playwright during dev for visual verification (`feedback_playwright_verification`)
- Never spawn gsd-executor subagents; work inline (`feedback_no_executors`)
- Design-quality bar is high; no generic "skeleton" screens (`feedback_design_quality`)

**Design constraints (project CLAUDE.md + Phase 01.2 carry-forward):**
- Cyberpunk Metro tile grid aesthetic
- Monochrome palette: `#000000 / #111111 / #222222 / #f5f5f0`
- Mono-uppercase headings with `tracking-[0.05em]`
- No neon, no colored glow, no per-service category color coding
- Hover-only glitch overlays — no always-on animations

---

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH — all versions read from local `package.json`, not claimed from training data.
- **Architecture:** HIGH — patterns match existing code (server components, react.cache, server actions, revalidatePath).
- **Don't-hand-roll list:** HIGH — every alternative exists in the installed dependency set.
- **Pitfalls:** HIGH — drawn from file-by-file inspection of current code and edge cases visible in the existing `BookingFlow` state machine.
- **Code examples:** HIGH — adapted directly from existing file patterns; no invented APIs.
- **Portfolio-to-service matching:** MEDIUM — schema has no explicit link; recommended convention is pragmatic. Flagged in Open Questions #1 for Wave 0 DB audit.
- **Manifesto copy tone:** MEDIUM — UI-SPEC locks full copy; treat as HIGH for planner purposes.

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (30 days — stable stack, no fast-moving libraries in scope)

## RESEARCH COMPLETE
