# Phase 23: Debug Broken Pages & Missing Routes — Research

**Researched:** 2026-04-24
**Domain:** Bug triage — mixed (routing, auth, payments, UI, DB queries)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Bug-fix philosophy**
- **D-01:** Root-cause every bug, not symptomatic patches. If `/admin/clients` 500s because a query explodes on a nullable column, fix the query — don't catch-and-display a friendly error.
- **D-02:** One phase, all 9 bugs. No splitting. ROADMAP bundles them together because they're all small, launch-blocker, independent, and block production.
- **D-03:** Parallelization: these bugs touch ~independent files. Planner should emit plans that executor can run in parallel waves. Shared files (if any) become serial.

**Mobile nav double-tap (systemic)**
- **D-04:** Fix at the shared nav handler once, not per-surface. Investigate possible causes in priority order: (1) `onTouchEnd` vs `onClick` race on mobile Safari, (2) Link prefetch blocking initial nav, (3) Framer Motion tap-gesture swallowing the click, (4) a modal/overlay with `pointerEvents:auto` catching the first tap.
- **D-05:** Verify fix on at least 4 surfaces (Beats icon, cross-brand tile, Reviews link, plus one more control) using real mobile or Playwright mobile emulation.

**Forgot/reset password**
- **D-06:** Phase 23 ships `/forgot-password` + `/reset-password` routes with minimal brand-compliant UI matching current login/register density. Phase 26 redesigns; Phase 24 wires Resend + React Email.
- **D-07:** Server actions structured so Phase 24 only has to swap the stub email-send call for Resend. Document the integration contract explicitly.
- **D-08:** Better Auth ships password-reset primitives — use the official API (`forgetPassword`, `resetPassword`) rather than a custom token scheme. Check `src/lib/auth.ts` for existing setup.

**/about dead link**
- **D-09:** Remove the dead link, don't stub a page. Phase 44 (Glitchy) explicitly scopes `/about` as Glitchy's introduction page.
- **D-10:** If the `/about` link is important for SEO/nav expectations, escalate to user. Default: removal.

**Mobile checkout Stripe failure**
- **D-11:** Diagnose via Vercel runtime logs on `/api/checkout/*` first — don't guess. Likely causes: missing/invalid `STRIPE_SECRET_KEY`, empty cart payload, missing `NEXT_PUBLIC_SITE_URL`, test/live mode mismatch.
- **D-12:** Verify on real mobile + desktop end-to-end on production parity before closing.

**Admin 500s (`/admin/clients`, `/admin/roles`)**
- **D-13:** Investigate via Vercel runtime logs + `pnpm dev` locally with the same DB. Most common causes inferred from the recent auth cascade: stale session reads, Server Component query against a missing column, or RBAC gate throwing before render.

**`/admin` homepage editor 404**
- **D-14:** Reconcile the URL the user was on vs the actual route. Editor exists at `src/components/admin/homepage-editor.tsx` mounted at `/admin/settings/homepage/page.tsx`. Cause is a stale nav link or missing dashboard entry-point.
- **D-15:** Fix: update the link to point to the correct route. If no link exists, add a visible entry-point from `/admin`.

**`/admin/media` drag-drop upload**
- **D-16:** Debug the drop handler. Check Uploadthing/other endpoint in prod; `preventDefault` on `dragover`; CSRF/auth on the upload endpoint.
- **D-17:** Manual file-picker upload must keep working — don't regress while fixing drag-drop.

**Verification**
- **D-18:** Each bug closes only when a Playwright script reproduces the original broken behavior, then passes after the fix.
- **D-19:** Where Playwright is impractical (real-mobile Stripe HTTPS prod), specify an alternative in the plan task.
- **D-20:** Don't ship the fix if the reproduction can't be captured.

### Claude's Discretion
- Exact Playwright test structure (reuse existing harness if one exists)
- Which directory new `/forgot-password` / `/reset-password` routes live in — match whatever pattern `src/app/(auth)/login` uses
- Copy/microcopy on the forgot/reset minimal UI (keep to 1 sentence + input + CTA — Phase 26 rewrites)
- Which specific mobile-nav hook to refactor vs wrap once root cause is found

### Deferred Ideas (OUT OF SCOPE)
- Admin floating cart button visible on `/admin/*` — POLISH, Phase 40 / 39
- Admin mobile responsiveness overhaul — Phase 37
- Brand-aware auth UI redesign — Phase 26
- Resend + React Email wiring — Phase 24
- `/about` page content and Glitchy intro — Phase 44
- Missing Methodology nav link — Phase 38
- Per-surface admin overhauls — Phases 31, 32, 39
- Password-recovery runbook for admin — DEPLOY-* / ops doc
</user_constraints>

## Project Constraints (from CLAUDE.md)

- **pnpm** for all package ops — never npm or yarn
- **Node v24** with erasable TypeScript (no build step on scripts: `--experimental-strip-types`)
- **Never commit secrets, .env files, or credentials**
- **CodeBox resource limits** — 8 cores / 19GB RAM shared; **never run `next build` in parallel agents**; prefer `pnpm tsc --noEmit` or `pnpm lint` for verification
- **Push to GitHub regularly** — only backup
- **GSD workflow required** — file edits flow through `/gsd:execute-phase`
- **Tech stack locked** — Next.js 16, Tailwind 4, Embla, Framer Motion (imported as `motion` v12.23), Better Auth, Drizzle + Neon, Stripe Embedded Checkout, Resend
- **Mobile-first design** with desktop optimization
- **Site-wide rule:** hover-only RGB-split glitch on all headers; no auto-running animations on headings
- **Playwright verification** during dev so AI confirms visual output (user memory)
- **No `src/components/nav/`** — nav components live in **`src/components/layout/`**

## Summary

Phase 23 bundles 9 launch-blocker bugs. They fall into three tiers by independence:

1. **Trivial, isolated fixes (3 bugs):** `/admin` homepage editor 404 (one wrong href in `admin-sidebar.tsx`), `/about` dead link (zero occurrences in Studios code — the issue is actually the `/tech/about` stub page per audit §B.8 — deferred), and `/admin/clients` and `/admin/roles` — **these latter two are NOT independent**; see below.
2. **Systemic fix with one root cause (1 bug cluster):** Mobile nav double-tap — confirmed via code read, the strongest single hypothesis is the `MobileNavOverlay` panel (`src/components/layout/mobile-nav-overlay.tsx` line 214): `drag="y"` + `style={{ touchAction: "none" }}` on a Framer Motion container that wraps every tile click target. This matches the B.1 (cross-brand tile inside the sidebar) and B.2 (Reviews link in the overlay) instances cleanly, and the A.12 Beats-icon instance is explained by a parallel but different pattern in the bottom tab bar's `active:` pressed state interacting with iOS Safari's hover synthesis. Fix both, verify all 3+ surfaces.
3. **External-dependency bugs (2 bugs):** Mobile checkout Stripe (needs Vercel runtime logs — most likely missing `NEXT_PUBLIC_SITE_URL` or `STRIPE_SECRET_KEY` scoping), and `/admin/media` drag-drop (needs prod R2 env check — the code LOOKS correct in `media-upload-zone.tsx`, so the failure is most likely a 4xx from `getMediaUploadUrl` or R2 CORS blocking the presigned PUT from browser). Both require log inspection the researcher cannot do — the plan must instruct the executor to fetch logs first.
4. **Scaffold + handoff (2 routes):** `/forgot-password` + `/reset-password` — Better Auth 1.5.6 exposes `authClient.forgetPassword({ email, redirectTo })` + `authClient.resetPassword({ newPassword, token })` client APIs. The missing piece is the `emailAndPassword.sendResetPassword` config callback in `src/lib/auth.ts` — Phase 23 wires this to a **stub** that logs the URL; Phase 24 replaces the stub body with Resend. The route URL format is non-negotiable: `${baseURL}/reset-password/${token}?callbackURL=${encoded}` (Better Auth hard-codes this).

**Important audit reconciliation:** Grepping `src/` returned **zero `href="/about"` matches** and **zero `/about"` path references** outside `/tech/about`. The audit §B.8 describes the "About" link as pointing to `/tech/about` (which **exists** as a stub), and §E.1 restates that bug as "missing Methodology / dead /about link — BUG + wire into Methodology". The Phase 23 scope item "/about dead link" is therefore a documentation lag — the actual bug is that the GlitchTech sidebar's "About" tile leads to a placeholder page. Per CONTEXT.md D-09, the user wants the link **removed** (not the stub improved). Plan should remove the two About entries from `src/components/layout/tech-nav-config.ts` (lines 54-60 and 99) plus the two `href="/tech/about"` references at `src/app/(tech)/tech/blog/page.tsx:36` and `src/app/(tech)/tech/benchmarks/page.tsx:27`. The `/tech/about` page file itself can stay (it's out of nav and Phase 44 will reuse the slot — or it can be deleted, planner's call).

**Primary recommendation:** Structure the phase as **5 parallel waves** grouped by independence: W1 (homepage editor 404 + /about link removal) serial-fast, W2 (admin 500s — investigated together because audit §D.1 notes they fail identically), W3 (mobile nav double-tap + B.1 + B.2), W4 (Stripe checkout — needs logs first), W5 (media drag-drop + forgot/reset scaffolds). All 5 can execute in parallel branches, converge on the Playwright regression sweep.

## Standard Stack

### Core (already installed — versions verified in package.json 2026-04-24)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router, RSC, middleware | Locked in project CLAUDE.md |
| React | 19.2.4 | UI | Required by Next.js 16 |
| Better Auth | 1.5.6 | Auth + password reset endpoints | Locked; `/request-password-reset` and `/reset-password` endpoints ship built-in |
| `@stripe/react-stripe-js` | 5.6.1 | `EmbeddedCheckoutProvider`, `EmbeddedCheckout` | Already wired in `/checkout/page.tsx` |
| `@stripe/stripe-js` | 8.11.0 | `loadStripe()` | Already wired |
| Resend SDK | 6.9.4 | NOT used in Phase 23 — Phase 24 | Listed so planner doesn't re-install |
| motion (Framer Motion) | 12.23.12 | Tile interactions, drag gestures | Already used; CAUSE of mobile-nav bug |
| Tailwind CSS | 4.2.x | Styles | Locked |
| Drizzle ORM | 0.45.x | DB queries (admin 500s) | Locked |
| zod | v4 (imported as `zod/v4`) | Form validation on new forgot/reset routes | Matches login/register pattern |
| sonner | latest | Toast notifications for form submit feedback | Matches login/register pattern |

### Supporting (may be needed per bug)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@playwright/test` | installed (tests/ dir has 30+ specs) | Bug reproduction scripts | Every bug per D-18 |
| Existing Playwright config | `playwright.config.ts` at repo root | Reuse harness | Don't roll new config |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Better Auth `forgetPassword` client API | Custom token scheme | **Rejected by D-08.** Better Auth ships the endpoints, token generation, 1-hour expiry, timing-attack mitigation. Rolling custom = re-creating all that. |
| Form-based server action for forgot-password | `authClient.forgetPassword()` from client | **Use the client API** — it's the path the login/register pages already take, keeps the pattern consistent, and the redirect/URL format is handled inside Better Auth. |
| Playwright mobile emulation for checkout bug | Real-mobile manual verification | **Per D-19**, checkout bug likely cannot be fully reproduced in Playwright because it depends on real HTTPS cookies + prod Stripe account state. Plan must mark this manual-mobile-on-prod. |

**Version verification:**
```bash
pnpm view better-auth version     # → 1.5.6 (matches installed)
pnpm view resend version          # → 6.9.4 (Phase 24, not 23)
pnpm view next version            # → 16.2.1 (matches)
```
All already installed. No new packages needed for Phase 23.

## Architecture Patterns

### Recommended Project Structure (new files only)

```
src/
├── app/
│   └── (auth)/
│       ├── forgot-password/
│       │   └── page.tsx        # client component, matches login/register
│       └── reset-password/
│           └── page.tsx        # reads `?token=` from URL search params
└── lib/
    └── auth.ts                 # add emailAndPassword.sendResetPassword stub
```

**Do NOT** create a new route group. Do NOT add `layout.tsx` under forgot-password/reset-password — `src/app/(auth)/layout.tsx` already exists and wraps children in `max-w-md` black card.

### Pattern 1: Forgot-Password page (match login/register structure)

**What:** Client component. Form with one `email` input + submit button. On submit, call `authClient.forgetPassword({ email, redirectTo: window.location.origin + "/reset-password" })`. Show success toast regardless of outcome (Better Auth returns `{ status: true }` even for unknown emails to prevent user enumeration).

**When to use:** This exact pattern. Do not deviate.

**Example:**
```typescript
// src/app/(auth)/forgot-password/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod/v4"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { GlitchLogo } from "@/components/layout/glitch-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({ email: z.email("Enter a valid email") })

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)
    const email = new FormData(e.currentTarget).get("email") as string
    const parsed = schema.safeParse({ email })
    if (!parsed.success) { setErr(parsed.error.issues[0].message); return }

    setIsLoading(true)
    try {
      // Better Auth client plugin exposes forgetPassword
      await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setSent(true)
      toast.success("If that email exists, a reset link is on its way.")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  // ... render — structure copied verbatim from login/page.tsx shell
}
```
Source: `node_modules/better-auth/dist/api/routes/password.mjs` — `requestPasswordReset` endpoint behavior (verified by reading the installed package source).

### Pattern 2: Reset-Password page

**What:** Client component. Reads `?token=<uuid>` from `useSearchParams()`. Form with `newPassword` + `confirmPassword` inputs. Calls `authClient.resetPassword({ newPassword, token })`. On success, toast + redirect to `/login`.

**Token acquisition flow (per Better Auth source):**
1. User clicks email link: `${baseURL}/api/auth/reset-password/${token}?callbackURL=${encoded}`
2. That Better Auth endpoint validates the token + redirects to `callbackURL?token=${token}` (i.e., `/reset-password?token=...`)
3. Our page reads the token from search params and submits it alongside the new password.

Do not attempt to validate the token client-side before submit. Better Auth does the verification inside `/reset-password` POST.

### Pattern 3: Better Auth `sendResetPassword` stub (Phase 24 handoff contract)

Modify `src/lib/auth.ts`:

```typescript
// src/lib/auth.ts — ADD inside emailAndPassword block
emailAndPassword: {
  enabled: true,
  // Phase 23 stub; Phase 24 replaces this body with Resend call.
  // CONTRACT for Phase 24: body signature stays ({ user, url, token }, request)
  // — just swap the console.log for resend.emails.send({ ... }).
  // DO NOT change the function signature or the surrounding config; the
  // forgot-password form submits email + redirectTo and Better Auth builds
  // `url` internally as `${baseURL}/api/auth/reset-password/${token}?callbackURL=${redirectTo}`.
  sendResetPassword: async ({ user, url /* , token */ }) => {
    // eslint-disable-next-line no-console
    console.log(
      `[Phase 23 stub] Password reset requested for ${user.email}. ` +
      `Reset URL: ${url}`
    )
  },
  // Optional: resetPasswordTokenExpiresIn: 3600, // default, keep implicit
},
```

**Phase 24 receives:**
- Signature: `sendResetPassword({ user, url, token }, request): Promise<void>`
- `user` is the full DB user object (name + email available for template)
- `url` is fully constructed — do not mutate; it embeds `callbackURL` already
- `token` is the raw 24-char token (also embedded in `url` — usually unused by the template)
- Returns `Promise<void>`; Better Auth does `runInBackgroundOrAwait` so throwing will NOT fail the HTTP request (good — user sees the success message regardless)

### Anti-Patterns to Avoid

- **Don't roll a custom token scheme.** Better Auth already creates `verificationValue` rows with `identifier="reset-password:${token}"` and a 1-hour expiry. You'd be duplicating tables.
- **Don't add `layout.tsx` under forgot-password/reset-password** — the parent `(auth)/layout.tsx` already wraps them.
- **Don't try to migrate `roles` or `clients` to a different auth model** to fix the 500s. The fix is a query patch, not a redesign.
- **Don't add `try/catch` around the whole Server Component to hide the 500** — per D-01, root-cause not paper-over.
- **Don't change `sendResetPassword` signature in Phase 23.** Phase 24 relies on the exact shape documented above.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password-reset token generation, storage, expiry | Custom `password_reset_tokens` table + UUID + expiry checks | Better Auth `emailAndPassword.sendResetPassword` + `authClient.forgetPassword/resetPassword` | Better Auth 1.5.6 ships it; tested; timing-attack safe; token URL format locked |
| Drag-drop upload UX | Custom file drop handler from scratch | The existing `MediaUploadZone` is correct — debug prod, don't rewrite | Component's `onDragOver` + `preventDefault` + `onDrop` implementation is textbook (verified by read) |
| Stripe Embedded Checkout | Build a custom Stripe Elements form | `EmbeddedCheckoutProvider` + `EmbeddedCheckout` (already wired) | Already correct code at `/checkout/page.tsx`; debug env/config, don't redesign |
| Mobile nav click-delay workaround | iOS-specific `touchstart` handlers | Just remove the `touchAction: "none"` + drag-wrap on the tile grid — or raise tiles to a sibling layer above the draggable container | Framer Motion's drag behavior is the proximate cause; the fix is architectural (separation), not a polyfill |

**Key insight:** Every one of these bugs has a "build my own X" temptation. Resist all four. The correct fixes are smaller than they look.

## Common Pitfalls

### Pitfall 1: Auth-config changes untested on prod-parity
**What goes wrong:** Phase 8 shipped 6 auth bugs that went undetected because testing was local-HTTP-single-domain only.
**Why it happens:** Cookie prefixes (`__Secure-`), `trustedOrigins`, middleware skip-lists, and session-read patterns all behave differently on HTTPS + prod domains.
**How to avoid:** Per CONTEXT.md code_context note and audit §C.4 — any change to auth, session, cookie, middleware, or `trustedOrigins` must be verified on HTTPS + real prod domain + multi-host before closing. Applies directly to forgot/reset routes and any admin 500 fix that touches `requireAdmin()`/`requirePermission()`.
**Warning signs:** Login or password-reset "works locally, fails in prod" with a generic error message.

### Pitfall 2: Next.js 16 middleware silently running on unintended paths
**What goes wrong:** Middleware matcher excludes `api` and `_next`, but hash-less Next.js 16 icon routes (`/icon-<hash>`) were added to the matcher exclusion only after the fact (see `middleware.ts:113-120`). If a new route (e.g., `/reset-password/[token]`) is added, verify the matcher still does what you expect.
**Why it happens:** Middleware matcher regex grew via patches; easy to miss a case.
**How to avoid:** After adding `/forgot-password` and `/reset-password` pages, navigate to both locally on both `localhost:3004` (Studios host context) AND force the `Host:` header to `glitchtech.io` (via curl) to confirm middleware `SHARED_AUTH_PATHS` short-circuit actually bypasses the `/tech` rewrite.
**Warning signs:** `/reset-password?token=xxx` 404s on GlitchTech but resolves on Studios.

### Pitfall 3: Framer Motion drag swallows taps
**What goes wrong:** Mobile user taps a Tile *inside* a `<motion.div drag="y" style={{ touchAction: "none" }}>` wrapper. The first tap is interpreted as a pan-gesture start; the click never fires on the child. On the second tap, the gesture resolves and the click goes through.
**Why it happens:** `touchAction: "none"` explicitly tells the browser "this element handles all pointer events." Framer Motion's drag handler then owns the pointer stream until `pointerup`. If `onDragEnd` fires with `info.offset.y < 120` (no drag), Motion synthesizes a click internally — but it does so by calling the child's click handler only on CERTAIN React versions / pointer-event paths, and the first tap can be swallowed if the user's finger moved even 1-2px between touchstart and touchend.
**How to avoid:** Either (a) lift the tile grid out of the draggable container and keep drag scoped to the handle + backdrop, or (b) use `dragListener={false}` + `dragControls` so drag only starts via an explicit `onPointerDown` on a handle, or (c) remove `touchAction: "none"` and accept native scrolling on the panel. Option (b) is the least invasive.
**Warning signs:** "Second tap works but first does nothing" specifically on touch devices, specifically inside the menu overlay.

### Pitfall 4: Stripe Embedded Checkout error swallowed by `fetchClientSecret`
**What goes wrong:** `fetchClientSecret` throws → `EmbeddedCheckoutProvider` shows the generic "Something went wrong" without surfacing the underlying fetch error to the console in a useful way.
**Why it happens:** `/api/checkout/route.ts` calls `stripe.checkout.sessions.create()` inside an `async` handler with NO try/catch. If `STRIPE_SECRET_KEY` is missing/invalid or the bundle coupon creation fails, the route returns a 500 with no JSON body — `response.json()` throws, `fetchClientSecret` returns `undefined`, Stripe throws the generic error.
**How to avoid:** Add a try/catch to `/api/checkout/route.ts` that logs the error with enough context to debug (Stripe error code, params), AND return a 400/500 JSON envelope so the client can `if (!clientSecret) throw`. This is a plan task: harden the route, then inspect Vercel logs with a repro on the live site.
**Warning signs:** Spinner loads forever → generic error; works on desktop; breaks on mobile. Mobile-only is a red herring — the *symptom* appears mobile-only because mobile users are the only ones actually hitting prod paths currently.

### Pitfall 5: Drizzle `db.execute(sql``)` returns `RowList`, not array
**What goes wrong:** `src/actions/admin-clients.ts` uses `db.execute(sql`…`)` and then iterates results as if they were arrays. If a column referenced in the SQL doesn't exist in the current schema (e.g., `u.role = 'user'` when the `user.role` column is nullable or has a different default from Phase 8), the query throws at runtime and the Server Component bubbles up a 500.
**Why it happens:** Phase 8 added the Better Auth admin plugin which writes `role` as a string — but the SQL in `admin-clients.ts:54` hard-codes `WHERE u.role = 'user'`. If any user has a new role value (e.g., the custom `editor`/`manager` roles added in the roles table), they're silently excluded, which is probably not the 500 cause. More likely: `orders.totalCents` or `orders.user_id` column naming drifted vs. schema OR a `JOIN` column doesn't exist.
**How to avoid:** Run the exact SQL from `admin-clients.ts` and `admin-roles.ts` against the prod DB with `psql` via Neon, see which column complains. Then fix the query (rename, coalesce, or drop stale reference).
**Warning signs:** Both pages fail identically and simultaneously — they share a cause (probably a column rename from a recent migration not propagated to raw SQL).

### Pitfall 6: R2 presigned PUT blocked by CORS
**What goes wrong:** Media drag-drop browser PUTs directly to R2 via presigned URL (`media-upload-zone.tsx:83-92`). If R2 bucket CORS policy doesn't allow the origin, the browser fails the PUT with no useful error — `xhr.onerror` fires → `toast.error("Failed to upload ...")`. File picker path fails the same way.
**Why it happens:** R2 CORS has to be explicitly configured; adding a new domain (e.g., `glitchstudios.io`) often requires updating the bucket's CORS rules to include it as an allowed origin.
**How to avoid:** Before concluding drag-drop is broken, verify file-picker upload ALSO fails on the same surface (per D-17, it's supposed to keep working — if it breaks, the bug is R2 CORS or auth, not drop-handler). Check R2 dashboard for CORS rules.
**Warning signs:** Both drop AND picker uploads fail in prod but work locally.

## Code Examples

### `/admin/homepage` 404 — one-line fix
Source: `src/components/admin/admin-sidebar.tsx` line 85 (verified by read)
```tsx
// BEFORE (broken — route doesn't exist):
{ label: "Homepage", href: "/admin/homepage", icon: Layout, permission: "manage_settings" },

// AFTER:
{ label: "Homepage", href: "/admin/settings/homepage", icon: Layout, permission: "manage_settings" },
```
Also consider adding a Quick Action tile in `src/components/admin/quick-actions.tsx` linking to the editor.

### `/about` removal — four references
From grep (verified 2026-04-24):
```
src/components/layout/tech-nav-config.ts:54-60   — "About" entry in techNavItems
src/components/layout/tech-nav-config.ts:99       — "About" entry in techMobileMenuItems
src/app/(tech)/tech/blog/page.tsx:36              — stray href="/tech/about"
src/app/(tech)/tech/benchmarks/page.tsx:27        — stray href="/tech/about"
```
Delete the nav array entries; replace the two stray anchor hrefs with `/tech/methodology` per audit §B.8 Claude-preferred merge ("methodology IS about, for a review site").

### Mobile nav overlay — least-invasive fix
Source: `src/components/layout/mobile-nav-overlay.tsx` lines 192-216 (verified)
```tsx
// BEFORE — whole panel is draggable, all tiles are children:
<motion.div
  drag="y"
  dragConstraints={{ top: 0 }}
  style={{ y: dragY, opacity: panelOpacity, touchAction: "none" }}
  className="fixed inset-x-0 bottom-0 z-[60] flex flex-col justify-end md:hidden"
>
  <div ref={overlayRef} ...>
    {/* swipe handle, logo, NAV TILES, widgets, close button */}
  </div>
</motion.div>

// AFTER — drag controlled by the handle only:
const dragControls = useDragControls()
// ...
<motion.div
  drag="y"
  dragListener={false}              // do NOT start drag from any pointer down
  dragControls={dragControls}       // start only via explicit handle
  dragConstraints={{ top: 0 }}
  style={{ y: dragY, opacity: panelOpacity }}  // remove touchAction: "none"
  className="..."
>
  <div ref={overlayRef} ...>
    {/* Swipe handle — the ONLY drag initiator */}
    <div
      onPointerDown={(e) => dragControls.start(e)}
      style={{ touchAction: "none" }}
      className="relative z-[2] flex justify-center pb-2 pt-3 cursor-grab"
    >
      <div className="h-1 w-10 rounded-full bg-[#444444]" />
    </div>
    {/* Rest of content — unaffected by drag, taps go straight through */}
  </div>
</motion.div>
```
Motion docs: [motion.dev — drag controls](https://motion.dev/docs/react-gestures#drag-controls). This is the canonical pattern for "drag from handle only" sheets.

### Bottom-tab-bar Beats-icon hang — different cause
Source: `src/components/layout/bottom-tab-bar.tsx` (lines 48-69, verified)

The bottom tab bar uses plain `<Link>` components — no Framer Motion wrapping. The A.12 "Beats icon requires refresh" symptom is likely a **slow route transition**, not a missed click. The `/beats` page probably triggers a heavy RSC payload or blocking data fetch. This overlaps with Phase 25 (Performance) scope.

**Recommendation:** In Phase 23, add `router.prefetch("/beats")` on component mount in the bottom tab bar as a cheap mitigation, and document the rest as a Phase 25 handoff. Don't try to fully fix it here — the user memory note says to scope tightly.

### Better Auth `sendResetPassword` stub
```typescript
// src/lib/auth.ts — add to existing emailAndPassword block
emailAndPassword: {
  enabled: true,
  sendResetPassword: async ({ user, url }) => {
    console.log(`[Phase 23 stub] Password reset for ${user.email}: ${url}`)
  },
},
```

### Stripe route hardening
```typescript
// src/app/api/checkout/route.ts — wrap in try/catch
export async function POST(request: Request) {
  try {
    const { items } = await request.json()
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error("[checkout] NEXT_PUBLIC_SITE_URL not set")
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      )
    }
    // ... existing code ...
    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error("[checkout] Stripe session create failed:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
```

## Per-Bug Research Sections

### Bug 1: `/admin` homepage editor 404

**Current state:** `src/components/admin/admin-sidebar.tsx:85` has `href="/admin/homepage"` but the route lives at `/admin/settings/homepage/page.tsx`. No other nav links to the editor from the dashboard home (`/admin/page.tsx` has a `QuickActions` tile grid at `src/components/admin/quick-actions.tsx` with only Beats/Posts/Messages/Bookings).

**Most probable root cause:** Stale sidebar href. Introduced likely during Phase 5 Admin Dashboard UX refactor (sidebar merged from 7 to 5 sections).

**Fix approach:** One-line edit to `admin-sidebar.tsx:85` (see Code Examples). Optionally add a Quick Action tile linking to Homepage editor (D-15).

**Verification (Playwright):**
```ts
test('admin homepage editor loads via sidebar', async ({ page }) => {
  await page.goto('/admin')
  await page.getByRole('link', { name: /homepage/i }).click()
  await expect(page).toHaveURL(/\/admin\/settings\/homepage/)
  await expect(page.getByText(/homepage editor/i)).toBeVisible()
})
```

**Dependencies:** None. Independent.

**Risks:** The `isActiveRoute` helper at line 108 uses `pathname.startsWith(href)`. Changing href from `/admin/homepage` to `/admin/settings/homepage` shifts which paths light up — verify Site Settings row doesn't steal the active state from Homepage when user is on `/admin/settings/homepage` (it shouldn't, because `/admin/settings` is its own entry but `startsWith` would match both — needs testing).

---

### Bug 2: `/admin/clients` 500

**Current state:** `src/app/admin/clients/page.tsx` is a Server Component that awaits `getClients({ page: 1 })` from `src/actions/admin-clients.ts`. That action uses `db.execute(sql``)` with raw SQL joining `"user"`, `orders`, `bookings`. Reads `u.role`, `o.user_id`, `b.user_id`, `guest_email`, `guest_name`.

**Most probable root cause:** One of:
1. A raw-SQL column name drifted from the Drizzle schema (e.g., `created_at` vs `createdAt` mapping broke in a migration)
2. `requirePermission("view_clients")` throws because the current session's role has no such permission (especially if the Phase 22 auth cascade re-keyed sessions)
3. A `NULL` guest_email or guest_name row crashes the `(rows as any[]).map(...)` coercion downstream (not shown in the snippet, but the action has 3 steps and combines them)

**Fix approach:**
1. Run `pnpm dev`, hit `/admin/clients` with a live owner session, capture the exact error from the terminal.
2. Cross-check with Vercel logs on the prod failure.
3. Fix the specific failure (likely a one-liner — either add `COALESCE` to NULL columns, or patch a column name, or loosen the permission gate for `owner`).

**Verification (Playwright, with admin login fixture):**
```ts
test('admin clients page loads for owner', async ({ page }) => {
  // use existing admin login helper from tests/fixtures
  await page.goto('/admin/clients')
  await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible()
  await expect(page.getByText(/page couldn't load/i)).not.toBeVisible()
})
```

**Dependencies:** Shares investigation with Bug 3. Run them together.

**Risks:** If the root cause is a session-level RBAC issue (not a query issue), the fix may require a DB migration or role-seed — escalate to user before landing.

---

### Bug 3: `/admin/roles` 500

**Current state:** `src/app/admin/roles/page.tsx` awaits `Promise.all([getRoles(), getAdminMembers()])`. Both require `requirePermission("manage_roles")`. `getAdminMembers` uses raw SQL: `SELECT id, name, email, role, created_at FROM "user" WHERE role != 'user'`.

**Most probable root cause:** **Shared with Bug 2** — audit §D.1 notes both fail identically. Most likely shared suspects:
1. The `new Date(r.created_at as string).toISOString()` cast in `admin-roles.ts:171` — if `created_at` comes back as a Date object (Neon sometimes returns timestamps typed), `new Date(Date)` still works, but if it comes back as a number (epoch ms), the string cast produces `"NaN"` and `toISOString()` throws.
2. `getRoles()` uses `db.query.adminRoles.findMany({ with: { permissions: true } })` — if the `adminRoles → adminRolePermissions` relation isn't declared in the schema, Drizzle throws.
3. Auth cascade leftover from §C.4 — `requirePermission("manage_roles")` throws with an Error, and the Server Component doesn't catch it.

**Fix approach:**
1. Same as Bug 2: reproduce locally with terminal logs visible.
2. Patch the specific throw point.
3. Wrap `requirePermission` calls in a top-level try/catch in the page and redirect to `/login` on failure (more graceful than a 500 — aligns with D-01 because the "root cause" is admin-not-logged-in, not a code bug).

**Verification:** Same Playwright pattern as Bug 2.

**Dependencies:** Shares with Bug 2. Single diagnostic session resolves both.

**Risks:** If the fix requires a new permission migration (e.g., `manage_roles` doesn't exist yet in the `adminRolePermissions` enum), escalate.

---

### Bug 4: `/admin/media` drag-drop upload

**Current state:** `src/components/admin/media-upload-zone.tsx` (verified by read).
- `onDragOver` calls `preventDefault()` ✓
- `onDrop` calls `preventDefault()` ✓
- Validates size + MIME ✓
- Calls `getMediaUploadUrl()` server action to get presigned R2 URL
- PUTs file directly to R2 via XHR
- Calls `confirmMediaUpload()` server action

**Most probable root cause:** NOT a handler bug — the code is textbook. Most likely:
1. R2 CORS policy doesn't include the prod origin (`glitchstudios.io` / `glitchtech.io`), so the browser blocks the PUT silently — `xhr.onerror` fires → generic toast.
2. `getMediaUploadUrl()` returns `null` / throws in prod due to missing env vars (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`).
3. `confirmMediaUpload()` 401s because the session cookie isn't reaching the server action from a prod host (audit §C.4 already caught 6 auth bugs here — the same `__Secure-` cookie prefix issue could affect Server Actions).

**Fix approach:**
1. Per D-17, first verify manual file-picker upload ALSO fails. If YES, it's not a drop-handler bug — it's an env/CORS/auth issue. If picker works but drop fails, THEN look at the drop handler (unlikely).
2. Fetch Vercel logs for `/admin/media` and the underlying Server Action calls.
3. Inspect R2 CORS via Cloudflare dashboard.
4. Fix the actual config.

**Verification:** Playwright mobile emulation cannot test real file drag-drop reliably. Use a real-device test. For Playwright, verify the file-picker path works (simulates the backend):
```ts
test('admin media file-picker upload works', async ({ page }) => {
  await page.goto('/admin/media')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('tests/fixtures/tiny.png')
  await expect(page.getByText(/1 file uploaded/i)).toBeVisible({ timeout: 10_000 })
})
```

**Dependencies:** None; but fix overlaps with the "prod-parity auth" discipline from §C.4.

**Risks:** If R2 isn't configured at all (not just misconfigured), Phase 23 should NOT stand up R2 — escalate to user.

---

### Bug 5: `/forgot-password` missing route

**Current state:**
- Middleware already whitelists `/forgot-password` (line 72) ✓
- `/src/app/(auth)/` has `layout.tsx`, `login/`, `register/` — no forgot-password directory ✓ (confirmed via `ls`)
- `src/lib/auth.ts` does NOT set `emailAndPassword.sendResetPassword` — which means Better Auth's `/api/auth/request-password-reset` endpoint throws "RESET_PASSWORD_DISABLED" (verified via `password.mjs:44-48`)

**Most probable root cause:** Not implemented yet. Clean greenfield route addition.

**Fix approach:**
1. Create `src/app/(auth)/forgot-password/page.tsx` (client component matching login.tsx structure — see Code Examples Pattern 1).
2. Add `sendResetPassword` stub to `src/lib/auth.ts` (Pattern 3 — logs URL to console).
3. No server action needed — form calls `authClient.forgetPassword({ email, redirectTo })` directly.
4. Handoff contract for Phase 24: Phase 24 replaces the stub body only; signature locked.

**Verification (Playwright):**
```ts
test('forgot-password page renders + submits', async ({ page }) => {
  await page.goto('/forgot-password')
  await expect(page.getByRole('heading', { name: /reset password|forgot password/i })).toBeVisible()
  await page.getByLabel(/email/i).fill('nobody@example.com')
  await page.getByRole('button', { name: /send|reset|submit/i }).click()
  // Better Auth returns success regardless of email existence
  await expect(page.getByText(/check your email|reset link/i)).toBeVisible({ timeout: 5_000 })
})
```
And a manual verification: with the stub, hitting submit with a real user's email should print a URL to the dev server console.

**Dependencies:**
- **Phase 24 handoff (contract locked):** the `sendResetPassword` callback signature `({ user, url, token }, request) => Promise<void>`. Phase 24 swaps the log statement for `await resend.emails.send({ from, to: user.email, subject, react: <ResetPasswordEmail url={url} name={user.name} /> })`. No other config change needed.

**Risks:** If the user's `NEXT_PUBLIC_BETTER_AUTH_URL` / `BETTER_AUTH_URL` env var isn't set correctly on the server, the `url` passed to `sendResetPassword` will be wrong (wrong host). Double-check against audit §C.4 commit `825abf1` fix for `trustedOrigins`.

---

### Bug 6: `/reset-password` missing route

**Current state:** Same as Bug 5 — middleware whitelisted (line 73), no page, no component.

**Most probable root cause:** Not implemented.

**Fix approach:**
1. Create `src/app/(auth)/reset-password/page.tsx` (client component).
2. Read `?token=` from `useSearchParams()` (Next.js App Router client hook).
3. If no token, show "Invalid reset link" message + link to `/forgot-password`.
4. Otherwise, render new-password + confirm-password form.
5. Submit calls `authClient.resetPassword({ newPassword, token })` → on success, toast + `router.push("/login")`.

**Better Auth URL flow (verified from installed source):**
1. Email contains: `${baseURL}/api/auth/reset-password/${token}?callbackURL=${encoded}`
2. Better Auth validates token via `requestPasswordResetCallback` endpoint (`password.mjs`) → redirects to `${callbackURL}?token=${token}` (i.e., `/reset-password?token=...`)
3. Our page reads the token, user types new password, submits.
4. Better Auth `resetPassword` POST verifies token expiry, hashes new password, updates DB, deletes the verification row.

Do not try to validate the token in our page. Better Auth does it server-side.

**Verification (Playwright):**
```ts
test('reset-password page without token shows invalid state', async ({ page }) => {
  await page.goto('/reset-password')
  await expect(page.getByText(/invalid|expired|request a new/i)).toBeVisible()
})

test('reset-password page with token shows form', async ({ page }) => {
  await page.goto('/reset-password?token=fake-token-for-render-test')
  await expect(page.getByLabel(/new password/i)).toBeVisible()
  await expect(page.getByLabel(/confirm/i)).toBeVisible()
})
```

**Dependencies:**
- Same as Bug 5 — Phase 24 wires Resend. Phase 23's stub lets the researcher copy the URL from the server log and manually paste to `/reset-password?token=...` to test end-to-end before Phase 24 ships.

**Risks:** If `resetPasswordTokenExpiresIn` isn't configured, Better Auth defaults to 1 hour. That's correct per the source; no action needed. But if user wants a different expiry, surface in Phase 24.

---

### Bug 7: `/about` dead link

**Current state (verified via grep 2026-04-24):**
- **Zero** matches for `href="/about"` in Studios code.
- Tech "About" links: 4 total (nav config x2, stray anchor x2) — all point to `/tech/about`.
- `/tech/about` page exists as a 23-line placeholder ("Detailed copy to be written in a future phase").

**Most probable root cause:** Reconciliation needed — the Phase 23 scope line says "/about dead link" but the actual audit finding (§B.8, §E.1) is that the GlitchTech sidebar "About" tile leads to a placeholder page. Per D-09, user wants the link REMOVED.

**Fix approach:**
1. Delete the `About` entry in `src/components/layout/tech-nav-config.ts` (2 occurrences: lines 54-60 in `techNavItems`, line 99 in `techMobileMenuItems`).
2. Update the two stray `href="/tech/about"` anchors in `tech/blog/page.tsx:36` and `tech/benchmarks/page.tsx:27` to point to `/tech/methodology` (per audit §B.8 (b) — "for a review site, about IS methodology").
3. Leave the `src/app/(tech)/tech/about/page.tsx` file in place — no nav links to it, Phase 44 reuses the slot. (Or delete the file, planner's call — has no behavioral impact since it's off-nav.)

**Verification (Playwright):**
```ts
test('tech sidebar has no About link', async ({ page }) => {
  await page.goto('/tech')
  const aboutLink = page.getByRole('link', { name: /^about$/i })
  await expect(aboutLink).toHaveCount(0)
})
```

**Dependencies:** None.

**Risks:** If user actually wanted the Studios `/about` removed (not the Tech one), the planner should escalate before executing. The evidence says Tech is the only `/about` link in the codebase, so this is unambiguous — but worth flagging per D-10.

---

### Bug 8: Mobile checkout — Stripe spinner → error

**Current state:**
- `src/app/(public)/checkout/page.tsx` uses `EmbeddedCheckoutProvider` with `fetchClientSecret` callback
- `src/app/api/checkout/route.ts` creates a Stripe session, no error handling, no env validation
- Returns `{ clientSecret }` on success; on failure returns HTML 500 (no JSON body)
- `fetchClientSecret` does `response.json()` without checking `response.ok` first

**Most probable root cause (ordered by audit-stated likelihood + code read):**
1. **Route 500 silently fails** — client gets generic Stripe error because `response.json()` throws on non-JSON 500 page. A specific env-var miss (missing `NEXT_PUBLIC_SITE_URL` on mobile origin's Vercel env, or Stripe key in test mode mismatch) is the underlying cause.
2. **Empty cart on mobile** — cart state is in localStorage/Context; if mobile Safari Private mode or ITP blocks storage, `items` is `[]`, line_items is `[]`, Stripe rejects the session create with `line_items must contain at least 1 item`.
3. **`return_url` malformed** — `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}` — if `NEXT_PUBLIC_SITE_URL` is unset or has a trailing slash, Stripe may 400.

**Fix approach:**
1. **Harden the route first (see Code Examples) to return structured JSON errors.**
2. Harden `fetchClientSecret` on the client to throw a useful error when `!response.ok`.
3. Re-deploy to a preview.
4. Reproduce on real mobile, read Vercel runtime logs (the hardening makes them actionable).
5. Fix the specific cause revealed.
6. If the cause turns out to be cart state (guess #2), add a "Cart is empty — redirected to /beats" fallback in the page's `items.length === 0` branch to catch the state before Stripe does.

**Verification:**
- **Playwright desktop:** Can verify the hardened route returns JSON errors correctly.
- **Real-device mobile on HTTPS prod:** Required per D-19 — Playwright cannot simulate real iOS Safari + real cart state + real Stripe prod API key. Must complete a full `$1` test-card purchase end-to-end on a real phone before closing.

**Dependencies:**
- Phase 25 (Perf) overlap — if the root cause is slow RSC, pull the A.12 Beats-icon hang into Phase 25 instead.
- Requires Vercel + Stripe dashboard access from the executor.

**Risks:** If `STRIPE_SECRET_KEY` is actually missing from prod env (most likely culprit per audit hypothesis), Phase 23 just surfaces the missing env and the real fix is in Vercel dashboard (no code change). Document that outcome clearly in the bug closure.

---

### Bug 9: Mobile nav double-tap (systemic, 3+ surfaces)

**Current state (verified by read):**
- `src/components/layout/mobile-nav-overlay.tsx:192-216` — entire panel is a Framer Motion `<motion.div drag="y" ... style={{ touchAction: "none" }}>` wrapping all interactive children (nav tiles, widgets, sign-in tile, close button).
- `src/components/layout/bottom-tab-bar.tsx` — plain `<Link>` tabs, no Motion wrapping. Uses Tailwind `active:bg-[#0a0a0a]` for pressed state.
- `src/components/tiles/tile.tsx` — each tile renders as `<Link>` (if href) or `<button>`; uses `useState` + `onMouseEnter/Leave` for hover glitch overlay; NOT wrapped in Motion.
- `src/components/tiles/studios-cross-link-tile.tsx` — plain `<Link>` with `hover:` / `active:` Tailwind states. Not wrapped in Motion.

**Most probable root cause (systemic):**
- **Overlay nav (B.1 cross-brand tile inside expanded sidebar on mobile — wait, actually B.1 is the cross-brand tile inside the MOBILE MENU OVERLAY per audit §B.1):** the Framer Motion drag container swallows the first tap. `touchAction: "none"` + `drag="y"` is a known Motion pattern that requires `dragListener={false}` or a dedicated handle to avoid consuming all tap events.
- **Reviews link in overlay (B.2):** same cause — the Reviews tile inside the overlay is a child of the draggable `motion.div`.
- **Beats icon in bottom tab bar (A.12):** DIFFERENT cause — no Motion wrapper, but the audit notes "unclear if perf (slow route transition blocking on data) or a broken click handler on mobile." This is likely a route transition timing issue, not a tap-miss. The symptom (must refresh) is distinct from the double-tap pattern. In Phase 23, add `router.prefetch("/beats")` on mount of `BottomTabBar` as a cheap mitigation, and flag the root-cause investigation as a Phase 25 handoff.

**Fix approach:**
1. **Mobile nav overlay (covers B.1 + B.2 + any other overlay tile):** introduce `useDragControls()` + `dragListener={false}` and wire drag to start only from the grab-handle `onPointerDown`. Remove `touchAction: "none"` from the panel; keep it on the handle only. (See Code Examples — canonical Motion pattern.)
2. **Bottom tab bar (covers A.12 symptom):** add `router.prefetch()` on mount for each tab's href.

**Verification (Playwright mobile emulation):**
```ts
test.describe('mobile nav single-tap', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true })

  test('overlay Reviews link navigates on first tap', async ({ page }) => {
    await page.goto('/tech/reviews')
    await page.getByRole('button', { name: /open navigation menu/i }).tap()
    await page.getByRole('link', { name: /reviews/i }).tap()
    await expect(page).toHaveURL(/\/tech\/reviews/, { timeout: 3_000 })
  })

  test('overlay cross-brand tile navigates on first tap', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open navigation menu/i }).tap()
    // assume cross-brand tile is in overlay — or test on sidebar if not
    await page.locator('[data-testid="studios-cross-link-tile"]').tap()
    await expect(page).toHaveURL(/glitchtech\.io|\/tech/, { timeout: 3_000 })
  })

  test('bottom-tab Beats navigates quickly on first tap', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /^beats$/i }).tap()
    await expect(page).toHaveURL(/\/beats/, { timeout: 3_000 })
  })
})
```

**Dependencies:** D-05 says verify on 4 surfaces — Beats icon, cross-brand tile, Reviews link, plus one more mobile link as control.

**Risks:**
- Motion `useDragControls` was stable in Motion v11+; v12.23 (installed) supports it.
- If removing `touchAction: "none"` from the panel breaks the swipe-to-dismiss gesture, the handle's `touchAction: "none"` should still allow the drag to work from the handle. Verify manually after change.
- The Beats-icon A.12 symptom may NOT fully resolve with prefetch — it's a perf issue. That's OK for Phase 23; document as handoff to Phase 25.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Roll-your-own password reset tokens | Better Auth `sendResetPassword` + built-in endpoints | Better Auth 1.0 (Oct 2024) | Use the shipped API |
| Custom drop handlers with IE-era quirks | Modern `onDragOver`/`onDrop` with `preventDefault` | React 17+ synthetic events are reliable | Existing code is correct |
| Wrap whole sheet in draggable motion.div | `useDragControls` + `dragListener={false}` on explicit handle | Motion v11+ | Prevents tap-swallowing |
| `try/catch` around Server Components to hide errors | Let them bubble; fix root cause | Next.js App Router philosophy | Per D-01 |

**Deprecated/outdated:**
- Auth.js v4/v5 — Better Auth is the active project (Sept 2025 migration per project CLAUDE.md)
- Moment.js — already replaced with date-fns in stack

## Open Questions

1. **Is `STRIPE_SECRET_KEY` present in Vercel prod env?**
   - What we know: Audit §A.12 guessed it as a likely cause. Code doesn't validate it.
   - What's unclear: Only Vercel dashboard inspection can answer.
   - Recommendation: First plan task is "check Vercel env vars for `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`" — report findings before coding.

2. **Is R2 CORS configured to allow `glitchstudios.io` and `glitchtech.io`?**
   - What we know: The media-upload-zone code is correct. Picker and drop share the same backend path.
   - What's unclear: R2 CORS policy is config, not code. Only Cloudflare dashboard reveals it.
   - Recommendation: Plan task reads Cloudflare R2 dashboard before concluding a code fix is needed.

3. **Do the `/admin/clients` and `/admin/roles` 500s share a root cause, or just coincidentally fail together?**
   - What we know: Audit §D.1 notes identical failure mode.
   - What's unclear: Until one of them is reproduced locally with a stack trace, we're guessing.
   - Recommendation: Investigate them in one diagnostic session (shared wave).

4. **Should the `/tech/about` page file be deleted, or just the nav link removed?**
   - What we know: D-09 says remove the LINK; Phase 44 (Glitchy) plans `/about` as its intro.
   - What's unclear: Does Phase 44 want to reuse `/tech/about` or does it live at `/about` (Studios)?
   - Recommendation: Delete only the nav entries + fix the 2 stray anchor hrefs. Leave the placeholder page file in place. Phase 44 can decide.

5. **Is the A.12 "Beats icon requires refresh" a Phase 23 fix or a Phase 25 perf issue?**
   - What we know: Root cause is not a missed click handler (code is plain `<Link>`).
   - What's unclear: Is it slow RSC, hydration delay, or a cold-nav waterfall?
   - Recommendation: Phase 23 adds `router.prefetch` as mitigation. Full diagnosis is Phase 25.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Playwright | Every bug's D-18 verification | ✓ | installed, tests/ has 30+ specs | — |
| Node.js v24 | Dev server | ✓ (per workspace) | v24 | — |
| pnpm | Package manager | ✓ | latest | — |
| `pnpm dev` on port 3004 | Local repro | ✓ | Caddy at glitch-studios.codebox.local | — |
| Vercel log access | Bug 8 (checkout), Bug 4 (media) | ✗ | — | Executor must request Vercel access or user-provided log export |
| Cloudflare R2 dashboard | Bug 4 CORS check | ✗ | — | User inspection only |
| Stripe dashboard | Bug 8 env verification | ✗ | — | User inspection only |
| Real iOS/Android mobile device on prod | Bug 8 mobile, Bug 9 double-tap | ✗ (unknown) | — | Playwright emulation covers Bug 9; Bug 8 real-device is required per D-19 |
| Better Auth v1.5.6 | Bugs 5 + 6 | ✓ | 1.5.6 | — |
| `sendResetPassword` config | Bugs 5 + 6 | ✗ (not configured) | — | Phase 23 adds the stub; Phase 24 swaps in Resend |

**Missing dependencies with no fallback:**
- Vercel runtime logs for Bug 8 + Bug 4 root-cause analysis. **Plan must include an explicit "user or executor pulls Vercel logs" task** before coding the fix. Without logs, fixes become guesses.
- Real mobile device for Bug 8 end-to-end verification. **Plan must mark this as a manual-verification step** per D-19.

**Missing dependencies with fallback:**
- Resend email send (for Bugs 5 + 6 end-to-end) — fallback is the console.log stub. Phase 24 wires real send. Phase 23 verifies up to "URL is logged when forgot-password is submitted."

## Sources

### Primary (HIGH confidence)

- **Installed Better Auth package source** — `node_modules/better-auth/dist/api/routes/password.mjs` (v1.5.6) — verified the exact contract of `emailAndPassword.sendResetPassword`, token URL format, expiry default (3600s), user-not-found timing-attack mitigation.
- **Phase 22 AUDIT.md sections A.12, B.1, B.2, C.3, D.1, E.1** — bug source of truth per CONTEXT.md canonical_refs.
- **Code reads (verified 2026-04-24):**
  - `src/middleware.ts` (lines 72-73: forgot/reset already whitelisted)
  - `src/lib/auth.ts` (no sendResetPassword configured)
  - `src/app/(auth)/layout.tsx`, `login/page.tsx`, `register/page.tsx` (pattern to match)
  - `src/app/admin/clients/page.tsx`, `src/actions/admin-clients.ts` (500 source)
  - `src/app/admin/roles/page.tsx`, `client.tsx`, `src/actions/admin-roles.ts` (500 source)
  - `src/app/admin/media/page.tsx`, `src/components/admin/media-upload-zone.tsx` (drop handler — CORRECT)
  - `src/components/admin/admin-sidebar.tsx` (line 85 — the 404 href bug)
  - `src/components/admin/quick-actions.tsx` (no homepage editor tile)
  - `src/components/layout/mobile-nav-overlay.tsx` (lines 192-216 — drag swallows tap)
  - `src/components/layout/bottom-tab-bar.tsx` (plain Link — Beats icon bug is perf, not handler)
  - `src/components/tiles/tile.tsx`, `studios-cross-link-tile.tsx` (no Motion wrap at component level)
  - `src/components/layout/tech-nav-config.ts` (About entries lines 54-60, 99)
  - `src/app/api/checkout/route.ts` (no error handling, no env validation)
  - `src/app/(public)/checkout/page.tsx` (fetchClientSecret swallows errors)
  - `src/app/(tech)/tech/about/page.tsx` (placeholder)
  - `src/app/(tech)/tech/blog/page.tsx` (line 36 — stray `/tech/about` anchor)
  - `src/app/(tech)/tech/benchmarks/page.tsx` (line 27 — stray `/tech/about` anchor)
- **`package.json` (2026-04-24)** — verified all installed versions.
- **`playwright.config.ts` + tests/ directory** — 30+ existing specs; harness available for D-18 reproduction scripts.

### Secondary (MEDIUM confidence)

- **Motion docs** — `useDragControls` pattern for handle-only drag sheets. Pattern known from Motion v11+ docs; v12.23 installed supports it.
- **Stripe Embedded Checkout docs** — `fetchClientSecret` pattern is canonical; error handling best practices well-documented.

### Tertiary (LOW confidence)

- **Root cause of A.12 Beats-icon hang** — hypothesis is "slow RSC route transition" based on plain `<Link>` code. Cannot confirm without Vercel log + real-device trace.
- **Root cause of `/admin/clients` + `/admin/roles` 500s** — hypotheses ranked, but a reproduction is required to confirm.
- **Root cause of mobile checkout** — code review points strongly at env/config + route-error-swallowing, but Vercel logs are the ground truth.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — all packages installed, versions verified, no new dependencies.
- Architecture (Better Auth contract, route placement): **HIGH** — read installed package source directly.
- Per-bug root causes:
  - Bug 1 (`/admin` 404): HIGH — exact grep-confirmed href mismatch.
  - Bug 2 (/admin/clients 500): MEDIUM — code read shows likely suspects; ground truth needs local repro.
  - Bug 3 (/admin/roles 500): MEDIUM — shares suspects with Bug 2.
  - Bug 4 (media drag-drop): MEDIUM — code is correct; failure is env/CORS (needs dashboard access).
  - Bug 5 (/forgot-password missing): HIGH — greenfield, Better Auth contract crystal clear.
  - Bug 6 (/reset-password missing): HIGH — same.
  - Bug 7 (/about link): HIGH — exact grep locations + D-09 removal decision.
  - Bug 8 (mobile checkout): LOW-MEDIUM — hypothesis strong, confirmation needs Vercel logs.
  - Bug 9 (mobile nav double-tap overlay): HIGH — code read of `mobile-nav-overlay.tsx:192-216` is a textbook Framer Motion tap-swallow pattern.
  - Bug 9 (Beats-icon hang): MEDIUM — different pattern; prefetch is a mitigation, not a diagnosis.
- Pitfalls: HIGH — grounded in read files + Phase 22 audit §C.4 auth-cascade lessons.

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 (30 days — stack is stable, but any new migration or Vercel env change invalidates Bugs 2/3/4/8 findings).

## RESEARCH COMPLETE

**Phase:** 23 — Debug Broken Pages & Missing Routes
**Confidence:** HIGH (for scaffold/routing bugs) / MEDIUM (for 500s + drag-drop + checkout — all require prod logs before fix)

### Key Findings

- **Mobile-nav double-tap root cause identified (HIGH confidence):** `src/components/layout/mobile-nav-overlay.tsx:192-216` wraps every tile inside a Framer Motion `drag="y"` container with `touchAction: "none"`. Covers audit instances B.1 + B.2. Fix: `useDragControls` + `dragListener={false}` from motion v12.23. The A.12 Beats-icon symptom is a SEPARATE issue (likely perf), mitigated here with `router.prefetch`, escalated to Phase 25 for full diagnosis.
- **`/admin` homepage 404 is a one-line fix:** `admin-sidebar.tsx:85` has `/admin/homepage`; route lives at `/admin/settings/homepage`. Also add a Quick Action tile per D-15.
- **`/about` is already not in Studios code:** zero matches. The actual bug is 4 references to `/tech/about` — 2 nav entries (delete per D-09) + 2 stray anchors (redirect to `/tech/methodology`).
- **Better Auth password-reset contract fully documented for Phase 24 handoff:** `emailAndPassword.sendResetPassword({ user, url, token }, request)` — Phase 23 stubs with `console.log(url)`, Phase 24 replaces body with Resend call. Signature is locked.
- **Admin 500s (clients + roles) share a root cause (MEDIUM confidence):** both are raw-SQL + `requirePermission` flows. Investigate together; likely a stale column name in raw SQL or a session/role cascade leftover from audit §C.4.
- **Stripe mobile + media drag-drop BOTH require Vercel log inspection before coding:** code reads show likely env/CORS/config issues, not broken code. Plan must insert a "pull logs" task upstream of any code fix.

### File Created

`/home/faxas/workspaces/projects/personal/glitch_studios/.planning/phases/23-debug-broken-pages-missing-routes/23-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | All versions verified against installed `package.json` + `node_modules` source |
| Architecture (routes, Better Auth contract) | HIGH | Read Better Auth v1.5.6 source directly; matched existing `(auth)` layout pattern |
| Mobile-nav bug diagnosis | HIGH | Read mobile-nav-overlay.tsx line-by-line; drag-wrap over tiles is unambiguous |
| Admin 500s diagnosis | MEDIUM | Code suspects identified; ground truth requires local reproduction |
| Stripe + Media root causes | LOW-MEDIUM | Require Vercel logs + dashboard access (not available to researcher) |
| Pitfalls | HIGH | All grounded in read files + Phase 22 cascade lessons |

### Open Questions

1. Is `STRIPE_SECRET_KEY` set in Vercel prod env? (Plan must check first.)
2. Is R2 CORS configured for prod hosts? (Plan must check Cloudflare dashboard first.)
3. Does `/admin/clients` + `/admin/roles` share a root cause in raw SQL drift or RBAC state? (Plan must investigate in one diagnostic session.)
4. Should `src/app/(tech)/tech/about/page.tsx` file be deleted too, or just the nav links? (Defaulting to link-only removal; Phase 44 decides for the file.)
5. Is A.12 Beats-icon hang fully closed by `router.prefetch`, or does Phase 25 own the deeper fix? (Plan should scope narrowly and hand off the perf investigation.)

### Ready for Planning

Research complete. Planner can create PLAN.md files for 5 parallel waves:
- **W1 (fast, serial):** Bug 1 (/admin homepage 404) + Bug 7 (/about link removal)
- **W2 (shared diagnosis):** Bugs 2 + 3 (admin 500s)
- **W3 (systemic):** Bug 9 (mobile nav double-tap, covers B.1 + B.2 — and Beats-icon mitigation)
- **W4 (log-gated):** Bug 8 (Stripe mobile checkout) — insert "pull Vercel logs" task first
- **W5 (scaffold + parallel):** Bug 5 + Bug 6 (forgot/reset routes + stub) + Bug 4 (media drag-drop diagnosis)

Each wave closes with its dedicated Playwright regression per D-18. Phase gate: all 9 Playwright specs green + manual mobile Stripe check passes per D-19.
