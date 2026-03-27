# Phase 4: Admin Dashboard + Email - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can manage all site content, clients, settings, and email communications from a unified, task-oriented dashboard. Includes content CRUD (blog, services, team, testimonials), client management, media library, site settings, homepage customization, contact inbox with email reply, newsletter broadcasts, and role-based access with configurable permissions.

Requirements: ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09, MAIL-03, MAIL-04, MAIL-05

</domain>

<decisions>
## Implementation Decisions

### Admin Navigation & Layout
- **D-01:** Unified admin sidebar — all admin pages (existing: beats, bookings, rooms, availability, services, packages, bundles + new: blog, clients, media, settings, email) share one AdminShell layout with sidebar navigation
- **D-02:** AdminShell wraps existing admin pages — existing pages get integrated into the new layout rather than staying separate
- **D-03:** Dashboard organization approach — Claude's discretion. Researcher should investigate best admin layout patterns for creative studio/agency dashboards (task-oriented groups vs flat list vs hub dashboard). Pick the optimal approach during planning.

### Content Editing
- **D-04:** Rich text editor — Tiptap (headless ProseMirror-based). Styled to match Cyberpunk Metro aesthetic. Used for blog posts and service page descriptions.
- **D-05:** Blog publish flow — Draft → Schedule → Publish. Optional scheduled publish date with automatic publishing via Vercel Cron (reuse existing cron pattern from booking reminders).
- **D-06:** Blog categories + freeform tags — posts get assigned to one predefined category AND optional freeform tags. Both categories and tags are DB-backed with admin CRUD.
- **D-07:** Service page editing — full CRUD in admin. Admin can create new services, edit descriptions/pricing/hero images, reorder, and delete. Service pages fully dynamic from DB.
- **D-08:** Team member & testimonial management — full CRUD forms in admin for bios, photos, roles, social links, display order (team); quotes, client name, service type, rating, photo (testimonials).

### Media Library
- **D-09:** Shared global media library — one central media library for all content types. Upload once, reuse anywhere. When editing blog posts/services/team, pick from the shared library.
- **D-10:** Media library uses R2 direct upload (reuse Phase 2 R2 pattern). Supports images, audio, and video. Grid display with thumbnails, filter by type, search.

### Homepage Customization
- **D-11:** Section reorder + content edit — admin can drag to reorder homepage sections (hero, featured beats, services, testimonials, blog), edit hero text/media, and pick which beats/videos are featured.
- **D-12:** Homepage section order and featured content stored in DB, rendered dynamically on the public homepage.

### Contact Inbox & Email
- **D-13:** Admin contact inbox with email reply — admin views contact form submissions in dashboard with read/unread state and unread count badge on nav tile. Can reply from dashboard (sends email via Resend). Thread tracked on admin side.
- **D-14:** Email notification on new contact submission (MAIL-03) — admin gets email via Resend when someone submits the contact form.
- **D-15:** Newsletter composer — Tiptap rich text editor (reuse blog editor) for newsletter body. Live preview showing rendered email. Send flow: Compose → Preview → Confirm dialog (shows subscriber count) → Send.
- **D-16:** Basic newsletter segmentation — dropdown filter: "All subscribers", "Beat buyers", "Studio clients". Auto-tags subscribers based on purchase/booking history. Data model designed to support full segmentation in v2.
- **D-17:** Newsletter broadcast history — table of past broadcasts with sent date, recipient count. Subscriber management table with email, subscribed date, status.

### Role-Based Access (RBAC)
- **D-18:** Custom roles — admin can create custom role names beyond the defaults (owner, editor, manager). Examples: "Intern", "Freelancer". Each custom role gets its own permission configuration.
- **D-19:** Configurable permission grid — owner configures a matrix of roles vs permissions (manage content, manage media, view clients, send newsletters, manage bookings, manage settings, manage roles, etc.). Individual cells toggled on/off.
- **D-20:** Owner controls all role/permission management — only the owner role (or roles with "manage roles" permission) can create admin accounts, assign roles, and modify the permission grid.
- **D-21:** Permission enforcement — role permissions checked server-side on every admin API route/action. UI hides/disables features the user's role can't access.

### Claude's Discretion
- Admin sidebar section grouping and organization (D-03 — researcher investigates)
- Dashboard landing page design (stat tiles, recent activity, quick actions)
- Database schema for roles, permissions, media library, homepage sections, newsletter broadcasts
- Tiptap editor configuration and toolbar buttons
- Slug auto-generation for blog posts
- Media library pagination and bulk operations UX
- Contact inbox threading implementation
- Permission granularity (which specific permissions to include in the grid)
- Newsletter email template design (React Email)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.planning/DESIGN-LANGUAGE.md` — Cyberpunk Metro design spec: tile system, animations, spacing, color palette. Admin pages must follow this.
- `.planning/phases/04-admin-dashboard-email/04-UI-SPEC.md` — Phase 4 UI design contract: AdminShell layout, component inventory, interaction patterns, typography, color tokens.

### Existing Admin Patterns
- `src/app/admin/layout.tsx` — Current admin layout with session/role check. Will be replaced by AdminShell.
- `src/app/admin/beats/` — Beat management CRUD pattern (table + form). Reference for new admin pages.
- `src/components/admin/beats/beat-table.tsx` — Table component pattern for admin lists.
- `src/components/admin/admin-booking-list.tsx` — Filter + search + table pattern.

### Database & Auth
- `src/db/schema.ts` — Current schema including user role field, contactSubmissions, newsletterSubscribers tables.
- `src/lib/auth.ts` — Better Auth server config. Role system needs extending for RBAC.

### Email
- `src/lib/email/` — Existing React Email templates (purchase-receipt, booking-confirmation, booking-reminder). Pattern for new admin notification and newsletter templates.

### File Storage
- `src/lib/r2.ts` — R2 direct upload utilities. Reuse for media library uploads.

### Requirements
- `.planning/REQUIREMENTS.md` — ADMN-03 through ADMN-09, MAIL-03 through MAIL-05 requirements.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/admin/beats/beat-table.tsx`: Table pattern with search, filters, status badges, and row actions — reuse for blog posts, clients, subscribers, newsletters
- `src/components/admin/admin-booking-list.tsx`: Filter + search + table pattern — reuse for client list and contact inbox
- `src/lib/r2.ts`: R2 presigned URL upload — reuse for media library file uploads
- `src/lib/email/*.tsx`: React Email templates — pattern for admin notification and newsletter broadcast emails
- `src/components/ui/table.tsx`, `sheet.tsx`, `dialog.tsx`, `badge.tsx`: shadcn UI components already installed — use for all admin tables, detail panels, confirmations, status indicators
- Existing admin pages (beats, bookings, rooms, availability, services, packages, bundles): Working CRUD patterns to reference

### Established Patterns
- Server Actions for form mutations (used in all existing admin pages)
- `force-dynamic` on admin pages for runtime DB queries
- Native HTML select for admin form dropdowns (Phase 3 decision)
- Delete-and-reinsert for related data updates (Phases 2 & 3)
- Sonner toast for action confirmations
- React Email + Resend for transactional emails

### Integration Points
- `src/app/admin/layout.tsx` — Replace with AdminShell that wraps all admin routes
- `src/db/schema.ts` — Extend with roles/permissions tables, media library table, homepage sections, blog categories/tags, newsletter broadcasts
- `src/lib/auth.ts` — Extend Better Auth for RBAC with custom roles
- Vercel Cron — Add scheduled publish job alongside existing booking reminder cron
- `/api/` routes — New API routes for contact reply, newsletter send, media upload

</code_context>

<specifics>
## Specific Ideas

- Newsletter composer should reuse the same Tiptap editor as blog posts — consistent editing experience
- Unread badge on Contact Inbox nav tile so admin can see at a glance if messages are waiting
- Permission grid should be visual and easy to understand — not a wall of checkboxes but a clean matrix
- Homepage editor should let admin preview changes before publishing (or at minimum see what the homepage currently looks like)

</specifics>

<deferred>
## Deferred Ideas

- **Full client messaging portal** — Bidirectional in-app messaging where clients can view and reply to messages in their dashboard. Threads visible to both sides. New phase/capability beyond contact form reply.
- **Full newsletter segmentation (ADVN-05)** — Custom rules engine with boolean logic, date ranges, engagement filters, saved segments. v2 scope. Basic segments (beat buyer/studio client/all) ship in Phase 4 as foundation.
- **Analytics dashboard (ANLY-01, ANLY-02)** — Admin analytics with play counts, sales, conversion rates, revenue reporting. v2 scope.

</deferred>

---

*Phase: 04-admin-dashboard-email*
*Context gathered: 2026-03-27*
