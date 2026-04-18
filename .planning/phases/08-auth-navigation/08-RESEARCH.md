# Phase 8: Auth & Navigation - Research

**Researched:** 2026-04-17
**Domain:** Better Auth session handling, Next.js App Router RSC patterns, role-based routing, dashboard data queries
**Confidence:** HIGH — all findings sourced directly from the codebase, not external docs

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: After login, role `"admin"` OR `"owner"` → `/admin`. All others → `/dashboard`.
- D-02: No toast on success. Button label state ("Signing in...") only. Hard `router.push` only.
- D-03: Fix bug in `src/app/(auth)/login/page.tsx` — currently always redirects to `/admin`.
- D-04: Post-registration redirect changes from `/` to `/dashboard`. Keep existing success toast copy.
- D-05: Desktop sidebar logged-in state: user initials avatar (24px circle) + "MY ACCOUNT" text link + sign-out icon button replacing the "SIGN IN" tile.
- D-06: Mobile nav overlay logged-in state: "Sign In" tile → "My Account" tile linking to `/dashboard`. Sign Out replaces it conditionally.
- D-07: Avatar initials derived from `session.user.name` (first letter of each word, max 2 words). Fallback: first letter of email prefix.
- D-08: No new `/admin/login` route. Admin separation achieved via UX flow + role redirect only.
- D-09: Sign out is immediate — no confirmation dialog.
- D-10: After sign-out, redirect to `/` from any surface.
- D-11: Minimal dashboard landing page — greeting + "My Purchases" (beatOrders) + "My Bookings" (bookings), read-only.
- D-12: Fill in `/dashboard/page.tsx` skeleton only. Do NOT touch `/dashboard/bookings/` or `/dashboard/purchases/` subdirectory pages.

### Claude's Discretion
- Exact visual layout of dashboard sections (grid vs stacked, card density) — follow UI-SPEC tile patterns.
- Query shape in Drizzle calls (joins, ordering, limits) — use existing patterns from `src/actions/`.
- Whether to add a "View all" link under each section — allowed but not required.

### Deferred Ideas (OUT OF SCOPE)
- RBAC hierarchy (super_admin, studio_admin, tech_admin, employee/worker)
- Remember me checkbox
- Social login
- Password reset flow
- Email verification
- Profile editor, password change, email preferences
- Beat re-download links, booking reschedule/cancel actions
- Order history filtering/pagination
- Unread indicator/badge on "My Account"
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | Login redirects users based on role — admin to /admin, regular users to /dashboard | Bug is in login/page.tsx line 53: `router.push("/admin")` unconditional. Fix: read `data.user.role` from signIn return value, branch on "admin"/"owner". |
| NAV-02 | Client account access (sign up, login, dashboard) is discoverable in main navigation | TileNav + MobileNavOverlay already use `useSession`. TileNav shows Sign In/Out, but logged-in state only shows Sign Out — missing "MY ACCOUNT" link + avatar. Mobile overlay shows Sign In OR Sign Out, but logged-in state needs "My Account" tile + "My Account" links to /dashboard. |
| NAV-03 | Sign-up flow clearly separated from admin login | No admin/login route exists. Admin separation is purely UX/flow: same /login page, role-redirect sends admin to /admin. No code change needed for this except ensuring D-03 is fixed. |
</phase_requirements>

---

## Summary

Phase 8 is a surgical codebase-only phase. All files to modify already exist — no new routes, no new schema, no new dependencies. The work is 5 targeted edits across 5 files plus creating one new landing page.

The login bug (NAV-01) is a one-liner fix: `signIn.email()` already returns `{ data, error }` where `data.user.role` is available immediately. The current code ignores `data` entirely and unconditionally pushes to `/admin`. The fix reads `data.user.role`, checks for `"admin"` or `"owner"`, and branches the push.

The nav surfaces (NAV-02) are client components already using `useSession`. TileNav's logged-in branch currently only shows a Sign Out button — it needs to become a two-element row: initials avatar + "MY ACCOUNT" link on the left, sign-out icon on the right. MobileNavOverlay currently shows Sign Out tile when logged in but omits any "My Account" link — it needs the tile label/href to change to "My Account" → `/dashboard` when logged in.

The dashboard landing page (D-11) is an RSC that uses the exact same `auth.api.getSession` + Drizzle query pattern already established in `/dashboard/purchases/page.tsx` and `/dashboard/bookings/page.tsx`. `getUserOrders(userId)` already exists in `src/actions/orders.ts`. A bookings query pattern already exists inline in `/dashboard/bookings/page.tsx` and can be copied directly.

**Primary recommendation:** Execute as 3 plans: (1) login/register redirect fixes, (2) nav surface auth state upgrade, (3) dashboard landing page.

---

## Standard Stack

### Core (all pre-installed, no new dependencies)

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| better-auth | installed | Session management, signIn/signOut/useSession | src/lib/auth-client.ts |
| drizzle-orm | installed | Database queries for orders + bookings | src/actions/orders.ts |
| next/navigation | built-in | `useRouter`, `redirect` | login/page.tsx pattern |
| next/headers | built-in | RSC session reads (`await headers()`) | dashboard/purchases/page.tsx |
| lucide-react | installed | LogIn, LogOut, User icons | tile-nav.tsx |
| sonner | installed | Toast notifications (already wired) | register/page.tsx |

**No new installs required for this phase.**

---

## Architecture Patterns

### Pattern 1: Client-side role check after signIn (login/page.tsx)

**What:** Read `data.user.role` from the `signIn.email()` return value immediately in the success branch. No second session fetch.

**Current code (buggy):**
```typescript
const { error, data } = await signIn.email({ email, password })
if (error) {
  toast.error("Invalid email or password. Please try again.")
} else {
  router.push("/admin")   // ← BUG: ignores role
  router.refresh()
}
```

**Fixed pattern:**
```typescript
const { error, data } = await signIn.email({ email, password })
if (error) {
  toast.error("Invalid email or password. Please try again.")
} else {
  const role = data?.user?.role
  if (role === "admin" || role === "owner") {
    router.push("/admin")
  } else {
    router.push("/dashboard")
  }
  router.refresh()
}
```

**Source:** Directly observed in `src/app/(auth)/login/page.tsx` — `data` is already destructured but unused. `auth.ts` confirms `adminRoles: ["owner", "admin"]`.

**Confidence:** HIGH

---

### Pattern 2: RSC session read (server components)

**What:** Server components in the dashboard use `auth.api.getSession({ headers: await headers() })`. This is the canonical pattern, used in purchases/page.tsx, bookings/page.tsx, and admin tech/reviews pages.

**Canonical pattern:**
```typescript
export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  // use session.user.id, session.user.name, session.user.email
}
```

**Critical:** `export const dynamic = "force-dynamic"` is required — already present in purchases/page.tsx and bookings/page.tsx. The current dashboard/page.tsx already sets this. The new landing page content MUST include it.

**Source:** `src/app/(public)/dashboard/purchases/page.tsx` line 1–8 and `src/app/(public)/dashboard/bookings/page.tsx` line 1–8. Confirmed in admin tech pages.

**Confidence:** HIGH

---

### Pattern 3: Client component session detection (tile-nav.tsx, mobile-nav-overlay.tsx)

**What:** Client components call `const { data: session } = useSession()` from `@/lib/auth-client`. Branch on `session?.user` for logged-in state. Already used in both TileNav and MobileNavOverlay.

```typescript
const { data: session } = useSession()
// session?.user exists when logged in
// session?.user.name — display name
// session?.user.email — fallback for initials
// session?.user.role — "admin" | "owner" | "user"
```

**Source:** `src/components/layout/tile-nav.tsx` line 41, `src/components/layout/mobile-nav-overlay.tsx` line 91.

**Confidence:** HIGH

---

### Pattern 4: Avatar initials derivation (new utility — inline or helper)

**What:** No existing initials/avatar utility found in codebase. `src/components/ui/avatar.tsx` exists (from base-ui, with `AvatarFallback`) but is not currently used in TileNav or MobileNavOverlay. Phase 8 can implement initials derivation as a small inline utility in TileNav.

**Derivation logic (per D-07):**
```typescript
function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  return email.split("@")[0][0].toUpperCase()
}
```

**Whether to use `Avatar` component:** The existing `Avatar` from `@base-ui/react/avatar` is a full component with image + fallback slots. For the collapsed sidebar (24px circle in a 48px tap target), a plain `<span>` with inline styles is cleaner and avoids importing additional base-ui primitives for a trivial use case. Planner can decide.

**Confidence:** HIGH (logic trivial; Avatar component availability confirmed)

---

### Pattern 5: Purchase history query (already exists)

**What:** `getUserOrders(userId: string)` in `src/actions/orders.ts` returns orders with nested items including beat title, slug, cover art, license tier, and price. Returns `[]` for no orders.

```typescript
import { getUserOrders } from "@/actions/orders"
const orders = await getUserOrders(session.user.id)
// orders[].createdAt, orders[].items[].beat.title, orders[].totalCents
```

**Source:** `src/actions/orders.ts` lines 74–120.

**Confidence:** HIGH — exact function signature confirmed.

---

### Pattern 6: Bookings query pattern (inline in dashboard/bookings/page.tsx)

**What:** No `getUserBookings` server action exists in `src/actions/`. The bookings page queries inline using Drizzle directly. For D-11's dashboard landing, a simplified version (upcoming only, limit 5) can be extracted.

**Existing pattern (from `/dashboard/bookings/page.tsx`):**
```typescript
import { db } from "@/lib/db"
import { bookings, services, rooms } from "@/db/schema"
import { eq, or, asc } from "drizzle-orm"

const today = new Date().toISOString().split("T")[0]
const allBookings = await db
  .select({
    id: bookings.id,
    serviceName: services.name,
    date: bookings.date,
    startTime: bookings.startTime,
    status: bookings.status,
  })
  .from(bookings)
  .innerJoin(services, eq(bookings.serviceId, services.id))
  .where(
    or(
      eq(bookings.userId, session.user.id),
      eq(bookings.guestEmail, session.user.email)
    )
  )
  .orderBy(asc(bookings.date), asc(bookings.startTime))
```

**Important:** bookings join on `or(eq(bookings.userId, ...), eq(bookings.guestEmail, ...))` — handles both logged-in bookings AND guest bookings matched by email. This must be preserved.

**Source:** `src/app/(public)/dashboard/bookings/page.tsx` lines 25–54.

**Confidence:** HIGH

---

### Pattern 7: Sign-out with redirect

**What:** Sign-out is already wired in both TileNav and MobileNavOverlay with `router.push("/")` + `router.refresh()` after `await signOut()`. This is already correct per D-10. No change needed to the sign-out logic itself.

```typescript
await signOut()
router.push("/")
router.refresh()
```

**Source:** `src/components/layout/tile-nav.tsx` lines 93–96 and 163–166.

**Confidence:** HIGH — sign-out already redirects to `/`.

---

### Current TileNav Logged-In State (what D-05 changes)

**Current behavior:** When logged in, expanded sidebar shows only a "Sign Out" button (no initials, no "MY ACCOUNT" link). Collapsed sidebar shows only a LogOut icon.

**D-05 requires:** Expanded logged-in → two-element row: `[initials circle + "MY ACCOUNT" link]` on left, `[sign-out icon button]` on right. Collapsed logged-in → initials circle centered in 48px tap target, clicking navigates to `/dashboard` (or `/admin` for admin/owner).

The "MY ACCOUNT" link destination is role-aware:
```typescript
const accountHref = (role === "admin" || role === "owner") ? "/admin" : "/dashboard"
```

**Source:** `src/components/layout/tile-nav.tsx` lines 88–111 (collapsed) and 159–182 (expanded).

**Confidence:** HIGH

---

### Current MobileNavOverlay Logged-In State (what D-06 changes)

**Current behavior:** When logged in, shows "Sign Out" tile in bottom-left slot. When logged out, shows "Sign In" tile linking to `/login`.

**D-06 requires:** When logged in, "Sign Out" tile becomes "My Account" tile linking to `/dashboard`. Per UI-SPEC: "Sign In" tile → "My Account" tile. Sign Out logic (the actual sign-out) is still needed — need to decide placement. UI-SPEC says "Sign Out moves to same slot if session exists." Re-reading UI-SPEC §Mobile Nav Overlay: "Logged in: 'Sign In' Tile replaced by 'My Account' Tile (User icon + 'MY ACCOUNT' label) linking to /dashboard." This means the logged-in slot becomes "My Account" link, not Sign Out. However the current code shows Sign Out when logged in. The CONTEXT.md D-06 says: "Sign Out replaces it conditionally." This is ambiguous — see Open Questions below.

**Source:** `src/components/layout/mobile-nav-overlay.tsx` lines 332–363.

**Confidence:** HIGH (existing code confirmed) / MEDIUM (exact logged-in slot assignment needs planner resolution — see Open Questions)

---

### Dashboard Page: Current State

**Reality check:** The dashboard is at `src/app/(public)/dashboard/` (inside `(public)` route group), NOT `src/app/dashboard/`. The CONTEXT.md references `src/app/dashboard/page.tsx` but the actual path is `src/app/(public)/dashboard/page.tsx`.

**Current `dashboard/page.tsx`:** Not a 311-byte skeleton — it's already 9 lines that call `auth.api.getSession`, redirect to `/login` if no session, then `redirect("/dashboard/purchases")`. This means hitting `/dashboard` currently just redirects to `/dashboard/purchases`.

**D-11 requires:** Replace this redirect-only page with an actual landing page: greeting + "My Purchases" preview section + "My Bookings" preview section.

**Current `dashboard/layout.tsx`:** A client component with tab navigation (Purchases / Bookings tabs). This layout renders around `/dashboard/page.tsx`, `/dashboard/purchases/page.tsx`, and `/dashboard/bookings/page.tsx`. The tab nav will show on the landing page too — which is appropriate.

**Source:** `src/app/(public)/dashboard/page.tsx` and `src/app/(public)/dashboard/layout.tsx`.

**Confidence:** HIGH

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session reads in RSC | Custom middleware/cookie parsing | `auth.api.getSession({ headers: await headers() })` | Already the canonical pattern in 4 existing pages |
| Purchase data for dashboard | New Drizzle query | `getUserOrders(userId)` from `src/actions/orders.ts` | Already exists, returns full order+items shape |
| Bookings data for dashboard | New action file | Inline Drizzle query (copy from bookings/page.tsx pattern) | Existing inline pattern is clear, no abstraction needed yet |
| Sign-out redirect | Custom cleanup logic | `await signOut(); router.push("/"); router.refresh()` | Already wired and working in tile-nav.tsx |

---

## Common Pitfalls

### Pitfall 1: Path confusion — dashboard is in (public) route group
**What goes wrong:** Files referenced as `src/app/dashboard/` in CONTEXT.md but actual path is `src/app/(public)/dashboard/`.
**Why it happens:** CONTEXT.md was written before route group structure was confirmed.
**How to avoid:** Use `src/app/(public)/dashboard/page.tsx` in all plans.
**Warning signs:** File not found errors when editing dashboard/page.tsx.

---

### Pitfall 2: Forgetting `export const dynamic = "force-dynamic"`
**What goes wrong:** Next.js statically renders the dashboard landing page. Session call returns null on every request. User always gets redirected to /login.
**Why it happens:** Next.js App Router defaults to static rendering. `auth.api.getSession` requires request headers which are only available at runtime.
**How to avoid:** Add `export const dynamic = "force-dynamic"` at the top of the new dashboard/page.tsx, before any imports. Already present in all existing dashboard sub-pages.
**Warning signs:** `/dashboard` redirects to `/login` even when authenticated.

---

### Pitfall 3: Reading role from a second session call instead of signIn return
**What goes wrong:** After `signIn.email()` succeeds, firing `auth.api.getSession` or `useSession` to get the role introduces an async gap. Role may not be set yet in the client session cache.
**Why it happens:** Pattern cargo-culted from server component patterns into a client component.
**How to avoid:** Read `data.user.role` directly from the `signIn.email()` return value. The `data` object is already destructured in login/page.tsx but currently ignored.
**Warning signs:** Role-based redirect inconsistency under network latency.

---

### Pitfall 4: MobileNavOverlay role-conditional "MY ACCOUNT" destination
**What goes wrong:** "My Account" tile links to `/dashboard` for all logged-in users — but admin users should land on `/admin`.
**Why it happens:** D-06 only mentions `/dashboard` for the mobile My Account tile. UI-SPEC §Mobile Nav Overlay also only says `/dashboard`.
**How to avoid:** Per UI-SPEC: mobile "My Account" links to `/dashboard` only — no role-awareness on mobile (admin users can navigate from /dashboard to /admin separately). This matches the spec — do not add role-awareness to mobile.
**Warning signs:** Admin users clicking "My Account" on mobile land at /dashboard (this is correct per spec).

---

### Pitfall 5: dashboard/layout.tsx tab nav shows on landing page
**What goes wrong:** The tab nav in `dashboard/layout.tsx` (Purchases | Bookings tabs) wraps all dashboard pages including the new landing page. The landing page will have the tab nav at top plus its own content below.
**Why it happens:** Next.js layout wraps all children.
**How to avoid:** This is expected and acceptable — the CONTEXT.md says D-12 does NOT touch subdirectory pages or layout. The planner should design the landing page to coexist naturally with the tab nav (greeting above the tabs, sections below).
**Warning signs:** Attempting to hide or remove the tab nav from the landing page — that would require touching layout.tsx (out of scope).

---

## Code Examples

### Existing server session pattern (canonical)
```typescript
// Source: src/app/(public)/dashboard/purchases/page.tsx
export const dynamic = "force-dynamic"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect("/login")
// session.user.id, session.user.name, session.user.email, session.user.role
```

### Existing getUserOrders call (for "My Purchases" section)
```typescript
// Source: src/actions/orders.ts lines 74–120
import { getUserOrders } from "@/actions/orders"
const orders = await getUserOrders(session.user.id)
// Returns: { id, userId, totalCents, status, createdAt, items: [{ beat: { title, slug }, licenseTier, price }] }[]
```

### Booking query for "My Bookings" section (simplified from bookings/page.tsx)
```typescript
// Source: src/app/(public)/dashboard/bookings/page.tsx lines 25–54
import { db } from "@/lib/db"
import { bookings, services } from "@/db/schema"
import { eq, or, gte, asc } from "drizzle-orm"

const today = new Date().toISOString().split("T")[0]
const upcomingBookings = await db
  .select({
    id: bookings.id,
    serviceName: services.name,
    date: bookings.date,
    startTime: bookings.startTime,
    status: bookings.status,
  })
  .from(bookings)
  .innerJoin(services, eq(bookings.serviceId, services.id))
  .where(
    or(
      eq(bookings.userId, session.user.id),
      eq(bookings.guestEmail, session.user.email)
    )
  )
  .orderBy(asc(bookings.date), asc(bookings.startTime))
  .limit(5)
```

### Role-aware signIn redirect (the fix for D-03)
```typescript
// Source: login/page.tsx — current buggy code + fix
const { error, data } = await signIn.email({ email, password })
if (error) {
  toast.error("Invalid email or password. Please try again.")
} else {
  const role = data?.user?.role
  router.push(role === "admin" || role === "owner" ? "/admin" : "/dashboard")
  router.refresh()
}
```

### Initials derivation utility (new, inline)
```typescript
// Per D-07: first letter of first+second word; fallback email prefix
function getInitials(name: string | null | undefined, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase()
  }
  return (email.split("@")[0][0] ?? "U").toUpperCase()
}
```

### TileNav expanded logged-in row (per D-05)
```typescript
// Replaces current "Sign Out button only" in expanded sidebar
// Left: initials circle + MY ACCOUNT link. Right: sign-out icon.
const role = session?.user.role
const accountHref = (role === "admin" || role === "owner") ? "/admin" : "/dashboard"
const initials = getInitials(session?.user.name, session?.user.email ?? "")

// Row structure:
<div className="flex w-full items-center border border-[#222222] bg-[#111111] mt-1">
  <Link href={accountHref} className="flex flex-1 items-center gap-2 py-2 pl-3 hover:bg-[#1a1a1a] transition-colors">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#222222] text-[#f5f5f0] font-mono text-[10px] font-bold uppercase shrink-0">
      {initials}
    </span>
    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">My Account</span>
  </Link>
  <button onClick={handleSignOut} className="flex items-center justify-center p-2 hover:bg-[#1a1a1a] transition-colors" aria-label="Sign Out">
    <LogOut className="h-4 w-4 text-[#f5f5f0]" />
  </button>
</div>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Redirect every login to /admin | Read role from signIn return, branch push | Fixes NAV-01 |
| Sign In tile shows in both logged-in and logged-out | Show Sign In when out, My Account + initials when in | Satisfies NAV-02 |
| Post-registration → / (homepage) | Post-registration → /dashboard | Client immediately enters account |
| /dashboard auto-redirects to /dashboard/purchases | /dashboard shows landing page with both sections | Real client landing experience |

---

## Open Questions

1. **Mobile overlay: Sign Out placement when logged in**
   - What we know: Current code shows Sign Out tile when logged in (left slot in bottom row). D-06 says "My Account" tile replaces Sign In when logged in. UI-SPEC says "Sign Out moves to same slot." This is contradictory — "My Account" and "Sign Out" can't both occupy the same single slot.
   - What's unclear: Does logged-in state show BOTH "My Account" (left) + "Sign Out" would go where? Right slot is currently the "Close" button (permanent). Or does the logged-in left slot cycle between My Account link and Sign Out button? Or does the tile become "My Account" with a separate sign-out mechanism (e.g., via the sidebar on desktop)?
   - Recommendation: Read UI-SPEC literally — "My Account" tile in left slot when logged in, no separate Sign Out tile in mobile overlay. User can sign out from desktop sidebar or by navigating to /dashboard and using a sign-out action there. If planner wants Sign Out accessible on mobile, swap left slot between My Account and Sign Out based on current page (this adds complexity beyond D-06 scope). **Simplest correct interpretation: logged-in left slot = "My Account" tile linking to /dashboard. Sign Out is desktop-only in this phase.**

2. **Dashboard landing page heading — GlitchHeading vs plain mono**
   - What we know: UI-SPEC says "Auth page h1 uses plain font-mono since it has no hover interaction in a centered form context." Dashboard is not an auth page but it's a simple informational page. GlitchHeading is the site-wide rule for headers but the hover-glitch on a greeting ("Welcome back, {name}") may feel odd.
   - What's unclear: Should the greeting use GlitchHeading or plain font-mono?
   - Recommendation: Use plain font-mono for the dashboard greeting per the "interactive heading" rationale — the greeting is not a navigational heading. Section headings ("MY PURCHASES", "MY BOOKINGS") can use GlitchHeading if they're designed as clickable links to the full sub-pages.

3. **`beatOrders` vs `orders` — CONTEXT.md terminology**
   - What we know: CONTEXT.md and REQUIREMENTS.md refer to "beatOrders table" but the actual Drizzle schema has `orders` + `orderItems` tables (no `beatOrders` table). `getUserOrders` in `src/actions/orders.ts` queries the `orders` table filtered by `userId`.
   - Resolution: "beatOrders" in CONTEXT.md is informal naming for `orders`. Use `getUserOrders(userId)` — confirmed working.
   - **No blocker** — this is clarified by reading the schema directly.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code/config changes within the existing Next.js app. No external tools, services, or CLIs beyond what the project already uses.

---

## Sources

### Primary (HIGH confidence — directly read from codebase)

- `src/lib/auth.ts` — Better Auth config; `adminRoles: ["owner", "admin"]` confirmed
- `src/lib/auth-client.ts` — Exports: `signIn`, `signUp`, `signOut`, `useSession`, `authClient`
- `src/db/schema.ts` — `user.role` column (text, default "user"); `orders`, `orderItems`, `bookings` tables confirmed
- `src/app/(auth)/login/page.tsx` — Bug confirmed: line 53 unconditional `router.push("/admin")`; `data` already destructured but unused
- `src/app/(auth)/register/page.tsx` — `router.push("/")` confirmed at line 69; toast copy confirmed
- `src/components/layout/tile-nav.tsx` — `useSession` already in use; logged-in shows Sign Out only; sign-out already redirects to "/"
- `src/components/layout/mobile-nav-overlay.tsx` — `useSession` in use; logged-in shows Sign Out tile; logged-out shows Sign In tile
- `src/app/(public)/dashboard/page.tsx` — Uses `auth.api.getSession`; redirects to `/dashboard/purchases` (not a stub)
- `src/app/(public)/dashboard/layout.tsx` — Client component, tab nav; wraps all sub-pages
- `src/app/(public)/dashboard/purchases/page.tsx` — Canonical RSC session pattern; uses `getUserOrders`
- `src/app/(public)/dashboard/bookings/page.tsx` — Canonical inline Drizzle query for user bookings
- `src/actions/orders.ts` — `getUserOrders(userId)` function confirmed; returns orders with nested items
- `src/components/ui/avatar.tsx` — Avatar component exists (base-ui) but unused in nav surfaces
- `.planning/config.json` — `nyquist_validation: false` confirmed; validation section skipped

### Secondary (MEDIUM confidence)
- N/A — all findings from direct file reads

---

## Metadata

**Confidence breakdown:**
- Login bug fix: HIGH — bug location confirmed in file, fix pattern is trivial
- Nav surface changes: HIGH — both files read, `useSession` already wired
- Dashboard queries: HIGH — both `getUserOrders` and bookings inline pattern confirmed
- Dashboard path: HIGH — confirmed at `src/app/(public)/dashboard/`, not `src/app/dashboard/`
- Avatar initials: HIGH — no existing utility, trivial to add inline
- Sign-out wiring: HIGH — already redirects to "/" in both components

**Research date:** 2026-04-17
**Valid until:** Stable — no external dependencies; valid until codebase structure changes
