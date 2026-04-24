# Phase 24: Email Deliverability

**Captured:** 2026-04-24 via MCP (Cloudflare zones) + `dig` (public DNS)

## Summary

**Critical finding:** Both `glitchstudios.io` and `glitchtech.io` have **zero email DNS records**. No SPF, no DKIM, no DMARC, no MX. This means:

- Resend emails will be sent from a generic `resend.dev` fallback address, OR
- Emails will be silently rejected by recipient servers as unauthenticated.

This is the single blocker between "code is wired" (24-01, 24-02 complete) and "emails actually land in inboxes."

## DNS Inventory

### glitchstudios.io
```
SPF (root TXT):            (none)
DKIM (resend._domainkey):  (none)
DKIM (resend2._domainkey): (none)
DKIM (resend3._domainkey): (none)
DMARC (_dmarc TXT):        (none)
MX:                        (none)
```

### glitchtech.io
```
SPF (root TXT):            (none)
DKIM (resend._domainkey):  (none)
DKIM (resend2._domainkey): (none)
DKIM (resend3._domainkey): (none)
DMARC (_dmarc TXT):        (none)
MX:                        (none)
```

## Cloudflare Zone Confirmation (via MCP)

Both domains are active Cloudflare zones on the same account — DNS changes can be applied in the Cloudflare dashboard.

| Domain | Zone ID | Status | Nameservers |
|--------|---------|--------|-------------|
| glitchstudios.io | `7e591a2f96e13c32f67187c27b250b1c` | active | heidi.ns.cloudflare.com / jacob.ns.cloudflare.com |
| glitchtech.io | `39d07788a8542b3b2367ce1ca04f0039` | active | heidi.ns.cloudflare.com / jacob.ns.cloudflare.com |

Also present: `glitch.reviews`, `glitchapparel.com` — out of scope for v4.0 launch.

## Resend Domain Status

**Pending user action** — the Resend MCP is not authenticated for this session. Please paste the status from https://resend.com/domains below:

```
glitchstudios.io:
- Added to Resend?     [YES/NO]
- Verification status: [Verified / Pending / Failed / Not added]

glitchtech.io:
- Added to Resend?     [YES/NO]
- Verification status: [Verified / Pending / Failed / Not added]
```

## Action List

**Fastest path — Resend-driven (recommended):**

1. Log into https://resend.com/domains
2. Click **"Add Domain"** → enter `glitchstudios.io` → Resend generates 3 CNAME (DKIM) + 1 TXT (SPF) records specific to your account
3. In Cloudflare dashboard → Websites → glitchstudios.io → DNS → Records, paste the exact records Resend generated
4. Wait 1-5 minutes for propagation, click **"Verify"** in Resend
5. Repeat steps 2-4 for `glitchtech.io`

**Manual action items (if following the manual path):**

### glitchstudios.io (in Cloudflare → DNS)

- [ ] **SPF** — TXT record on `@` (root), value: `v=spf1 include:_spf.resend.com ~all` *(actual value per Resend dashboard)*
- [ ] **DKIM** — 3 CNAME records (names + targets provided by Resend after domain add)
- [ ] **DMARC** (optional, recommended for launch) — TXT record on `_dmarc`, value: `v=DMARC1; p=none; rua=mailto:admin@glitchstudios.io`

### glitchtech.io (in Cloudflare → DNS)

- [ ] **SPF** — same pattern as Studios
- [ ] **DKIM** — same pattern
- [ ] **DMARC** (optional) — `v=DMARC1; p=none; rua=mailto:admin@glitchtech.io`

## Post-Change Verification

After applying, re-run this from the project root:

```bash
for DOMAIN in glitchstudios.io glitchtech.io; do
  echo "=== $DOMAIN ==="
  dig +short TXT $DOMAIN | grep -i spf
  dig +short CNAME resend._domainkey.$DOMAIN
  dig +short CNAME resend2._domainkey.$DOMAIN
  dig +short CNAME resend3._domainkey.$DOMAIN
  dig +short TXT _dmarc.$DOMAIN
done
```

All six grep lines (3 per domain) should return values. Record the output in a "Post-Change Verification" section below when complete.

## Scope notes

- **p=none DMARC is acceptable for v4.0 launch.** Tightening to `p=quarantine` or `p=reject` is Phase 46 (deploy hardening).
- **Brand-split (sending Tech emails from glitchtech.io)** is Phase 38. For v4.0, all emails send from `noreply@glitchstudios.io` per `24-CONTEXT.md` D-10.
- **Do NOT add MX records for these domains** — we're not accepting inbound email there. Inbound mail is office@cprremodelinggroup.com (Google Workspace, separate domain).

## Current code state

✅ 24-01 complete — `sendResetPassword` + `sendVerificationEmail` wired via Resend
✅ 24-02 complete — booking-modification template + cancel/reschedule wiring
⏸️  24-03 **blocked** — awaiting DNS + Resend domain verification by user

Once DNS is in place, all five email flows (reset, verify, booking confirm, booking modification, booking reminder) will land in production inboxes. The code path is fully ready.
