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
