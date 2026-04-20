# Mobile Fixes Applied

Completion date: 2026-04-20
Source break list: .planning/phases/09-services-booking/audit/MOBILE-BREAKS.md
Verification spec: tests/09-services-booking-verification.spec.ts
Verification screenshots: .planning/phases/09-services-booking/screenshots/verification/

## Summary

- Total breaks in MOBILE-BREAKS.md: 10
- Resolved by Plan 04 (manifesto / toggle / CTA reroute): 1 (B-05)
- Resolved by Plan 05 (service detail panel): 2 (B-01, B-02)
- Resolved by Plan 06 (wizard polish): 4 (B-03, B-04, B-06, B-07)
- Fixed in this plan: 0
- Deferred to a future phase: 3 (B-08, B-09, B-10)

## Per-break resolution

| Break | Status | Resolution |
|-------|--------|------------|
| B-01 | RESOLVED_BY_PLAN_05 | service-grid.tsx: `expandedSlug` now defaults to `services[0]?.slug` on mobile accordion; first service detail visible on load. |
| B-02 | RESOLVED_BY_PLAN_05 | ServiceDetailPanel extended to 9 UI-SPEC sections (Name, Description, Pricing, Duration & Includes, Highlights, Process, Policies, Example Work, CTA). |
| B-03 | RESOLVED_BY_PLAN_06 | service-selector.tsx rewritten to 4-piece rich tiles (name + description + price + duration with Clock icon). |
| B-04 | RESOLVED_BY_PLAN_06 | booking-flow.tsx renders per-step GlitchHeading + verbatim UI-SPEC subtitle on every step. |
| B-05 | RESOLVED_BY_PLAN_04 | ComingSoonManifesto component shipped; /services + /book branch on `booking_live` flag; both render manifesto when OFF. |
| B-06 | RESOLVED_BY_PLAN_06 | booking-summary.tsx rewritten: desktop 320px sticky sidebar + mobile 48px collapsible header with status line; 5 rows always rendered with em-dash placeholders. |
| B-07 | RESOLVED_BY_PLAN_06 | booking-flow.tsx Step 4 renders inline DEPOSIT & CANCELLATION block above the submit button (no checkbox, copy verbatim from UI-SPEC). |
| B-08 | DEFERRED | Cart button 44x44px on global header is out of Phase 09 scope. Flagged for Phase 14 Global Polish. |
| B-09 | DEFERRED | Footer text nav links small (~15px) are global footer polish, out of Phase 09 scope. Flagged for Phase 14. |
| B-10 | DEFERRED | Footer social icons (14-20px) are out of Phase 09 scope. Already tracked in the existing "social icons need brand icons" item for Phase 14. |

## Files touched in this plan

None. All P0/P1 breaks were resolved by earlier-wave plans; this plan only produced the verification artifacts.

## Deferrals

| Break | Reason |
|-------|--------|
| B-08 | Global nav component, touches affect every page not just Phase 09 scope. Cart button tap target is 44x44px (below UI-SPEC's 48px non-negotiable) but this is inherited from pre-Phase-09 code. Deferring aligns with the phase boundary. |
| B-09 | Footer nav links (SERVICES / PORTFOLIO / ARTISTS / BLOG) render ~15px tall text links. This is site-wide chrome, tracked for Phase 14. |
| B-10 | Footer social icons are 14-20px SVGs. Need brand icons upgrade per user's prior feedback. Tracked for Phase 14. |

## Verification results

- `pnpm exec playwright test tests/09-services-booking-verification.spec.ts --project=mobile`: 6 passed, 1 skipped (manifesto test skipped because `booking_live` is ON at test time — correctly tested as skip, not failure).
- `pnpm tsc --noEmit`: zero new errors introduced by Phase 09 changes.
- Playwright asserts:
  - zero horizontal overflow on /services and /book Step 1 at 375x812;
  - CONTINUE TO DATE button tall enough (>=48px);
  - BOOKING SUMMARY mobile header at 48px (±4px tolerance);
  - All 9 detail-panel sections present in DOM when `booking_live` is ON.

## Next action

Human sign-off checkpoint: review verification screenshots and /services + /book in the browser at 375px. Reply "approved" to close Phase 09 or list issues for revision.
