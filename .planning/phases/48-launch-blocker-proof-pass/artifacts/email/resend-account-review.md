# Resend Account Review

Captured: 2026-04-28T05:31:00Z
Updated: 2026-04-28T05:42:00Z
Updated: 2026-04-28T05:45:00Z

## API Key Findings

| Source | Result |
| --- | --- |
| Local `.env.local` `RESEND_API_KEY` | Valid Resend API key, rotated after first review |
| Vercel Production `RESEND_API_KEY` | Updated to match the current valid local testing key |
| Key comparison | Local and production keys now match |
| Vercel Production `EMAIL_FROM` | `Glitch Studios <noreply@glitchtech.io>` |

No API key values were printed or stored in this artifact.

## Domains Visible To Current Valid Local Resend Key

| domain | Resend status | sending | receiving | region |
| --- | --- | --- | --- | --- |
| `glitchtech.io` | verified | enabled | disabled | us-east-1 |

`glitchstudios.io` is not visible from the current valid local Resend API key.

Earlier review note: the previous local key saw only `glitchstudios.io`. The newly supplied local key sees only `glitchtech.io`. This strongly indicates the two domains currently belong to different Resend account/team contexts or API-key contexts.

## Resend Domain Detail For `glitchtech.io`

Visible verified records:

| record | name | type | status |
| --- | --- | --- | --- |
| DKIM | `resend._domainkey` | TXT | verified |
| SPF | `send` | MX | verified |
| SPF | `send` | TXT | verified |

Open tracking: disabled.
Click tracking: disabled.

## Public DNS Findings

See `dns-after.txt` for raw `dig` output.

| domain | public SPF/MX at `send` | public DKIM at `resend._domainkey` | public DMARC |
| --- | --- | --- | --- |
| `glitchstudios.io` | present | present | missing |
| `glitchtech.io` | present | present | missing |

This means both domains have Resend-style DNS records published, but only `glitchstudios.io` is visible to the valid local Resend API key. `glitchtech.io` may belong to a different Resend account/API key or may be visible only in a different dashboard context.

## App Sender Mismatch

Code search found several senders using `@glitchstudios.com`, while the valid Resend key only exposes `glitchstudios.io`.

Examples:

- `src/actions/admin-newsletter.ts` uses `newsletter@glitchstudios.com`
- `src/actions/contact.ts` uses `noreply@glitchstudios.com`
- `src/app/api/webhooks/stripe/route.ts` uses `bookings@glitchstudios.com` and `noreply@glitchstudios.com`
- `src/app/api/cron/booking-reminders/route.ts` uses `bookings@glitchstudios.com`

Those sends are likely to fail or be rejected unless `glitchstudios.com` is also verified in the active Resend account. The safer launch fix is to align app sender addresses to verified `.io` domains or verify `glitchstudios.com` as an additional Resend domain.

## Recommended Next Actions

1. Continue Phase 48 testing on the paid/available `glitchtech.io` Resend domain.
2. Keep `glitchstudios.io` multi-domain Resend verification deferred until the account is upgraded or the domain is moved into the same Resend account/team.
3. Add DMARC TXT records when convenient; current smoke testing can proceed without using DMARC as a launch-pass claim.
4. Revisit full two-brand sender/domain proof before final production launch acceptance.
