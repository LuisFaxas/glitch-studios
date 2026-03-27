---
phase: 04-admin-dashboard-email
plan: 01
subsystem: database, auth, ui
tags: [drizzle, rbac, permissions, admin-dashboard, sidebar, framer-motion]

requires:
  - phase: 03-booking-calendar
    provides: "Booking tables, admin CRUD actions, Better Auth admin plugin"
provides:
  - "9 new Phase 4 database tables (adminRoles, adminRolePermissions, blogTags, blogPostTags, mediaAssets, homepageSections, contactReplies, newsletterBroadcasts, siteSettings)"
  - "RBAC permission system (requireAdmin, requirePermission, getSessionPermissions)"
  - "AdminShell layout with sidebar navigation and permission gating"
  - "Dashboard overview page with stat tiles and activity feed"
  - "All existing admin files migrated to centralized RBAC auth"
  - "Drizzle relations for adminRoles, blogTags, contactReplies"
affects: [04-02, 04-03, 04-04, 04-05, 04-06, 04-07, 04-08]

tech-stack:
  added: []
  patterns: [centralized-rbac, admin-shell-layout, permission-gated-sidebar]

key-files:
  created:
    - src/lib/permissions.ts
    - src/lib/db-migrate-04.ts
    - src/components/admin/admin-shell.tsx
    - src/components/admin/admin-sidebar.tsx
    - src/components/admin/stat-tile.tsx
    - src/app/admin/page.tsx
  modified:
    - src/db/schema.ts
    - src/lib/auth.ts
    - src/app/admin/layout.tsx
    - src/actions/admin-beats.ts
    - src/actions/admin-bundles.ts
    - src/app/admin/rooms/actions.ts
    - src/app/admin/packages/actions.ts
    - src/app/admin/availability/actions.ts
    - src/app/admin/services/[id]/booking-config/actions.ts
    - src/app/api/bookings/confirm/route.ts
    - src/app/api/bookings/cancel/route.ts
    - src/app/api/bookings/reschedule/route.ts
    - vercel.json

key-decisions:
  - "RBAC requireAdmin accepts any non-user role for backwards compatibility with existing admin role"
  - "Owner and legacy admin bypass all permission checks in requirePermission"
  - "Cast session.user.role to string for Drizzle eq() type safety"
  - "AdminShell is a server component that fetches permissions and unread count"
  - "AdminSidebar is a client component with mobile sheet and desktop fixed sidebar"

patterns-established:
  - "Centralized RBAC: import { requireAdmin, requirePermission } from @/lib/permissions"
  - "AdminShell wraps all admin routes via layout.tsx, provides sidebar + content area"
  - "Permission-gated sidebar: sections hidden based on user permissions array"
  - "StatTile: reusable dashboard metric tile with stagger animation"

requirements-completed: [ADMN-09]

duration: 8min
completed: 2026-03-27
---

# Phase 04 Plan 01: Schema, RBAC, AdminShell & Dashboard Summary

**Extended DB schema with 9 Phase 4 tables, centralized RBAC permission system replacing 10 hardcoded role checks, AdminShell layout with tile-based sidebar, and dashboard overview with stat tiles + activity feed**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-27T07:28:09Z
- **Completed:** 2026-03-27T07:36:09Z
- **Tasks:** 2
- **Files modified:** 21

## Accomplishments
- Extended DB schema with all Phase 4 tables (RBAC, blog tags, media assets, homepage sections, contact replies, newsletter broadcasts, site settings)
- Created centralized RBAC system with backwards-compatible requireAdmin (accepts admin + owner + editor + manager + custom roles)
- Built AdminShell layout with permission-gated tile sidebar, mobile sheet, and desktop fixed sidebar
- Created dashboard overview page with 4 stat tiles (revenue, bookings, messages, subscribers) and recent activity feed
- Migrated all 10 existing admin files from hardcoded role==="admin" to centralized RBAC-compatible auth
- Added publish-scheduled cron job to vercel.json

## Task Commits

1. **Task 1: Extend DB schema, RBAC utilities, migration, auth config** - `50b5836` (feat)
2. **Task 2: AdminShell, sidebar, dashboard, RBAC compatibility pass** - `ab7671d` (feat)

## Files Created/Modified
- `src/db/schema.ts` - Extended with 9 new tables, 3 new columns, postStatusEnum updated, Drizzle relations added
- `src/lib/permissions.ts` - RBAC utilities: requireAdmin, requirePermission, getSessionPermissions
- `src/lib/db-migrate-04.ts` - SQL migration script with default roles, permissions, admin-to-owner migration
- `src/lib/auth.ts` - Better Auth admin plugin updated with adminRoles config
- `src/components/admin/admin-shell.tsx` - Server component wrapping admin routes with sidebar + content
- `src/components/admin/admin-sidebar.tsx` - Client component with tile nav, section groups, permission gating, mobile sheet
- `src/components/admin/stat-tile.tsx` - Reusable dashboard metric tile with Framer Motion stagger
- `src/app/admin/page.tsx` - Dashboard overview with 4 stats and activity feed
- `src/app/admin/layout.tsx` - Simplified to render AdminShell
- `src/actions/admin-beats.ts` - Migrated to centralized requireAdmin from permissions.ts
- `src/actions/admin-bundles.ts` - Migrated to centralized requireAdmin
- `src/app/admin/rooms/actions.ts` - Migrated to centralized requireAdmin
- `src/app/admin/packages/actions.ts` - Migrated to centralized requireAdmin
- `src/app/admin/availability/actions.ts` - Migrated to centralized requireAdmin
- `src/app/admin/services/[id]/booking-config/actions.ts` - Migrated to centralized requireAdmin
- `src/app/api/bookings/confirm/route.ts` - Changed role!=="admin" to role==="user"
- `src/app/api/bookings/cancel/route.ts` - Changed role!=="admin" to role==="user"
- `src/app/api/bookings/reschedule/route.ts` - Changed role!=="admin" to role==="user"
- `vercel.json` - Added publish-scheduled cron entry

## Decisions Made
- RBAC requireAdmin accepts any non-"user" role (not just "admin") for backwards compatibility with existing users while enabling new roles
- Owner and legacy "admin" role bypass all permission checks in requirePermission (full access)
- Cast session.user.role to string for Drizzle eq() type safety since Better Auth types role as string | null | undefined
- AdminShell is a server component that fetches permissions and unread count before rendering
- AdminSidebar sections are permission-gated: items with a permission prop are hidden if user lacks that permission

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- TypeScript error with session.user.role type (string | null | undefined) not assignable to Drizzle eq() parameter - resolved by casting to string after null check

## User Setup Required

Run the Phase 4 migration script against the database:
```bash
DATABASE_URL=<your-url> npx tsx src/lib/db-migrate-04.ts
```
This creates all new tables, inserts default roles/permissions, and migrates existing admin users from role="admin" to role="owner".

## Known Stubs

None - all data sources are wired to real database queries.

## Next Phase Readiness
- All Phase 4 database tables ready for subsequent plans
- RBAC system ready for permission-specific checks in Plans 02-08
- AdminShell layout renders on all admin routes, ready for new admin pages
- Dashboard overview functional with real data queries

---
*Phase: 04-admin-dashboard-email*
*Completed: 2026-03-27*
