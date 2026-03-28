---
phase: 04-admin-dashboard-email
plan: 05
subsystem: admin
tags: [clients, guest-support, site-settings, rbac, roles, permissions]

requires:
  - phase: 04-01
    provides: RBAC infrastructure (adminRoles, adminRolePermissions, requirePermission)
provides:
  - Client management page with unified registered + guest client list
  - Client detail sheet with purchase and booking history
  - Site settings form (studio info, contact, social links)
  - Roles & Permissions management page with permission grid and team management
affects: [04-admin-dashboard-email]

tech-stack:
  added: []
  patterns: [raw SQL union for unified client list across user/orders/bookings tables, upsert pattern for key-value site settings]

key-files:
  created:
    - src/actions/admin-clients.ts
    - src/actions/admin-settings.ts
    - src/actions/admin-roles.ts
    - src/components/admin/client-list-table.tsx
    - src/components/admin/client-detail-sheet.tsx
    - src/components/admin/site-settings-form.tsx
    - src/components/admin/role-permission-grid.tsx
    - src/components/admin/admin-member-table.tsx
    - src/app/admin/clients/page.tsx
    - src/app/admin/settings/page.tsx
    - src/app/admin/roles/page.tsx
    - src/app/admin/roles/client.tsx
  modified: []

key-decisions:
  - "Raw SQL union across user/orders/bookings tables to build unified client list including guests"
  - "Upsert pattern (check-then-insert/update) for site settings key-value pairs"
  - "Roles page split into server page.tsx + client.tsx for state management"

patterns-established:
  - "Unified client list: three-source union (registered users, guest orders, guest bookings) merged by email"
  - "Dialog-based role management: invite, change role, remove access all via Dialog components"

requirements-completed: [ADMN-04, ADMN-05, ADMN-09]

duration: 6min
completed: 2026-03-27
---

# Phase 04 Plan 05: Client Management, Site Settings & Roles Summary

**Unified client list (registered + guest purchasers/bookers), site settings form, and RBAC permission grid with team management**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-27T07:47:27Z
- **Completed:** 2026-03-27T07:53:27Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Client list page showing ALL customer types: registered users, guest purchasers, and guest bookers merged by email
- Client detail sheet with purchase history (order items with beat titles) and booking history (service, room, date/time)
- Site settings form with Zod validation for studio info, contact info, and social links
- Roles & Permissions page with interactive checkbox permission grid and admin team member management

## Task Commits

Each task was committed atomically:

1. **Task 1: Client list page with guest support and detail sheet** - `6d91f09` (feat)
2. **Task 2: Site settings form and Roles & Permissions page** - `bff0bd9` (feat)

## Files Created/Modified
- `src/actions/admin-clients.ts` - Server actions for unified client list and detail queries
- `src/actions/admin-settings.ts` - Site settings get/update with upsert pattern
- `src/actions/admin-roles.ts` - Role CRUD, permission updates, admin member management
- `src/components/admin/client-list-table.tsx` - Client table with type filter tabs, search, pagination
- `src/components/admin/client-detail-sheet.tsx` - Slide-out sheet with purchase and booking history
- `src/components/admin/site-settings-form.tsx` - Three-section form with Zod validation
- `src/components/admin/role-permission-grid.tsx` - Permission matrix with checkbox toggling
- `src/components/admin/admin-member-table.tsx` - Team table with invite, change role, remove dialogs
- `src/app/admin/clients/page.tsx` - Client list server page (force-dynamic)
- `src/app/admin/settings/page.tsx` - Settings server page (force-dynamic)
- `src/app/admin/roles/page.tsx` - Roles server page (force-dynamic)
- `src/app/admin/roles/client.tsx` - Roles client wrapper with state management

## Decisions Made
- Raw SQL union approach for client list: three separate queries (registered users, guest orders, guest bookings) merged in JS by email. Simpler than a complex SQL UNION and handles the different schemas cleanly.
- Upsert pattern for site settings: check-then-insert/update rather than Drizzle onConflictDoUpdate (more explicit, avoids unique constraint complexity).
- Roles page uses a client.tsx wrapper component to manage role and member state, keeping the server page.tsx clean.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Client management, site settings, and roles pages are complete
- All features respect RBAC permission checks (view_clients, manage_settings, manage_roles)
- Admin sidebar can link to /admin/clients, /admin/settings, /admin/roles

---
*Phase: 04-admin-dashboard-email*
*Completed: 2026-03-27*
