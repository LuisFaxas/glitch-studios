# Phase 48 Human Proof Guide

Use this when the workflow asks for proof artifacts. Do not paste API keys, passwords, or card details beyond Stripe's public test card number.

## Already Handled

Performance proof is complete. You do not need to gather Vercel Speed Insights or Lighthouse evidence for Phase 48 anymore.

Desktop Stripe checkout proof is complete. You do not need to run the desktop
test-card path again unless you want to spot-check it personally.

Auth page/browser smoke and grandfather migration DB proof are captured. Google
OAuth and admin review actions are not launch-passed yet.

Completed files:

- `artifacts/perf/perf-evidence-matrix.md`
- `artifacts/perf/bundle-audit.md`
- `48-05-SUMMARY.md`
- `artifacts/checkout/mobile-checkout-proof.md` (desktop row passed, iOS row blocked)
- `artifacts/checkout/desktop-checkout-stripe-db-proof.json`
- `artifacts/auth/auth-smoke-matrix.md`
- `artifacts/auth/grandfather-migration.md`

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

## Remaining 2: Auth/OAuth/Admin Proof

You need access to:

- Vercel Production env or another deployment env manager
- Google Cloud Console OAuth credentials
- A production admin account
- Resend dashboard and applicant/test inboxes

Current auth blockers:

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are missing in Vercel
  Production, so Google OAuth is hidden and cannot pass.
- Google Cloud Console redirect URIs still need dashboard confirmation for:
  - `https://glitchstudios.io/api/auth/callback/google`
  - `https://glitchtech.io/api/auth/callback/google`
- Admin application approve/reject/request-more-info needs a real admin login.
- Invite, request-more-info, reset, and verification email flows need Resend
  event IDs plus inbox/link proof.

Codex can then update:

- `artifacts/auth/oauth-env-redirects.md`
- `artifacts/auth/auth-smoke-matrix.md`
- `artifacts/auth/admin-application-smoke.md`

## Remaining 3: Real iOS Safari Checkout

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

Codex will then update:

- `artifacts/checkout/mobile-checkout-proof.md`

Useful official docs:

- Stripe test cards: https://docs.stripe.com/testing

## What To Say To Codex

After an email smoke test is complete:

> I tested [flow] at [time]. Resend event/screenshot is [id/name]. Inbox result was [result]. Link result was [result].

After Google OAuth/admin proof is ready:

> I configured Google OAuth/admin access. Test it now.

After iOS checkout is complete:

> I did the iOS checkout at [time]. Screenshots are [names].
