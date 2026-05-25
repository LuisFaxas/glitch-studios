# Resend Domain Verification

Captured: 2026-04-28T11:36:37Z
Plan: 48-10 single-domain email smoke

## Scope Decision

The original launch criterion asked for both `glitchstudios.io` and
`glitchtech.io` to be verified in Resend. During execution, the user chose not
to pay for or continue multi-domain Resend setup right now. The current proof
scope is therefore:

- `glitchtech.io`: available verified Resend domain for transactional testing.
- `glitchstudios.io`: deferred: user does not want to pay for more than one
  Resend domain right now.
- Full DMARC proof: deferred_or_blocked: not required for current single-domain
  smoke; do not mark EMAIL-08 passed.

This artifact does not claim full EMAIL-08 completion.

## Domain: glitchtech.io

- domain: glitchtech.io
- resend_status: verified
- spf_record: `send.glitchtech.io TXT "v=spf1 include:amazonses.com ~all"` and `send.glitchtech.io MX 10 feedback-smtp.us-east-1.amazonses.com.`
- dkim_records: `resend._domainkey.glitchtech.io TXT` public key present in `dns-after.txt`
- dmarc_record: blocked: no public DMARC TXT returned for `_dmarc.glitchtech.io`
- cloudflare_evidence: `.planning/phases/48-launch-blocker-proof-pass/artifacts/email/dns-after.txt`
- resend_evidence: `.planning/phases/48-launch-blocker-proof-pass/artifacts/email/resend-account-review.md`; Resend API domain list returned `glitchtech.io` with status `verified`

## Domain: glitchstudios.io

- domain: glitchstudios.io
- resend_status: deferred
- deferred_reason: user does not want to pay for more than one Resend domain right now
- spf_record: `send.glitchstudios.io TXT "v=spf1 include:amazonses.com ~all"` and `send.glitchstudios.io MX 10 feedback-smtp.us-east-1.amazonses.com.` are present in public DNS
- dkim_records: `resend._domainkey.glitchstudios.io TXT` public key present in `dns-after.txt`
- dmarc_record: blocked: no public DMARC TXT returned for `_dmarc.glitchstudios.io`
- cloudflare_evidence: `.planning/phases/48-launch-blocker-proof-pass/artifacts/email/dns-after.txt`
- resend_evidence: blocked: current Resend API key lists only `glitchtech.io`; no dashboard/API proof for `glitchstudios.io` in the active testing account

## Verification Notes

- `dns-after.txt` contains public DNS evidence for both domains.
- `resend-account-review.md` records the account/API-key context without storing
  any secret key values.
- Full two-brand deliverability remains open until both domains are verified in
  the same usable Resend context and DMARC is documented.
- EMAIL-08 remains partial/deferred for this plan; do not mark EMAIL-08 passed
  without real `glitchstudios.io` Resend verification and DMARC proof.

## 48-17 Evidence Contract

- `glitchtech.io` remains the verified/current testing domain because dashboard
  or API evidence exists in `resend-account-review.md`.
- `glitchstudios.io` remains deferred: user does not want to pay for more than
  one Resend domain right now.
- DMARC proof for the full two-brand launch criterion remains deferred or
  blocked.
- Do not mark EMAIL-08 passed until real `glitchstudios.io` Resend verification
  and full DMARC proof exist.

### Plan 48-17 Task 1 Reconfirmation

Reconfirmed 2026-05-25T17:27:29Z:

- `glitchtech.io` is the only Resend domain in scope for Plan 48-17 evidence.
- `glitchstudios.io` Resend addition remains deferred per the user's cost
  decision; this plan must not add or pay for a second Resend domain.
- EMAIL-08 stays `partial/deferred` (not passed) and the deferral reason
  remains: `user does not want to pay for more than one Resend domain right
  now`.
