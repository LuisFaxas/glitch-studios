---
phase: 02-beat-store
plan: 07
subsystem: payments
tags: [stripe, checkout, pdf-lib, resend, react-email, r2, webhooks, bundles]

requires:
  - phase: 02-01
    provides: Beat schema, Stripe server client, R2 helpers
  - phase: 02-04
    provides: Admin beat CRUD, beat pricing, bundle management
  - phase: 02-06
    provides: Cart provider (useCart), CartItem type, cart drawer

provides:
  - Stripe Embedded Checkout page (/checkout)
  - Stripe webhook handler for payment confirmation
  - License PDF generation (pdf-lib)
  - Purchase receipt email template (React Email + Resend)
  - Order creation and item tracking (orders, orderItems tables)
  - Order success page with signed R2 download URLs (24h expiry)
  - Bundle discount logic (auto-detect matching bundles, Stripe coupons)
  - Public bundle display on /beats page
  - Session status polling endpoint

affects: [admin-dashboard, client-accounts, booking]

tech-stack:
  added: []
  patterns:
    - "Stripe Embedded Checkout with ui_mode embedded and return_url"
    - "Stripe webhook raw body parsing (request.text() not request.json())"
    - "Stripe coupon creation for bundle percentage discounts"
    - "PDF generation via pdf-lib (PDFDocument.create, StandardFonts)"
    - "R2 presigned upload for generated PDFs"
    - "React Email template with Resend API"
    - "Session status polling with retry logic (max 30 polls, 2s interval)"

key-files:
  created:
    - src/app/api/checkout/route.ts
    - src/app/api/checkout/session-status/route.ts
    - src/app/(public)/checkout/page.tsx
    - src/app/(public)/checkout/success/page.tsx
    - src/app/api/webhooks/stripe/route.ts
    - src/lib/pdf-license.ts
    - src/lib/email/purchase-receipt.tsx
    - src/actions/orders.ts
    - src/actions/bundles.ts
    - src/components/beats/bundle-section.tsx
  modified:
    - src/app/(public)/beats/page.tsx

key-decisions:
  - "Stripe Embedded Checkout (ui_mode: embedded) for seamless in-page payment"
  - "Bundle discount via Stripe coupons (getOrCreateBundleCoupon pattern)"
  - "License PDF uploaded to R2 with presigned URL after webhook payment confirmation"
  - "Receipt email sends download URL pointing to success page (not direct R2 URL)"
  - "24-hour signed download URLs matching email copy expiry"
  - "Buffer.from(pdfBytes) for fetch body compatibility with Node.js types"

patterns-established:
  - "Webhook raw body pattern: request.text() + constructEvent for Stripe signature verification"
  - "Session polling pattern: poll /api/checkout/session-status then fetch order via server action"
  - "Per-item tierDef lookup in email builder (avoids loop-scoped variable leak)"

requirements-completed: [BEAT-08, BEAT-09, BEAT-05, BEAT-10, MAIL-01]

duration: 3min
completed: 2026-03-25
---

# Phase 02 Plan 07: Checkout & Post-Purchase Summary

**Stripe Embedded Checkout with webhook-driven order creation, PDF license generation, Resend receipt email, signed R2 download URLs, and bundle discount logic**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-25T22:41:43Z
- **Completed:** 2026-03-25T22:45:19Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Complete checkout flow: cart items to Stripe Embedded Checkout to payment confirmation
- Webhook creates order records, generates license PDFs (uploaded to R2), sends receipt email via Resend
- Success page polls session status, then shows download links with 24-hour signed R2 URLs
- Bundle discount auto-detection at checkout with Stripe coupon application
- BundleSection component displays active bundles on /beats page with discounted pricing

## Task Commits

Each task was committed atomically:

1. **Task 1: Stripe Checkout Session API with bundle discount, Embedded Checkout page, and session status endpoint** - `02d66f6` (feat)
2. **Task 2: Webhook handler, PDF license generation, receipt email, order creation, success page, and bundle display** - `9aba6a4` (feat)

## Files Created/Modified
- `src/app/api/checkout/route.ts` - POST endpoint creating Stripe Checkout Session with bundle discount
- `src/app/api/checkout/session-status/route.ts` - GET endpoint for session status polling
- `src/app/(public)/checkout/page.tsx` - Stripe Embedded Checkout UI (use client)
- `src/app/(public)/checkout/success/page.tsx` - Order confirmation with download links
- `src/app/api/webhooks/stripe/route.ts` - Stripe webhook: order creation, PDF gen, email
- `src/lib/pdf-license.ts` - License PDF generation via pdf-lib
- `src/lib/email/purchase-receipt.tsx` - React Email purchase receipt template
- `src/actions/orders.ts` - Server actions for order queries and download URL generation
- `src/actions/bundles.ts` - Server actions for public bundle queries and discount calculation
- `src/components/beats/bundle-section.tsx` - Bundle display cards with add-to-cart
- `src/app/(public)/beats/page.tsx` - Added BundleSection import and rendering

## Decisions Made
- Used Stripe Embedded Checkout (ui_mode: "embedded") for seamless in-page payment experience
- Bundle discounts applied via Stripe coupons (getOrCreateBundleCoupon reuses existing coupons)
- License PDFs uploaded to R2 via presigned URL after webhook payment confirmation
- Receipt email download URL points to success page (not direct R2 URL) for consistent UX
- Buffer.from(pdfBytes) needed for Node.js fetch body type compatibility
- Email builder computes itemTierDef per item independently (avoids loop-scoped variable leak)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Uint8Array body type for fetch in webhook**
- **Found during:** Task 2 (webhook handler)
- **Issue:** TypeScript error: Uint8Array not assignable to BodyInit for fetch body
- **Fix:** Wrapped pdfBytes in Buffer.from() for Node.js type compatibility
- **Files modified:** src/app/api/webhooks/stripe/route.ts
- **Verification:** pnpm tsc --noEmit passes
- **Committed in:** 9aba6a4 (Task 2 commit)

**2. [Rule 1 - Bug] Removed server-side import from client component**
- **Found during:** Task 2 (bundle-section.tsx)
- **Issue:** BundleSection imported getPublicUrl from @/lib/r2 (server-only AWS SDK module) but is a "use client" component
- **Fix:** Removed the import since URLs are already resolved by getPublishedBundles() on the server
- **Files modified:** src/components/beats/bundle-section.tsx
- **Verification:** No build errors
- **Committed in:** 9aba6a4 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required

External services require manual configuration:
- **Stripe:** STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET env vars
- **Stripe Dashboard:** Enable PayPal as payment method, create webhook endpoint for checkout.session.completed
- **Resend:** RESEND_API_KEY env var for purchase receipt emails

## Next Phase Readiness
- Checkout and payment flow complete -- ready for client account integration
- Guest checkout works without auth; account CTA shown post-purchase
- Bundle system ready for admin management (already has admin CRUD from 02-04)

## Self-Check: PASSED

All 11 files verified present. Both commit hashes (02d66f6, 9aba6a4) verified in git log.

---
*Phase: 02-beat-store*
*Completed: 2026-03-25*
