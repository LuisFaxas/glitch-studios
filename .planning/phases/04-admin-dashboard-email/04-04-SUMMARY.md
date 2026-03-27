---
phase: 04-admin-dashboard-email
plan: 04
subsystem: ui
tags: [admin, crud, services, team, testimonials, tiptap, media-picker, soft-delete]

requires:
  - phase: 04-02
    provides: Tiptap editor and media library components
provides:
  - Service page CRUD with soft-delete safety for booking-linked services
  - Team member management with photo selection and social links
  - Testimonial management with service type and rating
affects: [04-admin-dashboard-email]

tech-stack:
  added: []
  patterns: [soft-delete for FK-referenced entities, dialog-based CRUD for simple forms, page-based CRUD for complex forms]

key-files:
  created:
    - src/actions/admin-services.ts
    - src/actions/admin-content.ts
    - src/components/admin/service-page-form.tsx
    - src/components/admin/admin-service-table.tsx
    - src/components/admin/team-member-form.tsx
    - src/components/admin/admin-team-table.tsx
    - src/components/admin/testimonial-form.tsx
    - src/components/admin/admin-testimonial-table.tsx
    - src/app/admin/services/new/page.tsx
    - src/app/admin/services/[id]/edit/page.tsx
    - src/app/admin/team/page.tsx
    - src/app/admin/team/new/page.tsx
    - src/app/admin/team/[id]/edit/page.tsx
    - src/app/admin/testimonials/page.tsx
  modified:
    - src/app/admin/services/page.tsx

key-decisions:
  - "Soft-delete (isActive=false) for services with active bookings, hard delete only when no FK references"
  - "Dialog-based CRUD for testimonials (simpler form), page-based CRUD for team members and services (complex forms)"
  - "Social links stored as JSON string in teamMembers.socialLinks column"

patterns-established:
  - "Soft-delete pattern: deactivateService checks for pending/confirmed bookings before allowing deactivation"
  - "Dialog CRUD pattern: AdminTestimonialTable renders create/edit forms in Dialog components"

requirements-completed: [ADMN-03]

duration: 2min
completed: 2026-03-27
---

# Phase 04 Plan 04: Content Management CRUD Summary

**Service, team member, and testimonial admin CRUD with soft-delete safety for booking-linked services and dialog-based testimonial editing**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-27T08:08:05Z
- **Completed:** 2026-03-27T08:10:56Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Service page CRUD with TiptapEditor for rich text descriptions and soft-delete safety preventing deactivation of services with active bookings
- Team member management with MediaPickerDialog photo selection, social links JSON storage, and full CRUD routing
- Testimonial management with dialog-based create/edit, service type dropdown, optional rating, and avatarUrl

## Task Commits

Each task was committed atomically:

1. **Task 1: Service page CRUD with soft-delete safety** - `f3d7b0a` (feat)
2. **Task 2: Team member and testimonial CRUD management** - `c39b53b` (feat)

## Files Created/Modified
- `src/actions/admin-services.ts` - Service CRUD actions with soft-delete and permission checks
- `src/actions/admin-content.ts` - Team member and testimonial CRUD actions
- `src/components/admin/service-page-form.tsx` - Service form with TiptapEditor, type select, features array
- `src/components/admin/admin-service-table.tsx` - Service table with status badges and booking config links
- `src/components/admin/team-member-form.tsx` - Team form with MediaPickerDialog and social links
- `src/components/admin/admin-team-table.tsx` - Team table with photo thumbnails and delete confirmation
- `src/components/admin/testimonial-form.tsx` - Testimonial form with service type and avatarUrl
- `src/components/admin/admin-testimonial-table.tsx` - Testimonial table with dialog-based CRUD
- `src/app/admin/services/page.tsx` - Service list page (force-dynamic)
- `src/app/admin/services/new/page.tsx` - New service page
- `src/app/admin/services/[id]/edit/page.tsx` - Edit service page
- `src/app/admin/team/page.tsx` - Team list page (force-dynamic)
- `src/app/admin/team/new/page.tsx` - New team member page
- `src/app/admin/team/[id]/edit/page.tsx` - Edit team member page
- `src/app/admin/testimonials/page.tsx` - Testimonial list page (force-dynamic)

## Decisions Made
- Soft-delete (isActive=false) for services with active bookings; hard delete only when no FK references exist
- Dialog-based CRUD for testimonials (simpler form), page-based CRUD for team members and services (complex forms)
- Social links stored as JSON string in teamMembers.socialLinks column

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Content management CRUD complete for services, team members, and testimonials
- All admin pages enforce manage_content permission
- Booking-config sub-routes remain accessible for existing services

---
*Phase: 04-admin-dashboard-email*
*Completed: 2026-03-27*
