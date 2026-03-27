# Phase 4: Admin Dashboard + Email - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 04-admin-dashboard-email
**Areas discussed:** Admin navigation & layout, Content editing experience, Email & messaging system, Role-based access (RBAC)

---

## Admin Navigation & Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Task-oriented groups | Group by what admin does: Content, Clients, Media, Settings, Messages & Email | |
| Flat section list | Every admin page as its own sidebar tile | |
| Hub dashboard + sections | Landing page with stat tiles and quick actions, sidebar for full sections | |
| Other (research best approach) | Let researcher investigate optimal admin layout for creative studios | ✓ |

**User's choice:** User was torn between options and requested research to find the best approach.
**Notes:** Marked as Claude's Discretion — researcher will investigate and planner will decide.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, unify all admin | One sidebar with all sections: existing (beats, bookings, rooms) + new (blog, clients, media, settings, email) | ✓ |
| You decide | Claude picks based on effort and consistency | |

**User's choice:** Unify all admin pages under one sidebar navigation.

---

## Content Editing Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Tiptap (Recommended) | Headless rich text editor, ProseMirror-based, customizable | ✓ |
| Markdown + preview | Write in Markdown with live preview | |
| You decide | Claude picks | |

**User's choice:** Tiptap

---

| Option | Description | Selected |
|--------|-------------|----------|
| Draft → Publish toggle | Simple switch, no scheduling | |
| Draft → Schedule → Publish | Optional scheduled publish date with Vercel Cron | ✓ |
| You decide | Claude picks | |

**User's choice:** Draft → Schedule → Publish

---

| Option | Description | Selected |
|--------|-------------|----------|
| Shared global library | One central media library, upload once reuse anywhere | ✓ |
| Per-section uploads | Each form has its own upload zone, no central library | |
| You decide | Claude picks | |

**User's choice:** Shared global library

---

| Option | Description | Selected |
|--------|-------------|----------|
| Section reorder + content edit | Drag reorder sections, edit hero, pick featured beats/videos | ✓ |
| Content edit only | Edit content in sections but order fixed in code | |
| You decide | Claude picks | |

**User's choice:** Section reorder + content edit

---

| Option | Description | Selected |
|--------|-------------|----------|
| Both categories + tags | Category for primary grouping, freeform tags for cross-cutting | ✓ |
| Predefined categories | Fixed category list, one per post | |
| Freeform tags | Free-form tags only, no hierarchy | |
| You decide | Claude picks | |

**User's choice:** Both categories + tags

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full CRUD in admin | Create, edit, reorder, delete services from admin | ✓ |
| Edit existing only | Edit descriptions/pricing of existing services only | |
| You decide | Claude picks | |

**User's choice:** Full CRUD in admin

---

## Email & Messaging System

| Option | Description | Selected |
|--------|-------------|----------|
| Rich text compose + preview | Tiptap editor with live email preview | ✓ |
| Simple text + template | Plain text wrapped in pre-designed template | |
| You decide | Claude picks | |

**User's choice:** Rich text compose + preview

---

| Option | Description | Selected |
|--------|-------------|----------|
| Admin inbox + email reply | Admin views submissions, replies via dashboard (sends email), thread on admin side | ✓ |
| Full client messaging | Bidirectional in-app threads (deferred to new phase) | |

**User's choice:** Initially wanted full bidirectional messaging. After scope discussion, agreed to admin inbox with email reply for Phase 4. Full client messaging portal deferred to a new phase.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Basic segments (Recommended) | Beat buyer / Studio client / All dropdown with auto-tagging | ✓ |
| Full segmentation | Custom rules builder, boolean logic, saved segments | |

**User's choice:** Initially wanted full segmentation. After comparison of effort vs value, agreed to basic segments for Phase 4 with data model foundation for v2 expansion.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Email + unread badge | Email notification via Resend + unread count badge on Contact Inbox nav tile | ✓ |
| Email notification only | Email only, no in-app badge | |
| You decide | Claude picks | |

**User's choice:** Email + unread badge

---

| Option | Description | Selected |
|--------|-------------|----------|
| Preview + confirm | Compose → Preview → Confirm dialog with subscriber count → Send | ✓ |
| Send immediately | Compose → Send button with toast only | |
| You decide | Claude picks | |

**User's choice:** Preview + confirm

---

## Role-Based Access (RBAC)

| Option | Description | Selected |
|--------|-------------|----------|
| Configurable permission grid | Admin toggles individual permissions per role | ✓ |
| Fixed role presets | Hardcoded permissions per role (owner/editor/manager) | |
| You decide | Claude picks | |

**User's choice:** Configurable permission grid. User emphasized wanting granular control over manager scope from the admin dashboard.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Custom roles | Admin can create new role names and configure permissions for each | ✓ |
| Three fixed roles | Owner, Editor, Manager with configurable permissions but no new roles | |
| You decide | Claude picks | |

**User's choice:** Custom roles

---

## Claude's Discretion

- Admin sidebar section grouping and organization (researcher to investigate)
- Dashboard landing page design (stat tiles, recent activity, quick actions)
- Database schema design for all new tables
- Tiptap editor configuration and toolbar buttons
- Slug auto-generation for blog posts
- Media library pagination and bulk operations UX
- Contact inbox threading implementation
- Permission granularity (which specific permissions to include)
- Newsletter email template design
- Team member and testimonial form field details

## Deferred Ideas

- Full client messaging portal — bidirectional in-app threads visible to both admin and clients. New phase.
- Full newsletter segmentation (ADVN-05) — custom rules engine. v2 scope.
- Analytics dashboard (ANLY-01, ANLY-02) — play counts, sales, revenue reporting. v2 scope.
