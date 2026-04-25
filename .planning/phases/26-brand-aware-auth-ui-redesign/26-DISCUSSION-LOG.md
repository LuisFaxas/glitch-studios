# Phase 26: Brand-Aware Auth UI Redesign - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 26-brand-aware-auth-ui-redesign
**Areas discussed:** Customer wizard step 2 — preferences; Artist/contributor request flow; Social login — scope + behavior; Email-verify gating + existing-user migration; Brand attribute placement (added inline)

---

## Customer wizard step 2 — preferences

### Q1: What fields go in step 2 (Preferences)?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal: newsletter only | Just the newsletter opt-in checkbox. Lowest friction, highest completion rate. Matches modern consumer auth (Stripe, Linear). Easy to expand later via /dashboard/settings. | ✓ |
| Newsletter + brand interest | Newsletter checkbox + 'I'm interested in: ☐ Studios ☐ GlitchTech ☐ Both' — powers brand-segmented email lists from day 1. Adds 1 question. | |
| Newsletter + brand interest + service interest | Above plus 'What brings you here? ☐ Buy beats ☐ Book a session ☐ Mix/master ☐ Custom production'. Useful for sales triage but adds friction. | |
| Newsletter + genre interests | Newsletter checkbox + multi-select genre tags. Powers personalized beat recommendations later. | |

**User's choice:** Minimal: newsletter only
**Notes:** Recommended option. Leaves room for /dashboard/settings expansion post-launch.

---

### Q2: When is the account actually created during the customer wizard?

| Option | Description | Selected |
|--------|-------------|----------|
| At step 3 confirm submit | Atomic: collect step 1+2 in client state, call signUp.email + write newsletter pref in one server action on step 3 submit. T&Cs on step 3. Verification email at step 3. Step 1/2 dropoff = no DB row. | ✓ |
| At step 1 submit (account-first) | Account + verification email created on step 1. Steps 2-3 are post-signup onboarding. Half-finished accounts possible. | |
| At step 2 submit (preferences-first) | Awkward middle ground; T&Cs placement unclear. | |

**User's choice:** At step 3 confirm submit
**Notes:** Recommended. Clean DB trade-off accepted.

---

### Q3: When should we check 'email already in use'?

| Option | Description | Selected |
|--------|-------------|----------|
| On step 1 → step 2 transition | Pre-validate uniqueness in 'Continue' click on step 1. Surface enumeration-safe error inline before user invests in steps 2-3. | ✓ |
| Only on step 3 final submit | Single call at end. Risk: user fills whole wizard, bounces at the end. | |
| On step 1 AND step 3 | Belt-and-suspenders. Two server roundtrips. | |

**User's choice:** On step 1 → step 2 transition
**Notes:** Recommended. Note: register flow leaks email existence by design (UI-SPEC error table); login + forgot remain enumeration-safe.

---

## Artist/contributor request flow

### Q1: Where do artist/contributor requests get stored?

| Option | Description | Selected |
|--------|-------------|----------|
| New `artistApplication` table | Drizzle table: id, brand, name, email, bio, portfolioUrl, focusTags (jsonb), status, timestamps, reviewedBy, notes. Powers the queue. | ✓ |
| Reuse `user` table with status='pending_artist' | Adds column to user. Mixes auth users with applicants. Hard to clean rejected rows. | |
| Email-to-admin only (no DB) | Doesn't satisfy 'admin review queue' criterion. | |

**User's choice:** New `artistApplication` table
**Notes:** Recommended. Migration committed in this phase.

---

### Q2: How do per-brand fields differ on the request form?

| Option | Description | Selected |
|--------|-------------|----------|
| Same form, brand stored in column | Same fields both brands; brand auto-set from host. Tag list switches Studios=genres / Tech=focus-areas. One admin queue, filterable. | ✓ |
| Two distinct forms with shared core | Different fields per brand. Two admin queues. Higher fidelity, double the work. | |
| Generic form (no brand-specific fields) | Lowest signal; forces back-and-forth. | |

**User's choice:** Same form, brand stored in a column
**Notes:** Recommended. focusTags jsonb holds both label sets.

---

### Q3: What does the admin review surface include in this phase?

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated `/admin/applications` page | List + detail drawer + Approve / Reject / Request more info. New email notification to admin on each submission. | ✓ |
| List page + inline approve buttons | No detail drawer. Bio/portfolio in expandable accordion. Lighter. | |
| Stub-only: admin email + manual invite via /admin/users | Minimal admin surface. Doesn't strictly match 'admin review queue'. | |

**User's choice:** Dedicated `/admin/applications` page
**Notes:** Recommended. Direct-fire approve with toast-undo (recommendation, planner may modal).

---

### Q4: On Approve, how is the invite delivered?

| Option | Description | Selected |
|--------|-------------|----------|
| Better Auth password-reset-style magic link | Create user (emailVerified=true, role=artist|contributor), send 'set your password' email with tokenized link to /reset-password. Reuses existing reset infrastructure. | ✓ |
| Better Auth admin invite plugin | One-time `/accept-invite/[token]` route. Account created at link-acceptance. More secure but new route + plugin. | |
| Admin-set password + email credentials | Old-school. Less secure. | |

**User's choice:** Better Auth password-reset-style magic link
**Notes:** Recommended. New email template `artist-approval-invite.tsx`.

---

## Social login — scope + behavior

### Q1: Which providers must be functional end-to-end at v4.0 launch?

| Option | Description | Selected |
|--------|-------------|----------|
| All 3 wired, Google live on launch | Google: full E2E both brand hosts. Meta + GitHub: code wired, env stubs in place; buttons hide if env missing. Pattern documented. | ✓ |
| All 3 functional on day 1 | Highest fidelity. Blocks shipping on Meta dev-app review (slow). | |
| Google only; Meta + GitHub deferred | Doesn't match the UI-SPEC 3-provider row. | |

**User's choice:** All 3 wired, Google live on launch
**Notes:** Recommended. Buttons hide cleanly when env vars are absent.

---

### Q2: What happens when social login arrives at an email that already has an email+password account?

| Option | Description | Selected |
|--------|-------------|----------|
| Force sign-in-with-existing, link in settings later | Detect collision → enumeration-safe error directing to existing-method sign-in. Linked-accounts UI deferred. | ✓ |
| Auto-link if provider email is verified | Better Auth `accountLinking.trustedProviders`. Trusts provider claim. Per-provider trust list needed. | |
| Always create separate account | Causes duplicates. Don't recommend. | |

**User's choice:** Force sign-in-with-existing
**Notes:** Recommended. `accountLinking.enabled: false` for v4.0.

---

### Q3: How do social-login signups handle T&Cs and newsletter opt-in (the wizard skips entirely)?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline T&Cs notice under social row; newsletter off by default | Microcopy: 'By continuing, you agree to the Terms and Privacy Policy.' Newsletter opt-in defaults FALSE; user toggles in /dashboard/settings later. | ✓ |
| Mandatory consent screen after social callback | Explicit consent record. Adds friction step that breaks OAuth-feels-instant promise. | |
| Skip both — OAuth implies acceptance | Lowest friction. Risky for EU/CA jurisdictions. | |

**User's choice:** Inline T&Cs notice under social row; newsletter off by default
**Notes:** Recommended. Standard consumer pattern.

---

## Email-verify gating + existing-user migration

### Q1: What should happen when an unverified email/password user tries to log in?

| Option | Description | Selected |
|--------|-------------|----------|
| Soft gate — log in, redirect to /verify-email | Session created; layout/middleware redirects all routes EXCEPT /verify-email until emailVerified=true. UX-friendly path forward. | ✓ |
| Hard gate at login submit | Throw on signIn if !emailVerified. Cleaner conceptually but no path forward without leaving /login. | |
| Allow login + gate sensitive routes only | Most lenient. Easy to miss a sensitive route. | |

**User's choice:** Soft gate
**Notes:** Recommended. /verify-email page itself, /api/auth/*, and sign-out are unguarded.

---

### Q2: How do existing users (registered before Phase 26 ships) behave on next login?

| Option | Description | Selected |
|--------|-------------|----------|
| Grandfather — set emailVerified=true for all existing users | One-shot SQL update at deploy time. New signups face soft gate. | ✓ |
| Force re-verify on next login | Most secure. Breaks every dev/test/admin account on day one. | |
| Per-role: admin grandfathered, regular force-verify | Compromise but adds complexity. Few non-admin existing users anyway. | |

**User's choice:** Grandfather
**Notes:** Recommended. Drizzle migration with re-run guard.

---

## Brand attribute placement

### Q1: Where does `data-brand` get set for the auth pages?

| Option | Description | Selected |
|--------|-------------|----------|
| Auth-route-group server layout reads host | `(auth)/layout.tsx` becomes server component, reads host via next/headers, sets `<div data-brand={brand}>` wrapper. Default 'studios'; tech hostnames → 'tech'. | ✓ |
| AuthShell component reads host as a prop | Each auth page reads host and passes brand prop. Per-page boilerplate. | |
| Root layout sets data-brand site-wide | Cleanest but larger refactor; touches non-auth routes. | |

**User's choice:** Auth-route-group server layout reads host
**Notes:** Recommended. Extract shared util `src/lib/brand.ts` so middleware + layout don't duplicate hostname sets.

---

## Claude's Discretion

Areas where the user deferred to Claude (or where UI-SPEC already locked the answer):
- Exact Drizzle migration SQL shape — patterns from `src/db/schema.ts`.
- Exact server-action shape for wizard pre-check, application submit, approve/reject — patterns from `src/actions/`.
- Decorative monochrome SVG art for brand-side panel.
- Loading skeletons during OAuth redirects.
- Exact admin-page row UX (sortable columns, filter chips).
- Whether Approve fires direct or shows confirm modal (recommended: direct + toast-undo).
- `?brand=tech` QA override (recommended: gated to non-prod).

## Deferred Ideas

Captured for future phases:
- Linked-accounts settings UI (post-launch polish phase)
- Public artist self-serve signup (v5.0)
- Twilio SMS auth (no v4.0 commitment)
- Admin self-registration (never, by design)
- 2FA / MFA (dedicated phase post-launch)
- Full email-template brand-aware redesign (backlog 999.5)
- Wizard step 2 expansion — brand interest, genres, services (post-launch onboarding-personalization phase)
- Bulk admin actions on `/admin/applications`
- Inbound email automation for `info_requested` replies
