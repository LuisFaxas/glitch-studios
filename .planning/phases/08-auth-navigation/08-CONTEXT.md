# Phase 8: Auth & Navigation - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the role-based redirect bug after login, make client account entrances (Sign In / My Account) discoverable in existing nav surfaces, and land the logged-in client on a minimal but useful `/dashboard` landing page.

**Out of scope:** social login, password reset, email verification, remember-me, full client dashboard features (edits, downloads, reschedule), and the larger RBAC hierarchy redesign (super_admin / per-vertical admin / employee roles).

</domain>

<decisions>
## Implementation Decisions

### Role redirect (NAV-01)
- **D-01:** After login, redirect logic reads `session.user.role`. Values `"admin"` OR `"owner"` → `router.push("/admin")`. All other values (default `"user"`) → `router.push("/dashboard")`.
- **D-02:** No toast on success. No loading overlay. Button label state ("Signing in...") is sufficient feedback. Hard router.push only.
- **D-03:** Fix the existing bug in [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx) where every login redirects to /admin regardless of role.
- **D-04:** Post-registration redirect changes from `/` to `/dashboard`. Keep the existing success toast copy: `"Account created. Welcome to Glitch Studios."`

### Navigation discoverability (NAV-02)
- **D-05:** Desktop sidebar [tile-nav.tsx](src/components/layout/tile-nav.tsx): when logged in, replace the existing "SIGN IN" tile with a row containing user initials (24px circle) + "MY ACCOUNT" text link (pointing to /dashboard for clients, /admin for admin/owner) + a sign-out icon button. Layout details locked in UI-SPEC §Auth State.
- **D-06:** Mobile nav overlay [mobile-nav-overlay.tsx](src/components/layout/mobile-nav-overlay.tsx): when logged in, the "Sign In" tile becomes a "My Account" tile linking to /dashboard. Sign Out replaces it conditionally. No new mobile tab bar slot — keeps the 5-slot Beats/Services/Portfolio/Blog/Menu pattern established in Phase 07.3.
- **D-07:** Avatar initials: derived from `session.user.name` (first letter of first word; if name has 2+ words, first letter of each of first two words). Fallback if no name: first letter of email prefix.

### Admin separation (NAV-03)
- **D-08:** No new /admin/login route. Separation is achieved by: (a) no public nav link to /admin/*, (b) admin users use the same /login page, (c) post-login role redirect routes them to /admin. UX flow does the separation, not URL split.

### Sign-out behavior
- **D-09:** Sign out is immediate — no confirmation dialog, single tap/click. Reversible by re-signing-in.
- **D-10:** After sign-out, redirect to `/` (homepage) from any surface (dashboard, admin, or elsewhere). Single destination, no context-aware routing.

### Dashboard scope (NAV-02 landing)
- **D-11:** Phase 8 builds a minimal `/dashboard` landing page only:
  - Greeting: `"Welcome back, {name}"` (mono heading, consistent with brand)
  - "My Purchases" section — reads from `beatOrders` table (existing from Phase 2). Lists recent purchases with title + date. Empty state copy locked in UI-SPEC: `"No purchases yet. Browse the beat catalog to get started."`
  - "My Bookings" section — reads from `bookings` table (existing from Phase 3). Lists upcoming bookings with service + date. Empty state copy: `"No bookings yet. Book a studio session to get started."`
  - Read-only. No edit/cancel/download actions. No profile editor. No password change.
- **D-12:** Dashboard already has `/dashboard/layout.tsx` + `/dashboard/page.tsx` (skeleton) + `/dashboard/bookings/` + `/dashboard/purchases/` subdirectories. Phase 8 fills in the landing page at `/dashboard/page.tsx` — does NOT touch the subdirectory pages (future polish phase).

### Claude's Discretion
- Exact visual layout of the two dashboard sections (grid vs stacked, card density) — follow UI-SPEC tile patterns but planner/executor decides specifics.
- Query shape in the Drizzle call (joins, ordering, limits) — planner picks based on existing patterns in `src/actions/`.
- Whether to add a "View all" link under each dashboard section linking to /dashboard/purchases and /dashboard/bookings — allowed but not required.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth library & session shape
- [src/lib/auth.ts](src/lib/auth.ts) — Better Auth config. Shows `admin` plugin with `adminRoles: ["owner", "admin"]`, confirming D-01 covers both.
- [src/lib/auth-client.ts](src/lib/auth-client.ts) — Client exports: `signIn`, `signUp`, `signOut`, `useSession`, `authClient`. Used throughout auth pages.
- [src/db/schema.ts](src/db/schema.ts#L22) — `user.role` column (`text, default "user"`). Values set per Better Auth admin plugin conventions.

### Existing auth pages (extend, don't redesign)
- [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx) — Client login page. Has the redirect bug D-03 fixes.
- [src/app/(auth)/register/page.tsx](src/app/(auth)/register/page.tsx) — Client registration page. D-04 updates post-signup redirect here.
- [src/app/(auth)/layout.tsx](src/app/(auth)/layout.tsx) — Shared auth layout (centered max-w-md card).

### Existing nav surfaces (modify, don't rebuild)
- [src/components/layout/tile-nav.tsx](src/components/layout/tile-nav.tsx) — Desktop sidebar with current "Sign In" tile. D-05 changes its logged-in state.
- [src/components/layout/mobile-nav-overlay.tsx](src/components/layout/mobile-nav-overlay.tsx) — Mobile hamburger overlay. D-06 changes its logged-in state.
- [src/components/layout/nav-config-types.ts](src/components/layout/nav-config-types.ts) — Nav item type definitions.
- [src/components/layout/public-nav-config.ts](src/components/layout/public-nav-config.ts) — Public nav config (mobileTabItems already excludes auth).

### Dashboard
- [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx) — Dashboard guard + layout (already redirects to /login if no session).
- [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx) — 311-byte skeleton landing page. D-11 fills this in.
- [src/app/dashboard/bookings/page.tsx](src/app/dashboard/bookings/page.tsx) — Existing sub-route (do NOT touch in Phase 8).
- [src/app/dashboard/purchases/page.tsx](src/app/dashboard/purchases/page.tsx) — Existing sub-route (do NOT touch in Phase 8).

### UI contract (already approved)
- [.planning/phases/08-auth-navigation/08-UI-SPEC.md](.planning/phases/08-auth-navigation/08-UI-SPEC.md) — Locked visual + interaction contracts. Planner MUST match Copywriting, Color, Typography, Spacing, Component map tables.

### Existing domain tables (for dashboard queries)
- [src/db/schema.ts](src/db/schema.ts) — `beatOrders` (purchases), `bookings` (sessions), `user` (identity). Planner reads these to shape D-11 queries.

### Project + requirements
- [.planning/REQUIREMENTS.md](.planning/REQUIREMENTS.md) — NAV-01, NAV-02, NAV-03 acceptance criteria.
- [.planning/ROADMAP.md](.planning/ROADMAP.md) — Phase 8 goal + 4 success criteria.
- [CLAUDE.md](CLAUDE.md) — Project brand, tech stack conventions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **GlitchLogo** component — already used on /login and /register; match size="md" for consistency.
- **shadcn Input / Label / Button / Sonner toast** — all installed; no new shadcn components needed.
- **Lucide icons** — `LogIn`, `LogOut`, `User`, `Settings` already in use; pick from this set.
- **Better Auth useSession hook** from `auth-client.ts` — already exported; use in tile-nav.tsx and mobile-nav-overlay.tsx for logged-in detection.

### Established Patterns
- **Tile styling:** border `#222` bg `#111` hover bg `#1a1a1a` — locked in UI-SPEC. Every new tile must match.
- **Session reads in server components:** `await auth.api.getSession({ headers: await headers() })` pattern (used in admin routes). Can be reused on /dashboard.
- **Toast on action:** Sonner is wired via `Toaster` in layout; use `toast.success(...)` / `toast.error(...)` directly.
- **Glitch Heading:** Headings use `<GlitchHeading text="...">...</GlitchHeading>` — applies to dashboard greeting.
- **Client-side role check in login/page.tsx:** Use `useSession` post-signIn, NOT a server read — the signIn.email() return value includes session data.

### Integration Points
- Login redirect: inline in `handleSubmit` after `signIn.email({email, password})` resolves. Match by role → router.push.
- Register redirect: inline in `handleSubmit` after `signUp.email(...)` resolves with success.
- Sidebar auth detection: `useSession()` at top of TileNav, branch on `session.data?.user`.
- Mobile overlay auth detection: same `useSession()` pattern in MobileNavOverlay.
- Dashboard landing queries: server component, uses `auth.api.getSession` + Drizzle queries on `beatOrders`/`bookings`.

</code_context>

<specifics>
## Specific Ideas

- **User vision (captured, deferred):** Eventual role hierarchy — **super_admin** (sees both Studios + Tech admin surfaces), **studio_admin** (scoped to Studios admin only), **tech_admin** (scoped to Tech admin only), **employee/worker** (limited permissions for hired staff). This is NOT Phase 8 work, but downstream RBAC phase should support all four tiers with scoped permissions.
- **Phase 07.6 just shipped** with full Glitch Tech public surface. Phase 8 rides on the same design tokens (`#f5f5f0`, `#111`, `#222`, JetBrains Mono 11px labels). Do not introduce new colors or fonts.
- **Admin plugin trusted:** auth.ts declares `adminRoles: ["owner", "admin"]` — D-01's "admin OR owner → /admin" aligns exactly with what Better Auth already considers admin-capable. No schema changes needed.
- **No /admin/login route exists** (filesystem confirmed). NAV-03 solved through UX flow per D-08, not by creating a new URL.

</specifics>

<deferred>
## Deferred Ideas

### RBAC hierarchy redesign (new phase)
- Add `super_admin`, `studio_admin`, `tech_admin`, `employee/worker` roles
- Scope admin permissions by vertical (Studios vs Tech)
- Admin UI for role assignment
- Better Auth accessControl config extension
- **Belongs in:** dedicated RBAC phase after 8 (suggested: `8.1 - Role Hierarchy`, or backlog item)

### Auth features explicitly deferred from Phase 8 scope
- **Remember me checkbox** — Session length extension toggle. Better Auth supports it; future auth polish phase.
- **Social login** (Google/Apple/GitHub) — OAuth providers. Not in NAV-* requirements; future auth phase.
- **Password reset flow** — Forgot password → email token → reset page. Significant scope (email template + route + token handling); future auth phase.
- **Email verification** — Verify email on signup, verify route, unverified gating. Not required for NAV-*; future auth phase.

### Client dashboard features deferred from Phase 8 scope
- Profile editor (name, email change)
- Password change form
- Email preferences / notification settings
- Beat re-download links (requires signed URL refresh)
- Booking reschedule / cancel actions
- Order history filtering / pagination
- **Belongs in:** Phase 13+ Global Polish or a dedicated "Client Dashboard" phase

### Nav persistence (NAV-02 polish)
- Unread indicator / badge on "My Account" when user has unread receipts or upcoming bookings
- **Belongs in:** Phase 14 Global Polish

</deferred>

---

*Phase: 08-auth-navigation*
*Context gathered: 2026-04-17*
