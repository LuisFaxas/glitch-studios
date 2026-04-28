# OAuth Env And Redirect Evidence

Captured: 2026-04-28T09:26:00Z
Plan: 48-03 auth/OAuth/admin smoke

Secrets were not printed or stored. Vercel Production env was checked with
`vercel env pull --environment=production` into a temporary file that was
deleted after presence parsing.

## Vercel Env

| env_var | status | evidence |
| --- | --- | --- |
| GOOGLE_CLIENT_ID | missing | Vercel Production env presence parse |
| GOOGLE_CLIENT_SECRET | missing | Vercel Production env presence parse |
| META_CLIENT_ID | missing | Vercel Production env presence parse |
| META_CLIENT_SECRET | missing | Vercel Production env presence parse |
| GITHUB_CLIENT_ID | missing | Vercel Production env presence parse |
| GITHUB_CLIENT_SECRET | missing | Vercel Production env presence parse |
| BETTER_AUTH_URL | present | Vercel Production env presence parse; value not stored |
| BETTER_AUTH_SECRET | present | Vercel Production env presence parse; value not stored |
| RESEND_API_KEY | present | Vercel Production env presence parse; value not stored |
| ADMIN_NOTIFICATION_EMAIL | missing | Vercel Production env presence parse; app falls back to studio inbox |

## Google OAuth Redirect URIs

| redirect_uri | status | evidence |
| --- | --- | --- |
| `https://glitchstudios.io/api/auth/callback/google` | status: blocked: Google provider env is missing in Vercel Production, so live OAuth cannot be exercised and Google Console redirect presence is not dashboard-confirmed | Vercel env parse; no Google dashboard screenshot supplied |
| `https://glitchtech.io/api/auth/callback/google` | status: blocked: Google provider env is missing in Vercel Production, so live OAuth cannot be exercised and Google Console redirect presence is not dashboard-confirmed | Vercel env parse; no Google dashboard screenshot supplied |

## Better Auth Base URL

Vercel Production has `BETTER_AUTH_URL` present, but the raw value is not stored
in artifacts. Host-aware client behavior is implemented in
`src/lib/auth-client.ts`: `baseURL` uses `window.location.origin` in the browser
and falls back to `process.env.BETTER_AUTH_URL` server-side.

`src/lib/auth.ts` trusts both production brand hosts:

- `https://glitchstudios.io`
- `https://www.glitchstudios.io`
- `https://glitchtech.io`
- `https://www.glitchtech.io`

## Provider Code Evidence

- `src/lib/auth.ts` builds `socialProviders` at module load time.
- `google` is registered only when `GOOGLE_CLIENT_ID` and
  `GOOGLE_CLIENT_SECRET` are both present.
- `github` is registered only when `GITHUB_CLIENT_ID` and
  `GITHUB_CLIENT_SECRET` are both present.
- `facebook` is registered only when `META_CLIENT_ID` and
  `META_CLIENT_SECRET` are both present. This covers the AUTH-22 Meta naming
  decision because Better Auth uses the `facebook` provider key.
- `src/lib/auth-providers.ts` uses the same env gates for UI buttons.
- `src/components/auth/social-auth-row.tsx` calls `signIn.social({ provider })`;
  Better Auth callback shape is `/api/auth/callback/{provider}`.

AUTH-20/AUTH-22 status:

- Google OAuth cannot pass until Google env values and Google Cloud Console
  redirect URIs are configured.
- Meta and GitHub are correctly hidden while their env values are missing.

