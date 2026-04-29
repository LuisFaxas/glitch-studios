# Single-Domain Email Testing Scope

Captured: 2026-04-28T11:36:37Z

## Current Testing Scope

- tested_at: blocked: not yet tested
- sender_domain: glitchtech.io
- allowed_sender: Glitch Studios <noreply@glitchtech.io>
- resend_scope: single verified Resend domain only
- glitchstudios_io_resend_status: deferred_user_cost_decision
- glitchstudios.io: deferred: user does not want to pay for more than one Resend domain right now
- email08_final_behavior: deferred_not_passed
- secret_safety: no API keys, OAuth secrets, passwords, tokens, full cookies, or real card numbers in artifacts
- full_dmarc_proof: deferred_or_blocked: not required for current single-domain smoke; do not mark EMAIL-08 passed

## 48-17 Evidence Contract

Current transactional email proof is limited to the single verified sender:

- sender_domain: glitchtech.io
- allowed_sender: Glitch Studios <noreply@glitchtech.io>
- glitchstudios_io_resend_status: deferred_user_cost_decision
- email08_final_behavior: deferred_not_passed
- secret_safety: no API keys, OAuth secrets, passwords, tokens, full cookies, or real card numbers in artifacts

Every email row marked `passed` in `email-smoke-matrix.md` must include a real
Resend event ID or screenshot, inbox screenshot/filename, content assertions,
and a link result where the flow includes a link. Rows without that proof remain
`blocked` with a concrete `blocked_reason`.

## Decision

The user explicitly chose not to pay for or pursue multi-domain Resend verification right now because the user does not want to pay for more than one Resend domain right now. Phase 48 email testing will continue using the single verified/available Resend domain:

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
- `glitchstudios.io` Resend paid multi-domain proof: deferred: user does not want to pay for more than one Resend domain right now
- Full two-brand sender-domain and DMARC proof: deferred_or_blocked: not required for current single-domain smoke; do not mark EMAIL-08 passed

## Code Change

All app Resend sender addresses now route through `src/lib/email/senders.ts`, which defaults to the verified testing sender and can be changed later with environment variables:

- `EMAIL_FROM`
- `BOOKING_EMAIL_FROM`
- `NEWSLETTER_EMAIL_FROM`
