# Resend Domain Verification

Captured: 2026-04-28T08:55:00Z
Plan: 48-02 Resend email proof

## Scope Decision

The original launch criterion asked for both `glitchstudios.io` and
`glitchtech.io` to be verified in Resend. During execution, the user chose not
to pay for or continue multi-domain Resend setup right now. The current testing
scope is therefore:

- `glitchtech.io`: available verified Resend domain for transactional testing.
- `glitchstudios.io`: deferred until the user upgrades/pays or consolidates the
  domain into the active Resend account/team.

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
- resend_status: blocked: not visible to the current valid Resend API key; paid/multi-domain setup deferred by user decision
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
