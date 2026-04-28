# Stripe Checkout Env Fix

Captured: 2026-04-28T06:04:00Z
Plan: 48-04 mobile checkout proof

## Problem

Production checkout was returning HTTP 500 before the customer could complete Stripe checkout.

Observed production errors:

- `Invalid character in header content ["Authorization"]`
- `Not a valid URL`
- Stripe `code: url_invalid`
- Stripe `param: return_url`

## Cause

Several Vercel Production env values contained pasted literal `\n` characters:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `BETTER_AUTH_URL`

No secret key material is recorded in this artifact.

## Fix

- Replaced the affected Vercel Production env values with sanitized values.
- Added `cleanStripeEnv()` usage for server, client, and webhook Stripe env reads.
- Added shared `getSiteUrl()` helper to sanitize `NEXT_PUBLIC_SITE_URL`.
- Routed checkout, booking checkout, webhook receipt links, newsletter unsubscribe links, sitemap, and robots through `getSiteUrl()`.

## Verification

Build:

- `pnpm build` passed locally.
- `vercel --prod --yes` passed and deployed `https://glitchstudios-m6s4tn2sk-luis-faxas-projects.vercel.app`.

Live API:

- `https://glitchstudios.io/api/checkout` returned HTTP/2 200 and a test-mode embedded checkout session secret prefix `cs_test_`.
- `https://glitchtech.io/api/checkout` returned HTTP/2 200 and a test-mode embedded checkout session secret prefix `cs_test_`.

Live browser:

- Playwright Chromium loaded `https://glitchstudios.io/checkout`.
- Local cart seed key: `glitch-cart`.
- Checkout container mounted: yes.
- `/api/checkout` response: HTTP 200.
- Stripe frames detected: yes.

## Status

Stripe embedded checkout session creation is fixed in production.

Still required before closing 48-04:

- physical iOS Safari test-card payment;
- desktop browser test-card payment;
- Stripe payment/session evidence;
- app order/receipt evidence.
