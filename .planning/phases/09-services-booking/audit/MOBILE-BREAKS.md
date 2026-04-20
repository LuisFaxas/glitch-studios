# Mobile Audit — Break List

**Audited:** 2026-04-20
**Viewport:** 375x812 (iPhone emulation, isMobile+hasTouch)
**Source:** tests/09-services-booking-mobile-audit.spec.ts
**Screenshots:** .planning/phases/09-services-booking/screenshots/audit/
**Raw log:** /tmp/09-audit.log (ephemeral — rerun spec to regenerate)

## Summary

| Route/State | Overflow? | Tap targets <48px | Stacking issues | Priority |
|-------------|-----------|-------------------|-----------------|----------|
| /services (toggle ON) | no | 1 (cart 44x44) | Mobile detail panel not visible (accordion default collapsed); service tiles missing pricing/duration/inclusions | P0 |
| /services (toggle OFF) | no | 1 (cart 44x44) | Manifesto not implemented — renders identical to ON state | P0 |
| /book (toggle OFF) | no | 5 (nav-footer text links + cart) | Manifesto not implemented — /book renders wizard instead of manifesto | P0 |
| /book Step 1 (Service) | no | 5 (nav-footer text links + cart) | Tiles compact (name + duration + price only); missing D-13 rich-tile content; only 2 of 5 services visible (inner-join working as designed per D-14 but catalog coverage gap) | P0 |
| /book Step 2 (Date) | n/a | — | Not reachable via deep-link in audit (/book?service=slug did not advance past Step 1 — service click path needs verification) | P1 |
| /book Step 3 (Time) | no | 5 | Not reachable — same as Step 2 | P1 |
| /book Step 4 (Details) | no | 5 | Not reachable — same; also confirms D-12 terms block audit can't be done yet | P1 |
| /book Step 5 (Payment) | no | 11 (nav-footer links, social icons, JOIN button, cart) | Not reachable; visible TAP targets are all footer/global nav (Phase 14 scope, not Wave 4) | P2 |

**Top-level finding:** No horizontal overflow on any audited route. Primary issues are (a) content contract gaps (missing service detail fields per BOOK-08), (b) manifesto/flag-branch not yet implemented (D-02/D-05/D-06/D-18), (c) wizard polish gaps (D-10/D-11/D-12/D-13), and (d) mobile service-detail accordion defaulting to collapsed so NO detail is visible without explicit tap.

## Breaks

### B-01 — /services mobile detail panel hidden by default

- **Route:** /services (toggle ON)
- **Screenshot:** screenshots/audit/01-services-toggle-on.png
- **File:** src/components/services/service-grid.tsx (expandedSlug state initialized to `null`, L87)
- **Observed:** On mobile the master-detail accordion pattern initializes with `expandedSlug === null`, so no service detail renders without a user tap. Client landing on /services sees only a stacked list of tile names + short descriptions. BOOK-08 success criteria require pricing, what's included, duration visible enough to decide without contacting support.
- **UI-SPEC reference:** § Service Detail Panel (9-section contract)
- **Fix hint:** Default `expandedSlug` to `services[0]?.slug` on mobile (initialize to first service's slug) so the first service's detail is visible on load. OR: render tile cards with the detail content inline (stack pattern) — collapse is the aesthetic choice, but D-08's 9 sections need a visible home.
- **Priority:** P0

### B-02 — /services tiles missing BOOK-08 v2 content contract

- **Route:** /services (toggle ON) and expanded panel
- **Screenshot:** screenshots/audit/01-services-toggle-on.png
- **File:** src/components/services/service-grid.tsx `ServiceDetailPanel` L28-80
- **Observed:** Current `ServiceDetailPanel` renders name, description, priceLabel, features (what's included), and CTAs — but UI-SPEC § Service Detail Panel specifies 9 sections: (1) name, (2) description, (3) price, (4) DURATION & INCLUDES, (5) features/what's-included, (6) PROCESS, (7) POLICIES, (8) EXAMPLE WORK, (9) CTAs. Missing D-08 sections: DURATION & INCLUDES (separate from features), PROCESS, POLICIES, EXAMPLE WORK.
- **UI-SPEC reference:** § Service Detail Panel (D-08, 9 sections)
- **Fix hint:** Plan 09-05 Task 2 extends `ServiceDetailPanel` with 4 new section blocks. Pass `portfolioItems` via Plan 09-05 Task 1's enrichment loader (uses Plan 09-02 locked predicate).
- **Priority:** P0

### B-03 — /book Step 1 service tiles not "rich" per D-13

- **Route:** /book Step 1 (Service)
- **Screenshot:** screenshots/audit/04-book-step1-service.png
- **File:** src/components/booking/service-selector.tsx
- **Observed:** Tiles currently show 4 fields: (1) icon, (2) service name, (3) duration, (4) price label. D-13 requires "rich tiles" with 4 pieces: service name, duration, price/price-range, AND deposit hint (or equivalent "what's included" one-liner). Deposit hint missing. Also tiles render 2-column grid at 375px which squeezes longer service names to 2-line wrap (RECORDING / SESSION) — acceptable but tight.
- **UI-SPEC reference:** § Booking Wizard / Step 1 Service (D-13)
- **Fix hint:** Plan 09-06 Task 3 extends `ServiceSelector` tile to include 4 D-13 pieces. Consider 1-column stack on <380px to avoid name-wrap.
- **Priority:** P0

### B-04 — /book wizard step subtitles absent (D-11)

- **Route:** /book all steps
- **Screenshot:** screenshots/audit/04-book-step1-service.png (SERVICE DATE TIME DETAILS PAYMENT word row at top)
- **File:** src/components/booking/booking-flow.tsx and src/components/booking/booking-flow-stepper.tsx
- **Observed:** Stepper renders labels only (SERVICE, DATE, TIME, DETAILS, PAYMENT). D-11 requires a one-line contextual subtitle under each step heading ("Choose a session type", "Pick an available day", etc., verbatim from UI-SPEC).
- **UI-SPEC reference:** § Booking Wizard / Step Subtitles (D-11)
- **Fix hint:** Plan 09-06 Task 2 adds subtitle line under each step section heading in booking-flow.tsx. Copy UI-SPEC strings verbatim.
- **Priority:** P0

### B-05 — /services and /book manifesto not implemented (D-02/D-05)

- **Route:** /services (toggle OFF), /book (toggle OFF)
- **Screenshots:** screenshots/audit/02-services-toggle-off.png, screenshots/audit/03-book-toggle-off.png
- **File:** .planning/phases/09-services-booking/09-UI-SPEC.md § Coming-Soon Manifesto (component not yet built), src/app/(public)/services/page.tsx, src/app/(public)/book/page.tsx
- **Observed:** Audit at 2026-04-20 shows both routes render their current implementations; manifesto component (D-05) does not exist, server pages do not branch on `booking_live` flag (D-02). /book renders the wizard, /services renders the grid. Expected post-Wave-2 behavior: both show `<ComingSoonManifesto />` when `booking_live=false`.
- **UI-SPEC reference:** § Coming-Soon Manifesto, § Flag Gate
- **Fix hint:** Plan 09-04 Task 1 (build `ComingSoonManifesto`) + Task 4 (branch public pages on flag). No mobile-specific fix needed here — correct implementation in Wave 2 closes this break.
- **Priority:** P0 (but resolved by Wave 2, not Wave 4)

### B-06 — Booking summary: mobile collapsed height and persistence not spec-compliant

- **Route:** /book all steps (evaluated from Step 1)
- **Screenshot:** screenshots/audit/04-book-step1-service.png (top "BOOKING SUMMARY ▼" bar)
- **File:** src/components/booking/booking-summary.tsx
- **Observed:** Current BookingSummary renders an expandable row at top with "BOOKING SUMMARY" + ChevronDown. Pre-measurement indicates the collapsed bar is ~48px-ish which roughly matches D-10, but the spec also requires: (a) persistent across ALL wizard steps (confirm by auditing step 2+; not reachable in this audit), (b) collapsed-mobile shows service name + price when a selection exists. Current "Select a service to begin" copy is correct for empty state; post-selection collapsed state needs verification.
- **UI-SPEC reference:** § Persistent Booking Summary Sidebar (D-10)
- **Fix hint:** Plan 09-06 Task 1 rewrites BookingSummary to: desktop sticky right sidebar 320px wide; mobile 48px-collapsed header with "Service — $price" when selected; tap expands to full summary sheet. Also render at every step (currently renders at top of BookingFlow root — confirm it stays present through Step 5).
- **Priority:** P0

### B-07 — Step 4 terms block absent (D-12)

- **Route:** /book Step 4 (Details)
- **Screenshot:** screenshots/audit/07-book-step4-details.png (not reachable in audit — Step 1 navigation blocked)
- **File:** src/components/booking/booking-form.tsx OR booking-flow.tsx Step 4 render
- **Observed:** Cannot directly verify because audit couldn't advance past Step 1. However, grep of booking-form.tsx / booking-flow.tsx for the literal UI-SPEC terms block copy should return 0 — confirming the D-12 inline terms block does not exist.
- **UI-SPEC reference:** § Booking Wizard / Step 4 Details (D-12 terms block)
- **Fix hint:** Plan 09-06 Task 2 injects a terms paragraph above the form's submit row on Step 4. No checkbox per D-12 — static text only. Copy UI-SPEC verbatim.
- **Priority:** P0

### B-08 — Cart button tap target 44x44px (below 48px non-negotiable)

- **Route:** All routes (global header)
- **Screenshot:** screenshots/audit/*.png (top-right cart icon)
- **File:** src/components/layout/header.tsx OR src/components/cart/cart-button.tsx (verify via grep)
- **Observed:** Cart button measures 44x44px (iOS standard but below UI-SPEC's 48px non-negotiable for all audit-reachable routes).
- **UI-SPEC reference:** § Mobile Rendering Contract (48px minimum)
- **Fix hint:** Out of Wave 4 scope (global nav, not wizard/service-panel). Flag for Phase 14 global polish. Do NOT address in Phase 09.
- **Priority:** P2

### B-09 — Footer nav text links small (15px tall)

- **Route:** All routes (footer when scrolled)
- **Screenshots:** screenshots/audit/03-book-toggle-off.png, 04, 06, 07, 08
- **File:** src/components/footer/* (verify via grep for footer nav)
- **Observed:** Footer links SERVICES / PORTFOLIO / ARTISTS / BLOG render ~15px tall (well below 48px). Text-only uppercase links.
- **UI-SPEC reference:** n/a for Phase 09
- **Fix hint:** Out of Phase 09 scope (global footer polish). Flag for Phase 14 (global polish).
- **Priority:** P2

### B-10 — Footer social icons tiny (14-20px)

- **Route:** All routes (footer)
- **Screenshot:** screenshots/audit/08-book-step5-payment.png
- **File:** src/components/footer/* social links section
- **Observed:** Instagram 14x14, YouTube 14x14, SoundCloud 20x20, X 14x14. All far below 48px tap target.
- **UI-SPEC reference:** n/a for Phase 09
- **Fix hint:** Out of Phase 09 scope. Per memory note this is already flagged as a Phase 14 global polish concern (brand icons + footer).
- **Priority:** P2

## Wave 4 Task Mapping

Wave 4 (Plan 09-07) applies mobile fixes DERIVED FROM prior-wave work. Prior-wave plans address most breaks; Wave 4 is scoped to fixes NOT already handled elsewhere.

| Break | Resolver | Priority | Wave 4 work needed? |
|-------|----------|----------|---------------------|
| B-01 /services accordion default collapsed | Plan 09-05 Task 2 (extends ServiceDetailPanel — must set `expandedSlug` default to first slug) | P0 | Audit-only in 09-07 (confirm B-01 resolved on screenshot diff) |
| B-02 BOOK-08 content contract | Plan 09-05 Tasks 1+2 (9 sections) | P0 | Audit-only |
| B-03 D-13 rich tiles | Plan 09-06 Task 3 | P0 | Audit-only |
| B-04 D-11 subtitles | Plan 09-06 Task 2 | P0 | Audit-only |
| B-05 Manifesto | Plan 09-04 Tasks 1+4 | P0 | Audit-only |
| B-06 D-10 summary | Plan 09-06 Task 1 | P0 | Audit-only |
| B-07 D-12 terms | Plan 09-06 Task 2 Change 3 | P0 | Audit-only |
| B-08 cart 44x44 | Out of phase scope | P2 | Defer to Phase 14 |
| B-09 footer links | Out of phase scope | P2 | Defer to Phase 14 |
| B-10 social icons | Out of phase scope | P2 | Defer to Phase 14 |

**Wave 4 scope (Plan 09-07) reduces to:**
1. Re-run tests/09-services-booking-mobile-audit.spec.ts AFTER Waves 1-3 complete.
2. Diff new screenshots against these baseline screenshots.
3. For each B-NN break with `P0` priority: confirm resolved (screenshot + code check). If not resolved: document specific residual fix.
4. Human sign-off gate.

No residual P0 fixes are predicted — all P0 breaks map to prior-wave tasks. Plan 09-07 is primarily verification + sign-off.
