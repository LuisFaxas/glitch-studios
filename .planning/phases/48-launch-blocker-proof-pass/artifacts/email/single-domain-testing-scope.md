# Single-Domain Email Testing Scope

Captured: 2026-04-28T05:45:00Z

## Decision

The user explicitly chose not to pay for or pursue multi-domain Resend verification right now. Phase 48 email testing will continue using the single verified/available Resend domain:

- `glitchtech.io`

The unavailable second-domain proof is intentionally deferred, not treated as a mystery blocker.

## Production Configuration

Vercel Production was updated so the current production deployment can send using the single verified testing domain:

- `RESEND_API_KEY`: updated to the valid key that sees `glitchtech.io: verified`
- `EMAIL_FROM`: `Glitch Studios <noreply@glitchtech.io>`

The sender-code change was deployed in:

- Vercel deployment: `https://glitchstudios-qtqh51b76-luis-faxas-projects.vercel.app`
- Aliases verified: `https://glitchstudios.io`, `https://glitchtech.io`

## Scope Impact

This does not fully satisfy the original two-domain EMAIL-08 launch criterion. It does unblock practical transactional email smoke testing for now.

Final Phase 48 verification should report:

- `glitchtech.io` Resend proof: available for testing
- `glitchstudios.io` Resend paid multi-domain proof: deferred by user decision
- Full two-brand sender-domain proof: not claimed until the user decides to pay/upgrade or consolidate domains into one Resend account

## Code Change

All app Resend sender addresses now route through `src/lib/email/senders.ts`, which defaults to the verified testing sender and can be changed later with environment variables:

- `EMAIL_FROM`
- `BOOKING_EMAIL_FROM`
- `NEWSLETTER_EMAIL_FROM`
