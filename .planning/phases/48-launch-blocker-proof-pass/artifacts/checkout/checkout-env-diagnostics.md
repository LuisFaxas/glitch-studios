# Checkout Env Diagnostics

Captured: 2026-04-28T03:16:00Z
Plan: 48-04 mobile checkout proof

deployed_url: https://glitchstudios.io
checkout_url: https://glitchstudios.io/checkout
deployed_url_status: present - production alias returned HTTP/2 200 for /checkout
stripe_mode: test
stripe_public_key_present: present
stripe_secret_key_present: present
stripe_webhook_secret_present: present
checkout_route_error_logging: present
vercel_log_query: [checkout]
stripe_test_card: 4242 4242 4242 4242

## Deployment Discovery

- `vercel whoami` is authenticated as `luisfaxas`.
- `vercel inspect https://glitchstudios.io` resolved to production deployment `glitchstudios-lsx597al7-luis-faxas-projects.vercel.app`, status Ready.
- `curl -I https://glitchstudios.io/checkout` returned HTTP/2 200.
- Latest preview deployment `https://glitchstudios-dpdbse9e8-luis-faxas-projects.vercel.app` is Ready, but direct `/checkout` access returned HTTP/2 401 from Vercel SSO protection, so the public production alias is the usable real-device proof target.
- `https://www.glitchstudios.io/checkout` is not a usable proof target right now because the TLS certificate did not match the `www` host during curl verification.

## Env Verification Notes

- Production env was checked with `vercel env pull --environment=production` into a temporary file.
- Secret values were not printed or retained.
- Stripe publishable and secret keys were confirmed present with test-mode prefixes only; no key material was copied into this artifact.
- `STRIPE_WEBHOOK_SECRET` was confirmed present.

## Route Observability Notes

- `src/app/api/checkout/route.ts` has explicit env validation for `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_SITE_URL`.
- Checkout route failures log with the `[checkout]` prefix.
- `src/app/(public)/checkout/page.tsx` checks `response.ok` and surfaces server-provided checkout errors.

## Human Proof Required

This artifact does not close the mobile checkout carry-forward. The carry-forward closes only after:

- real iOS Safari completes a Stripe test-card checkout against `https://glitchstudios.io/checkout`;
- desktop Chrome or Safari completes the same Stripe test-card checkout;
- Stripe test payment/session evidence, Vercel `[checkout]` log evidence, and app order/receipt evidence are recorded in `mobile-checkout-proof.md`.

## 2026-04-28 Production Stripe Fix

Root cause:

- Production Stripe env values had a pasted literal `\n` suffix, which caused Stripe requests to fail before session creation with `Invalid character in header content ["Authorization"]`.
- After key cleanup, `NEXT_PUBLIC_SITE_URL` / `BETTER_AUTH_URL` had the same pasted literal `\n` shape, causing Stripe to reject `return_url` with `code: url_invalid`.

Fixes applied:

- Vercel Production `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` were replaced with sanitized values from `.env.local`.
- Vercel Production `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` were replaced with clean `https://glitchstudios.io`.
- App code now defensively strips pasted literal `\n` values from Stripe keys and shared site URLs.

Deployments:

- Stripe key sanitizer deployment: `https://glitchstudios-mjyz74uuv-luis-faxas-projects.vercel.app`
- Site URL sanitizer deployment: `https://glitchstudios-m6s4tn2sk-luis-faxas-projects.vercel.app`

Post-fix proof:

- `curl -X POST https://glitchstudios.io/api/checkout` returned HTTP/2 200 with a test-mode embedded checkout `clientSecret` prefix `cs_test_`.
- `curl -X POST https://glitchtech.io/api/checkout` returned HTTP/2 200 with a test-mode embedded checkout `clientSecret` prefix `cs_test_`.
- Playwright Chromium loaded `https://glitchstudios.io/checkout` with `glitch-cart` populated, mounted `#checkout`, observed `/api/checkout` HTTP 200, and detected Stripe frames on the page.

Remaining proof gap:

- The server/browser session-creation error is fixed. The original carry-forward still needs a real physical iOS Safari test-card payment and a desktop test-card payment recorded in `mobile-checkout-proof.md`.
