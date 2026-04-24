# Phase 23: Debug Broken Pages & Missing Routes - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning
**Mode:** Auto (gray areas auto-resolved to recommended defaults)

<domain>
## Phase Boundary

Fix every broken surface the Phase 22 audit catalogued. Eight concrete bugs, all tagged `[LAUNCH-BLOCKER]` or `[BLOCK]` in `22-AUDIT.md`:

1. `/admin` homepage editor — 404 (user couldn't reach the homepage editor)
2. `/admin/clients` — 500 "page couldn't load"
3. `/admin/roles` — 500 "page couldn't load"
4. `/admin/media` — drag-and-drop upload fails on drop
5. `/forgot-password` — route missing (404)
6. `/reset-password` — route missing (404)
7. `/about` — dead link somewhere in the sidebar/nav (no Studios page exists)
8. Mobile checkout — Stripe Embedded Checkout spins indefinitely, then errors
9. Mobile nav double-tap bug — systemic; first tap does nothing, second navigates (confirmed 3+ surfaces: Beats icon, cross-brand tile, Reviews link)

**In scope:** Investigate root cause, ship minimal functional fix, verify with Playwright.
**Out of scope:** Brand-aware redesign of auth pages (Phase 26), wiring Resend (Phase 24), admin mobile responsiveness overhaul (Phase 37), admin list-page pattern (Phase 39), per-surface admin overhauls (Phases 31+). If a fix requires cross-phase coordination (e.g., forgot-password needs Resend), Phase 23 scaffolds the structural half and leaves a clearly-documented handoff for the sibling phase.

</domain>

<decisions>
## Implementation Decisions

### Bug-fix philosophy
- **D-01:** Root-cause every bug, not symptomatic patches. If `/admin/clients` 500s because a query explodes on a nullable column, fix the query — don't catch-and-display a friendly error.
- **D-02:** One phase, all 9 bugs. No splitting. ROADMAP bundles them together because they're all small, launch-blocker, independent, and block production.
- **D-03:** Parallelization: these bugs touch ~independent files. Planner should emit plans that executor can run in parallel waves. Shared files (if any) become serial.

### Mobile nav double-tap (systemic bug)
- **D-04:** Fix at the shared nav handler once, not per-surface. Audit confirmed 3 instances = systemic. Research needs to identify the common component/hook — most likely the mobile bottom tab bar or sidebar link handler in `src/components/nav/*`. Possible causes to investigate in priority order:
  1. `onTouchEnd` vs `onClick` race on mobile Safari (first tap fires hover, second fires click)
  2. Link prefetch blocking initial nav (useRouter/Link interaction)
  3. Framer Motion tap-gesture swallowing the click
  4. A modal/overlay with `pointerEvents: auto` catching the first tap
- **D-05:** Verify fix on at least 4 surfaces (Beats icon, cross-brand tile, Reviews link, plus one more mobile link as control) using a real mobile browser or Playwright mobile emulation.

### Forgot/reset password (Phase 23 scaffolds, Phase 24 wires email)
- **D-06:** Phase 23 ships: `/forgot-password` route + form + stub server action; `/reset-password` route + form + stub server action; minimal brand-compliant UI (Tailwind + existing layout — no new component system, matches current login/register visual density so it doesn't look broken). Phase 26 redesigns. Phase 24 wires Resend + React Email templates.
- **D-07:** Server actions should be structured so Phase 24 only has to swap the stub email-send call for Resend. Document the integration contract explicitly in the plan.
- **D-08:** Better Auth ships password reset primitives — use the official API (`forgetPassword`, `resetPassword` endpoints) rather than a custom token scheme. Check `src/lib/auth.ts` for existing setup.

### `/about` dead link
- **D-09:** **Remove** the dead link, don't stub a page. Phase 44 (Glitchy mascot) explicitly scopes `/about` as Glitchy's introduction page — stubbing here creates churn. Find every `href="/about"` in `src/` and either delete the link or route it to an existing destination (home, services, or contact — planner decides per context).
- **D-10:** If research finds the `/about` link is important for SEO/nav expectations, escalate to user before stubbing. Default is removal.

### Mobile checkout Stripe failure
- **D-11:** Diagnose via Vercel runtime logs on the `/api/checkout/*` endpoints first — don't guess. Audit lists likely causes:
  - Missing/invalid `STRIPE_SECRET_KEY` in prod env
  - Empty cart payload shipped to Stripe
  - Missing `NEXT_PUBLIC_SITE_URL` for redirect config
  - Stripe account in test mode while client SDK expects live (or vice versa)
- **D-12:** Verify on real mobile + desktop after fix. Mobile checkout must complete a full beat purchase end-to-end on production parity before this bug closes.

### Admin 500s (`/admin/clients`, `/admin/roles`)
- **D-13:** Investigate via Vercel runtime logs + `pnpm dev` locally with the same DB. Most common causes for post-v2.0 Next.js 16 admin 500s in this repo (inferred from recent auth-bug cascade): stale session reads, Server Component query against missing column, or RBAC gate throwing before render.

### Admin `/admin` homepage editor 404
- **D-14:** Research must first reconcile the URL the user was on vs the actual route. The editor component exists at `src/components/admin/homepage-editor.tsx` and is mounted at `/admin/settings/homepage/page.tsx`. The 404 is likely one of:
  - Stale nav link pointing to `/admin/homepage` instead of `/admin/settings/homepage`
  - Missing dashboard widget that links to the editor from `/admin`
  - A tile/CTA in the admin home that targets a non-existent route
- **D-15:** Fix: update the link to point to the correct route. If no link existed, add a visible entry-point from `/admin` to the homepage editor (small card or quick-action).

### `/admin/media` drag-drop upload
- **D-16:** Debug the drop handler. Check:
  - Is the Uploadthing (or other) endpoint configured for prod?
  - Does the drop handler call `preventDefault` on `dragover`? Missing preventDefault silently breaks drop.
  - CSRF / auth on the upload endpoint
- **D-17:** Manual file-picker upload must keep working — don't regress the working path while fixing drag-drop.

### Verification (per bug)
- **D-18:** Each bug closes only when a Playwright script reproduces the original broken behavior from audit notes, then passes after the fix. Per the user's memory note: Playwright verification during dev so AI confirms visual output.
- **D-19:** Where Playwright is impractical (real-mobile Stripe checkout on HTTPS prod), the planner specifies an alternative (manual verification on real mobile device over Tailscale or prod) in the plan task.
- **D-20:** Don't ship the fix if the reproduction can't be captured. A bug that can't be reproduced can't be verified.

### Claude's Discretion
- Exact Playwright test structure (reuse existing harness if one exists)
- Which directory new `/forgot-password` / `/reset-password` routes live in — match whatever pattern `src/app/(auth)/login` uses
- Copy/microcopy on the forgot/reset minimal UI (keep to 1 sentence + input + CTA — Phase 26 rewrites)
- Which specific mobile-nav hook to refactor vs wrap once root cause is found

### Folded Todos
None — no pending todos matched. (Cross-reference step skipped because init returned phase_found: false; proceeded by direct scope from ROADMAP.md + 22-AUDIT.md.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Bug source-of-truth
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §A.12 — Mobile checkout Stripe failure + Beats-icon nav bug
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §B.1 — Cross-brand tile double-tap (mobile nav bug, 2nd instance)
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §B.2 — Reviews link double-tap (mobile nav bug, 3rd instance — systemic confirmed)
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §C.3 — `/forgot-password` + `/reset-password` missing routes
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §D.1 — Admin homepage editor 404, `/admin/clients` + `/admin/roles` 500s, `/admin/media` drag-drop, admin floating-cart bug (latter is POLISH, not Phase 23)
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §E.1 — `/about` dead link source
- `.planning/phases/22-visual-audit-discovery/22-AUDIT.md` §K row 23 — phase intent restatement

### Roadmap
- `.planning/ROADMAP.md` line 31 — Phase 23 canonical line item and scope list
- `.planning/ROADMAP.md` lines 30-33 — launch-blocker cluster; Phase 23 ships parallel with 24 (Email) and 25 (Perf)

### Codebase entry points
- `src/app/(auth)/login/` — pattern for new `/forgot-password` + `/reset-password` route group (match this structure)
- `src/middleware.ts` lines 72-73 — forgot-password and reset-password already whitelisted as public routes; routes must exist to resolve
- `src/lib/auth.ts` — Better Auth configuration; password-reset primitives live here; trustedOrigins cascade documented in audit §C.4
- `src/app/api/checkout/route.ts` — checkout session creation endpoint; investigate for mobile Stripe failure
- `src/app/api/checkout/session-status/route.ts` — session status polling endpoint
- `src/app/admin/settings/homepage/page.tsx` + `src/components/admin/homepage-editor.tsx` — homepage editor actual location (404 is a link/discoverability issue, not a missing component)
- `src/app/admin/clients/` — client list page (500 source)
- `src/app/admin/roles/` — roles page (500 source; has `client.tsx` + `page.tsx`)
- `src/app/admin/media/` — media library page (drag-drop source)
- `src/components/nav/` + mobile layout components — mobile nav double-tap root cause lives somewhere in here
- `src/app/(tech)/tech/about/` — GlitchTech has `/tech/about`; Studios does not have `/about`

### Prior-phase context (patterns to follow)
- `.planning/phases/16.1-public-site-maintenance/16.1-CONTEXT.md` — most recent bug-sweep phase; mirror its decision density and wave-parallel task shape

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **Existing `(auth)` route group** at `src/app/(auth)/` with `layout.tsx`, `login/`, `register/` — forgot-password + reset-password go here, inherit the layout.
- **Better Auth primitives** in `src/lib/auth.ts` — provides `forgetPassword` and `resetPassword` endpoints; don't roll custom token logic.
- **Middleware already whitelists** `/forgot-password` and `/reset-password` (lines 72-73) — no middleware changes needed when adding the routes.
- **Homepage editor component exists** at `src/components/admin/homepage-editor.tsx` — 404 bug is a routing/linking issue, not a missing feature.
- **Checkout API routes exist** at `src/app/api/checkout/route.ts` and `.../session-status/route.ts` — bug is in wiring/config, not missing endpoints.

### Established patterns
- **Auth bug prod-parity lesson (from audit §C.4):** Six auth bugs shipped undetected through v2.0 because testing was local-HTTP-single-domain-only. Any change to auth, session, cookie, middleware, or trustedOrigins config must be verified on HTTPS + real prod domain + multi-host before closing. Applies directly to the forgot/reset routes.
- **Brand structure:** two brands share the codebase (`(public)` = Studios, `(tech)` = GlitchTech). Forgot/reset is shared auth — lives under `(auth)` not brand-prefixed.
- **Commit-per-task protocol** from GSD — keep bug fixes atomic per file scope.

### Integration points
- Phase 24 (Email) will consume Phase 23's stub server actions for `/forgot-password` and `/reset-password` — plan must document the send-email contract clearly.
- Phase 26 (Auth UI redesign) will replace Phase 23's minimal UI on forgot/reset pages — keep Phase 23 styling uncomplicated so the rewrite is clean.
- Phase 44 (Glitchy) will build `/about` properly — removing the dead link now avoids stubbing a throwaway page.

</code_context>

<specifics>
## Specific Ideas

- "User verdict on double-tap bug: users won't double-tap; they'll assume the site is broken and leave" — treat as UX-critical, not cosmetic.
- Audit observed `/admin/clients` and `/admin/roles` failing identically ("page couldn't load error") — may share a root cause (shared layout, shared auth gate, shared query pattern). Investigate together before fixing separately.
- Stripe Embedded Checkout error surfaced as generic "Something went wrong, please try again or contact the merchant." — classic symptom of a failed client-session fetch. Vercel logs are the ground truth, don't guess.
- The audit captured 6 auth bugs that shipped undetected because Phase 8 testing was local-HTTP-only. Use that as the test-scope north star for Phase 23 fixes that touch auth/middleware/Stripe config.

</specifics>

<deferred>
## Deferred Ideas

- **Admin floating cart button visible on `/admin/*`** (audit §D.1) — tagged POLISH, not LAUNCH-BLOCKER. Add to polish backlog or fold into Phase 40 (Public Per-Page Polish) / admin list-page pattern phase (Phase 39).
- **Admin mobile responsiveness overhaul** — Phase 37 (Mobile-Native-Feel Sweep).
- **Brand-aware auth UI redesign** — Phase 26.
- **Resend + React Email wiring** — Phase 24.
- **`/about` page content and Glitchy intro** — Phase 44.
- **Missing Methodology nav link** (audit §E.1 noted alongside the /about link) — Phase 38 (GlitchTech Brand-Wide Editorial Polish).
- **Per-surface admin overhauls** — Phases 31, 32, 39.
- **Password-recovery runbook for admin** (audit §C.4 process gap) — defer to DEPLOY-* or a separate ops doc.

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 23-debug-broken-pages-missing-routes*
*Context gathered: 2026-04-24*
