# Phase 48 Human Proof Guide

Use this when the workflow asks for proof artifacts. Do not paste API keys, passwords, or card details beyond Stripe's public test card number.

## Already Handled

Performance proof is complete. You do not need to gather Vercel Speed Insights or Lighthouse evidence for Phase 48 anymore.

Completed files:

- `artifacts/perf/perf-evidence-matrix.md`
- `artifacts/perf/bundle-audit.md`
- `48-05-SUMMARY.md`

## Remaining 1: Email Smoke On The Single Verified Resend Domain

You need access to:

- Resend dashboard
- An inbox you control for each test recipient

Current scope:

- `glitchtech.io` is the verified/available Resend domain for testing.
- `glitchstudios.io` multi-domain proof is deferred until you decide to pay,
  upgrade, or move the domain into the same Resend account/team.

Steps:

1. Trigger each email path from the live site or admin UI.
2. In Resend, open the email event/log and capture the event ID or screenshot.
3. In the recipient inbox, confirm the message arrived.
4. Click any required link, such as reset, verify, invite, unsubscribe, or download.
5. Tell Codex the flow name, approximate time, recipient inbox, event ID or
   screenshot name, and whether the link worked.

Codex can then update:

- `artifacts/email/email-smoke-matrix.md`

Useful official docs:

- Resend domain verification: https://resend.com/docs/dashboard/domains/introduction
- Resend DMARC: https://resend.com/docs/dashboard/domains/dmarc
- Cloudflare DNS records: https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/

## Remaining 2: Real iOS Safari Checkout

You need:

- A real iPhone or iPad
- Safari
- Stripe test mode dashboard access, or screenshots of the successful checkout/session

Steps:

1. On the iPhone/iPad, open Safari.
2. Go to `https://glitchstudios.io/checkout`.
3. If the cart is empty, go to `https://glitchstudios.io/beats`, add a beat, then return to checkout.
4. Complete checkout using Stripe's public test card:
   - Card: `4242 4242 4242 4242`
   - Expiration: any future date, for example `12/34`
   - CVC: any three digits
   - ZIP/postal code: any valid-looking value
5. Take screenshots of:
   - Checkout page before payment
   - Stripe payment success or returned success page
   - Any order/receipt page shown by the app
6. Tell Codex the approximate time you ran it and the screenshot filenames. Codex can help pull matching Vercel `[checkout]` logs.

Desktop checkout can be run the same way from Chrome or Safari on a computer.

Codex will then create:

- `artifacts/checkout/mobile-checkout-proof.md`

Useful official docs:

- Stripe test cards: https://docs.stripe.com/testing

## What To Say To Codex

After an email smoke test is complete:

> I tested [flow] at [time]. Resend event/screenshot is [id/name]. Inbox result was [result]. Link result was [result].

After iOS checkout is complete:

> I did the iOS checkout at [time]. Screenshots are [names].

After desktop checkout is complete:

> I did the desktop checkout at [time]. Screenshots are [names].
