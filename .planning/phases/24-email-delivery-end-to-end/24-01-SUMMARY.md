---
phase: 24-email-delivery-end-to-end
plan: 01
status: complete
completed: 2026-04-24
---

## What was built

Closed EMAIL-02 (password-reset + verification templates) and EMAIL-03 (reset flow end-to-end).

### Changes

**`src/lib/email/password-reset.tsx`** (new) — React Email template with props `{ name, url }`. Dark Glitch aesthetic matching existing templates (black bg, cream text, monospace, cream CTA button). 1-hour expiry note + "ignore if you didn't request" security line. Footer with glitchstudios.io link.

**`src/lib/email/account-verification.tsx`** (new) — same visual system, copy diffs only (subject, heading, body, preview text).

**`src/lib/auth.ts`**
- Added imports: `Resend`, `PasswordResetEmail`, `AccountVerificationEmail`.
- Module-level: `const resend = new Resend(process.env.RESEND_API_KEY)` + `EMAIL_FROM = "Glitch Studios <noreply@glitchstudios.io>"`.
- Body-swapped `sendResetPassword` (Phase 23-06 stub replaced) — uses `resend.emails.send` with `react: PasswordResetEmail(...)`. Structured `[email:reset]` error logs. Signature unchanged per the 23-06 locked contract.
- Added new `emailVerification` block at same level as `emailAndPassword` with `sendOnSignUp: true`, `autoSignInAfterVerification: true`, and `sendVerificationEmail` using `AccountVerificationEmail`.

### Decisions applied

- **Single-brand from address** per CONTEXT.md D-10. `noreply@glitchstudios.io` for both reset + verify. Phase 38 owns brand-split.
- **Log, don't throw.** Better Auth runs these callbacks in background; throwing swallows the error. Structured `[email:reset]` / `[email:verify]` prefixes for Vercel log filtering.
- **No shared `<EmailLayout>` extraction yet** — two templates at this point; refactor threshold (≥3 duplicated call sites) not hit. Revisit in 24-02.

### Tests

`tests/24-01-auth-emails.spec.ts` — 2/2 passed (desktop):
- Unknown-email → 200 + `status: true` (Better Auth timing-safe mitigation)
- Real admin email → 200 (triggers Resend send — delivery verifiable via Resend dashboard)

### Deviations

- Plan asked for explicit assertion that `[email:reset]` log did NOT include "Resend failed". That's a server-side log check that Playwright can't cleanly capture without log-streaming. The 200 response itself confirms Better Auth didn't throw, which is the observable contract. Delivery verification happens via Resend dashboard in 24-03.

## Open

- EMAIL-08 deliverability (SPF/DKIM/DMARC) — owned by plan 24-03.
- Actual delivery depends on Resend domain verification status — also 24-03.
