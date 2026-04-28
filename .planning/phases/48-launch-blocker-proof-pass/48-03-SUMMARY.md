---
phase: 48-launch-blocker-proof-pass
plan: 03
subsystem: auth
tags: [auth, oauth, admin, resend, evidence]

requires:
  - phase: 26-brand-aware-auth-ui-redesign
    provides: "Auth/OAuth/admin implementation and launch smoke checklist"
  - phase: 48-launch-blocker-proof-pass
    provides: "Email single-domain scope and current production deployment"
provides:
  - "Vercel Production auth env presence evidence without secrets"
  - "Both-brand auth page/browser smoke artifact"
  - "Public artist/contributor application submission and DB row proof"
  - "Grandfather migration production DB evidence"
  - "Explicit blocked rows for OAuth, email-dependent auth, and admin review"
affects: [48-06, AUTH-14, AUTH-15, AUTH-16, AUTH-17, AUTH-18, AUTH-19, AUTH-20, AUTH-21, AUTH-22, AUTH-26, AUTH-28, AUTH-29, AUTH-32]

tech-stack:
  added: []
  patterns:
    - "Auth launch proof records blocked rows rather than inferring pass from implementation"
    - "Production env presence is captured without storing secret values"

key-files:
  created:
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/auth/oauth-env-redirects.md
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/auth/auth-smoke-matrix.md
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/auth/admin-application-smoke.md
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/auth/grandfather-migration.md
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/auth/auth-command-output.md
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/auth/auth-browser-smoke-result.json
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/auth/artist-application-browser-result.json
    - .planning/phases/48-launch-blocker-proof-pass/artifacts/auth/auth-db-proof.json
  modified: []

key-decisions:
  - "Did not mark Google OAuth passed because Vercel Production is missing GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
  - "Marked Meta/GitHub hidden behavior passed because their env vars are missing and their buttons are absent on both hosts."
  - "Marked admin review actions blocked because no production admin browser credentials or Resend event proof were supplied."

patterns-established:
  - "Rows with screenshots/logs/DB output can pass; rows needing dashboards, inboxes, or credentials remain blocked."

requirements-completed:
  - AUTH-28

duration: 40min
completed: 2026-04-28
---

# Phase 48 Plan 03: Auth/OAuth/Admin Smoke Summary

**Auth implementation surfaces render on both production brand hosts, but launch
proof is still blocked for Google OAuth, email-dependent auth links, and admin
review actions.**

## Performance

- **Duration:** 40 min
- **Started:** 2026-04-28T09:22:00Z
- **Completed:** 2026-04-28T09:32:00Z
- **Tasks:** 3
- **Files modified:** 8 artifacts plus screenshots

## Accomplishments

- Captured Vercel Production auth env presence without storing secrets.
- Verified both brand hosts render `/login`, `/register?role=customer`,
  `/register/customer`, `/forgot-password`, `/reset-password`, `/verify-email`,
  `/dashboard`, and `/api/auth/get-session`.
- Confirmed provider buttons are hidden when provider env pairs are absent.
- Submitted one studios artist application and one GlitchTech contributor
  application through production browser flows.
- Confirmed both application rows exist in production DB with `pending` status.
- Confirmed the grandfather email verification migration ran in production and
  there are currently zero unverified users in the production `user` table.
- Captured required `pnpm tsc --noEmit` and `pnpm lint` command statuses.

## Blocked Rows

- Google OAuth is blocked because `GOOGLE_CLIENT_ID` and
  `GOOGLE_CLIENT_SECRET` are missing in Vercel Production and Google Console
  redirect URIs are not dashboard-confirmed.
- Customer registration verification, forgot/reset password, and verify-email
  token proof are blocked on real Resend event/inbox/link evidence.
- Admin application list/detail/approve/reject/request-more-info actions are
  blocked until production admin browser credentials are supplied.
- Admin notification, invite, and request-info emails are blocked until Resend
  event IDs or inbox screenshots are captured.
- AUTH-32 command proof is blocked by existing repo-wide `tsc`/lint failures,
  not by auth smoke code changes.

## Verification

- `auth-smoke-matrix.md` contains both production hosts and every required auth
  surface row.
- `admin-application-smoke.md` contains passed public submission/DB rows and
  explicit blocked admin review/email rows.
- `grandfather-migration.md` contains all required SQL evidence.
- `auth-command-output.md` contains both command names and exit statuses.

## Next Phase Readiness

Plan 48-06 can conservatively roll up AUTH-28 as passed and keep the remaining
OAuth/email/admin auth requirements open until the missing credentials,
provider envs, Google dashboard redirects, and Resend event proof are supplied.

