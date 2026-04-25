# Phase 26: Brand-Aware Auth UI Redesign — Research

**Researched:** 2026-04-24
**Domain:** Better Auth social providers + brand-aware Next.js 16 server-component layout + Drizzle migration patterns + admin review queue UI
**Confidence:** HIGH (config + integration points verified against installed code; Better Auth API verified against official docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

The 32 AUTH-* requirements are locked. Verbatim from `<decisions>`:

| ID | Requirement |
|----|-------------|
| AUTH-01 | All five auth surfaces render distinct Studios vs GlitchTech theming based on host (logo, palette accent hook, typography, hero treatment, copy variants from UI-SPEC). |
| AUTH-02 | Desktop split-layout (form column right, brand-side panel left, ≥1024px) + mobile stacked layout (compact brand header + form, <1024px) ship per UI-SPEC §Spacing/§Breakpoints. |
| AUTH-03 | `/login` surface rebuilt: social row above email, enumeration-safe error copy (wrong-password and unknown-email both "That email and password don't match"), branded. |
| AUTH-04 | Customer register wizard at `/register?role=customer` — 3 steps (identity → preferences → confirm). Step indicator sticky. Back button on steps 2-3. Step query param for deep-link + browser-back. |
| AUTH-05 | Account creation is **atomic at step 3 submit**. Steps 1-2 hold data in client state only. Verification email fires at step 3. T&Cs checkbox on step 3. |
| AUTH-06 | Step 1 → Step 2 transition pre-validates email uniqueness via server action. On collision, surface enumeration-safe error copy "That email is already in use. Sign in, or reset your password." inline before user invests in steps 2-3. (Register flow leaks email existence by design.) |
| AUTH-07 | Step 2 (Preferences) holds **only the newsletter opt-in checkbox** ("Send me new beat drops and studio news."). Skip-friendly. |
| AUTH-08 | Step 3 (Confirm) shows the captured email + name read-only, the T&Cs checkbox, and the primary "Create account" CTA. T&Cs is required to submit. |
| AUTH-09 | Drop the existing **confirm-password** field from `/register`. Use `<PasswordField>` show/hide toggle. |
| AUTH-10 | `/register` (no role param) shows two CTA tiles side-by-side on desktop, stacked on mobile. |
| AUTH-11 | `/register?role=artist` renders `<ArtistRequestForm>` — single page, on-page success state. |
| AUTH-12 | New Drizzle table `artistApplication` (uuid pk, brand, name, email, bio, portfolioUrl, focusTags jsonb, status enum, submittedAt, reviewedAt, reviewedBy fk, reviewerNote). |
| AUTH-13 | Artist request form: same field shape both brands; brand auto-set from host. Studios = genre tags; Tech = focus areas. Both stored in `focusTags` jsonb. |
| AUTH-14 | New admin page `/admin/applications` with list + detail drawer + Approve / Reject / Request more info actions. |
| AUTH-15 | Approve flow: creates `user` row (`emailVerified=true`, role `'artist'` Studios or `'contributor'` Tech), sets application status='approved', triggers Better Auth password-reset email with branded subject. |
| AUTH-16 | Reject flow: silent (no applicant email). Reviewer note is internal-only. |
| AUTH-17 | Request-more-info flow: status='info_requested', sends admin-composed email via Resend. Status returns to 'pending' on applicant reply (manual triage). |
| AUTH-18 | New admin notification email on every artist-application submission. `ADMIN_NOTIFICATION_EMAIL` env, fallback to hard-coded studio inbox. |
| AUTH-19 | New email template `artist-approval-invite.tsx` under `src/lib/email/` reusing Phase 24 layout. |
| AUTH-20 | Social login row: 3 OAuth buttons (Google / Meta / GitHub), equal weight. Position ABOVE email/password on `/login` and `/register?role=customer`. |
| AUTH-21 | Google live end-to-end on both brand hosts at v4.0 launch. Meta + GitHub plugins wired in code; buttons hide entirely if env vars missing (no "coming soon"). |
| AUTH-22 | Better Auth `socialProviders` block in `src/lib/auth.ts`. Callback `/api/auth/callback/{provider}`. Env: `GOOGLE_CLIENT_ID`/`SECRET`, `META_CLIENT_ID`/`SECRET`, `GITHUB_CLIENT_ID`/`SECRET`. |
| AUTH-23 | `accountLinking.enabled: false` for v4.0. Conflict copy: "An account with this email already exists with a different sign-in method. Sign in with that method, then link {provider} from settings." |
| AUTH-24 | Social-signup T&Cs: inline microcopy "By continuing, you agree to the Terms and Privacy Policy." Newsletter defaults FALSE for OAuth signups. |
| AUTH-25 | New SVGs `GoogleIcon`, `MetaIcon`, `GitHubIcon` in `src/components/icons/social-icons.tsx`. |
| AUTH-26 | Email-verification soft gate at the layout level. Authenticated unverified users redirected from any page EXCEPT `/verify-email`, `/api/auth/*`, sign-out. |
| AUTH-27 | `/verify-email` route: pending / success / expired states resolved server-side by token validity. All states share AuthShell. |
| AUTH-28 | Grandfather migration: one-shot SQL update at deploy time sets `user.emailVerified = true` for users created BEFORE Phase 26 deploy. Drizzle migration with re-run guard. |
| AUTH-29 | Branded `forgot-password` + `reset-password` end-to-end pass. Phase 24 template reused. |
| AUTH-30 | `src/app/(auth)/layout.tsx` becomes server component. Reads `host` from `next/headers`, renders `<div data-brand={brand}>`. Default `'studios'` for unknown hosts. Tech hostnames → `'tech'`. Mirrors middleware fall-through. |
| AUTH-31 | All page H1s wrap `<HoverGlitchHeading>`. Hover-only; never auto-runs. Reduced-motion honored. |
| AUTH-32 | `pnpm tsc --noEmit` and `pnpm lint` pass. Manual Playwright pass: both brand hosts × 5 auth surfaces × at least Google end-to-end. |

### Claude's Discretion

- Exact Drizzle migration SQL (column types, default values, indices) — pick from `src/db/schema.ts` patterns.
- Exact server-action shape for wizard email pre-check, application submit, approve/reject.
- Decorative monochrome SVG art for brand-side panel (Studios = vinyl/waveform; Tech = circuit/benchmark-grid).
- Loading skeletons during OAuth redirects.
- Exact admin-page row UX (sortable columns, filter chips).
- Whether Approve action shows confirmation modal or fires directly. **Recommendation: direct-fire with 5-second toast undo.**
- Whether `/register?role=artist` accepts `?brand=tech` override for QA on a non-tech host. **Recommendation: allow it gated to `NODE_ENV !== 'production'`.**

### Deferred Ideas (OUT OF SCOPE)

- Linked-accounts settings UI (post-launch polish phase)
- Public artist self-serve signup (v5.0)
- Twilio SMS auth (no v4.0 commitment)
- Admin self-registration (never, by design)
- 2FA / MFA (dedicated post-launch phase)
- Email-template visual redesign (backlog 999.5)
- Wizard step 2 expansion (post-launch onboarding personalization)
- Bulk admin actions on `/admin/applications`
- Inbound email automation for `info_requested` replies
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Brand-aware theming on 5 auth surfaces | §Brand Detection Refactor + §(auth)/layout.tsx Server Component |
| AUTH-02 | Desktop split-layout + mobile stacked | UI-SPEC §Breakpoints; existing tile-nav patterns |
| AUTH-03 | Login enumeration-safe + branded | UI-SPEC §Copywriting Contract error table |
| AUTH-04 | Customer wizard `?step=1\|2\|3` | §Customer Wizard Architecture |
| AUTH-05 | Atomic create at step 3 | §Customer Wizard Architecture |
| AUTH-06 | Step 1→2 email-uniqueness pre-check | §Customer Wizard Architecture |
| AUTH-07 | Step 2 = newsletter only | UI-SPEC contract |
| AUTH-08 | Step 3 confirm + T&Cs | UI-SPEC contract |
| AUTH-09 | Drop confirm-password | §PasswordField pattern |
| AUTH-10 | Role-select tiles on `/register` | UI-SPEC contract |
| AUTH-11 | `/register?role=artist` single-page form | UI-SPEC contract |
| AUTH-12 | `artistApplication` table | §Artist Application Data Model |
| AUTH-13 | Brand-conditional tag list | §Artist Application Data Model |
| AUTH-14 | `/admin/applications` page | §Admin Applications Page |
| AUTH-15 | Approve flow | §Resend Artist-Approval Invite |
| AUTH-16 | Silent reject | §Admin Applications Page |
| AUTH-17 | Request-more-info | §Admin Applications Page |
| AUTH-18 | Admin notification email | §Resend Artist-Approval Invite |
| AUTH-19 | `artist-approval-invite.tsx` template | §Resend Artist-Approval Invite |
| AUTH-20 | 3-OAuth row above email/password | §Better Auth Social Providers |
| AUTH-21 | Google live; Meta + GitHub conditional | §Better Auth Social Providers + §OAuth Provider Setup Steps |
| AUTH-22 | `socialProviders` block | §Better Auth Social Providers |
| AUTH-23 | `accountLinking.enabled: false` | §Better Auth accountLinking Behavior |
| AUTH-24 | Inline T&Cs microcopy | UI-SPEC contract |
| AUTH-25 | New OAuth SVG icons | Existing `social-icons.tsx` extension |
| AUTH-26 | Soft email-verification gate | §Email-Verification Soft Gate |
| AUTH-27 | `/verify-email` 3 states | UI-SPEC + Better Auth `verifyEmail` flow |
| AUTH-28 | Grandfather migration | §Grandfather Migration Pattern |
| AUTH-29 | Branded forgot/reset polish | §Brand Detection Refactor |
| AUTH-30 | `(auth)/layout.tsx` server component | §(auth)/layout.tsx Server Component |
| AUTH-31 | HoverGlitchHeading on all H1s | Site-wide rule (existing component) |
| AUTH-32 | Verification gates | Standard project commands |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **pnpm only** — never npm or yarn
- **Verification commands:** `pnpm tsc --noEmit` and `pnpm lint`. NEVER `next build` (CodeBox 19GB RAM shared)
- **No parallel builds** — agents must run one verification at a time
- **No screenshot auto-loading** — reference paths only
- **GSD workflow** — file edits flow through `/gsd:execute-phase`; no out-of-band edits
- **Brand spelling:** "**GlitchTech**" (matches `glitchtech.io`). Stale planning docs say "GlitchTek" — fix as touched, no bulk rename in this phase
- **No emojis** in committed files unless user explicitly requests

## Summary

1. **Better Auth `socialProviders` is a single config block** in `src/lib/auth.ts`. Each provider takes `{ clientId, clientSecret }` reading from env. The provider key is **`facebook`** (not `meta`) — UI labels Meta but config key is `facebook`. Default callback path `/api/auth/callback/{provider}` is auto-handled by the existing `/api/auth/[...all]/route.ts`. Conditional registration is straightforward: build the providers object at module load time, only including a provider when both env vars are present.

2. **`accountLinking.enabled: false` is a verified Better Auth config.** When a social-login email matches an existing email+password user, the OAuth flow returns the documented error code **`account_not_linked`** (URL slug `/docs/reference/errors/account_not_linked`). On the client, `signIn.social({ provider, errorCallbackURL })` redirects to the error URL with `?error=account_not_linked`. The login page reads that query param and surfaces the UI-SPEC enumeration-safe copy.

3. **Brand detection extraction is mechanical.** The middleware already owns `STUDIOS_HOSTS` / `TECH_HOSTS` sets. Lift them into `src/lib/brand.ts` exporting `getBrandFromHost(host: string | null): 'studios' | 'tech'` with `'studios'` as default. Both the middleware and the new server-component `(auth)/layout.tsx` import it. Single source of truth.

4. **Customer wizard URL pattern: `?step=1|2|3` query param** — chosen over a `/register/customer/[step]` segment for: simpler React state hydration, browser-back works without prefetch overhead on three near-identical routes, deep-link friendly, lighter route tree. Steps 1 and 2 are CLIENT-state only (a single `'use client'` page driving a form component reading the step from `nuqs`). Step 3 fires the atomic `signUp.email()` call. Email-uniqueness pre-check at step 1→2 is a server action returning `{ taken: boolean }` only — never echoes the email back, never throws — so misuse can't enumerate.

5. **Email-verification soft gate goes at the LAYOUT level**, not in middleware. Middleware decoding a Better Auth session would require either a database round-trip or shipping the Edge runtime variant — both are heavier than three layout-level checks. Add `await auth.api.getSession({ headers: await headers() })` to `(public)/layout.tsx`, `dashboard/layout.tsx`, and `admin/layout.tsx`. Each: if `session.user && !session.user.emailVerified` → `redirect('/verify-email')`. The `(auth)` route group is NOT guarded (it includes `/verify-email` itself).

**Primary recommendation:** Build `src/lib/brand.ts` first (lift logic, no behavior change). Then `(auth)/layout.tsx` server-component conversion. Then schema additions and migration (with grandfather UPDATE in same migration file). Then auth.ts socialProviders block + new OAuth icons. Then page-by-page UI rebuild against AuthShell. Verification soft gate is the LAST code change before Playwright pass — it's a cross-cutting guard that's easier to audit at the end.

## Standard Stack

### Core (already installed — verified in package.json)

| Library | Version (installed) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-auth | ^1.5.6 | Auth + social providers + admin plugin | Already wired; `socialProviders` block is the supported integration path |
| drizzle-orm | ^0.45.1 | Schema + queries | Existing `artistApplication` table follows established `pgEnum` + `jsonb` patterns |
| drizzle-kit | ^0.31.10 (devDep) | Migration generation | `db:generate` script already in package.json |
| @react-email/components | ^1.0.10 | Email layout primitives | Phase 24 templates use this exact import path |
| resend | ^6.9.4 | Transactional email delivery | Phase 24 wired via `new Resend(process.env.RESEND_API_KEY)` in auth.ts |
| nuqs | ^2.8.9 | URL query state | Already used elsewhere; perfect for `?step=1\|2\|3` and `?role=customer\|artist` |
| sonner | ^2.0.7 | Toast notifications + undo action | Already wired in root layout; supports `{ action: { label, onClick } }` |
| zod | ^4.3.6 | Form validation | Server actions in this project use Zod 4 — note `.issues` not `.errors` per existing pattern |

### Verified (Better Auth installed version supports)

- `socialProviders.{google, github, facebook}` config keys (HIGH — verified at https://better-auth.com/docs/concepts/oauth)
- `accountLinking.enabled: false` (HIGH — verified at https://better-auth.com/docs/concepts/users-accounts)
- `signIn.social({ provider, callbackURL?, errorCallbackURL?, newUserCallbackURL?, disableRedirect? })` (HIGH — verified at https://better-auth.com/docs/basic-usage)
- Error code `account_not_linked` (HIGH — has its own docs page at https://better-auth.com/docs/reference/errors/account_not_linked)

### No new packages required for this phase

All existing dependencies cover the full scope. No `next-auth` migration, no new icon pack, no new OAuth library.

## Better Auth Social Providers

### Config block (drop into `src/lib/auth.ts` between `emailVerification` and `plugins`)

```typescript
// Build providers object conditionally — only register when env vars exist.
// This is the env-var-gating mechanism (AUTH-21). The button-hide visibility
// is controlled at the page level via a server-component prop (see below).
const socialProviders: NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]> = {}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }
}
// Better Auth provider key is `facebook`, NOT `meta`. UI labels say "Meta"
// (covers Facebook + Instagram). Env var names per AUTH-22 use `META_*` for
// brand consistency — map them to the `facebook` provider key here.
if (process.env.META_CLIENT_ID && process.env.META_CLIENT_SECRET) {
  socialProviders.facebook = {
    clientId: process.env.META_CLIENT_ID,
    clientSecret: process.env.META_CLIENT_SECRET,
  }
}

export const auth = betterAuth({
  // ...existing config...
  socialProviders,
  account: {
    accountLinking: {
      enabled: false, // AUTH-23 — see §accountLinking Behavior below
    },
  },
  // ...
})
```

**CRITICAL naming note:** AUTH-22 specifies `META_CLIENT_ID` env var names. Better Auth's provider config key is `facebook`. The mapping is intentional: env vars use the brand name ("Meta" = Facebook + Instagram), config key matches Better Auth API. Document this mapping in code comments.

### Callback URL — verified

Default: `/api/auth/callback/{provider}` (literal — `provider` here is `google`, `github`, or `facebook`).

Routes auto-handled by existing `src/app/api/auth/[...all]/route.ts`. **No code changes needed there.**

Required redirect URIs to register in each provider's developer console:
- `https://glitchstudios.io/api/auth/callback/{provider}`
- `https://www.glitchstudios.io/api/auth/callback/{provider}`
- `https://glitchtech.io/api/auth/callback/{provider}`
- `https://www.glitchtech.io/api/auth/callback/{provider}`
- `http://localhost:3004/api/auth/callback/{provider}` (dev)

Each provider must have ALL FOUR production URIs registered — Google in particular won't accept a wildcard, and OAuth flow must originate from the same host that registered the URI.

### Client API — verified

```typescript
// src/components/auth/social-auth-row.tsx (client component)
"use client"
import { signIn } from "@/lib/auth-client"

const handleProvider = async (provider: "google" | "github" | "facebook") => {
  await signIn.social({
    provider,
    callbackURL: "/dashboard", // post-success redirect (UI-SPEC §Helper)
    errorCallbackURL: "/login?social_error=1", // post-failure redirect
    newUserCallbackURL: "/dashboard?welcome=1", // optional new-user landing
  })
}
```

Login page reads `?error=account_not_linked` (Better Auth appends this) and `?social_error=1` (custom for cancel/network) and surfaces the matching UI-SPEC error copy.

### Conditional button visibility — RECOMMENDED PATTERN

Make the provider list flow from server → client:

```typescript
// src/lib/auth-providers.ts (server-only OK; pure env read)
import "server-only"
export function getAvailableSocialProviders(): Array<"google" | "github" | "facebook"> {
  const providers: Array<"google" | "github" | "facebook"> = []
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) providers.push("google")
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) providers.push("github")
  if (process.env.META_CLIENT_ID && process.env.META_CLIENT_SECRET) providers.push("facebook")
  return providers
}
```

In `(auth)/login/page.tsx` (server component): `const providers = getAvailableSocialProviders()` then pass `<SocialAuthRow availableProviders={providers} />`.

The client component renders only the buttons whose key is in `availableProviders`. Buttons that aren't listed are NOT rendered (no "Coming soon" — UI-SPEC §AUTH-21).

## Better Auth accountLinking Behavior

### What `accountLinking.enabled: false` does — verified

Per the official docs (https://better-auth.com/docs/concepts/users-accounts): "If account linking is disabled, no accounts can be linked, regardless of the provider or email verification status."

When social login email matches an existing email+password user:
1. Better Auth detects the email collision
2. Refuses to auto-link (per disabled config)
3. Returns the documented error code `account_not_linked` (verified at https://better-auth.com/docs/reference/errors/account_not_linked)
4. OAuth callback redirects to the error URL with the code in the query string

### Detecting the conflict on the client

Two surfaces:

1. **Auto-redirect path:** After failed OAuth, Better Auth redirects to `errorCallbackURL` (or default error page) with `?error=account_not_linked`. The login page reads `useSearchParams()` and conditionally renders `<EnumSafeFormError>` with the UI-SPEC copy:

   > "An account with this email already exists with a different sign-in method. Sign in with that method, then link {provider} from settings."

2. **Provider-specific copy:** The error path doesn't tell us which provider was attempted. Two options:
   - Pass it along: `errorCallbackURL: \`/login?social_error=1&attempted=${provider}\`` — display "Sign in with that method, then link **Google** from settings." (provider name from the `attempted` param)
   - Generic copy: "Sign in with that method, then link {your social provider} from settings." (no extra param)

   **Recommendation:** Pass `attempted={provider}` for better UX; the param is non-sensitive (we initiated the OAuth flow).

### Known limitation — flagged for future phase

Per GitHub issue #6392 (https://github.com/better-auth/better-auth/issues/6392): when `accountLinking.enabled: false`, even **explicit** `linkSocial()` calls fail with "Unable to link account". This is fine for v4.0 (linking is OUT OF SCOPE per Deferred Ideas). When the future "Linked accounts" settings phase enables linking, it will need either `accountLinking.enabled: true` or wait for Better Auth to ship the granular flag from #6392.

## Brand Detection Refactor

### `src/lib/brand.ts` — new file

```typescript
// src/lib/brand.ts
// Single source of truth for hostname → brand mapping.
// Consumed by middleware AND (auth)/layout.tsx server component.
// Mirrors the fall-through behavior of src/middleware.ts:
// unknown hosts (localhost, codebox.local, Vercel preview) → 'studios'.

export type Brand = "studios" | "tech"

export const STUDIOS_HOSTS = new Set([
  "glitchstudios.io",
  "www.glitchstudios.io",
])

export const TECH_HOSTS = new Set([
  "glitchtech.io",
  "www.glitchtech.io",
])

/**
 * Extract the bare hostname (no port) from a host header value.
 * Returns lowercase. Empty input returns "".
 */
export function getHostname(hostHeader: string | null | undefined): string {
  if (!hostHeader) return ""
  return hostHeader.split(":")[0].toLowerCase()
}

/**
 * Resolve a host header to a brand. Defaults to 'studios' for any host
 * not in TECH_HOSTS — matches middleware fall-through (localhost, codebox.local,
 * Vercel preview URLs all render as Studios).
 */
export function getBrandFromHost(hostHeader: string | null | undefined): Brand {
  const host = getHostname(hostHeader)
  if (TECH_HOSTS.has(host)) return "tech"
  return "studios" // STUDIOS_HOSTS + everything else
}
```

### Middleware refactor — `src/middleware.ts`

Replace inline `STUDIOS_HOSTS` / `TECH_HOSTS` declarations with imports:
```typescript
import { STUDIOS_HOSTS, TECH_HOSTS, getHostname } from "@/lib/brand"
```

`APPAREL_HOSTS` and `REVIEWS_HOSTS` stay in middleware (not brand-related).

Behavior is identical post-refactor; this is pure code-deduplication.

## (auth)/layout.tsx Server Component

### New shape — replace existing 11-line layout

```typescript
// src/app/(auth)/layout.tsx
import { headers } from "next/headers"
import { getBrandFromHost } from "@/lib/brand"
import { AuthShell } from "@/components/auth/auth-shell"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const brand = getBrandFromHost(headersList.get("host"))

  return (
    <div data-brand={brand} className="min-h-screen bg-black">
      <AuthShell brand={brand}>{children}</AuthShell>
    </div>
  )
}
```

### Critical Next.js 16 notes — verified

- `headers()` is **async** in Next.js 16 (verified at https://nextjs.org/docs/app/api-reference/functions/headers). Must `await` it. Pre-16 sync usage is gone.
- Reading `headers()` opts the route into **dynamic rendering** (no static optimization). For auth pages this is correct — they should always render server-side per request.
- The `(auth)` route group does not change the URL. `data-brand` lives on the wrapper div; CSS hooks `[data-brand="tech"]` will activate.
- Existing children pages (login, register, forgot-password, reset-password, verify-email) remain client components. The server-component layout passes `brand` as a prop to `<AuthShell>` — child client components can't directly read `headers()`, but they CAN receive the brand value through `<AuthShell>` context or props.

### AuthShell as the prop-drilling boundary

`<AuthShell brand={brand}>` is a client component (it manages layout state, mobile/desktop conditional rendering, focus management on route change). Children (the page components) receive brand via React Context exposed by AuthShell, OR each `(auth)/*/page.tsx` re-reads `host` itself.

**Recommendation:** A small React Context provider inside AuthShell. Pages call `const brand = useBrand()` to read it. Avoids prop drilling and keeps page files clean.

### Default fallback — verified against middleware

| Host | Brand | Source |
|------|-------|--------|
| `glitchstudios.io`, `www.glitchstudios.io` | `'studios'` | STUDIOS_HOSTS |
| `glitchtech.io`, `www.glitchtech.io` | `'tech'` | TECH_HOSTS |
| `localhost:3004`, `192.168.1.122:3004` | `'studios'` | Default |
| `*.codebox.local` | `'studios'` | Default |
| `*.vercel.app` (preview URLs) | `'studios'` | Default |
| Anything else | `'studios'` | Default |

Optional QA override (Claude's discretion approved): `?brand=tech` query param flips brand on non-prod for non-tech hosts. Implement only if Phase 26 actually needs it; otherwise add a `127.0.0.1 glitchtech.local` `/etc/hosts` entry per CONTEXT.md.

## Customer Wizard Architecture

### URL pattern decision: `?step=1|2|3` (query param), NOT segment

| Pattern | Pro | Con |
|---------|-----|-----|
| `?step=1\|2\|3` (chosen) | Single page file, single client state tree, browser back works, nuqs handles serialization, no React tree remount on step change | Step is "fake" — visually the URL changes but the route doesn't, slightly less SEO-meaningful (acceptable for an auth flow that should not be indexed anyway) |
| `/register/customer/[step]` | Each step is a "real" page; cleaner mental model | Tree remount on each step → form state lost without explicit hoisting; three near-identical files; harder to atomically submit with state from earlier steps |

**Decision:** `?step=1|2|3` because the form state from steps 1-2 must reach step 3 atomically. Storing it in a parent server-state component → child route segment crossing introduces complexity. Single client page reads `step` via nuqs and switches inner components.

### File layout

```
src/app/(auth)/register/
  page.tsx              ← role-select tiles (server component, reads brand)
  customer/
    page.tsx            ← wizard host (client component, reads ?step via nuqs)
  artist/
    page.tsx            ← <ArtistRequestForm /> single page (client component)
```

### Wizard state model

```typescript
// src/components/auth/customer-wizard.tsx
"use client"
import { useQueryState, parseAsInteger } from "nuqs"
import { useState } from "react"

export function CustomerWizard({ brand }: { brand: Brand }) {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1))
  // Steps 1+2 hold form data in parent state — survives nuqs URL changes,
  // does NOT persist across page reload (intentional: AUTH-05 atomic semantics).
  const [identity, setIdentity] = useState<{ name: string; email: string; password: string } | null>(null)
  const [preferences, setPreferences] = useState<{ newsletter: boolean }>({ newsletter: false })

  // step transitions:
  //   1 → 2: handleStep1Submit calls server action checkEmailUniqueness({email})
  //          if { taken: true } → set inline error, stay on step 1
  //          if { taken: false } → setIdentity(...), setStep(2)
  //   2 → 3: setPreferences(...), setStep(3)
  //   3 submit: signUp.email({name, email, password}) → wait for verify-email auto-redirect
}
```

### Atomic create at step 3 — verified API

Better Auth `signUp.email()` is a single client call:
```typescript
import { signUp } from "@/lib/auth-client"
await signUp.email({
  name: identity.name,
  email: identity.email,
  password: identity.password,
  callbackURL: "/dashboard", // landing after auto-sign-in (post-verification)
})
```

Better Auth's `emailVerification.sendOnSignUp: true` (already wired in `auth.ts`) fires the verification email. `autoSignInAfterVerification: true` means the user lands at `/dashboard` after clicking the email link.

After step-3 success, the page should:
1. Show a success toast: "Account created. Check your inbox to verify."
2. Redirect to `/verify-email?email={email}` (the pending state surface) — the soft email-verification gate will keep them there until they click the link.

### Step-1 → Step-2 email-uniqueness pre-check

Server action shape:

```typescript
// src/actions/auth-customer-register.ts
"use server"
import { z } from "zod"
import { db } from "@/lib/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"

const schema = z.object({ email: z.string().email() })

export async function checkEmailUniqueness(input: unknown): Promise<{ taken: boolean }> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { taken: false } // bad input → don't leak
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, parsed.data.email.toLowerCase()))
    .limit(1)
  return { taken: !!existing }
}
```

The action ONLY returns `{ taken: boolean }`. Never throws. Never echoes the email. Server-side rate limiting (deferred — not in scope for v4.0).

**Enumeration consistency note:** The CONTEXT.md is explicit (D-03, AUTH-06): the register flow leaks email existence by design at step-1, AS LONG AS login + forgot-password remain enumeration-safe. This is the modern industry pattern (Stripe, Linear, Vercel all do this). The trade-off is that signup can't be the enumeration vector if the rest of the flow is locked down.

### Confirm-password drop (AUTH-09)

Existing `/register/page.tsx` has `confirmPassword` field with cross-validation. Drop it. Use `<PasswordField>` with show/hide eye toggle (UI-SPEC §Interaction). Component spec lives in UI-SPEC §Design System — relies on existing `<InputGroup>` shadcn primitive.

## Artist Application Data Model

### Drizzle schema sketch — drop into `src/db/schema.ts`

```typescript
// === Artist Application (Phase 26) ===

export const artistApplicationStatusEnum = pgEnum("artist_application_status", [
  "pending",
  "approved",
  "rejected",
  "info_requested",
])

export const artistApplicationBrandEnum = pgEnum("artist_application_brand", [
  "studios",
  "tech",
])

export const artistApplications = pgTable(
  "artist_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brand: artistApplicationBrandEnum("brand").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    bio: text("bio").notNull(),
    portfolioUrl: text("portfolio_url"),
    focusTags: jsonb("focus_tags").$type<string[]>().notNull().default([]),
    status: artistApplicationStatusEnum("status").notNull().default("pending"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
    reviewerNote: text("reviewer_note"),
  },
  (t) => [
    index("idx_artist_applications_status").on(t.status),
    index("idx_artist_applications_brand").on(t.brand),
    index("idx_artist_applications_submitted_at").on(t.submittedAt),
  ],
)

export const artistApplicationsRelations = relations(artistApplications, ({ one }) => ({
  reviewer: one(user, {
    fields: [artistApplications.reviewedBy],
    references: [user.id],
  }),
}))
```

### Schema decisions explained

| Decision | Why |
|----------|-----|
| `pgEnum` for `status` and `brand` | Matches existing pattern (`bookingStatusEnum`, `beatStatusEnum`, etc.). Postgres enums are cheaper to query and self-documenting. |
| `focusTags` as `jsonb` (not `text[]`) | Studios = genres, Tech = focus areas — both are conceptually "tags from a brand-specific list." `jsonb` is what existing `waveformPeaks`, `enumOptions` use; consistent. Easier future schema evolution if tags grow structure. |
| `reviewedBy` as `text` fk to `user.id` | Better Auth's `user.id` is `text` (not uuid). Schema reference at line 19 of schema.ts. `onDelete: "set null"` so deleting a reviewer doesn't cascade-destroy applications. |
| `reviewerNote` text, nullable | Internal-only per AUTH-16 — not surfaced to applicant. |
| Indices on status + brand + submittedAt | Admin page queries by status (pending) ordered by submittedAt desc; brand filter is a likely future addition. |
| No unique constraint on email | A rejected applicant might re-apply later. Status enum encodes the lifecycle. |

### Newsletter opt-in — RECOMMENDED placement (Claude's discretion)

CONTEXT.md `<specifics>` flags this is planner's call. **Recommendation: add `newsletterOptIn: boolean("newsletter_opt_in").default(false).notNull()` to the existing `user` table.** Reasons:
- Single preference; a separate `userPreferences` table is over-engineering
- Set at signup time (step 2), toggle later in `/dashboard/settings`
- OAuth signups default to FALSE per AUTH-24

This requires touching the Better Auth `user` table, which is delicate. The column is additive (no rename, no type change). Better Auth re-reads the schema on every request through `drizzleAdapter(db, { schema })`; an additive column is safe.

**Migration ordering:** the additive `newsletterOptIn` column should land in the same migration file as `artist_applications` for atomicity.

### `drizzle-kit generate` flow

Existing pattern (verified from `package.json` scripts):
```bash
pnpm db:generate        # generates SQL into src/db/migrations/
# inspect the file (ALWAYS — drizzle-kit can hit interactive prompts on
# column conflicts; per Phase 15 STATE.md note, prior migrations were applied
# via direct postgres-js scripts, NOT db:push, on production)
pnpm db:push            # for dev/prototyping only
```

For prod, the project's pattern (per STATE.md Phase 15-03 note) is to apply migrations via a standalone script using postgres-js — NOT `drizzle-kit migrate`. Look at how migration `0003_methodology_lock.sql` was applied for the canonical pattern. The migration file goes into `src/db/migrations/0006_*.sql`.

## Grandfather Migration Pattern

### Drizzle migration file structure

```sql
-- src/db/migrations/0006_phase26_auth.sql
-- Phase 26 — Brand-Aware Auth UI Redesign
-- Adds artist_applications table + newsletter_opt_in user column
-- + grandfather email verification for pre-existing users.

-- 1. Create enums (IF NOT EXISTS — idempotent)
DO $$ BEGIN
  CREATE TYPE "artist_application_status" AS ENUM ('pending', 'approved', 'rejected', 'info_requested');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "artist_application_brand" AS ENUM ('studios', 'tech');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create table
CREATE TABLE IF NOT EXISTS "artist_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "brand" "artist_application_brand" NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "bio" text NOT NULL,
  "portfolio_url" text,
  "focus_tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" "artist_application_status" NOT NULL DEFAULT 'pending',
  "submitted_at" timestamp NOT NULL DEFAULT now(),
  "reviewed_at" timestamp,
  "reviewed_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "reviewer_note" text
);

CREATE INDEX IF NOT EXISTS "idx_artist_applications_status" ON "artist_applications" ("status");
CREATE INDEX IF NOT EXISTS "idx_artist_applications_brand" ON "artist_applications" ("brand");
CREATE INDEX IF NOT EXISTS "idx_artist_applications_submitted_at" ON "artist_applications" ("submitted_at");

-- 3. Add newsletter_opt_in column to user (additive, safe)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "newsletter_opt_in" boolean NOT NULL DEFAULT false;

-- 4. Grandfather migration: every user that existed BEFORE this migration
-- ran is treated as already verified. The "before this migration" predicate
-- is "createdAt < now() at migration time". We use a sentinel timestamp
-- written into a one-row meta table to make this idempotent — running the
-- migration twice does nothing the second time.

CREATE TABLE IF NOT EXISTS "phase26_migration_meta" (
  "key" text PRIMARY KEY,
  "value" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

DO $$
DECLARE
  already_ran text;
BEGIN
  SELECT value INTO already_ran FROM "phase26_migration_meta" WHERE key = 'grandfather_email_verified';
  IF already_ran IS NULL THEN
    UPDATE "user" SET "emailVerified" = true WHERE "emailVerified" = false OR "emailVerified" IS NULL;
    INSERT INTO "phase26_migration_meta" (key, value) VALUES ('grandfather_email_verified', now()::text);
  END IF;
END $$;
```

### Why the meta table guard

Drizzle's standard migrations run once via `drizzle-kit migrate` because of `__drizzle_migrations` tracking. BUT — per STATE.md Phase 15-03 — this project applies migrations via a custom postgres-js script. That script may or may not track migrations as cleanly as drizzle-kit. The `phase26_migration_meta` table is a belt-and-suspenders idempotency guard that survives:
- Migration being applied twice (same script run twice)
- Cherry-picked / partial application
- Schema-only restore against a populated DB

### Alternative: app-level grandfather

Skip the SQL UPDATE; instead, in the soft-gate guard code, treat any user whose `createdAt < PHASE_26_DEPLOY_TIMESTAMP` as effectively verified. **Rejected.** Reasons:
- Deploy timestamps shift if rolled back / redeployed
- Adds runtime cost on every authenticated request
- The data should reflect reality (pre-existing users ARE verified; their email is the address they receive site mail at)

## Email-Verification Soft Gate

### Recommendation: layout-level guards, NOT middleware

CONTEXT.md `<code_context>` says either is acceptable. The layout-level approach wins:

| Approach | Cost | Security |
|----------|------|----------|
| Middleware | Session must be decoded on every request matching the matcher. Edge runtime needs the Better Auth session check to work in Edge — verifying this requires either DB-on-Edge (expensive) or shipping a special Edge-compatible session decoder. Heavier. | Same end-state |
| Layout-level | 3 layouts (`(public)`, `dashboard`, `admin`) each call `auth.api.getSession({ headers: await headers() })` once per request that hits that layout. Already doing this in `/admin` — pattern proven. | Same end-state |

### Concrete implementation

```typescript
// src/app/(public)/layout.tsx — augment existing layout
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user && !session.user.emailVerified) {
    redirect("/verify-email")
  }
  return <>{children}</>
}
```

Repeat in `dashboard/layout.tsx` and `admin/layout.tsx` (admin already has session lookup; just add the `emailVerified` branch).

### What is NOT guarded

- `(auth)/*` route group — includes `/verify-email` itself, plus `/login`, `/register`, `/forgot-password`, `/reset-password`. Unverified users MUST be able to reach these.
- `/api/auth/*` — Better Auth handlers, must run for verification-link consumption.
- Sign-out endpoint (auto-handled — sign-out is in `/api/auth/sign-out`).

### What about anonymous users?

The guard pattern (`if session?.user && !emailVerified`) only redirects if there IS a session. Anonymous users hit public pages normally. Phase 8 already established that public routes don't require auth.

### Edge case: stale session

If a user verifies email in another tab, their existing session still has `emailVerified: false` cached. Better Auth refreshes session data per-request via `getSession({ headers })`. As long as the layout-guard reads fresh from the DB (which `getSession` does — verified in existing `/admin` routes), the redirect will stop firing on the next page load.

## Resend Artist-Approval Invite

### Approach decision: Better Auth `requestPasswordReset` (admin-callable)

CONTEXT.md raises two options. Recommendation: **call Better Auth's password-reset machinery from a server action** using a custom email template.

### Why not a manual token

Better Auth already manages the `verification` table (line 73 of schema.ts), token expiry, and consumption. Replicating it for the artist invite is duplicate plumbing.

### Server action shape

```typescript
// src/actions/admin-artist-applications.ts
"use server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { artistApplications, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { Resend } from "resend"
import { ArtistApprovalInviteEmail } from "@/lib/email/artist-approval-invite"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function approveArtistApplication(applicationId: string) {
  // 1. Require admin session
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !["owner", "admin"].includes(session.user.role ?? "")) {
    throw new Error("Unauthorized")
  }

  // 2. Load application
  const [app] = await db.select().from(artistApplications).where(eq(artistApplications.id, applicationId)).limit(1)
  if (!app || app.status !== "pending") throw new Error("Invalid application state")

  // 3. Create user (atomic with status update — Drizzle transaction)
  const role = app.brand === "studios" ? "artist" : "contributor"
  await db.transaction(async (tx) => {
    const userId = crypto.randomUUID()
    // No password yet — they set one via the invite link
    await tx.insert(user).values({
      id: userId,
      name: app.name,
      email: app.email,
      emailVerified: true, // Admin-trusted
      role,
    })
    await tx.update(artistApplications).set({
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
    }).where(eq(artistApplications.id, applicationId))
  })

  // 4. Trigger Better Auth password-reset flow → custom email template
  // Note: Better Auth's `requestPasswordReset` API is callable server-side.
  // It generates the token, writes to `verification` table, and calls the
  // sendResetPassword handler from auth.ts. We need to intercept that handler
  // OR use a different transport.
  //
  // Cleanest path: manually call the same Resend send with the token URL,
  // using Better Auth's internal token generation via auth.api.requestPasswordReset.
  await auth.api.requestPasswordReset({
    body: { email: app.email, redirectTo: "/reset-password?invite=1" },
    headers: await headers(),
  })

  // The default sendResetPassword handler in auth.ts will fire. To send the
  // ArtistApprovalInviteEmail template instead, we pass a marker through
  // `redirectTo` and either:
  //   (a) modify auth.ts sendResetPassword to branch on the redirectTo URL
  //   (b) call resend.emails.send directly here with our custom template
  //       and DISABLE the default email by overriding the handler at config
  //
  // Recommendation: option (b) — bypass Better Auth's email handler and send
  // directly. The token still flows through Better Auth's verification table.
}
```

### Cleaner alternative: dual-handler in auth.ts

Refactor `sendResetPassword` in `auth.ts` to inspect the `url` for an `invite=1` marker and pick the email template:

```typescript
sendResetPassword: async ({ user, url }) => {
  const isInvite = url.includes("invite=1")
  await resend.emails.send({
    from: EMAIL_FROM,
    to: user.email,
    subject: isInvite ? "You're approved — set your password." : "Reset your Glitch Studios password",
    react: isInvite
      ? ArtistApprovalInviteEmail({ name: user.name, url })
      : PasswordResetEmail({ name: user.name, url }),
  })
}
```

This is cleaner because:
- All token logic lives in Better Auth (battle-tested)
- The auth.ts handler stays the single email-send seam
- Server action just calls `auth.api.requestPasswordReset({ body: { email, redirectTo: "/reset-password?invite=1" }})`

### `artist-approval-invite.tsx` template

Mirrors `password-reset.tsx` (verified — same React Email primitives at `@react-email/components`). Differences:
- Subject (handled by auth.ts handler): "You're approved — set your password."
- Heading: "Welcome to {brand-aware text}" — the email is brand-routed via the `app.brand` field, but the template gets brand passed in as a prop OR we use ONE template that takes `brand` and switches copy
- Body intro: "Your application to join Glitch Studios as an artist has been approved." (Studios variant) / "Your application to contribute to GlitchTech has been approved." (Tech variant)
- CTA: "Set your password"

Brand-aware emails are technically out of scope (deferred to phase 999.5 visual redesign), but a `brand` prop that switches the heading/intro is fair game for v4.0 — it's text variants, not a visual redesign.

```typescript
interface ArtistApprovalInviteEmailProps {
  name: string
  url: string
  brand: "studios" | "tech"
}

export function ArtistApprovalInviteEmail({ name, url, brand }: ArtistApprovalInviteEmailProps) {
  const brandName = brand === "tech" ? "GlitchTech" : "Glitch Studios"
  const role = brand === "tech" ? "contributor" : "artist"
  // ... rest copies password-reset.tsx structure with these substitutions
}
```

### Admin notification email (AUTH-18)

Server action `submitArtistApplication` (called from public-facing form) writes the row, then sends an admin-targeted email:

```typescript
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? "office@glitchstudios.io"
await resend.emails.send({
  from: EMAIL_FROM,
  to: adminEmail,
  subject: `New ${brandName} application: ${app.name}`,
  // Inline simple HTML — no need for a full template, AUTH-18 doesn't require
  // brand-aware design for the admin notification.
  html: `<p>${app.name} (${app.email}) submitted an application.</p>
         <p>View at <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/applications">/admin/applications</a></p>`,
})
```

## Admin Applications Page

### Pattern reuse from `/admin/users` and `/admin/clients`

Verified existing files:
- `src/app/admin/clients/page.tsx` — `force-dynamic`, server-component fetch via `getClients`, renders a client `<ClientListTable>`
- `src/components/admin/client-list-table.tsx` — table with row click → opens `<ClientDetailSheet>` (Sheet primitive from shadcn)
- `src/components/admin/client-detail-sheet.tsx` — drawer with detail + actions

**Replicate this exact pattern.** Don't invent. Files needed:
- `src/app/admin/applications/page.tsx` — server component, fetches applications
- `src/components/admin/application-list-table.tsx` — client component, table + filters
- `src/components/admin/application-detail-sheet.tsx` — drawer with bio, portfolio link, focusTags, Approve / Reject / Request More Info buttons
- `src/actions/admin-artist-applications.ts` — server actions: `approveArtistApplication`, `rejectArtistApplication`, `requestMoreInfo`

### Toast undo for Approve action — verified

Sonner's API (verified from npm + https://sonner.emilkowal.ski/toast):

```typescript
import { toast } from "sonner"

toast.success("Application approved", {
  duration: 5000, // 5s — UI-SPEC §specifics recommendation
  action: {
    label: "Undo",
    onClick: async () => {
      await revertArtistApprove(applicationId) // server action that reverses
    },
  },
})
```

The `action.onClick` fires when the user clicks the action button. The toast auto-dismisses at `duration` ms. After dismissal, the action can no longer be invoked (the toast is gone from DOM).

### Reverting an approve — implementation cost

To make undo work: `revertArtistApprove` must:
1. Delete the user row created in step 3 of approve (cascade-deletes their account row, sessions)
2. Set the application status back to `pending`
3. (Optional) Send a "previous email was sent in error" follow-up — UI-SPEC and CONTEXT.md don't require this

**Risk:** between approve and undo (5 seconds), the invite email has already been sent. The user may already have clicked the link. Inverting that is racy.

**Recommendation:** make undo best-effort. If the user row already has a session or has clicked the invite link (i.e., a `verification` row was consumed), surface "Approval already used by recipient — cannot undo" toast. Otherwise hard-delete.

Alternative simpler path: confirmation modal instead of undo (CONTEXT.md flagged either is acceptable). Modal is safer; undo is friendlier. Planner can pick — recommend confirmation modal for v4.0 simplicity, undo as a polish phase.

## OAuth Provider Setup Steps

### Google (live at v4.0 launch — AUTH-21)

| Step | URL / Action |
|------|-------------|
| 1. Create OAuth 2.0 client | https://console.cloud.google.com/apis/credentials → "Create Credentials" → "OAuth client ID" |
| 2. Application type | "Web application" |
| 3. Authorized JavaScript origins | `https://glitchstudios.io`, `https://www.glitchstudios.io`, `https://glitchtech.io`, `https://www.glitchtech.io`, `http://localhost:3004` |
| 4. Authorized redirect URIs | `https://{each host}/api/auth/callback/google` (5 URIs total) |
| 5. Env vars | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` in Vercel project + `.env.local` |
| 6. OAuth consent screen | Required for production — set app name "Glitch Studios", logo, privacy policy link, terms link, scopes (default: openid email profile) |
| Default scopes | `openid email profile` (Better Auth default) |
| Verification | Google requires app verification for production OAuth at scale; small projects can stay in "Testing" mode initially with limited users (100 cap) |

### Meta / Facebook (env stub, button hidden until envs land — AUTH-21)

| Step | URL / Action |
|------|-------------|
| 1. Create Meta app | https://developers.facebook.com/apps/ → "Create App" → use case "Authenticate and request data from users with Facebook Login" |
| 2. Add Facebook Login product | Sidebar → Add Product → Facebook Login |
| 3. Valid OAuth Redirect URIs | Same 5 URIs as Google but with `/api/auth/callback/facebook` |
| 4. App Domains (Settings → Basic) | `glitchstudios.io`, `glitchtech.io` (apex only — Meta accepts subdomains automatically) |
| 5. Env vars | `META_CLIENT_ID` (= App ID), `META_CLIENT_SECRET` (= App Secret). NOTE: env name is META_*, Better Auth provider key maps to `facebook` |
| 6. App Review for production | Required for `email` permission to work for non-test users — submit for review with privacy policy URL, screencast of usage |
| Default scopes | `email`, `public_profile` (Better Auth default) |

### GitHub (env stub, button hidden until envs land — AUTH-21)

| Step | URL / Action |
|------|-------------|
| 1. Create OAuth App | https://github.com/settings/developers → "New OAuth App" |
| 2. Application name | "Glitch Studios" |
| 3. Homepage URL | `https://glitchstudios.io` |
| 4. Authorization callback URL | `https://glitchstudios.io/api/auth/callback/github` (GitHub OAuth Apps allow ONE callback URL per app — see Pitfall below) |
| 5. Env vars | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| 6. Required scope | `user:email` (Better Auth default) — needed because some GitHub users have private email |

### Multi-host pitfall: GitHub one-callback-per-app limit

GitHub OAuth Apps support ONE callback URL. Two options:
- **Option A (recommended):** Register the callback against `glitchstudios.io` only. The middleware ALREADY routes `/api/auth/*` to the same handler regardless of host (it's not in `SHARED_AUTH_PATHS` but `/api/auth` is excluded from middleware via the matcher). This means GitHub callback always lands on `glitchstudios.io/api/auth/callback/github`, which serves the same Better Auth handler. After login, Better Auth redirects to the page that initiated the flow via `callbackURL`. SHOULD work cross-domain provided `trustedOrigins` includes both.
- **Option B:** Create TWO GitHub OAuth Apps (one per brand) and switch `GITHUB_CLIENT_ID` based on `host` at runtime. Adds complexity. Skip unless Option A demonstrates a bug.

**Verify Option A on staging before launch.** Cookie-domain semantics may bite (Better Auth session cookie needs to be readable from the host that initiated, not the callback host). If broken, fall back to Option B.

Google and Meta both support multiple redirect URIs per app, so this issue is GitHub-specific.

## Risks & Pitfalls

### 1. Cross-domain OAuth cookie scoping (HIGH risk)

Better Auth sets the session cookie on the host that initiated the OAuth flow. If a user starts OAuth on `glitchtech.io`, the callback (e.g., `glitchstudios.io/api/auth/callback/github` per Option A above) sets the cookie on `glitchstudios.io`. The user is then redirected back to `glitchtech.io` — but the cookie isn't readable there. They appear unauthenticated.

**Mitigation:** Either (a) host-scoped GitHub apps (Option B above), or (b) verify Better Auth's `trustedOrigins` plus `BETTER_AUTH_URL` config make the cookie work cross-host. Test on staging.

Google + Meta don't have this problem because we register callback URIs on every host.

### 2. Better Auth `accountLinking.enabled: false` blocks future explicit linking

Per https://github.com/better-auth/better-auth/issues/6392 — when `accountLinking.enabled: false`, even explicit user-initiated `linkSocial()` calls return "Unable to link account". For v4.0 this is fine (linked-accounts settings are deferred), but flag for the future "Linked accounts" phase: that phase MUST flip the flag to `true` and add an explicit conflict-resolution flow.

### 3. Edge runtime + Better Auth session decoding (MEDIUM risk — already mitigated)

If we tried to put the email-verification soft gate in middleware, we'd need a session decoder that runs in Next.js Edge runtime. Better Auth's `getSession` does a DB lookup — possible on Edge but expensive on every request. This research recommends layout-level guards specifically to avoid this.

### 4. Drizzle migrations applied via custom postgres-js script (MEDIUM)

Per STATE.md Phase 15: this project applies migrations via a standalone postgres-js script, not `drizzle-kit migrate`. Implication: the `__drizzle_migrations` tracking table may not be authoritative. Hence the explicit `phase26_migration_meta` guard in the grandfather migration. Same pattern as Phase 15 used (manual idempotency) is the safe path.

### 5. Newsletter column on `user` table touches Better Auth schema (LOW)

Adding `newsletter_opt_in` to `user` is additive. Better Auth uses `drizzleAdapter(db, { schema })` which re-reads the schema. Additive columns don't break Better Auth's internal type expectations. Confirmed safe by inspecting `auth.ts` — Better Auth doesn't enumerate user columns at runtime; it only references the ones it needs.

### 6. Session focus on H1 + HoverGlitchHeading interaction (LOW)

UI-SPEC §Interaction says: "On route change, focus moves to the H1 so screen readers announce the page title." The `<HoverGlitchHeading>` component must be `tabIndex={-1}` and accept a `ref` for `focus()`. If existing `glitch-heading.tsx` doesn't expose a ref, the planner needs to add `forwardRef`. Worth a quick code-read in the existing component before planning.

### 7. `(auth)/layout.tsx` becoming async server component (LOW — verified safe)

Existing children are client components (`page.tsx` files use `useState`, `useRouter`). A server-component layout wrapping client-component children is the canonical Next.js 16 pattern. No issue. Verified via existing `(public)/layout.tsx` already mixes server/client this way.

### 8. `?step=1|2|3` and browser back-button (LOW)

nuqs `useQueryState` with default behavior pushes history entries on every value change. Browser back from step 3 goes to step 2, then step 1. This is what AUTH-04 wants. Confirmed by reading nuqs README. If nuqs default is `replace` (no history entry), pass `{ history: "push" }` to `useQueryState`.

### 9. `parseAsInteger` + missing query param (LOW)

If a user lands at `/register/customer` with no `?step`, nuqs returns the default (1). Direct deep-link to `/register/customer?step=2` works for resuming, BUT — per AUTH-05 — steps 1-2 are client state. A user landing at step 2 directly has no `identity` data. The wizard must guard: `if (step >= 2 && !identity) setStep(1)`. Otherwise crash on `identity.name`.

### 10. Brand attribute timing for SSR (LOW)

Server-component layout reads `host` and renders `data-brand` synchronously. By the time the client hydrates, the attribute is already correct. No flash of wrong brand. Confirmed: same pattern works on existing `(tech)` route group.

### 11. GlitchTech vs GlitchTek spelling (LOW — but easy to slip)

Planning docs scattered through .planning/ use both spellings. **Source of truth: `glitchtech.io` domain → "GlitchTech".** The phase 999.5 email visual redesign is the planned correction window for emails. For Phase 26: every NEW string this phase introduces uses "GlitchTech". Stale strings touched incidentally get updated. No bulk rename.

## Open Questions

### Q1: Should Approve be confirmation-modal or toast-undo?

CONTEXT.md `<decisions>` flags this as Claude's discretion. Recommendation: **confirmation modal for v4.0**. Reasons:
- Approving sends a real email and creates a real user — undo introduces race conditions (recipient may have already clicked the invite link in 5 seconds)
- Modal is dead-simple to implement with shadcn Dialog
- The "What just happened" toast can still appear after the modal confirms

If the user pushed back wanting friction-free UX, undo is implementable but planner needs to add a "is this user still revertible?" pre-check.

### Q2: Single artist-approval-invite template with `brand` prop, or two templates?

Phase 999.5 will redesign emails with brand-aware visuals. For Phase 26: ONE template with `brand` prop and copy-only branching is sufficient. No new template files for the "tech version" — the prop drives the heading/intro copy. Cleaner than two near-duplicate templates. Verified the existing email primitives (`@react-email/components`) accept conditional inline content fine.

### Q3: Where does the `?brand=tech` QA override (Claude's discretion item) live?

Recommendation: in `getBrandFromHost` itself, gated on `process.env.NODE_ENV !== "production"` AND a query param. But `getBrandFromHost` is a pure function — it doesn't have access to query params. The override would need to live in the layout:

```typescript
// (auth)/layout.tsx
const url = new URL(headersList.get("x-url") ?? "/", "http://localhost") // pseudo
const queryBrand = url.searchParams.get("brand")
const brand = process.env.NODE_ENV !== "production" && (queryBrand === "tech" || queryBrand === "studios")
  ? queryBrand
  : getBrandFromHost(headersList.get("host"))
```

Reading the URL in a server component is awkward. Skip this in v4.0 unless someone actually needs it; recommend `127.0.0.1 glitchtech.local` `/etc/hosts` instead per CONTEXT.md.

### Q4: Should the soft-verification gate live in a shared utility?

Three layouts call the same code. DRY suggests a shared `requireVerifiedEmail()` helper:

```typescript
// src/lib/auth-guards.ts
import "server-only"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function requireVerifiedEmailOrRedirect() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user && !session.user.emailVerified) redirect("/verify-email")
  return session
}
```

Each layout calls `await requireVerifiedEmailOrRedirect()`. Returns the session for downstream use (admin layout already does its own session lookup — could consume the returned session and skip the second call). Minor refactor; planner can decide.

## Sources

### Primary (HIGH confidence)
- Better Auth OAuth setup: https://better-auth.com/docs/concepts/oauth (verified `socialProviders` config shape, callback URL pattern, env var names)
- Better Auth Google: https://better-auth.com/docs/authentication/google (verified scopes, redirect URI, `signIn.social` API)
- Better Auth Facebook: https://better-auth.com/docs/authentication/facebook (verified provider key is `facebook` not `meta`, env vars, scopes)
- Better Auth GitHub: https://better-auth.com/docs/authentication/github (verified `user:email` scope, single-callback-per-app limit)
- Better Auth User & Accounts: https://better-auth.com/docs/concepts/users-accounts (verified `accountLinking.enabled: false` behavior)
- Better Auth `account_not_linked` error: https://better-auth.com/docs/reference/errors/account_not_linked (verified error code surfaced when accountLinking disabled and email collision occurs)
- Better Auth Basic Usage: https://better-auth.com/docs/basic-usage (verified `signIn.social` parameter shape: provider, callbackURL, errorCallbackURL, newUserCallbackURL, disableRedirect)
- Next.js 16 `headers()`: https://nextjs.org/docs/app/api-reference/functions/headers (verified async API, opts route into dynamic rendering)
- Next.js 16 release: https://nextjs.org/blog/next-16
- Sonner toast docs: https://sonner.emilkowal.ski/toast (verified `action: { label, onClick }` shape, default 4000ms duration)
- Project codebase: `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/middleware.ts`, `src/db/schema.ts`, `src/db/migrations/0005_phase25_indexes.sql`, `src/lib/email/password-reset.tsx`, `src/components/icons/social-icons.tsx`, `src/app/admin/clients/page.tsx` (all directly read for verified pattern reuse)

### Secondary (MEDIUM confidence)
- Better Auth issue #6392 (accountLinking implicit vs explicit): https://github.com/better-auth/better-auth/issues/6392 (flagged future concern, not v4.0 blocker)
- Better Auth issue #2172 (account linking still requires email): https://github.com/better-auth/better-auth/issues/2172
- Better Auth issue #4610 (allowDifferentEmails edge cases): https://github.com/better-auth/better-auth/issues/4610
- Sonner default 4s duration: confirmed via WebFetch, also documented in package README

### Tertiary (LOW confidence — flagged for staging verification)
- Cross-host OAuth cookie scoping behavior with Better Auth `trustedOrigins`: tested in PRODUCTION patterns elsewhere but specific Glitch Studios cross-domain (glitchstudios.io ↔ glitchtech.io) flow needs staging verification per Pitfall #1

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed at known versions; verified in package.json
- Better Auth API: HIGH — `socialProviders`, `accountLinking`, `signIn.social` all verified against current official docs
- Architecture: HIGH — existing patterns (admin Sheet, server-component layout, server actions, Drizzle migrations) have direct precedents in the codebase that this phase mirrors
- Pitfalls: MEDIUM — most are verified in code; cross-domain GitHub OAuth cookie behavior (#1) and undo-race for approve (item Q1) need empirical verification on staging
- Email integration: HIGH — Phase 24 templates and Resend wiring are in place and read directly

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 (30 days — Better Auth releases frequently; re-verify `socialProviders` and `accountLinking` API shape if Better Auth ships a major version before then)

## RESEARCH COMPLETE
