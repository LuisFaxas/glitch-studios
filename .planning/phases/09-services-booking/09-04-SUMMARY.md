---
phase: 09-services-booking
plan: 04
subsystem: ui
tags: [coming-soon, feature-flag, admin, cta-reroute, manifesto]

requires:
  - phase: 09-services-booking
    provides: getBookingLive, setBookingLive, subscribeNewsletter(source), NewsletterForm source prop (Plan 09-03)
provides:
  - ComingSoonManifesto component with UI-SPEC-verbatim copy
  - BookingLiveToggle admin component (Switch + Save + Dialog confirmation)
  - Admin toggle wired into /admin/settings and /admin/services
  - /services and /book branch to manifesto when flag=false OR zero bookable services
  - Sitewide Book CTA rerouting: TileNav + BottomTabBar + BeatsHeroCarousel route /book → /services when flag=false
  - Pre-existing /booking bug (beats-hero-carousel L169) fixed
affects: [09-05, 09-06, 09-07]

tech-stack:
  added: []
  patterns:
    - "Server-Component boundary guard: all Book CTA href rewrites happen INSIDE Client Components (TileNav, BottomTabBar, BeatsHeroCarousel) to avoid serializing lucide icon refs across the Server→Client boundary."
    - "Flag-aware layout: (public)/layout.tsx reads getBookingLive() once and passes bookingLive as a prop to both nav client components."

key-files:
  created:
    - src/components/services/coming-soon-manifesto.tsx
    - src/components/admin/booking-live-toggle.tsx
  modified:
    - src/app/admin/settings/page.tsx
    - src/app/admin/services/page.tsx
    - src/app/(public)/services/page.tsx
    - src/app/(public)/book/page.tsx
    - src/app/(public)/layout.tsx
    - src/app/(public)/beats/page.tsx
    - src/components/beats/beats-hero-carousel.tsx
    - src/components/layout/public-nav-config.ts
    - src/components/layout/tile-nav.tsx
    - src/components/layout/bottom-tab-bar.tsx

key-decisions:
  - Used shadcn Dialog (existing) instead of AlertDialog (not installed). Behavior-equivalent — destructive confirm button retained. Avoids adding a new shadcn registry item to the project.
  - CTA href rewrite happens in Client Component render (TileNav/BottomTabBar/BeatsHeroCarousel) rather than by mutating `publicNavItems`. Mutating the exported array in the Server Component layout broke serialization of the lucide icon `render` functions across the Server→Client boundary (Next.js error "Functions cannot be passed directly to Client Components").
  - public-nav-config.ts retains "use client" — attempted removal caused same serialization error. The "use client" marker treats the whole module (including icons) as client references, which is the behavior the existing code relied on.

patterns-established:
  - "When rewriting nav/CTA hrefs based on server state, DO NOT map() a nav items array in a Server Component if the items carry React component references (icons, etc.). Instead pass the raw array + a boolean flag, and do the rewrite at Client-Component render time."

requirements-completed: [BOOK-06, BOOK-07, BOOK-08]

duration: ~55 min
completed: 2026-04-20
---

# Phase 09 Plan 04 Summary

**Coming-soon mode end-to-end live: manifesto renders, admin can toggle, sitewide Book CTAs reroute, pre-existing /booking bug fixed.**

## Files touched

### Created

| File | Purpose |
|------|---------|
| `src/components/services/coming-soon-manifesto.tsx` | Server Component manifesto: GlitchLogo + h1 + lede + 3-tile "what's coming" + "BE FIRST IN THE DOOR" notify-me form with `source="launch-notify"`. Verbatim UI-SPEC copy. |
| `src/components/admin/booking-live-toggle.tsx` | Client Component: Switch + Save Changes button + Dialog confirmation. Direction-correct copy via `turningOn` derived from `pendingValue`. Destructive `#dc2626` confirm button in both directions. Toasts with UI-SPEC-verbatim strings. |

### Modified

| File | Change |
|------|--------|
| `src/app/admin/settings/page.tsx` | Render `<BookingLiveToggle initialValue={bookingLive} />` above existing SiteSettingsForm. Parallel `Promise.all` to keep page fast. |
| `src/app/admin/services/page.tsx` | Render toggle in top-of-page banner row. Added `force-dynamic` (already present). |
| `src/app/(public)/services/page.tsx` | Branch: if `!bookingLive` → manifesto. After bookable-config count: if 0 → manifesto. Otherwise existing ServiceGrid. |
| `src/app/(public)/book/page.tsx` | Branch: if `!bookingLive` → manifesto. After inner-join: if 0 rows → manifesto. Otherwise existing BookingFlow. Inner-join preserved (D-14). |
| `src/app/(public)/layout.tsx` | Now async Server Component. Reads `getBookingLive()` and passes `bookingLive` prop to TileNav + BottomTabBar. |
| `src/app/(public)/beats/page.tsx` | Reads `getBookingLive()`, passes as prop to BeatsHeroCarousel. |
| `src/components/beats/beats-hero-carousel.tsx` | Accepts `bookingLive` prop; computes `bookCtaHref = bookingLive ? "/book" : "/services"`; CTA link uses `bookCtaHref`. **Pre-existing `/booking` → `/book` bug fixed in the same change.** |
| `src/components/layout/public-nav-config.ts` | Added comment near `/book` href noting it's rewritten at render time. Kept "use client". |
| `src/components/layout/tile-nav.tsx` | Added `bookingLive?: boolean` prop (default true). Added `resolveHref(href, bookingLive)` helper. Both render paths (collapsed + expanded) use resolved href for nav links. |
| `src/components/layout/bottom-tab-bar.tsx` | Added `bookingLive?: boolean` prop (default true). Inline `resolvedHref` computation in the items.map loop. |

## Final pattern for nav CTA rerouting

**Transform happens at Client-Component render, not at data import.** Server Component (layout.tsx) passes `bookingLive` as a separate boolean prop. Each nav client component (TileNav, BottomTabBar) and the beats hero carousel applies the rewrite at its own `<Link href>` site. This preserves the `publicNavItems` export as a stable client reference (icons are component references that fail to serialize when mapped in a Server Component).

## Confirmations

- `grep -rn '"/booking"' src/` returns **0** matches.
- `/services` returns 200 and renders manifesto (flag currently missing → defaults to false, D-01).
- `/book` returns 200 and renders manifesto (same).
- `/beats` returns 200; all CTAs in rendered HTML point to `/services` (not `/book` or `/booking`).
- `pnpm tsc --noEmit` emits zero errors in all 10 touched files.
- `pnpm lint` emits zero warnings in touched files.
- Manifesto visually verified at 375x812 iPhone emulation: GLITCH logo, h1, lede, 3-tile grid (stacked), BE FIRST IN THE DOOR heading, notify-me form.

## No UI shipped for wizard/service-detail

This plan does NOT touch:
- Service detail panel (Wave 3 / Plan 09-05)
- Booking wizard summary/subtitles/step tiles/terms (Wave 3 / Plan 09-06)

## Downstream consumers ready

- Admin can flip `booking_live=true` via either `/admin/settings` or `/admin/services` to unblock Wave 3 verification.
- When flag is true and bookable configs exist, `/services` renders ServiceGrid and `/book` renders BookingFlow — both ready for Wave 3 enrichment.
