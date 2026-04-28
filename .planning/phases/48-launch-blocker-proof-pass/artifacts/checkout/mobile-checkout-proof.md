# Mobile Checkout Proof

Captured: 2026-04-28T09:20:00Z
Plan: 48-04 mobile checkout proof

Stripe public test card used for proof rows: `4242 4242 4242 4242`.

| device_path | browser | checkout_url | stripe_payment_or_session | vercel_log_evidence | app_order_or_receipt | status |
| --- | --- | --- | --- | --- | --- | --- |
| real iOS device | Safari | `https://glitchstudios.io/checkout` | blocked: physical iOS Safari test has not been run by the user yet | blocked: no iOS Vercel log window yet | blocked: no iOS order/receipt screenshot yet | blocked: awaiting physical iOS Safari proof |
| desktop | Chrome or Safari | `https://glitchstudios.io/checkout` | Stripe Checkout Session `cs_test_a1ZFhgKjiKxLNDmjNlz899GAzCYU4gVUzSsY9Tssz9Z3SB7lOjU9p5idKD`; PaymentIntent `pi_3TR7ng2KEYdA76dA006759Yj`; event `evt_1TR7nh2KEYdA76dATySX7ThK`; payment status `paid`; pending webhooks `0` | `.planning/phases/48-launch-blocker-proof-pass/artifacts/checkout/desktop-checkout-vercel-logs.json` shows `POST /api/webhooks/stripe` status `200` plus session-status `200` | `.planning/phases/48-launch-blocker-proof-pass/artifacts/checkout/screenshots/desktop-checkout-success-final.png` shows Order Confirmed `#55f194e3`; `.planning/phases/48-launch-blocker-proof-pass/artifacts/checkout/desktop-checkout-stripe-db-proof.json` shows order row, item row, price_cents `2900`, MP3 + license PDF proof | passed |

## Desktop Diagnosis And Fixes

Desktop proof initially failed after Stripe returned `paid` because the app had no
Stripe webhook endpoint configured. After creating the test-mode endpoint for
`https://glitchstudios.io/api/webhooks/stripe` and updating Vercel
`STRIPE_WEBHOOK_SECRET`, the webhook reached production but failed against a DB
schema mismatch: production uses `order_items.price_cents`, while the app was
inserting/selecting `order_items.price`.

Fixes applied:

- Created the Stripe test-mode webhook endpoint for `checkout.session.completed`.
- Updated Vercel Production `STRIPE_WEBHOOK_SECRET` and redeployed.
- Aligned order item code with production `price_cents`.
- Added webhook idempotency so Stripe retries resume an existing order instead
  of creating broken duplicate orders.
- Applied `0010_order_items_price_cents.sql` to confirm `price_cents` and
  `created_at` compatibility.

## Remaining Gap

Phase 48 mobile checkout proof is not fully closed until the real iOS Safari row
is run on a physical iPhone or iPad and marked `passed`.
