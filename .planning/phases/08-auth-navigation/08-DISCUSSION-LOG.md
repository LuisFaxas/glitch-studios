# Phase 8: Auth & Navigation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 08-auth-navigation
**Areas discussed:** Role scope for /admin redirect, Dashboard scope for this phase, Sign-out destination, Out-of-scope auth features

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Role scope for /admin redirect | Who redirects to /admin — admin only, admin + owner, or auth helper? | ✓ |
| Dashboard scope for this phase | Nav-only, minimal landing, or full dashboard? | ✓ |
| Sign-out destination | Homepage, login page, or context-aware? | ✓ |
| Out-of-scope auth features | Remember me / social / reset / verification — defer which? | ✓ |

**User's choice:** All four areas selected for discussion.

---

## Role scope for /admin redirect

| Option | Description | Selected |
|--------|-------------|----------|
| admin + owner → /admin (Recommended) | Both roles land on /admin. Matches auth.ts adminRoles. | |
| Only admin → /admin, owner → /dashboard | Strict role split. Unusual for owner. | |
| Use Better Auth's built-in hasAdminAccess helper | Let the library decide. | |

**User's initial response (free text):** "There should be a super admin that is on top of everything and can see both pages at the same time. And there should be admin for each one of the pages being like the studio or the tech. And then should be worker or employee one for people."

**Interpretation:** User surfaced a full RBAC hierarchy vision — super_admin, per-vertical admin (studio_admin / tech_admin), and employee roles — that is broader than Phase 8's scope.

**Follow-up question — RBAC split strategy:**

| Option | Description | Selected |
|--------|-------------|----------|
| Defer RBAC redesign to new phase, Phase 8 uses existing roles (Recommended) | Phase 8 ships with admin + owner → /admin; full hierarchy becomes a separate phase. | ✓ |
| Expand Phase 8 to include RBAC redesign | Phase 8 grows to 12+ plans, delays ship date. | |
| Pause Phase 8, create an RBAC phase first | New phase first, Phase 8 waits. | |

**User's choice:** Defer.

**Decision captured:** D-01 (Phase 8 redirect = admin OR owner → /admin). RBAC hierarchy captured as deferred idea.

---

## Dashboard scope for this phase

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal landing page (Recommended) | Greeting + read-only purchases/bookings summaries with empty states. | ✓ |
| Nav-only — dashboard stays as-is | Skeleton /dashboard untouched. | |
| Full client dashboard | Purchases + bookings + profile + password + email prefs. | |

**User's choice:** Minimal landing page.

**Decision captured:** D-11 (greeting + purchases section + bookings section, read-only). D-12 (fills in /dashboard/page.tsx only, does not touch /dashboard/purchases or /dashboard/bookings subdirectories).

---

## Sign-out destination

| Option | Description | Selected |
|--------|-------------|----------|
| Homepage / (Recommended) | Clean default, public marketing surface. | ✓ |
| Login page /login | Faster re-login but odd for anon browsing. | |
| Stay on current page if public, else homepage | Nicer UX, more code paths. | |

**User's choice:** Homepage.

**Decision captured:** D-10 (sign out from anywhere → /).

---

## Out-of-scope auth features (Deferral Confirmation)

| Option | Description | Selected |
|--------|-------------|----------|
| Remember me checkbox | Session length toggle. | ✓ deferred |
| Social login (Google/Apple/GitHub) | OAuth providers. | ✓ deferred |
| Password reset flow | Forgot password → email → reset. | ✓ deferred |
| Email verification | Verify on signup, unverified gating. | ✓ deferred |

**User's choice:** All four deferred.

**Decision captured:** All four listed in CONTEXT.md `<deferred>` section under "Auth features explicitly deferred from Phase 8 scope".

---

## Claude's Discretion

- Exact Drizzle query shapes for dashboard sections (joins, ordering, limits) — planner picks based on existing `src/actions/` patterns.
- Visual layout of purchases/bookings sections (grid vs stacked) — follow UI-SPEC tile patterns, specifics left to executor.
- Whether to add "View all" links under dashboard sections — allowed but not required.

## Deferred Ideas (Roll-up)

### New phase / backlog
- **Role hierarchy redesign** — super_admin / studio_admin / tech_admin / employee. Cited by user as "a very important thing" during discussion; captured for future phase (suggested Phase 8.1 or backlog).

### Future auth polish phase
- Remember me checkbox
- Social login
- Password reset flow
- Email verification

### Future client dashboard phase
- Profile editor
- Password change
- Email preferences
- Beat re-download
- Booking reschedule/cancel
- Order history filtering/pagination

### Future global polish phase
- Unread indicator / badge on "My Account"

---
