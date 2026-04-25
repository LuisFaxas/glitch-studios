# Phase 26: Brand-Aware Auth UI Redesign - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace generic email+password auth surfaces (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`) with brand-aware, production-grade flows themed by host (`glitchstudios.io` vs `glitchtech.io`). Split registration by role: **customer wizard** (3 steps, atomic creation) and **artist/contributor request** (application form → admin review queue → invite email on approval). Add social login (Google + Meta + GitHub) with Google live at launch.

**In scope:** the five auth surfaces; the artist-application data model + admin review page (`/admin/applications`); brand attribute on the `(auth)` route group; email-verification soft gate; one-shot grandfather migration for pre-existing users.

**Out of scope (locked by roadmap + UI-SPEC):** Twilio SMS, public artist self-serve signup (v5.0), admin self-registration, 2FA/MFA, `/dashboard/*` polish, email-template visual redesign (uses Phase 24 templates as-is), "Linked accounts" settings UI (deferred polish phase).

</domain>

<decisions>
## Implementation Decisions

### Requirements (AUTH-*)

The following REQ-IDs are introduced by this phase. Every plan MUST tag at least one.

| ID | Requirement |
|----|-------------|
| AUTH-01 | All five auth surfaces render distinct Studios vs GlitchTech theming based on host (logo, palette accent hook, typography, hero treatment, copy variants from UI-SPEC). |
| AUTH-02 | Desktop split-layout (form column right, brand-side panel left, ≥1024px) + mobile stacked layout (compact brand header + form, <1024px) ship per UI-SPEC §Spacing/§Breakpoints. |
| AUTH-03 | `/login` surface rebuilt: social row above email, enumeration-safe error copy (wrong-password and unknown-email both "That email and password don't match"), branded. |
| AUTH-04 | Customer register wizard at `/register?role=customer` — 3 steps (identity → preferences → confirm). Step indicator sticky. Back button on steps 2-3. Step query param for deep-link + browser-back. |
| AUTH-05 | Account creation is **atomic at step 3 submit**. Steps 1-2 hold data in client state only. Verification email fires at step 3. T&Cs checkbox on step 3. |
| AUTH-06 | **Step 1 → Step 2 transition pre-validates email uniqueness** via server action. On collision, surface enumeration-safe error copy "That email is already in use. Sign in, or reset your password." inline before user invests in steps 2-3. (Register flow leaks email existence by design — UI-SPEC error table; this is consistent with the broader pattern. Login + forgot-password remain enumeration-safe.) |
| AUTH-07 | Step 2 (Preferences) holds **only the newsletter opt-in checkbox** ("Send me new beat drops and studio news."). Skip-friendly. Future preference fields (brand interest, genres, services) are deferred to /dashboard/settings. |
| AUTH-08 | Step 3 (Confirm) shows the captured email + name read-only, the T&Cs checkbox ("I agree to the Terms of Service and Privacy Policy."), and the primary "Create account" CTA. T&Cs is required to submit. |
| AUTH-09 | Drop the existing **confirm-password** field from `/register`. Use the `<PasswordField>` show/hide toggle so the user can self-verify their typed value. (UI-SPEC §Interaction.) |
| AUTH-10 | `/register` (no role param) shows two CTA tiles side-by-side on desktop, stacked on mobile: **Register as a customer** (Studios) / **Register as a customer** (Tech) and **Request artist access** (Studios) / **Request contributor access** (Tech). Click → role-scoped subroute. |
| AUTH-11 | `/register?role=artist` renders `<ArtistRequestForm>` — single page (not a wizard). On submit, form swaps to on-page confirmation copy ("Request received. Our team reviews every application…"); no redirect. |
| AUTH-12 | New Drizzle table `artistApplication` introduced via migration: columns `id` (uuid pk), `brand` ('studios' \| 'tech'), `name`, `email`, `bio` (text), `portfolioUrl` (nullable), `focusTags` (jsonb array), `status` ('pending' \| 'approved' \| 'rejected' \| 'info_requested'), `submittedAt`, `reviewedAt` (nullable), `reviewedBy` (fk → user, nullable), `reviewerNote` (text, nullable). |
| AUTH-13 | Artist request form: same field shape on both brands; `brand` auto-set from host. Studios renders **genre tags** multi-select (Hip-hop, R&B, Trap, Pop, Electronic, Lo-fi, Drill, Other). Tech renders **focus areas** multi-select (GPUs, CPUs, displays, peripherals, audio gear, full-system). Stored in `focusTags` jsonb. |
| AUTH-14 | New admin page `/admin/applications`: list of applications (newest first) with brand badge / name / email / submitted date / focus tags. Click row → detail drawer with bio + portfolio link + Approve / Reject / Request more info actions. |
| AUTH-15 | **Approve flow:** creates a `user` row with `emailVerified=true` (admin trust the reviewed email), role `'artist'` (Studios) or `'contributor'` (Tech). Sets `artistApplication.status='approved'`, `reviewedBy`, `reviewedAt`. Triggers Better Auth password-reset email (subject: "You're approved — set your password.") with a tokenized link to `/reset-password`. User lands there, picks a password, signs in to `/dashboard`. |
| AUTH-16 | **Reject flow:** sets `status='rejected'`, `reviewerNote` (optional internal-only note). No notification email to the applicant in this phase (silent rejection — UX choice; revisit in v5.0). |
| AUTH-17 | **Request-more-info flow:** sets `status='info_requested'`. Sends an admin-composed email back to the applicant via Resend (free-form body in the admin form). Status returns to `'pending'` upon applicant reply (manual triage; no inbound automation in this phase). |
| AUTH-18 | New admin notification email fires on every artist-application submission (to `office@cprremodelinggroup.com` analog → use the project's `ADMIN_NOTIFICATION_EMAIL` env if set, fallback to a hard-coded studio inbox). Subject: "New {brand} application: {name}". Body links to `/admin/applications`. |
| AUTH-19 | New email template `artist-approval-invite.tsx` under `src/lib/email/` — branded "You're approved" copy with the password-reset link. Reuses Phase 24 React Email layout. |
| AUTH-20 | Social login row: 3 OAuth buttons (Google / Meta / GitHub), equal weight, identical surface treatment (no provider favoritism). On `/login` AND `/register?role=customer`. Position: ABOVE the email/password fields. |
| AUTH-21 | Social provider scope at v4.0 launch: **Google functional end-to-end on both brand hosts** (OAuth app, redirect URIs, env secrets, Better Auth `socialProviders.google` plugin wired). Meta + GitHub: provider plugins wired in code, env-var stubs in place; **buttons hide entirely if env vars are missing** (no "coming soon" labels). Pattern is documented in code comments so adding more is plug-and-play. |
| AUTH-22 | Better Auth `socialProviders` config block lives in `src/lib/auth.ts`. Redirect callback path `/api/auth/callback/{provider}`. Each provider's secrets read from env: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `META_CLIENT_ID` / `META_CLIENT_SECRET`, `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`. |
| AUTH-23 | Account-linking conflict (social login email matches existing email+password user): Better Auth `accountLinking.enabled: false` for v4.0. Surface copy "An account with this email already exists with a different sign-in method. Sign in with that method, then link {provider} from settings." (UI-SPEC error table). User signs in via password; cross-method linking deferred. |
| AUTH-24 | Social-signup T&Cs + newsletter handling: inline microcopy under social row reads "By continuing, you agree to the Terms and Privacy Policy." (clickable links). No mid-flow consent screen. Newsletter defaults to FALSE for OAuth signups; user toggles in `/dashboard/settings` later. |
| AUTH-25 | Brand mark SVGs for OAuth buttons added to `src/components/icons/social-icons.tsx`: `GoogleIcon`, `MetaIcon`, `GitHubIcon`. Hand-coded per each vendor's official brand guidelines (UI-SPEC §Design System). |
| AUTH-26 | Email-verification gate: **soft gate at the layout level**. Authenticated users with `emailVerified=false` are redirected from any page EXCEPT `/verify-email`, `/api/auth/*`, and the sign-out endpoint to `/verify-email`. Implementation: page-level guard in shared layouts (or middleware augmentation if simpler). Once `emailVerified=true`, normal flow resumes. |
| AUTH-27 | `/verify-email` route (new): one route, three states resolved server-side by token validity — **pending** (no token, "Check your inbox", with "Resend verification email" CTA + email shown), **success** (valid token consumed, "Email verified" + "Continue to dashboard" CTA), **expired** ("Link expired", "Send a new link" CTA). All states share the AuthShell — only heading + body + CTA swap. |
| AUTH-28 | Grandfather migration: one-shot SQL update at deploy time sets `user.emailVerified = true` for every `user` row created BEFORE the Phase 26 deploy timestamp. Existing test/admin/founder accounts continue to log in normally. NEW signups (post-deploy) face the soft gate. Migration is committed as a Drizzle migration file with a guard against re-running. |
| AUTH-29 | Branded `forgot-password` + `reset-password` end-to-end pass: form submit → Resend-delivered email (Phase 24 template) → tokenized link → `/reset-password` accepts new password → user redirected to `/login` with success toast. UI-SPEC copy in error table applies. No dead ends. |
| AUTH-30 | Brand attribute placement: `src/app/(auth)/layout.tsx` becomes a **server component** that reads `host` from `next/headers` and renders `<div data-brand={brand}>` as the AuthShell wrapper. Default `'studios'` for unknown hosts (localhost, codebox.local, Vercel preview URLs). `glitchtech.io` / `www.glitchtech.io` → `'tech'`. Mirrors middleware fall-through logic. |
| AUTH-31 | All page H1s wrap in `<HoverGlitchHeading>` per site-wide rule. Glitch on hover only; never auto-runs. Reduced-motion honored. |
| AUTH-32 | `pnpm tsc --noEmit` and `pnpm lint` pass. Manual Playwright pass: both brand hosts × 5 auth surfaces × at least one social provider (Google) end-to-end. |

### Customer Wizard (AUTH-04..AUTH-09)
- **D-01:** 3 steps with sticky progress indicator. URL `?step=1|2|3` for browser-back support.
- **D-02:** Account creation is atomic at step 3. Steps 1-2 are client state. (Tradeoff: step-3 dropoff loses the lead, but DB stays clean.)
- **D-03:** Server pre-validation on step 1 → step 2 transition for email uniqueness. Enumeration-safe error copy.
- **D-04:** Step 2 = newsletter checkbox only. Brand-interest, genres, services deferred.
- **D-05:** Drop confirm-password field; show/hide toggle is sufficient.
- **D-06:** Verification email fires at step 3 success (Better Auth `emailVerification.sendOnSignUp: true` already wired).

### Artist/Contributor Request (AUTH-10..AUTH-19)
- **D-07:** Single-page form, on-page success state (no redirect). UI-SPEC §Interaction.
- **D-08:** New `artistApplication` table. Brand auto-set from host.
- **D-09:** Same form structure on both brands; tag list switches Studios=genres / Tech=focus-areas.
- **D-10:** `/admin/applications` page with list + detail drawer + Approve / Reject / Request-more-info actions.
- **D-11:** Approve = create `user` (emailVerified=true, role='artist' or 'contributor') + send password-reset-style invite via existing Resend pipeline. New email template `artist-approval-invite.tsx`.
- **D-12:** Reject is silent (no email to applicant). Reviewer note is internal-only.
- **D-13:** New admin notification email per submission.

### Social Login (AUTH-20..AUTH-25)
- **D-14:** All 3 providers (Google, Meta, GitHub) wired in code. Google live at launch on both brand hosts. Meta + GitHub buttons hide if env vars are missing.
- **D-15:** Account-linking disabled in Better Auth (`accountLinking.enabled: false`). Conflict shows enumeration-safe copy directing user to existing-method sign-in.
- **D-16:** T&Cs accepted via inline microcopy under social row. Newsletter defaults to FALSE for OAuth signups.
- **D-17:** New OAuth-mark SVGs added to existing `src/components/icons/social-icons.tsx`.

### Email Verification (AUTH-26..AUTH-28)
- **D-18:** Soft gate at layout level — authenticated unverified users redirected to `/verify-email` from all routes except `/verify-email` itself, `/api/auth/*`, and sign-out.
- **D-19:** `/verify-email` route renders 3 states (pending / success / expired) from a single page, server-resolved by token validity.
- **D-20:** Grandfather migration sets `emailVerified=true` for all pre-deploy users via Drizzle migration.

### Brand Attribution (AUTH-30)
- **D-21:** `(auth)/layout.tsx` becomes a server component, reads `host` via `next/headers`, renders `data-brand` wrapper. Default `'studios'`. Tech hostnames → `'tech'`. Mirrors `src/middleware.ts` host detection logic.

### Forgot/Reset Polish (AUTH-29)
- **D-22:** Existing `forgot-password` and `reset-password` pages are extended (not rebuilt) to use the new AuthShell + branded copy + enumeration-safe success message. Better Auth `requestPasswordReset` is already wired correctly (Phase 23-06 stub + Phase 24 email).

### Claude's Discretion
- Exact Drizzle migration SQL (column types, default values, indices) — planner picks based on existing patterns in `src/db/schema.ts`.
- Exact server-action shape for the wizard email pre-check, application submit, approve/reject — planner picks based on `src/actions/` patterns.
- Decorative monochrome SVG art for the brand-side panel (Studios = vinyl/waveform; Tech = circuit/benchmark-grid). UI-SPEC describes the motif; planner/executor decides exact paths.
- Loading skeletons during OAuth redirects.
- Exact admin-page row UX (sortable columns, filter chips) — UI-SPEC §Spacing/Typography rules apply but layout details are planner's.
- Whether the Approve action shows a confirmation modal or fires directly. (Recommendation: direct-fire with a 5-second toast undo, but planner can choose either.)
- Whether `/register?role=artist` accepts a `?brand=tech` override for QA on a non-tech host. (Recommendation: allow it for QA only, gated to `NODE_ENV !== 'production'`.)

### Folded Todos
None — no pending todos matched this phase's scope at discuss time. (REQ-IDs were generated fresh from this discussion per ROADMAP.md note.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI Contract (already approved)
- `.planning/phases/26-brand-aware-auth-ui-redesign/26-UI-SPEC.md` — Locked visual + interaction contracts. Planner MUST honor copy table (§Copywriting Contract), color reservations (§Color, accent off-white limited to 8 listed uses), spacing scale (§Spacing), typography roles (§Typography 4 sizes / 2 weights), interaction rules (§Interaction & State Contract), and the new-component list (§Design System).

### Auth library & session shape
- `src/lib/auth.ts` — Better Auth config. `emailAndPassword.enabled: true`, `emailVerification.sendOnSignUp: true`, `emailVerification.autoSignInAfterVerification: true`, admin plugin with `adminRoles: ["owner", "admin"]`. **Phase 26 adds `socialProviders` block + `accountLinking.enabled: false`.**
- `src/lib/auth-client.ts` — Client exports: `signIn`, `signUp`, `signOut`, `useSession`, `authClient`, `requestPasswordReset`. Phase 26 will use `signIn.social({provider})` for OAuth.
- `src/db/schema.ts` — `user`, `session`, `account` tables. Phase 26 adds the `artistApplication` table here.

### Existing auth pages (rebuild against AuthShell — current files are scaffolds)
- `src/app/(auth)/login/page.tsx` (129 lines) — current login. Replace with AuthShell + SocialAuthRow + EnumSafeFormError.
- `src/app/(auth)/register/page.tsx` (177 lines) — current register with confirm-password. Becomes the role-select landing; wizard moves to `/register/customer/[step]/page.tsx` (or query-param-driven, planner's call); artist form moves to `/register/artist/page.tsx`.
- `src/app/(auth)/forgot-password/page.tsx` (113 lines) — extend with AuthShell wrapper + branded copy.
- `src/app/(auth)/reset-password/page.tsx` (172 lines) — extend with AuthShell wrapper + branded copy + expired-token Alert state.
- `src/app/(auth)/layout.tsx` (11 lines) — **becomes server component** to read host and set `data-brand`.

### Brand routing (mirror this fall-through logic)
- `src/middleware.ts` — `STUDIOS_HOSTS`, `TECH_HOSTS` sets. `SHARED_AUTH_PATHS` array (already includes the 5 surfaces). Auth pages skip the `/tech/*` rewrite. New `(auth)/layout.tsx` must use the SAME hostname-to-brand mapping; do not duplicate logic — extract a shared util at `src/lib/brand.ts`.
- `src/app/(tech)/layout.tsx` — current location of `data-brand="tech"`. Reference for the attribute pattern.

### Email pipeline (Phase 24, already wired)
- `src/lib/email/account-verification.tsx` — verification email template, used at signUp.
- `src/lib/email/password-reset.tsx` — reset email template; reused for the artist-approval invite (with branded subject + intro paragraph swap).
- **NEW:** `src/lib/email/artist-approval-invite.tsx` — to be added in this phase.

### Admin (extend, don't rebuild)
- `src/app/admin/layout.tsx` — admin layout + auth gate.
- `src/middleware.ts` lines 35-43 — admin gate. `/admin/applications` inherits this gate automatically.
- `src/app/admin/users/` — pattern reference for the new `/admin/applications` page (table, drawer, server actions).

### Existing nav surfaces (do NOT modify in Phase 26 unless touching auth flows)
- `src/components/layout/tile-nav.tsx`, `src/components/layout/mobile-nav-overlay.tsx` — already reflect Phase 8 logged-in state. No changes needed unless we add a "Linked accounts" entry (deferred).

### Prior phase context (decisions still in force)
- `.planning/phases/08-auth-navigation/08-CONTEXT.md` — D-01 (role redirect), D-09 (sign-out behavior), D-10 (sign-out destination), D-11 (dashboard scope). Phase 26 does not change these.
- `.planning/phases/24-email-delivery-end-to-end/24-CONTEXT.md` — email infrastructure decisions. Phase 26 reuses Resend + React Email layout.
- `.planning/phases/23-debug-broken-pages-missing-routes/23-CONTEXT.md` — `forgot-password`/`reset-password` route stubs landed here.

### Project + requirements
- `.planning/REQUIREMENTS.md` — AUTH-* REQ-IDs are introduced in this phase (per ROADMAP note: "REQ-IDs allocated as issues are captured"). REQUIREMENTS.md should be updated alongside this phase to reflect AUTH-01..32.
- `.planning/ROADMAP.md` — Phase 26 goal + 8 success criteria.
- `CLAUDE.md` (project root) — tech stack constraints (pnpm, Better Auth, Drizzle, shadcn, Resend).
- `.planning/PROJECT.md` — vision, principles. Brand name `GlitchTech` (NOT `GlitchTek`) is load-bearing per memory.

### Site-wide design rules
- `src/components/glitch-heading.tsx` (or equivalent) — `<HoverGlitchHeading>` source. All H1s in this phase MUST use it; never auto-run glitch on headings (site-wide rule, in memory).
- `src/components/ui/*` — installed shadcn primitives (Button, Input, Label, Checkbox, Separator, Progress, Alert, InputGroup). UI-SPEC §Design System lists every primitive used.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`<GlitchLogo size="md">`** — `src/components/layout/glitch-logo.tsx`. Already used on every auth page; AuthShell + BrandSidePanel both use it.
- **shadcn primitives** (Button, Input, Label, Checkbox, Separator, Progress, Alert, InputGroup, Sonner) — all installed; no new shadcn additions required.
- **`useSession`, `signIn`, `signUp`, `signOut`, `requestPasswordReset`** — Better Auth client hooks already exported from `src/lib/auth-client.ts`. Add `signIn.social({provider})` for OAuth (Better Auth API).
- **Phase 24 email templates** — `src/lib/email/{account-verification, password-reset}.tsx`. New `artist-approval-invite.tsx` follows same React Email layout pattern.
- **`src/components/icons/social-icons.tsx`** — already has Instagram/YouTube/SoundCloud/X/TikTok. Add `GoogleIcon`, `MetaIcon`, `GitHubIcon` here.
- **Drizzle migration tooling** — `drizzle-kit generate` flow already exercised in prior phases; `artistApplication` table follows same migration pattern.

### Established Patterns
- **Server reads of session:** `await auth.api.getSession({ headers: await headers() })` pattern (used in `/admin/*`). Apply on `/admin/applications`.
- **Server actions for form submits:** existing pattern in `src/actions/`. Wizard email-uniqueness pre-check + step-3 atomic create + artist application submit + admin approve/reject all use server actions.
- **Toast feedback:** Sonner via `<Toaster>` in root layout; use `toast.success(...)` / `toast.error(...)` directly.
- **Mono uppercase headings:** `<GlitchHeading>` / `<HoverGlitchHeading>` — every H1 in this phase wraps it. Hover-only glitch (site-wide rule).
- **Enumeration-safe error copy on login + forgot:** existing `/forgot-password` already returns the same toast on success and unknown-email; preserve. Login currently shows "Invalid email or password" — replace with the UI-SPEC enumeration-safe copy.
- **Brand-host detection:** `src/middleware.ts` defines `STUDIOS_HOSTS` / `TECH_HOSTS`. Extract to `src/lib/brand.ts` so the `(auth)/layout.tsx` server component can reuse without duplicating sets.

### Integration Points
- **`(auth)/layout.tsx`** — convert to server component; reads host; sets `data-brand`; wraps children in AuthShell. New file: `src/lib/brand.ts` exports `getBrandFromHost(host: string): 'studios' | 'tech'`.
- **`src/lib/auth.ts`** — add `socialProviders.{google, meta, github}` block conditionally on env-var presence; add `accountLinking: { enabled: false }`; add the artist-approval invite trigger logic (or wrap `requestPasswordReset` in an admin-callable server action).
- **`src/db/schema.ts`** — add `artistApplication` table; add `artistApplicationStatusEnum` (pgEnum).
- **`src/middleware.ts`** — augment to include the verification soft gate, OR add a layout-level guard component (planner's call — middleware path is leaner but session decoding in middleware is heavier). Suggested: layout-level guard in `src/app/(public)/layout.tsx` + `src/app/dashboard/layout.tsx` + `src/app/admin/layout.tsx` (authenticated-only surfaces). Each guard reads session, checks `emailVerified`, redirects to `/verify-email` if false. `/verify-email` itself + `/api/auth/*` are NOT guarded.
- **`/admin/applications`** — new route; mirrors `/admin/users` layout pattern. Uses Drizzle queries with status filter + ordering.
- **`/api/auth/[...all]/route.ts`** — Better Auth handler; no changes (it auto-handles social provider callbacks once `socialProviders` is configured in `auth.ts`).

</code_context>

<specifics>
## Specific Ideas

- **GlitchTech name spelling:** Tech sub-brand is **GlitchTech** (matches `glitchtech.io`). Earlier planning docs spelled it "GlitchTek" — that's stale. Every auth surface, email subject, button label, and admin-page badge MUST render "GlitchTech" when brand is tech. Do NOT propagate "GlitchTek" anywhere in this phase.
- **`localhost` / Vercel preview / `codebox.local`** all default to `studios` (mirrors middleware fall-through). Tech can be QA'd locally by adding `127.0.0.1 glitchtech.local` to `/etc/hosts` + Caddyfile entry — out of scope for this phase, but a `?brand=tech` query override (gated to non-prod) is allowed.
- **Approve action UX:** Recommended direct-fire with 5-second toast-undo via Sonner (`toast.success("Application approved", { action: { label: "Undo", onClick: revert } })`). Reduces friction for the studio admin (non-technical daily user per CLAUDE.md operability constraint). Planner may opt for a confirm modal if simpler.
- **Newsletter opt-in storage:** Lives on `user.newsletterOptIn` (new boolean column on `user` table) OR a separate `userPreferences` table. Recommended new column on `user` (only one preference; over-engineering otherwise). Planner picks.
- **Future "Linked accounts" UI** — when account-linking is later enabled (deferred phase), this is where a user goes from /login error directing them. Out of scope for v4.0; mentioned only so planner doesn't accidentally architect against it.
- **Phase 22 audit C.1 + C.2** — original audit findings that derived this phase's scope. The audit captured (C.1) auth UI looks like a generic scaffold, (C.2) no social login, no brand awareness, no role-split signup. All addressed by this phase.

</specifics>

<deferred>
## Deferred Ideas

### Linked-accounts settings UI
- Surface in `/dashboard/settings` to attach Google/Meta/GitHub to an existing email+password account (and vice versa).
- Requires Better Auth `accountLinking.enabled: true` flip + per-provider trust list.
- **Belongs in:** dedicated "Account Settings" phase (post-launch polish).

### Public artist self-serve signup
- Removes the admin-review queue gate; artist applications auto-approve.
- **Belongs in:** v5.0 (explicitly deferred per ROADMAP).

### Twilio SMS auth
- 2FA via SMS or SMS magic-link.
- **Belongs in:** future MFA phase if/when needed (no v4.0 commitment).

### Admin self-registration
- Admins are always provisioned by other admins. No public admin-register UI.
- **Belongs in:** never (by design).

### 2FA / MFA
- TOTP, WebAuthn/passkeys, SMS.
- **Belongs in:** dedicated MFA phase post-launch.

### Email-template visual redesign
- Phase 26 reuses Phase 24's React Email layout AS-IS. Visual polish (full brand-aware HTML email with hero imagery, brand-side art) is deferred.
- **Belongs in:** backlog phase 999.5 (Resend email integration polish).

### Wizard step 2 expansion
- Brand-interest checkboxes (Studios/Tech/both), genre tags, service interests captured here at signup time. Currently lives in /dashboard/settings only.
- **Belongs in:** future "Onboarding personalization" phase (post-launch behavior data signals what's worth asking).

### Bulk admin actions on `/admin/applications`
- Multi-select rows + "Approve all" / "Reject all" — useful at scale.
- **Belongs in:** later admin polish when application volume justifies it.

### Inbound email automation for `info_requested` replies
- Currently manual triage; admin reads applicant reply in their inbox and updates the row.
- **Belongs in:** later admin automation phase (probably with Postmark inbound or similar).

### Reviewed Todos (not folded)
None — no pending todos matched this phase at discuss time.

</deferred>

---

*Phase: 26-brand-aware-auth-ui-redesign*
*Context gathered: 2026-04-24*
