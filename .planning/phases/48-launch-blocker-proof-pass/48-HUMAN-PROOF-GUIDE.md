# Phase 48 Human Proof Guide

Use this when the workflow asks for proof artifacts. Do not paste API keys, passwords, or card details beyond Stripe's public test card number.

## Already Handled

Performance proof is complete. You do not need to gather Vercel Speed Insights or Lighthouse evidence for Phase 48 anymore.

Completed files:

- `artifacts/perf/perf-evidence-matrix.md`
- `artifacts/perf/bundle-audit.md`
- `48-05-SUMMARY.md`

## Remaining 1: Resend + Cloudflare Domain Verification

You need access to:

- Resend dashboard
- Cloudflare dashboard for `glitchstudios.io`
- Cloudflare dashboard for `glitchtech.io`

Steps:

1. Open Resend Domains: `https://resend.com/domains`
2. Add `glitchstudios.io` if it is not already there.
3. Add `glitchtech.io` if it is not already there.
4. Open each domain in Resend and copy the DNS records it shows. Usually this includes SPF and DKIM records.
5. In Cloudflare, open the matching domain, then go to DNS -> Records -> Add record.
6. Add each Resend record exactly as Resend shows it.
7. Add a DMARC TXT record for each domain:
   - Type: `TXT`
   - Name: `_dmarc`
   - Content: `v=DMARC1; p=none; rua=mailto:<an inbox you control>;`
8. Go back to Resend and click Verify for each domain.
9. When Resend shows both domains as verified, tell Codex: `Resend is verified`.

Codex can then run the DNS commands and create:

- `artifacts/email/resend-domain-verification.md`
- `artifacts/email/dns-after.txt`

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

After Resend is verified:

> Resend is verified. Run the DNS proof.

After iOS checkout is complete:

> I did the iOS checkout at [time]. Screenshots are [names].

After desktop checkout is complete:

> I did the desktop checkout at [time]. Screenshots are [names].
