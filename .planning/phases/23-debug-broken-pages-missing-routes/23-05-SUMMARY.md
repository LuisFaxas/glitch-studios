---
phase: 23-debug-broken-pages-missing-routes
plan: 05
status: partial
completed: 2026-04-24
---

## What was built (Task 1 — hardening)

`/api/checkout` and `/checkout` page now produce observable, structured failures. Any future mobile-checkout report will have a root cause visible in Vercel logs + the user-facing error text within minutes, instead of the opaque "Something went wrong" spinner.

### Changes

**`src/app/api/checkout/route.ts`** (full rewrite, same success shape)
- Wrapped handler in try/catch.
- Body parsing: 400 on invalid JSON.
- Empty-cart guard: 400 + `{ error: "Cart is empty" }`.
- Env validation: 500 + `{ error: "Server misconfigured (STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL)", code: "ENV_MISSING" }` — names the specific missing vars.
- Stripe failures: 500 + `{ error: err.message, code: err.code }`.
- All errors `console.error` with `[checkout]` prefix for Vercel log filtering.

**`src/app/(public)/checkout/page.tsx`**
- `fetchClientSecret` checks `response.ok`, extracts `body.error` from failed response, throws an Error with the readable message.
- Throws on missing `clientSecret` in response.
- Empty-cart view now shows a "Browse beats" Link instead of just a paragraph.

### Tests

`tests/23-05-checkout-route-hardening.spec.ts` — 4/4 passed (desktop):
- empty cart → 400 + cart-is-empty error
- missing items body → 400 + error envelope
- invalid JSON body → 400 + error envelope
- client /checkout page with empty cart shows Browse Beats CTA

## What's blocked

**Tasks 2-4 require user action** — see `.planning/phases/23-debug-broken-pages-missing-routes/23-05-DIAGNOSIS.md`:

- Task 2: Deploy Vercel preview, reproduce on real iOS Safari, pull runtime logs + env inventory.
- Task 3: Apply diagnosis-driven fix (likely Vercel env var change, no code change needed).
- Task 4: Complete real-device test-card purchase on both mobile AND desktop.

The hardening done in Task 1 is sufficient to MAKE the diagnosis trivial when the user reproduces; it is not sufficient to close audit §A.12 on its own.

## Deviations

**Phase-level plan assumed this would be fully autonomous.** Plan tasks 2-4 explicitly require real-device + Vercel dashboard access per D-11/D-19. Marking this plan as partial: Task 1 is complete and committed; Tasks 2-4 are pending user execution documented in DIAGNOSIS.md.
