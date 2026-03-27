# Phase 4: Admin Dashboard + Email - Research

**Researched:** 2026-03-26
**Domain:** Admin dashboard CRUD, rich text editing, RBAC, email broadcasting, drag-and-drop reorder
**Confidence:** HIGH

## Summary

Phase 4 builds a unified admin dashboard with content CRUD (blog, services, team, testimonials), a global media library, client management, homepage customization with section reorder, a contact inbox with email reply, newsletter broadcasting, and a configurable RBAC system with custom roles. The existing codebase already has 7 admin pages (beats, bookings, rooms, availability, services, packages, bundles) using a consistent Server Actions + table pattern that Phase 4 extends to new entities.

The primary new dependencies are Tiptap (rich text editor, v3.20.x) for blog and newsletter editing, and @dnd-kit (drag-and-drop) for homepage section reorder. The RBAC system requires a custom implementation because Better Auth's admin plugin only supports static (code-defined) roles -- dynamic DB-stored roles with a configurable permission grid are not yet available in Better Auth (targeted for 2.0.0). Newsletter broadcasts use Resend's batch API (up to 100 emails per call) with chunking for larger lists.

**Primary recommendation:** Extend the existing admin patterns (Server Actions, force-dynamic pages, shadcn tables, sonner toasts) across all new admin pages. Build RBAC as a custom DB layer with permission checks in a reusable middleware function. Use Tiptap with StarterKit + image/link extensions for all rich text editing.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Unified admin sidebar -- all admin pages share one AdminShell layout with sidebar navigation
- D-02: AdminShell wraps existing admin pages -- existing pages integrated into new layout
- D-04: Rich text editor -- Tiptap (headless ProseMirror-based), styled to match Cyberpunk Metro
- D-05: Blog publish flow -- Draft -> Schedule -> Publish with Vercel Cron for scheduled publishing
- D-06: Blog categories + freeform tags -- both DB-backed with admin CRUD
- D-07: Service page editing -- full CRUD in admin, service pages fully dynamic from DB
- D-08: Team member & testimonial management -- full CRUD forms in admin
- D-09: Shared global media library -- one central library, upload once, reuse anywhere
- D-10: Media library uses R2 direct upload (reuse Phase 2 R2 pattern)
- D-11: Section reorder + content edit -- admin can drag to reorder homepage sections
- D-12: Homepage section order and featured content stored in DB
- D-13: Admin contact inbox with email reply via Resend, thread tracked on admin side
- D-14: Email notification on new contact submission (MAIL-03)
- D-15: Newsletter composer -- Tiptap rich text editor reused from blog, live preview
- D-16: Basic newsletter segmentation -- "All subscribers", "Beat buyers", "Studio clients"
- D-17: Newsletter broadcast history table + subscriber management table
- D-18: Custom roles -- admin can create custom role names beyond defaults
- D-19: Configurable permission grid -- matrix of roles vs permissions
- D-20: Owner controls all role/permission management
- D-21: Permission enforcement -- server-side checks on every admin API route/action, UI hides inaccessible features

### Claude's Discretion
- Admin sidebar section grouping and organization (D-03)
- Dashboard landing page design (stat tiles, recent activity, quick actions)
- Database schema for roles, permissions, media library, homepage sections, newsletter broadcasts
- Tiptap editor configuration and toolbar buttons
- Slug auto-generation for blog posts
- Media library pagination and bulk operations UX
- Contact inbox threading implementation
- Permission granularity (which specific permissions to include in the grid)
- Newsletter email template design (React Email)

### Deferred Ideas (OUT OF SCOPE)
- Full client messaging portal -- bidirectional in-app messaging
- Full newsletter segmentation (ADVN-05) -- custom rules engine
- Analytics dashboard (ANLY-01, ANLY-02) -- admin analytics with play counts, sales, revenue
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMN-03 | Content management -- CRUD for blog posts, service pages, team bios, testimonials | Tiptap editor for rich text, existing Server Actions pattern for CRUD, blog post schema needs tags + scheduled publish date |
| ADMN-04 | Client management -- view client list, purchase history, booking history | Join queries across user/orders/bookings tables, ClientListTable + ClientDetailSheet pattern from UI-SPEC |
| ADMN-05 | Site settings -- edit pricing, availability, about page, contact info | New siteSettings DB table (key-value or JSON), SiteSettingsForm with sections |
| ADMN-06 | Email campaign management -- compose and send newsletters | Tiptap editor reuse, Resend batch API for sending, React Email for template, newsletter broadcasts table |
| ADMN-07 | Media library -- upload, organize, manage images/audio/video | R2 direct upload reuse, mediaAssets DB table, grid/list views, MediaPickerDialog for forms |
| ADMN-08 | Homepage customization -- reorder sections, edit hero, feature beats/videos | @dnd-kit for section reorder, homepageSections DB table, featured content selectors |
| ADMN-09 | Role-based admin access -- owner, editor, manager with granular permissions | Custom RBAC layer (roles + permissions tables), permission check middleware, UI-level gating |
| MAIL-03 | Contact form submission notification to admin | React Email template, Resend send on contact form submit action |
| MAIL-04 | Newsletter broadcast emails from admin dashboard | React Email template for newsletter, Resend batch API, segment-based recipient filtering |
| MAIL-05 | Contact inbox -- view and reply to messages from admin dash | contactSubmissions table already has isRead, add contactReplies table, send reply via Resend |
</phase_requirements>

## Standard Stack

### Core (New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tiptap/react | 3.20.5 | React bindings for Tiptap editor | Official React wrapper for ProseMirror-based editor. Headless -- full styling control for Cyberpunk Metro theme. |
| @tiptap/pm | 3.20.5 | ProseMirror dependency | Required peer dependency for Tiptap. |
| @tiptap/starter-kit | 3.20.5 | Bundle of essential extensions | Includes bold, italic, strike, heading, list, blockquote, code, code-block, horizontal-rule. |
| @tiptap/extension-image | 3.20.5 | Image node for editor | Renders images in blog posts and newsletter body. Integrates with media library picker. |
| @tiptap/extension-link | 3.20.5 | Link mark for editor | Adds hyperlinks to rich text content. |
| @tiptap/extension-placeholder | 3.20.5 | Placeholder text | Shows "Start writing..." when editor is empty. |
| @tiptap/extension-underline | 3.20.5 | Underline mark | Common formatting option for blog and newsletter content. |
| @dnd-kit/core | 6.3.1 | Drag-and-drop framework | Homepage section reorder. Framework-agnostic with first-class React support. |
| @dnd-kit/sortable | 10.0.0 | Sortable preset for dnd-kit | Provides useSortable hook and arrayMove utility for list reorder. |
| @dnd-kit/utilities | 3.2.2 | DnD-kit utilities | CSS transform utilities for smooth drag animations. |

### Already Installed (Reused)

| Library | Version | Purpose | Phase 4 Usage |
|---------|---------|---------|---------------|
| resend | 6.9.4 | Email sending API | Contact notification (MAIL-03), newsletter broadcasts (MAIL-04), contact reply (MAIL-05) |
| @react-email/components | 1.0.10 | Email templates | Admin notification template, newsletter broadcast template |
| drizzle-orm | 0.45.1 | Database ORM | New tables for media, roles, permissions, homepage sections, tags, broadcasts |
| shadcn/ui | 4.1.0 | UI components | AlertDialog, Command, Breadcrumb, Checkbox, Pagination (to install) |
| sonner | 2.0.7 | Toast notifications | Save/delete/send/schedule action confirmations |
| date-fns | 4.1.0 | Date utilities | Scheduled publish dates, broadcast timestamps |
| zod | 4.3.6 | Validation | Form validation for all admin forms |
| lucide-react | 1.6.0 | Icons | Admin sidebar icons, toolbar icons, status indicators |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tiptap | Lexical (Meta) | Lexical is more React-native but less mature ecosystem for extensions. Tiptap was a locked decision (D-04). |
| @dnd-kit | react-beautiful-dnd | react-beautiful-dnd is deprecated. @dnd-kit is the community standard replacement. |
| Custom RBAC | Better Auth organization plugin | Organization plugin designed for multi-tenant SaaS, not single-site admin teams. Adds unnecessary complexity (organizations, invitations). Custom RBAC is simpler and matches the configurable permission grid requirement. |
| Resend batch API | Resend Broadcasts API | Broadcasts API is dashboard-only, not programmable from code. Batch API (up to 100/call) with chunking is the programmatic approach. |

**Installation:**
```bash
pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-underline @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**shadcn components to install:**
```bash
pnpm dlx shadcn@latest add alert-dialog command breadcrumb checkbox pagination
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/admin/
│   ├── layout.tsx              # AdminShell (replaces current simple layout)
│   ├── page.tsx                # Dashboard overview
│   ├── blog/
│   │   ├── page.tsx            # Blog post list
│   │   ├── new/page.tsx        # Create post
│   │   ├── [id]/edit/page.tsx  # Edit post
│   │   ├── categories/page.tsx # Category manager
│   │   └── tags/page.tsx       # Tag manager
│   ├── clients/page.tsx        # Client list
│   ├── media/page.tsx          # Media library
│   ├── settings/page.tsx       # Site settings
│   ├── homepage/page.tsx       # Homepage editor
│   ├── inbox/page.tsx          # Contact inbox
│   ├── newsletter/
│   │   ├── page.tsx            # Newsletter list + compose
│   │   └── subscribers/page.tsx # Subscriber management
│   ├── roles/page.tsx          # Roles & permissions
│   ├── beats/                  # (existing)
│   ├── bookings/               # (existing)
│   ├── rooms/                  # (existing)
│   ├── availability/           # (existing)
│   ├── services/               # (existing)
│   ├── packages/               # (existing)
│   └── bundles/                # (existing)
├── components/admin/
│   ├── admin-shell.tsx         # Layout with sidebar
│   ├── admin-sidebar.tsx       # Tile nav with sections
│   ├── tiptap-editor.tsx       # Shared rich text editor
│   ├── tiptap-toolbar.tsx      # Editor toolbar
│   ├── media-library.tsx       # Media grid/list
│   ├── media-picker-dialog.tsx # Media selection dialog
│   ├── stat-tile.tsx           # Dashboard stat card
│   └── ...                     # Per-feature components
├── actions/
│   ├── admin-blog.ts           # Blog CRUD actions
│   ├── admin-media.ts          # Media upload/delete actions
│   ├── admin-settings.ts       # Site settings actions
│   ├── admin-homepage.ts       # Homepage customization actions
│   ├── admin-inbox.ts          # Contact inbox/reply actions
│   ├── admin-newsletter.ts     # Newsletter compose/send actions
│   ├── admin-roles.ts          # Role/permission management actions
│   └── ...                     # (existing actions)
├── lib/
│   ├── permissions.ts          # RBAC permission check utilities
│   └── email/
│       ├── admin-contact-notification.tsx  # MAIL-03 template
│       └── newsletter-broadcast.tsx        # MAIL-04 template
└── db/schema.ts                # Extended with new tables
```

### Pattern 1: Server Action with Permission Check

**What:** All admin mutations go through Server Actions that verify both session and role permissions before executing.
**When to use:** Every admin write operation.

```typescript
// src/lib/permissions.ts
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { roles, rolePermissions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export type Permission =
  | "manage_content"
  | "manage_media"
  | "view_clients"
  | "send_newsletters"
  | "manage_bookings"
  | "manage_settings"
  | "manage_roles"
  | "reply_messages"

export async function requirePermission(permission: Permission) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role === "user") {
    throw new Error("Unauthorized")
  }
  // Owner bypasses all checks
  if (session.user.role === "owner") return session

  // Look up role permissions from DB
  const userRole = await db.query.roles.findFirst({
    where: eq(roles.name, session.user.role),
    with: { permissions: true },
  })
  if (!userRole?.permissions.some(p => p.permission === permission)) {
    throw new Error("Permission denied")
  }
  return session
}

// src/actions/admin-blog.ts
"use server"
import { requirePermission } from "@/lib/permissions"

export async function createBlogPost(data: BlogPostFormData) {
  await requirePermission("manage_content")
  // ... create post logic
}
```

### Pattern 2: Tiptap Editor with Media Library Integration

**What:** Shared Tiptap editor component used by blog posts and newsletter composer, with media picker for image insertion.
**When to use:** Blog post body, newsletter body, service descriptions.

```typescript
"use client"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing..." }),
      Underline,
    ],
    content,
    immediatelyRender: false, // CRITICAL: prevents SSR hydration mismatch
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  return (
    <div>
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
```

### Pattern 3: Newsletter Batch Send with Chunking

**What:** Send newsletter broadcasts via Resend batch API, chunking to 100 emails per request.
**When to use:** Newsletter broadcast sending.

```typescript
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendNewsletter(
  subscribers: { email: string }[],
  subject: string,
  htmlBody: string
) {
  const BATCH_SIZE = 100
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE)
    await resend.batch.send(
      batch.map(sub => ({
        from: "Glitch Studios <noreply@glitchstudios.com>",
        to: sub.email,
        subject,
        html: htmlBody,
      }))
    )
  }
}
```

### Pattern 4: Homepage Section Reorder with @dnd-kit

**What:** Drag-and-drop reorder of homepage sections using @dnd-kit sortable.
**When to use:** Homepage customization editor.

```typescript
"use client"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
// Note: Next.js SSR requires 'use client' directive.
// @dnd-kit handles hydration correctly with client components.
```

### Anti-Patterns to Avoid

- **Do NOT use Better Auth organization plugin for RBAC:** The organization plugin is designed for multi-tenant SaaS (Slack-style workspaces with invitations). This is a single-site admin team. Build custom roles/permissions tables.
- **Do NOT store rich text as Markdown:** Tiptap outputs HTML. Store HTML directly in the DB content column. Converting to/from Markdown adds complexity and loses formatting fidelity.
- **Do NOT send newsletters synchronously in a Server Action:** Newsletter sends to large lists should be chunked. Consider moving to an API route if the action times out (Vercel function timeout: 10s on hobby, 60s on pro).
- **Do NOT build a custom drag-and-drop:** Use @dnd-kit. Hand-rolling DnD is deceptively complex (touch support, keyboard a11y, scroll containers, animation).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text editing | Custom contentEditable | Tiptap (@tiptap/react) | ProseMirror handles selection, undo/redo, copy/paste, input rules, schema enforcement |
| Drag and drop reorder | Custom mouse/touch event handlers | @dnd-kit/sortable | Touch support, keyboard accessibility, smooth animations, edge cases with scroll |
| Email rendering | HTML string concatenation | React Email (@react-email/components) | Consistent rendering across email clients, dark mode support, responsive |
| Batch email sending | Manual loop with individual sends | Resend batch API | Rate limiting, error handling, idempotency keys |
| Slug generation | Custom regex | Reuse existing slugify function from admin-beats.ts | Already handles edge cases (consecutive hyphens, leading/trailing) |
| Date scheduling | setTimeout/setInterval | Vercel Cron (existing pattern) | Reliable, survives restarts, already set up for booking reminders |

## Database Schema Design (Discretion Area)

### New Tables Required

```sql
-- Blog tags (D-06)
blogTags (id, name, slug)
blogPostTags (id, postId -> blogPosts.id, tagId -> blogTags.id)

-- Media library (D-09, D-10)
mediaAssets (id, filename, key, url, mimeType, size, width, height, duration, alt, uploadedBy, createdAt)

-- Homepage sections (D-11, D-12)
homepageSections (id, sectionType, sortOrder, isVisible, config JSON, createdAt, updatedAt)
-- sectionType: 'hero' | 'featured_beats' | 'services' | 'testimonials' | 'blog' | 'portfolio'
-- config: JSON with section-specific data (hero text, featured beat IDs, etc.)

-- Contact replies (D-13, MAIL-05)
contactReplies (id, submissionId -> contactSubmissions.id, body, sentAt, sentBy)

-- Newsletter broadcasts (D-15, D-17)
newsletterBroadcasts (id, subject, body, segment, recipientCount, sentAt, sentBy, createdAt)

-- Subscriber tags for segmentation (D-16)
-- Extend newsletterSubscribers: add 'tags' text array column
-- Tags auto-populated: 'beat_buyer' (has orders), 'studio_client' (has bookings)

-- Site settings (ADMN-05)
siteSettings (id, key UNIQUE, value TEXT, updatedAt)
-- Keys: studio_name, studio_address, studio_phone, studio_email, about_text, social_links (JSON)

-- RBAC (D-18, D-19, D-20)
adminRoles (id, name UNIQUE, isDefault BOOLEAN, createdAt)
-- Default rows: owner, editor, manager
adminRolePermissions (id, roleId -> adminRoles.id, permission TEXT)
-- Permissions: manage_content, manage_media, view_clients, send_newsletters,
--              manage_bookings, manage_settings, manage_roles, reply_messages
```

### Schema Modifications

- **blogPosts:** Add `scheduledAt` timestamp column (for D-05 scheduled publishing), add `tags` relation through junction table
- **newsletterSubscribers:** Add `tags` text array column for segment auto-tagging
- **user table (Better Auth managed):** Role field already exists as text. Change from simple "admin"/"user" to role names ("owner", "editor", "manager", custom roles). Owner is the superuser.
- **contactSubmissions:** Already has `isRead` boolean. No schema change needed.
- **testimonials:** Add `serviceType` text column per D-08.

### Migration Strategy

Use direct SQL migration (established pattern from Phase 3 -- drizzle-kit push has bugs with pgEnum). Write a migration script that:
1. Creates new tables
2. Alters existing tables (add columns)
3. Seeds default roles (owner, editor, manager) with default permissions
4. Assigns "owner" role to the existing admin user

## Common Pitfalls

### Pitfall 1: Tiptap SSR Hydration Mismatch
**What goes wrong:** Editor renders different HTML on server vs client, causing React hydration errors.
**Why it happens:** Tiptap is browser-only. Next.js App Router SSRs by default.
**How to avoid:** Always set `immediatelyRender: false` in useEditor config. Component must have `"use client"` directive.
**Warning signs:** Console errors about hydration mismatch on pages with the editor.

### Pitfall 2: Newsletter Send Timeout
**What goes wrong:** Server Action times out when sending to a large subscriber list.
**Why it happens:** Vercel function timeout is 10s (hobby) or 60s (pro). Batch sending to 500+ subscribers may exceed this.
**How to avoid:** Use an API route instead of a Server Action for the send operation. Chunk into batches of 100 per Resend API call. Consider background processing for very large lists.
**Warning signs:** "Function timed out" errors in Vercel logs after clicking Send.

### Pitfall 3: RBAC Inconsistency Between Server and Client
**What goes wrong:** UI shows a button but the server rejects the action, or vice versa.
**Why it happens:** Permission checks duplicated in UI and server with different logic.
**How to avoid:** Single source of truth for permissions. Server always enforces. Client reads the user's role/permissions from session and hides UI elements. Pass permissions to client components as props from server components.
**Warning signs:** "Permission denied" toast appearing after clicking a visible button.

### Pitfall 4: Better Auth Role Field Mismatch
**What goes wrong:** Existing admin user has role="admin" but new RBAC expects role="owner".
**Why it happens:** Phase 1 set up Better Auth with defaultRole: "user" and manually assigned "admin" role.
**How to avoid:** Migration must update existing admin users from role="admin" to role="owner". Update the admin plugin config and layout auth check to use the new role system.
**Warning signs:** Admin locked out after deploying RBAC changes.

### Pitfall 5: @dnd-kit Hydration Warning in Next.js
**What goes wrong:** Console warns about hydration mismatch when DnD components render.
**Why it happens:** DnD generates different DOM on server vs client (drag handles, ARIA attributes).
**How to avoid:** Use `"use client"` on the homepage editor component. The DndContext and SortableContext must be client-only.
**Warning signs:** React hydration warnings in dev console on the homepage editor page.

### Pitfall 6: Media Library Upload Size Limits
**What goes wrong:** Large video uploads fail silently or time out.
**Why it happens:** Vercel's request body limit is 4.5MB for serverless functions. R2 presigned URLs bypass this (client uploads directly to R2), but the presigned URL generation still needs a server roundtrip.
**How to avoid:** Reuse the Phase 2 R2 direct upload pattern (presigned URL generated server-side, file uploaded client-side directly to R2). This pattern is already proven.
**Warning signs:** 413 errors or timeouts on large file uploads.

## Code Examples

### Existing Pattern: Server Action with Admin Check (from admin-beats.ts)

```typescript
"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: admin access required")
  }
  return session
}
```

This evolves to `requirePermission(permission)` for Phase 4 RBAC.

### Existing Pattern: R2 Direct Upload (from r2.ts)

```typescript
export async function getUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(r2Client, command, { expiresIn })
}
```

Reused directly for media library uploads with a `media/` key prefix.

### Existing Pattern: React Email Template (from booking-confirmation.tsx)

```typescript
import { Html, Head, Body, Container, Section, Heading, Text, Link, Hr } from "@react-email/components"

export function BookingConfirmationEmail({ clientName, ... }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#000", color: "#f5f5f0" }}>
        <Container>...</Container>
      </Body>
    </Html>
  )
}
```

Same pattern for AdminContactNotificationEmail and NewsletterBroadcastEmail.

### Existing Pattern: Vercel Cron (from vercel.json + booking-reminders)

```json
{ "path": "/api/cron/booking-reminders", "schedule": "0 * * * *" }
```

Add a second cron for scheduled blog post publishing:
```json
{ "path": "/api/cron/publish-scheduled", "schedule": "*/15 * * * *" }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Auth.js RBAC | Better Auth admin plugin + custom RBAC | Sept 2025 | Auth.js team joined Better Auth. Better Auth admin plugin provides base auth; custom layer adds dynamic roles. |
| react-beautiful-dnd | @dnd-kit | 2023+ | react-beautiful-dnd is deprecated by Atlassian. @dnd-kit is the modern replacement. |
| Quill/Draft.js | Tiptap (ProseMirror) | 2022+ | Quill is outdated, Draft.js unmaintained. Tiptap is the modern headless standard. |
| Individual email sends | Resend batch API | 2024 | Batch API sends up to 100 emails per call. More efficient and avoids rate limits. |

## RBAC Design Recommendation (Discretion Area)

### Permission List

Based on the admin sidebar sections and feature requirements:

| Permission | Description | Default: Owner | Default: Editor | Default: Manager |
|------------|-------------|:-:|:-:|:-:|
| manage_content | Create/edit/delete blog posts, services, team, testimonials | Y | Y | N |
| manage_media | Upload/delete media assets | Y | Y | N |
| view_clients | View client list and history | Y | N | Y |
| send_newsletters | Compose and send newsletter broadcasts | Y | N | Y |
| manage_bookings | View/confirm/cancel bookings | Y | N | Y |
| manage_settings | Edit site settings, homepage customization | Y | N | N |
| manage_roles | Create roles, assign permissions, invite admins | Y | N | N |
| reply_messages | View and reply to contact inbox messages | Y | Y | Y |

Owner has all permissions and cannot be modified. Editor focuses on content creation. Manager focuses on operations.

### Implementation Approach

1. **adminRoles table** stores role names + isDefault flag
2. **adminRolePermissions table** stores roleId + permission string pairs
3. **User's role field** (Better Auth managed) stores the role name as text
4. **requirePermission()** function: looks up user's role -> finds permissions -> checks if requested permission exists
5. **getSessionPermissions()** function: returns all permissions for the current user (used by client components for UI gating)
6. Server layout passes permissions to AdminSidebar as props; sidebar hides tiles accordingly

## Admin Sidebar Organization Recommendation (Discretion Area)

Based on task-oriented grouping (industry standard for studio/agency dashboards):

| Section | Tiles | Rationale |
|---------|-------|-----------|
| Overview | Dashboard | Landing page with stats and recent activity |
| Content | Blog Posts, Services, Team, Testimonials | Content creation and editing cluster |
| Commerce | Beats, Bundles, Bookings | Revenue and transaction management (existing Phase 2-3 pages) |
| Clients | Client List | Customer relationship view |
| Media | Media Library | Asset management |
| Communication | Contact Inbox, Newsletter | Inbound and outbound messaging |
| Settings | Site Settings, Roles & Permissions | Configuration and access control |

This matches the UI-SPEC exactly. Seven sections with logical grouping by admin task type.

## Open Questions

1. **Newsletter send for large lists (1000+)**
   - What we know: Resend batch API handles 100/call. Chunking is straightforward.
   - What's unclear: Whether a Vercel function can complete 10+ batch calls within the timeout window.
   - Recommendation: Start with Server Action + chunking. If timeout issues arise, move to a background API route or Vercel Cron-triggered send queue.

2. **Tiptap content in newsletter emails**
   - What we know: Tiptap outputs HTML. React Email expects JSX components.
   - What's unclear: Whether raw Tiptap HTML renders correctly across all email clients.
   - Recommendation: For newsletter body, inject Tiptap HTML into a React Email template wrapper (header + footer + styles). The Tiptap HTML itself goes into a `dangerouslySetInnerHTML` div within the email template. Apply inline styles via a simple post-processor.

3. **Better Auth role field update**
   - What we know: Current role field stores "admin" or "user". Phase 4 needs "owner", "editor", "manager", custom roles.
   - What's unclear: Whether Better Auth admin plugin handles arbitrary role strings gracefully.
   - Recommendation: Better Auth's admin plugin `defaultRole` is just a string. The role field is a text column. Setting role to "owner" works. Update the admin plugin config to recognize the new role names for the `adminRoles` option.

## Sources

### Primary (HIGH confidence)
- [Tiptap Next.js Installation Guide](https://tiptap.dev/docs/editor/getting-started/install/nextjs) - Installation, SSR caveats, immediatelyRender flag
- [Better Auth Admin Plugin](https://better-auth.com/docs/plugins/admin) - RBAC, createAccessControl, custom roles, permission checking
- [Resend Batch Emails API](https://resend.com/docs/api-reference/emails/send-batch-emails) - Batch send up to 100 emails per call
- [@dnd-kit official docs](https://dndkit.com/) - Sortable preset, React integration

### Secondary (MEDIUM confidence)
- [Better Auth Dynamic Roles Issue #4557](https://github.com/better-auth/better-auth/issues/4557) - Dynamic roles targeted for 2.0.0, not yet available
- [Tiptap extension-image npm](https://www.npmjs.com/package/@tiptap/extension-image) - v3.20.5 confirmed
- [Tiptap extension-link npm](https://www.npmjs.com/package/@tiptap/extension-link) - v3.20.5 confirmed
- Existing codebase patterns (admin-beats.ts, r2.ts, booking-confirmation.tsx, vercel.json)

### Tertiary (LOW confidence)
- Newsletter HTML rendering across email clients - needs testing with actual Tiptap output

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified on npm, versions confirmed, existing patterns established
- Architecture: HIGH - Extends proven patterns from Phases 2-3, consistent with UI-SPEC
- RBAC: MEDIUM - Custom implementation required due to Better Auth limitations. Design is sound but untested.
- Pitfalls: HIGH - Based on documented Next.js/Tiptap/dnd-kit caveats and project-specific history

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable ecosystem, no fast-moving dependencies)
