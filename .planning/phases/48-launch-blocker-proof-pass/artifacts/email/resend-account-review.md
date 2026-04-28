# Resend Account Review

Captured: 2026-04-28T05:31:00Z
Updated: 2026-04-28T05:42:00Z

## API Key Findings

| Source | Result |
| --- | --- |
| Local `.env.local` `RESEND_API_KEY` | Valid Resend API key, rotated after first review |
| Vercel Production `RESEND_API_KEY` | Invalid Resend API key according to `GET https://api.resend.com/domains` |
| Key comparison | Local and production keys are different |

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

1. Do not update Vercel Production to the current local key yet; it only sees `glitchtech.io` and the app sends from `glitchstudios.io`.
2. Pick one Resend account/team to be canonical for launch.
3. In that same canonical account/team, make both `glitchstudios.io` and `glitchtech.io` visible and verified.
4. Create a fresh API key from that canonical account/team and use it for both local and Vercel Production.
5. Replace the Vercel Production `RESEND_API_KEY` only after the key sees both domains.
6. Add DMARC TXT records for both `.io` domains.
7. Align app sender addresses away from unverified `@glitchstudios.com` senders, or verify `glitchstudios.com` too.
