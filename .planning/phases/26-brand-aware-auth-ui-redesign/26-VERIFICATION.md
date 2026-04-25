# Phase 26 — Verification Report

**Date:** 2026-04-25
**Branch:** master
**Phase:** 26-brand-aware-auth-ui-redesign

## Automated Checks

| Check | Result | Evidence |
|-------|--------|----------|
| `pnpm tsc --noEmit` | PASS | exits 0 |
| `pnpm lint` (Phase 26 files only) | PASS | no errors/warnings emitted from any new or modified Phase 26 file |
| `pnpm lint` (project total) | PRE-EXISTING NOISE | 123 problems (57 errors, 66 warnings) — all pre-date Phase 26 (in `tests/`, `src/lib/permissions.ts`, mesh fragments, etc.). Captured but not regressed by this phase. |
| GlitchTek → GlitchTech sweep (source) | PASS (NO MATCHES) | swept paths listed below |
| GlitchTek → GlitchTech sweep (Phase 26 planning docs) | INTENTIONAL HITS ONLY | only matches in CONTEXT/RESEARCH/UI-SPEC discuss the stale spelling itself — none in copy that would render to users |

## Brand Spelling Audit

Files swept for `GlitchTek` (must be empty):

- `src/app/(auth)/**/*.{ts,tsx}` — clean
- `src/app/admin/applications/**/*.{ts,tsx}` — clean
- `src/components/auth/**/*.tsx` — clean
- `src/components/admin/application-*.tsx` — clean
- `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/auth-providers.ts`, `src/lib/auth-guards.ts`, `src/lib/brand.ts` — clean
- `src/lib/email/artist-approval-invite.tsx` — clean

Per memory `project_brand_name.md`: tech sub-brand is **GlitchTech** (matches `glitchtech.io`). Phase 26 source code uses `GlitchTech` exclusively. Planning-doc references to `GlitchTek` are *meta-discussion of the misspelling itself* and are intentionally preserved.

## Vercel Env-Var Checklist (Production)

Required at deploy time:

| Var | Required For | Status |
|-----|--------------|--------|
| `GOOGLE_CLIENT_ID` | Google OAuth (live launch) | ☐ set in Vercel |
| `GOOGLE_CLIENT_SECRET` | Google OAuth (live launch) | ☐ set in Vercel |
| `META_CLIENT_ID` | Meta OAuth (button hidden when missing) | ☐ optional |
| `META_CLIENT_SECRET` | Meta OAuth (button hidden when missing) | ☐ optional |
| `GITHUB_CLIENT_ID` | GitHub OAuth (button hidden when missing) | ☐ optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth (button hidden when missing) | ☐ optional |
| `ADMIN_NOTIFICATION_EMAIL` | Artist application notification destination | ☐ set in Vercel |
| `RESEND_API_KEY` | Email delivery (already set from Phase 24) | ☐ confirm still set |

OAuth Provider Console redirect URIs (must register on each provider):

- **Google:** 5 URIs — `https://glitchstudios.io/api/auth/callback/google`, `https://www.glitchstudios.io/api/auth/callback/google`, `https://glitchtech.io/api/auth/callback/google`, `https://www.glitchtech.io/api/auth/callback/google`, `http://localhost:3004/api/auth/callback/google`
- **Meta:** same 5 with `/facebook` (Better Auth provider key is `facebook`)
- **GitHub:** ONE callback URL — register against `glitchstudios.io/api/auth/callback/github`; verify on staging that cross-host login works

## Database Migration Verification

Run on production DB (or staging) before flipping the soft gate:

```sql
-- Should return 1 row with key='grandfather_email_verified'
SELECT * FROM phase26_migration_meta WHERE key = 'grandfather_email_verified';

-- Should return 0 (every pre-existing user is now verified)
SELECT COUNT(*) FROM "user" WHERE "emailVerified" IS NOT TRUE;

-- Sanity check artist_applications
SELECT to_regclass('public.artist_applications');  -- should NOT be null
```

Migration runner: `pnpm db:migrate:phase26` is idempotent (uses `IF NOT EXISTS`, `DO $$ EXCEPTION WHEN duplicate_object`, and `phase26_migration_meta` row guard). Re-running is safe.

## Manual Playwright / Browser Smoke Pass

Test matrix: 2 brand hosts × 5 auth surfaces. Run dev locally on `localhost:3004` (defaults to studios) AND with `glitchtech.local` mapped via `/etc/hosts` for tech.

| # | Surface | Studios host | Tech host |
|---|---------|--------------|-----------|
| 1 | `/login` (form + social row + brand panel) | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 2 | `/login?error=account_not_linked&attempted=google` (conflict copy) | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 3 | `/register` role-select tiles | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 4 | `/register/customer?step=1` → step 2 → step 3 → account created | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 5 | `/register/customer?step=1` with duplicate email → inline error | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 6 | `/register/artist` form submit → on-page success + DB row + admin notification email | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 7 | `/forgot-password` always-success copy | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 8 | `/reset-password` valid token → success toast → /login | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 9 | `/reset-password` no token → expired Alert | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 10 | `/verify-email` pending state | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 11 | `/verify-email?status=success` success state + Continue CTA | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 12 | Soft gate: unverified user → `/` → redirected to `/verify-email` | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 13 | Soft gate: unverified user → `/login` → NOT redirected (auth group exempt) | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |

OAuth end-to-end (AUTH-32):

| # | Provider | Studios host | Tech host |
|---|---------|--------------|-----------|
| 14 | Google sign-in → `/` (post-login routing) | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |
| 15 | Google sign-in to a host whose email matches an existing email+password user → `account_not_linked` redirect | ☐ PASS / ☐ FAIL | ☐ PASS / ☐ FAIL |

Admin queue (AUTH-14..19):

| # | Flow | Result |
|---|------|--------|
| 16 | `/admin/applications` lists submitted application | ☐ PASS / ☐ FAIL |
| 17 | Detail drawer opens on row click; bio + portfolio + tags shown | ☐ PASS / ☐ FAIL |
| 18 | Approve modal → Confirm → user row created with role + emailVerified=true | ☐ PASS / ☐ FAIL |
| 19 | Approve email lands; recipient sets password; signs in successfully | ☐ PASS / ☐ FAIL |
| 20 | Reject sets status='rejected'; NO applicant email | ☐ PASS / ☐ FAIL |
| 21 | Request more info sends admin-composed email; status='info_requested' | ☐ PASS / ☐ FAIL |

## Known Limitations / Deferred

- **No `/dashboard` route exists in this project.** Verify-email success CTA + login post-success redirect both route to `/` (homepage) for non-admin users. To revisit when a dedicated dashboard ships (Phase 32 artist platform candidate).
- **Newsletter opt-in not persisted on signup.** The `user.newsletterOptIn` column from Plan 26-03 exists; the customer wizard (Plan 26-06) captures the choice in client state. Persisting it requires either configuring `betterAuth({ user: { additionalFields: { newsletterOptIn } } })` or a follow-up `authClient.updateUser` call. Not a blocker for AUTH-07 (UI bit captured).
- GitHub OAuth single-callback-per-app pitfall — verify on staging at deploy time per RESEARCH §Multi-host pitfall.
- Linked-accounts settings UI deferred (post-launch polish phase).
- Public artist self-serve signup deferred to v5.0.
- 2FA / MFA deferred.
- Email-template visual redesign deferred to backlog 999.5 (Phase 26 ships text-on-dark `ArtistApprovalInviteEmail`).
- Pre-existing project-wide lint errors (123 in `tests/`, `src/lib/permissions.ts`, etc.) NOT regressed by Phase 26 but tracked separately; clean-up out of scope here.

## Sign-Off

- [x] Automated checks pass (tsc + scoped lint)
- [ ] Manual smoke pass complete (rows 1–21 all PASS)
- [ ] Vercel env-vars set for prod
- [ ] Migration runner executed against prod (or scheduled)
- [ ] User reviewed + approved
