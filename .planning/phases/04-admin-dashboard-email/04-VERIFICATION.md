---
phase: 04-admin-dashboard-email
verified: 2026-03-27T08:24:46Z
status: gaps_found
score: 18/19 must-haves verified
gaps:
  - truth: "Admin sees a unified sidebar with grouped navigation tiles on every admin page — Services tile routes to wrong URL"
    status: partial
    reason: "admin-sidebar.tsx hardcodes href '/admin/services-list' but the Services page route is '/admin/services'. No route exists at /admin/services-list. Clicking Services in the sidebar produces a 404."
    artifacts:
      - path: "src/components/admin/admin-sidebar.tsx"
        issue: "Line 53: href is '/admin/services-list' but the actual admin services page is at '/admin/services'"
    missing:
      - "Change href on line 53 in admin-sidebar.tsx from '/admin/services-list' to '/admin/services'"
human_verification:
  - test: "Confirm sidebar active-state highlighting on /admin/services"
    expected: "The Services tile is visually highlighted when visiting /admin/services"
    why_human: "Active state depends on usePathname matching — fixing the href is required first, then visual check"
  - test: "Upload a file to the media library, then insert it into a blog post via Tiptap toolbar"
    expected: "File uploads successfully to R2, appears in media library grid, Tiptap image insertion opens MediaPickerDialog and inserts selected image into post content"
    why_human: "R2 presigned URL flow and Tiptap DOM integration require a running browser session"
  - test: "Send a test newsletter to 'All subscribers' segment with a small subscriber list"
    expected: "Email delivers with unsubscribe link, clicking unsubscribe link redirects to /unsubscribe page and deactivates subscriber"
    why_human: "End-to-end email delivery requires Resend live API key and actual subscriber records"
  - test: "Drag a section in the homepage editor to reorder, then check the public homepage reflects the new order"
    expected: "Section order changes immediately in admin, public homepage renders in the new order"
    why_human: "dnd-kit drag interactions require a browser; DB write and re-read must be verified visually"
---

# Phase 4: Admin Dashboard & Email Verification Report

**Phase Goal:** Admin can manage all site content, clients, settings, and email communications from a unified, task-oriented dashboard
**Verified:** 2026-03-27T08:24:46Z
**Status:** gaps_found — 1 blocker gap (broken sidebar link), 4 items require human testing
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Admin sees a unified sidebar with grouped navigation tiles on every admin page | PARTIAL | AdminShell + AdminSidebar wired correctly in layout.tsx; all nav tiles present and permission-gated EXCEPT the Services tile links to `/admin/services-list` which does not exist (route is `/admin/services`) |
| 2 | Owner can create custom roles and configure a permission grid | VERIFIED | admin-roles.ts: `createRole`, `updateRolePermissions` with `requirePermission("manage_roles")`; role-permission-grid.tsx with shadcn Checkbox; admin-member-table.tsx with `assignRole` |
| 3 | Non-owner admin users only see sidebar tiles for sections their role permits | VERIFIED | admin-sidebar.tsx uses `permissions` prop from `getSessionPermissions()` to hide tiles; each tile has a `permission` field matched against the array |
| 4 | Permission checks enforce server-side on every admin action | VERIFIED | All 8 action files call `requirePermission(...)` or `requireAdmin()` from `@/lib/permissions`; existing booking API routes migrated to `role === "user"` check |
| 5 | Existing admin pages render inside the new AdminShell | VERIFIED | admin/layout.tsx: `return <AdminShell>{children}</AdminShell>` — all admin routes inherit the shell |
| 6 | Existing admin users with role=admin continue to work after migration | VERIFIED | permissions.ts `requireAdmin()` accepts any role that is not "user"; `requirePermission()` grants owner bypass for both "owner" AND "admin" roles |
| 7 | All 11 files that hard-code role===admin are updated to use the new RBAC system | VERIFIED | All 6 action files import `requireAdmin` from `@/lib/permissions`; booking API routes use `=== "user"` pattern |
| 8 | Admin can upload media via drag-and-drop directly to R2 | VERIFIED | media-upload-zone.tsx: `getMediaUploadUrl` → presigned URL → `xhr.open("PUT", uploadUrl)` → `confirmMediaUpload`; no FormData to server |
| 9 | Admin can browse all media in a grid with filtering and select via picker dialog | VERIFIED | media-library.tsx renders MediaTile + MediaUploadZone; media-picker-dialog.tsx has Dialog + `onSelect` prop |
| 10 | Admin can create/edit/delete blog posts with rich text, scheduled publish, categories, tags | VERIFIED | admin-blog.ts: `createBlogPost`, `updateBlogPost`, `deleteBlogPost`, correct field names (`content`, `coverImageUrl`, `excerpt`, `publishedAt`); blog-post-form.tsx renders TiptapEditor + MediaPickerDialog |
| 11 | Scheduled posts auto-publish via Vercel Cron | VERIFIED | cron/publish-scheduled/route.ts: CRON_SECRET auth, queries `status="scheduled" AND scheduledAt <= NOW()`, sets `publishedAt`; vercel.json has `*/15 * * * *` schedule |
| 12 | Admin can manage services, team members, and testimonials | VERIFIED | admin-services.ts: `deactivateService` (soft-delete) + hard-delete safety check; service-page-form.tsx renders TiptapEditor; admin-content.ts: `createTeamMember`, `createTestimonial` with correct field names (`avatarUrl`, `clientTitle`, `socialLinks`) |
| 13 | Admin can view all clients including guests | VERIFIED | admin-clients.ts: UNION of registered users + guest purchasers (`guestEmail` from orders) + guest bookers (`guestEmail` from bookings); `requirePermission("view_clients")` |
| 14 | Admin can edit site settings | VERIFIED | admin-settings.ts: `updateSettings` with `requirePermission("manage_settings")`; site-settings-form.tsx has studio_name, contact_email fields; SiteSettingsForm rendered in settings/page.tsx |
| 15 | Admin receives email notification when contact form is submitted | VERIFIED | contact.ts imports `AdminContactNotificationEmail`; sends via `resend.emails.send` inside try/catch (failure does not break form) |
| 16 | Admin can view and reply to contact messages from inbox | VERIFIED | admin-inbox.ts: `getMessages`, `getMessage` (no auto-read), `markAsRead` (separate action), `replyToMessage` with `replyTo` header; contact-inbox.tsx calls `markAsRead` explicitly |
| 17 | Admin can compose and send newsletters with segment selection and failure tracking | VERIFIED | admin-newsletter.ts: `sendNewsletter` uses `resend.batch.send`, tracks `partial_failure`/`failed` status, only sends to `isActive=true` subscribers; newsletter-composer.tsx renders TiptapEditor + AlertDialog |
| 18 | Newsletter includes working unsubscribe and subscriber auto-tagging | VERIFIED | newsletter-broadcast.tsx: `unsubscribeUrl` per subscriber; newsletter.ts: `generateUnsubscribeUrl` with `createHmac`; unsubscribe/page.tsx sets `isActive: false`; stripe webhook calls `tagSubscriberOnEvent` on beat_purchase and booking_deposit |
| 19 | Admin can customize homepage section order, visibility, and hero content | VERIFIED | admin-homepage.ts: `updateSectionOrder`, `updateSectionConfig`, `getPublicHomepageSections`; homepage-editor.tsx: DndContext + SortableContext + arrayMove; public page.tsx reads from DB with hardcoded fallback; hero-section.tsx and featured-carousel.tsx accept optional props |

**Score:** 18/19 truths verified (1 partial — broken Services sidebar link)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/db/schema.ts` | All Phase 4 tables | VERIFIED | All 8 new tables present: adminRoles, adminRolePermissions, mediaAssets, homepageSections, blogTags, blogPostTags, contactReplies, newsletterBroadcasts, siteSettings |
| `src/lib/permissions.ts` | requirePermission, getSessionPermissions, requireAdmin | VERIFIED | All 3 functions exported; requireAdmin accepts non-"user" role; owner/admin bypass in requirePermission |
| `src/lib/db-migrate-04.ts` | Migration script | VERIFIED | File exists with CREATE TABLE and UPDATE "user" SET role migration |
| `src/components/admin/admin-shell.tsx` | Unified admin layout | VERIFIED | Calls getSessionPermissions, redirects on null/user, renders AdminSidebar with permissions+unreadCount |
| `src/components/admin/admin-sidebar.tsx` | Tile-based sidebar with role gating | PARTIAL | All tiles present with permission gating and usePathname; Services tile has broken href (`/admin/services-list` not `/admin/services`) |
| `src/app/admin/layout.tsx` | Wraps AdminShell | VERIFIED | Single-line: `return <AdminShell>{children}</AdminShell>` |
| `src/app/admin/page.tsx` | Dashboard with stats | VERIFIED | force-dynamic; 4 StatTile components with real DB queries (orders SUM, bookings COUNT, contactSubmissions COUNT, newsletterSubscribers COUNT) |
| `src/components/admin/tiptap-editor.tsx` | Shared rich text editor | VERIFIED | useEditor, StarterKit, immediatelyRender: false, TiptapToolbar rendered |
| `src/app/admin/media/page.tsx` | Media library page | VERIFIED | force-dynamic, renders MediaLibrary |
| `src/components/admin/media-picker-dialog.tsx` | Reusable media selection dialog | VERIFIED | Dialog + onSelect prop |
| `src/actions/admin-media.ts` | Media actions with R2 direct upload | VERIFIED | getMediaUploadUrl returns presigned URL; confirmMediaUpload records in DB; no FormData parameter |
| `src/components/admin/media-upload-zone.tsx` | Drag-and-drop upload zone | VERIFIED | Calls getMediaUploadUrl, PUTs via XHR directly to R2, then calls confirmMediaUpload |
| `src/app/admin/blog/page.tsx` | Blog post list | VERIFIED | force-dynamic, renders BlogPostTable |
| `src/components/admin/blog-post-form.tsx` | Blog CRUD form | VERIFIED | TiptapEditor + MediaPickerDialog; correct field names: coverImageUrl, excerpt, content |
| `src/app/api/cron/publish-scheduled/route.ts` | Scheduled publish cron | VERIFIED | CRON_SECRET auth; updates status="published", sets publishedAt |
| `src/actions/admin-blog.ts` | Blog CRUD actions | VERIFIED | requirePermission("manage_content"); correct field names throughout |
| `src/app/admin/services/page.tsx` | Service management | VERIFIED | force-dynamic; renders service table with deactivate/delete |
| `src/components/admin/service-page-form.tsx` | Service form | VERIFIED | TiptapEditor for description; studio_session enum values |
| `src/actions/admin-services.ts` | Service CRUD with soft-delete | VERIFIED | requirePermission("manage_content"); deactivateService checks active bookings; no heroImageUrl |
| `src/app/admin/team/page.tsx` | Team management | VERIFIED | force-dynamic |
| `src/components/admin/team-member-form.tsx` | Team member form | VERIFIED | MediaPickerDialog for photo; socialLinks JSON |
| `src/app/admin/testimonials/page.tsx` | Testimonial management | VERIFIED | force-dynamic |
| `src/components/admin/testimonial-form.tsx` | Testimonial form | VERIFIED | avatarUrl, serviceType |
| `src/actions/admin-content.ts` | Team + testimonial actions | VERIFIED | requirePermission("manage_content"); avatarUrl; clientTitle |
| `src/app/admin/clients/page.tsx` | Client list | VERIFIED | force-dynamic; renders ClientListTable |
| `src/actions/admin-clients.ts` | Client actions with guest support | VERIFIED | requirePermission("view_clients"); UNION of registered + guestEmail from orders + guestEmail from bookings |
| `src/app/admin/settings/page.tsx` | Site settings | VERIFIED | force-dynamic; renders SiteSettingsForm |
| `src/actions/admin-settings.ts` | Settings actions | VERIFIED | requirePermission("manage_settings"); updateSettings with upsert |
| `src/app/admin/roles/page.tsx` | Roles & permissions | VERIFIED | force-dynamic; renders RolePermissionGrid |
| `src/components/admin/role-permission-grid.tsx` | Permission matrix | VERIFIED | shadcn Checkbox; owner column always-all |
| `src/components/admin/admin-member-table.tsx` | Admin team management | VERIFIED | assignRole wired |
| `src/actions/admin-roles.ts` | RBAC management actions | VERIFIED | requirePermission("manage_roles"); createRole, updateRolePermissions |
| `src/app/admin/inbox/page.tsx` | Contact inbox | VERIFIED | force-dynamic; renders ContactInbox |
| `src/actions/admin-inbox.ts` | Inbox actions | VERIFIED | replyToMessage; markAsRead separate from getMessage; replyTo header; serviceInterest field name |
| `src/lib/email/admin-contact-notification.tsx` | Admin notification email | VERIFIED | AdminContactNotificationEmail; serviceInterest; senderName |
| `src/actions/contact.ts` | Contact form (updated) | VERIFIED | AdminContactNotificationEmail imported and called in try/catch |
| `src/app/admin/newsletter/compose/page.tsx` | Newsletter compose page | VERIFIED | Renders NewsletterComposer |
| `src/lib/email/newsletter-broadcast.tsx` | Newsletter email template | VERIFIED | NewsletterBroadcastEmail; unsubscribeUrl; dangerouslySetInnerHTML |
| `src/actions/admin-newsletter.ts` | Newsletter send actions | VERIFIED | resend.batch.send; partial_failure tracking; tagSubscriberOnEvent; isActive filter |
| `src/actions/newsletter.ts` | Public newsletter actions | VERIFIED | generateUnsubscribeUrl with createHmac; unsubscribe sets isActive=false |
| `src/app/(public)/unsubscribe/page.tsx` | Public unsubscribe page | VERIFIED | Calls unsubscribe action; shows "invalid link" on bad token |
| `src/app/admin/settings/homepage/page.tsx` | Homepage editor page | VERIFIED | force-dynamic; renders HomepageEditor |
| `src/actions/admin-homepage.ts` | Homepage section actions | VERIFIED | requirePermission("manage_settings"); updateSectionOrder; updateSectionConfig; getPublicHomepageSections; uses "portfolio" not "featured_videos" |
| `src/components/admin/homepage-editor.tsx` | Drag-and-drop homepage editor | VERIFIED | DndContext + SortableContext + arrayMove |
| `src/components/admin/homepage-section-tile.tsx` | Section tile with drag handle | VERIFIED | useSortable |
| `src/app/(public)/page.tsx` | Public homepage (updated) | VERIFIED | getPublicHomepageSections; dynamic rendering from DB with hardcoded fallback |
| `src/components/home/hero-section.tsx` | Hero with configurable props | VERIFIED | title?, subtitle? optional props; backwards-compatible |
| `src/components/home/featured-carousel.tsx` | Featured carousel with beatIds | VERIFIED | beatIds?: string[] prop |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/admin/layout.tsx` | `admin-shell.tsx` | renders AdminShell | WIRED | `return <AdminShell>{children}</AdminShell>` |
| `src/components/admin/admin-shell.tsx` | `src/lib/permissions.ts` | getSessionPermissions | WIRED | Line 5 import, line 9 call |
| `src/components/admin/admin-sidebar.tsx` | `src/lib/permissions.ts` | getSessionPermissions | WIRED | Line 5 import — called in parent (admin-shell) |
| `src/actions/admin-beats.ts` | `src/lib/permissions.ts` | requireAdmin | WIRED | Line 7 import; used on all 4 mutations |
| `src/app/api/bookings/confirm/route.ts` | RBAC pattern | `=== "user"` not `!== "admin"` | WIRED | Line 19: `session.user.role === "user"` |
| `src/components/admin/media-upload-zone.tsx` | `src/lib/r2.ts` | presigned URL PUT | WIRED | getMediaUploadUrl → XHR PUT → confirmMediaUpload |
| `src/components/admin/tiptap-toolbar.tsx` | `media-picker-dialog.tsx` | onInsertImage | WIRED | onInsertImage prop; ImagePlus button calls it |
| `src/components/admin/blog-post-form.tsx` | `tiptap-editor.tsx` | TiptapEditor | WIRED | Line 6 import; rendered in form |
| `src/components/admin/blog-post-form.tsx` | `media-picker-dialog.tsx` | cover image selection | WIRED | Line 7 import; MediaPickerDialog renders for coverImageUrl |
| `src/actions/admin-blog.ts` | `src/lib/permissions.ts` | requirePermission | WIRED | requirePermission("manage_content") on all mutations |
| `src/components/admin/service-page-form.tsx` | `tiptap-editor.tsx` | TiptapEditor for description | WIRED | Line 7 import |
| `src/components/admin/team-member-form.tsx` | `media-picker-dialog.tsx` | photo selection | WIRED | Line 7 import |
| `src/actions/admin-clients.ts` | `src/lib/permissions.ts` | requirePermission | WIRED | requirePermission("view_clients") |
| `src/actions/admin-settings.ts` | `src/db/schema.ts` | siteSettings table | WIRED | Line 5 import; SELECT/upsert on siteSettings |
| `src/actions/admin-roles.ts` | `src/lib/permissions.ts` | requirePermission | WIRED | requirePermission("manage_roles") on all mutations |
| `src/actions/contact.ts` | `admin-contact-notification.tsx` | admin notification email | WIRED | Line 7 import; sent in try/catch after insert |
| `src/actions/admin-inbox.ts` | resend | reply email with replyTo | WIRED | `resend.emails.send` with `replyTo` header |
| `src/components/admin/contact-inbox.tsx` | `admin-inbox.ts` | markAsRead explicit action | WIRED | markAsRead called on message selection, separate from getMessage |
| `src/components/admin/newsletter-composer.tsx` | `tiptap-editor.tsx` | TiptapEditor for body | WIRED | Line 7 import |
| `src/actions/admin-newsletter.ts` | resend | resend.batch.send | WIRED | Line 171 |
| `src/app/api/webhooks/stripe/route.ts` | `admin-newsletter.ts` | tagSubscriberOnEvent | WIRED | Line 21 import; called on beat_purchase and booking_deposit |
| `src/components/admin/homepage-editor.tsx` | `@dnd-kit/sortable` | DndContext + SortableContext | WIRED | Lines 5, 14-15 imports |
| `src/actions/admin-homepage.ts` | `src/db/schema.ts` | homepageSections table | WIRED | Line 4 import; all actions query homepageSections |
| `src/app/(public)/page.tsx` | `admin-homepage.ts` | getPublicHomepageSections | WIRED | Line 11 import; called in Promise.allSettled |
| **`src/components/admin/admin-sidebar.tsx`** | **`/admin/services`** | **Services tile href** | **BROKEN** | **href is `/admin/services-list` but route is `/admin/services` — 404 on click** |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `src/app/admin/page.tsx` | totalRevenue, bookingsThisWeek, pendingMessages, subscriberCount | db.select queries on orders, bookings, contactSubmissions, newsletterSubscribers | Yes — SQL queries with SUM/COUNT | FLOWING |
| `src/components/admin/admin-shell.tsx` | unreadCount | db.select COUNT from contactSubmissions WHERE isRead=false | Yes — live query | FLOWING |
| `src/app/admin/blog/page.tsx` | posts | getBlogPosts() from admin-blog.ts | Yes — Drizzle query with join | FLOWING |
| `src/app/admin/clients/page.tsx` | clients | getClients() UNION of 3 sources | Yes — raw SQL unions over users/orders/bookings | FLOWING |
| `src/app/(public)/page.tsx` | homepageSections | getPublicHomepageSections() from DB | Yes — DB query with hardcoded fallback | FLOWING |
| `src/app/admin/newsletter/compose/page.tsx` | segmentCounts | getSegmentCounts() — COUNT by isActive + tags | Yes — Drizzle COUNT queries | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| Module: permissions.ts exports requirePermission | `node -e "const m = require('./src/lib/permissions.ts'); console.log(typeof m.requirePermission)"` | N/A — TypeScript source | SKIP (TS module, needs compiled env) |
| TypeScript compiles without errors | `npx tsc --noEmit` | 1 error in `src/db/seed.ts` only: `Cannot find module '@neondatabase/serverless'` — unrelated to Phase 4 work (pre-existing seed file dependency) | PASS (no Phase 4 errors) |
| vercel.json has both cron jobs | grep for publish-scheduled | Both crons present: booking-reminders + publish-scheduled | PASS |
| @dnd-kit and @tiptap installed | grep package.json | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @tiptap/react all present | PASS |
| R2 direct upload pattern (no FormData to server) | grep admin-media.ts for "formData: FormData" | No FormData parameter found | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| ADMN-03 | Plans 03, 04 | Content management — CRUD for blog posts, service pages, team bios, testimonials | SATISFIED | admin-blog.ts, admin-services.ts, admin-content.ts all with requirePermission("manage_content"); all CRUD pages exist |
| ADMN-04 | Plan 05 | Client management — view client list, purchase history, booking history | SATISFIED | admin-clients.ts with guest UNION; client-detail-sheet.tsx; Note: REQUIREMENTS.md tracker shows "Pending" but implementation is complete |
| ADMN-05 | Plan 05 | Site settings — edit pricing, availability, about page, contact info | SATISFIED | admin-settings.ts; site-settings-form.tsx; Note: REQUIREMENTS.md tracker shows "Pending" but implementation is complete |
| ADMN-06 | Plan 07 | Email campaign management — compose and send newsletters | SATISFIED | admin-newsletter.ts; newsletter-composer.tsx; resend.batch.send; partial_failure tracking |
| ADMN-07 | Plan 02 | Media library — upload, organize, manage images/audio/video | SATISFIED | admin-media.ts; media-library.tsx; R2 direct upload pattern |
| ADMN-08 | Plan 08 | Homepage customization — reorder sections, edit hero, feature beats/videos | SATISFIED | admin-homepage.ts; homepage-editor.tsx with dnd-kit; public page.tsx reads from DB |
| ADMN-09 | Plans 01, 05 | Role-based admin access — owner, editor, manager with granular permissions | SATISFIED | permissions.ts; admin-roles.ts; role-permission-grid.tsx; all 11 old files migrated |
| MAIL-03 | Plan 06 | Contact form submission notification to admin | SATISFIED | admin-contact-notification.tsx; contact.ts sends notification in try/catch |
| MAIL-04 | Plan 07 | Newsletter broadcast emails from admin dashboard | SATISFIED | newsletter-broadcast.tsx; sendNewsletter with resend.batch.send; unsubscribeUrl per subscriber |
| MAIL-05 | Plan 06 | Contact inbox — view and reply to messages from admin dash | SATISFIED | admin-inbox.ts with replyToMessage + markAsRead; contact-inbox.tsx; contact-message-sheet.tsx |

**Note on REQUIREMENTS.md tracker:** ADMN-04 and ADMN-05 are implemented and complete but the requirements tracker still shows "Pending". This is a documentation drift issue — the tracker needs updating, not the code.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/admin/admin-sidebar.tsx` | 53 | `href: "/admin/services-list"` — route does not exist | BLOCKER | Services management is unreachable from the sidebar; admin cannot navigate to service CRUD |

No other blocker anti-patterns found. No stub returns, no TODO-only implementations, no hardcoded empty data flowing to rendered output detected across Phase 4 files.

---

### Human Verification Required

#### 1. Services Sidebar Navigation (post-fix)

**Test:** After fixing the href, click Services in the admin sidebar
**Expected:** Navigates to /admin/services and shows the service list; sidebar tile highlights correctly
**Why human:** Active-state highlighting and route rendering require a browser session

#### 2. Media Upload and Tiptap Insert Flow

**Test:** Go to /admin/media, drag an image file onto the upload zone. After upload, create a new blog post, click the Image button in the Tiptap toolbar, select the uploaded image
**Expected:** File uploads progress bar appears, completes, image appears in media grid. Tiptap toolbar opens MediaPickerDialog, selected image appears in post content
**Why human:** R2 presigned URL PUT and Tiptap DOM mutation require a live browser and real R2 credentials

#### 3. Newsletter Send and Unsubscribe Loop

**Test:** Compose a newsletter, send to "All subscribers", check the received email, click the unsubscribe link
**Expected:** Email arrives with unsubscribe link in footer. Clicking link loads /unsubscribe page, shows "You have been unsubscribed." Subscriber's isActive becomes false
**Why human:** Requires live Resend API key and a real subscriber record in the database

#### 4. Homepage Drag-to-Reorder

**Test:** Visit /admin/settings/homepage, drag "Testimonials" above "Services". Then visit the public homepage
**Expected:** Sections appear in new order on the public homepage immediately (no cache); DB homepageSections sortOrder updated
**Why human:** dnd-kit drag interactions require a browser; verifying DB write requires checking the live DB or observing the public page

---

### Gaps Summary

One gap blocks full goal achievement:

**Broken Services sidebar link (BLOCKER):** `src/components/admin/admin-sidebar.tsx` line 53 has `href: "/admin/services-list"` but the actual admin services page lives at `/admin/services`. The route `/admin/services-list` was never created. Any admin user clicking the Services tile in the sidebar will receive a 404. The fix is a single character change: update the href string.

All other 18 must-have truths are fully verified with substantive implementations, correct wiring, and real data flow. The TypeScript compilation error (`Cannot find module '@neondatabase/serverless'` in `seed.ts`) is pre-existing and unrelated to Phase 4 work.

The REQUIREMENTS.md tracker incorrectly shows ADMN-04 and ADMN-05 as "Pending" — both are fully implemented and should be marked Complete.

---

_Verified: 2026-03-27T08:24:46Z_
_Verifier: Claude (gsd-verifier)_
