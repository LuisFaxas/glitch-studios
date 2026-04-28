# Auth Smoke Matrix

Captured: 2026-04-28T09:26:37Z
Plan: 48-03 auth/OAuth/admin smoke

Browser artifact:
`.planning/phases/48-launch-blocker-proof-pass/artifacts/auth/auth-browser-smoke-result.json`

Screenshots:

- `screenshots/glitchstudios-io-login.png`
- `screenshots/glitchstudios-io-register-role-customer.png`
- `screenshots/glitchstudios-io-register-customer.png`
- `screenshots/glitchstudios-io-verify-email.png`
- `screenshots/glitchstudios-io-dashboard.png`
- `screenshots/glitchtech-io-login.png`
- `screenshots/glitchtech-io-register-role-customer.png`
- `screenshots/glitchtech-io-register-customer.png`
- `screenshots/glitchtech-io-verify-email.png`
- `screenshots/glitchtech-io-dashboard.png`

| brand_host | surface_or_flow | evidence | status | requirements |
| --- | --- | --- | --- | --- |
| glitchstudios.io | Google OAuth | `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` missing in Vercel Production; no Google button on `/login` | blocked: Google OAuth env missing and Google Console redirect not confirmed | AUTH-20, AUTH-32 |
| glitchstudios.io | social row on /login | `auth-browser-smoke-result.json`; `/login` HTTP 200, buttons were Sign In / Forgot / Create only | blocked: social row absent because all provider envs are missing | AUTH-20, AUTH-21, AUTH-22 |
| glitchstudios.io | social row on /register?role=customer | `auth-browser-smoke-result.json`; `/register?role=customer` HTTP 200 role-select page | blocked: role-select surface renders, but customer social row is only on `/register/customer` and providers are env-hidden | AUTH-20, AUTH-21, AUTH-22 |
| glitchstudios.io | Meta button hidden-or-configured | `auth-browser-smoke-result.json`; Meta label absent on `/login` and `/register/customer`; META env missing | passed: hidden while unconfigured | AUTH-22 |
| glitchstudios.io | GitHub button hidden-or-configured | `auth-browser-smoke-result.json`; GitHub label absent on `/login` and `/register/customer`; GitHub env missing | passed: hidden while unconfigured | AUTH-21 |
| glitchstudios.io | login email/password | Login page rendered at `/login` HTTP 200 | blocked: no production test user credentials supplied for a real sign-in | AUTH-32 |
| glitchstudios.io | register customer | Customer wizard rendered at `/register/customer` HTTP 200 | blocked: end-to-end registration requires inbox/verification email proof, which remains blocked by the email smoke gap | AUTH-29, AUTH-32 |
| glitchstudios.io | forgot password | Forgot password page rendered HTTP 200 | blocked: reset email delivery/event/link proof remains blocked by the email smoke gap | AUTH-29 |
| glitchstudios.io | reset password | Reset page rendered expired/no-token state HTTP 200 | blocked: requires a real reset token from delivered email | AUTH-29 |
| glitchstudios.io | verify email | `/verify-email` rendered HTTP 200 and screenshot captured | blocked: page is reachable, but token verification requires delivered verification email proof | AUTH-26, AUTH-29 |
| glitchstudios.io | protected-page redirect for unverified user | `/dashboard` redirected unauthenticated browser to `/login` | blocked: no unverified-user session available to prove soft-gate redirect specifically | AUTH-26 |
| glitchstudios.io | /verify-email allowed for unverified user | `/verify-email` returned HTTP 200 without middleware redirect | passed | AUTH-26 |
| glitchstudios.io | /api/auth/* allowed for unverified user | `/api/auth/get-session` returned HTTP 200 | passed: auth API route is not blocked by middleware | AUTH-26 |
| glitchstudios.io | sign out allowed for unverified user | No unverified-user session available | blocked: needs real unverified session proof | AUTH-26 |
| glitchtech.io | Google OAuth | `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` missing in Vercel Production; no Google button on `/login` | blocked: Google OAuth env missing and Google Console redirect not confirmed | AUTH-20, AUTH-32 |
| glitchtech.io | social row on /login | `auth-browser-smoke-result.json`; `/login` HTTP 200, buttons were Sign In / Forgot / Create only | blocked: social row absent because all provider envs are missing | AUTH-20, AUTH-21, AUTH-22 |
| glitchtech.io | social row on /register?role=customer | `auth-browser-smoke-result.json`; `/register?role=customer` HTTP 200 role-select page | blocked: role-select surface renders, but customer social row is only on `/register/customer` and providers are env-hidden | AUTH-20, AUTH-21, AUTH-22 |
| glitchtech.io | Meta button hidden-or-configured | `auth-browser-smoke-result.json`; Meta label absent on `/login` and `/register/customer`; META env missing | passed: hidden while unconfigured | AUTH-22 |
| glitchtech.io | GitHub button hidden-or-configured | `auth-browser-smoke-result.json`; GitHub label absent on `/login` and `/register/customer`; GitHub env missing | passed: hidden while unconfigured | AUTH-21 |
| glitchtech.io | login email/password | Login page rendered at `/login` HTTP 200 | blocked: no production test user credentials supplied for a real sign-in | AUTH-32 |
| glitchtech.io | register customer | Customer wizard rendered at `/register/customer` HTTP 200 | blocked: end-to-end registration requires inbox/verification email proof, which remains blocked by the email smoke gap | AUTH-29, AUTH-32 |
| glitchtech.io | forgot password | Forgot password page rendered HTTP 200 | blocked: reset email delivery/event/link proof remains blocked by the email smoke gap | AUTH-29 |
| glitchtech.io | reset password | Reset page rendered expired/no-token state HTTP 200 | blocked: requires a real reset token from delivered email | AUTH-29 |
| glitchtech.io | verify email | `/verify-email` rendered HTTP 200 and screenshot captured | blocked: page is reachable, but token verification requires delivered verification email proof | AUTH-26, AUTH-29 |
| glitchtech.io | protected-page redirect for unverified user | `/dashboard` redirected unauthenticated browser to `/login` | blocked: no unverified-user session available to prove soft-gate redirect specifically | AUTH-26 |
| glitchtech.io | /verify-email allowed for unverified user | `/verify-email` returned HTTP 200 without middleware redirect | passed | AUTH-26 |
| glitchtech.io | /api/auth/* allowed for unverified user | `/api/auth/get-session` returned HTTP 200 | passed: auth API route is not blocked by middleware | AUTH-26 |
| glitchtech.io | sign out allowed for unverified user | No unverified-user session available | blocked: needs real unverified session proof | AUTH-26 |

## Summary Counts

- Passed rows: 8
- Blocked rows: 20
- Failed rows: 0

AUTH-20/AUTH-21/AUTH-22 provider behavior is documented, but Google cannot be
launch-passed until the Google provider env and Google Cloud Console redirect
URIs are configured.

