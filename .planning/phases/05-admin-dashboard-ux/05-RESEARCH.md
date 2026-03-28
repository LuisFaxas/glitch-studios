# Phase 5: Admin Dashboard UX - Research

**Researched:** 2026-03-28
**Domain:** Admin dashboard layout, sidebar UX, overview page design
**Confidence:** HIGH

## Summary

This phase is a focused UX fix-up: repair the scroll bug, refine sidebar density, improve the dashboard overview, and make the admin feel visually intentional within the Cyberpunk Metro design language. No new features, no new dependencies -- purely layout and CSS work with minor component restructuring.

The scroll bug is a textbook CSS issue (min-h-screen on a flex container prevents independent column scrolling). The fix is well-documented and trivial. The larger design decisions -- sidebar density for 18 items across 7 sections, and dashboard overview layout -- are informed by patterns from Vercel, Linear, Stripe, and Notion dashboards, adapted to the project's monochrome brutalist aesthetic.

**Primary recommendation:** Fix the viewport container to `h-screen` with `overflow-hidden` on the outer wrapper, then independently scroll both sidebar and main content. Keep the sidebar expanded (no collapse) at 240px with tighter section spacing. Upgrade the dashboard overview from "4 stats + activity list" to a two-column layout with stats row, quick actions grid, and activity feed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Fix the core scroll bug: outer wrapper uses `min-h-screen` which lets the page grow beyond viewport. Change to `h-screen` (or equivalent) so sidebar and main content scroll independently within a fixed viewport container.
- **D-04:** Admin dashboard MUST follow the Cyberpunk Metro aesthetic -- same monochrome palette, glitch effects, and tile-based design as the public site. Admin is part of the same product, not a separate utility dashboard.
- **D-05:** Visual refinements should make sections feel intentional rather than scaffolded. Current tiles all use `border-[#222] bg-[#111]` uniformly -- differentiate where it improves hierarchy without breaking the design language.

### Claude's Discretion
- Sidebar collapse/expand behavior and section grouping approach (D-02)
- Dashboard overview layout and content -- stats, activity, quick actions (D-03)
- Spacing and visual weight distribution between sections
- Any responsive refinements for tablet-sized viewports

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-01 | Admin sidebar scrolls independently from main content area | Scroll fix pattern (h-screen + overflow-hidden outer, overflow-y-auto on each column) -- well-documented CSS pattern |
| ADMIN-02 | Dashboard layout feels polished -- stat tiles, activity feed, and navigation are visually cohesive | Industry dashboard patterns for overview layout, visual hierarchy techniques within monochrome palette |
</phase_requirements>

## Architecture Patterns

### The Scroll Fix (D-01) -- ADMIN-01

**The bug:** `admin-shell.tsx` line 24 uses `min-h-screen` on the outer flex container. This allows the document body to grow taller than the viewport, making the sidebar scroll with the page instead of independently.

**The fix pattern (HIGH confidence):**
```tsx
// BEFORE (broken)
<div className="flex min-h-screen bg-[#000000]">
  <AdminSidebar ... />
  <main className="flex-1 overflow-y-auto">

// AFTER (fixed)
<div className="flex h-screen overflow-hidden bg-[#000000]">
  <AdminSidebar ... />
  <main className="flex-1 overflow-y-auto">
```

Key requirements:
1. Outer container: `h-screen overflow-hidden` -- locks to viewport, prevents body scroll
2. Sidebar: already has `overflow-y-auto` -- will now scroll independently
3. Main content: already has `overflow-y-auto` and `flex-1` -- will scroll independently
4. Mobile sidebar: no change needed (it uses `fixed inset-y-0` positioning already)

This is the standard Tailwind pattern for fixed-viewport dual-scroll layouts. Used by Vercel, Linear, and shadcn/ui admin templates.

**Source:** Multiple verified CSS layout guides, Tailwind GitHub gists, and the shadcn/ui admin dashboard template all use this exact pattern.

### Sidebar Density Recommendation (D-02)

**Current state:** 18 nav items across 7 sections. Sidebar is 240px wide. No collapse behavior.

**Industry research findings:**

| Dashboard | Sidebar Width | Collapse? | Section Strategy | Item Count |
|-----------|--------------|-----------|------------------|------------|
| Vercel (2026) | ~240px | Resizable, hideable | Flat list with dividers, no section headers | ~8-10 top-level |
| Linear | ~240px | Collapsible (Ctrl+Shift+L) | Workspace > Teams > Views hierarchy | ~12-15 with nesting |
| Stripe | ~220px | No | Grouped with subtle headers | ~15-18 |
| Notion | ~240px | Collapsible | Flat + favorites + workspace sections | Variable |

**Recommendation: Do NOT add collapse behavior.** Rationale:
1. The sidebar has 18 items -- this fits in a 240px scrollable sidebar without truncation at standard viewport heights (768px+)
2. Collapse adds complexity (localStorage persistence, tooltips on icons, animation) for marginal benefit
3. The admin is used by non-technical staff daily -- hiding navigation creates friction
4. The Cyberpunk Metro design language emphasizes "the sidebar is a control panel" and "no empty space in the sidebar" -- collapsing contradicts both principles
5. Stripe (similar item count) does not collapse either

**Density improvements instead:**
- Reduce section header vertical spacing from current `gap-6` (24px between sections) to `gap-4` (16px)
- Section headers are already compact (`text-[13px] uppercase`)
- Keep min-height 44px touch targets on items (already present)
- Consider merging single-item sections to reduce visual noise:
  - "Clients" (1 item) could merge into "Commerce"
  - "Media" (1 item) could merge into "Content"
  - This reduces 7 sections to 5 -- less cognitive overhead, same items

**Merged section proposal:**

| Section | Items |
|---------|-------|
| Overview | Dashboard |
| Content | Blog Posts, Services, Team, Testimonials, Media Library |
| Commerce | Beats, Bundles, Bookings, Client List |
| Communication | Contact Inbox, Newsletter |
| Settings | Site Settings, Homepage, Roles & Permissions |

This brings us from 7 sections to 5, which aligns with the "5-7 primary groups" best practice from sidebar UX research. Each section has 1-5 items, which is scannable.

### Dashboard Overview Layout (D-03) -- ADMIN-02

**Current state:** 4 stat tiles in a row + activity feed list. Functional but scaffolded-feeling.

**Industry patterns for admin overview pages:**

| Dashboard | Layout Pattern | Key Elements |
|-----------|---------------|--------------|
| Vercel | Stats row + deployment list + quick actions | Prominent recent activity, action-oriented |
| Stripe | Stats row + charts + recent payments list | Data-heavy, metric-focused |
| Linear | No traditional dashboard -- goes straight to inbox/issues | Workflow-first, not overview-first |
| Notion | No traditional dashboard -- goes to recent pages | Content-first |

**Recommendation: Enhanced two-section layout**

For a studio admin who uses this daily, the overview should answer three questions instantly:
1. **"How's business?"** -- stat tiles (already exist)
2. **"What needs my attention?"** -- pending items requiring action
3. **"What happened recently?"** -- activity feed (already exists)

**Proposed layout:**
```
┌──────────────────────────────────────────────────┐
│  DASHBOARD (h1)                                   │
├────────────┬────────────┬────────────┬────────────┤
│ Revenue    │ Bookings   │ Messages   │ Subscribers │
│ (30d)      │ This Week  │ Pending    │             │
├────────────┴────────────┴────────────┴────────────┤
│                                                    │
│  QUICK ACTIONS              RECENT ACTIVITY        │
│  ┌──────────┬──────────┐   ┌─────────────────────┐│
│  │ New Beat │ New Post │   │ Order: $49.99  2h   ││
│  ├──────────┼──────────┤   │ Booking: John  5h   ││
│  │ Messages │ Bookings │   │ Message: Jane  1d   ││
│  └──────────┴──────────┘   │ ...                 ││
│                             └─────────────────────┘│
└──────────────────────────────────────────────────┘
```

**Quick Actions grid (new addition):**
- 2x2 grid of action tiles that link to the most common admin tasks
- Follows the tile-based design language (same `border-[#222] bg-[#111]` base)
- Suggested actions: "New Beat" -> /admin/beats, "New Post" -> /admin/blog, "View Messages" -> /admin/inbox, "View Bookings" -> /admin/bookings
- These are simple Link tiles, not buttons -- no new functionality needed

**Two-column layout for Quick Actions + Activity Feed:**
- On desktop (lg+): side by side, quick actions left (narrower), activity feed right (wider)
- On mobile: stacked, quick actions first, then activity feed
- Uses CSS Grid: `grid-cols-1 lg:grid-cols-[300px_1fr]` or similar

### Visual Hierarchy Improvements (D-05)

**Current problem:** Everything uses `border-[#222] bg-[#111]` uniformly. Stat tiles, activity items, and any future sections all look identical. This makes the dashboard feel flat and scaffolded.

**Recommendation: Differentiate through border weight and subtle background shifts, not color.**

Within the monochrome Cyberpunk Metro palette:

| Element | Current | Proposed | Why |
|---------|---------|----------|-----|
| Stat tiles | `border-[#222] bg-[#111]` | `border-[#333] bg-[#111]` + thicker border (`border-2`) | Stats are primary -- deserve more visual weight |
| Quick action tiles | N/A | `border-[#222] bg-[#0a0a0a]` + hover inversion | Slightly darker bg signals "interactive" vs "display" |
| Activity items | `border-[#222] bg-[#111]` | `border-[#1a1a1a] bg-[#0a0a0a]` (subtler) | Activity is secondary info -- should recede slightly |
| Section headers | `text-[#888888]` | `text-[#555555]` with a bottom border `border-b border-[#222]` | Clearer section delineation |

**Key principle:** In a monochrome palette, hierarchy comes from:
1. Border weight (1px vs 2px)
2. Background shade (five stops: #000, #0a0a0a, #111, #1a1a1a, #222)
3. Text brightness (#555 < #888 < #f5f5f0)
4. Size and spacing (larger tiles = more important)

This stays strictly within the design language -- no accent colors, no shadows, no rounded corners.

### Responsive Refinements

**Current:** Stat grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` -- this is correct.

**Tablet consideration (768px-1024px):**
- Sidebar is visible at `lg` breakpoint (1024px+)
- At 768px-1023px, sidebar is hidden (mobile hamburger)
- This means tablet users get full-width content -- the stat grid's `sm:grid-cols-2` handles this well
- No changes needed for tablet specifically

**One fix:** The mobile top padding `pt-16 lg:pt-6` accounts for the hamburger button. This is correct and should be preserved.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Independent scroll columns | Custom JS scroll sync | CSS `h-screen overflow-hidden` + `overflow-y-auto` on children | Pure CSS, zero JS, works everywhere |
| Sidebar collapse animation | Custom useState + CSS transitions | Don't collapse at all (per recommendation) | Complexity not justified for 18 items |
| Dashboard charts/graphs | Custom SVG charts | Skip for now -- stat tiles are sufficient | Charts add Recharts dependency weight for minimal value at current data volume |

## Common Pitfalls

### Pitfall 1: Scroll Containment Breaking on iOS Safari
**What goes wrong:** `h-screen` on iOS Safari includes the URL bar height, causing layout shifts when the bar collapses/expands.
**Why it happens:** `100vh` in Safari mobile includes the hidden URL bar area.
**How to avoid:** Use `h-dvh` (dynamic viewport height) instead of `h-screen` where supported, OR keep `h-screen` since the admin dashboard is a desktop-first tool unlikely to be used on mobile Safari in production.
**Warning signs:** Layout jumping on scroll in iOS Safari.

### Pitfall 2: Sidebar Scroll Position Resets on Navigation
**What goes wrong:** When clicking a nav item, the sidebar scrolls back to top on route change.
**Why it happens:** Next.js App Router re-renders the layout on navigation, which can reset scroll position in some configurations.
**How to avoid:** The sidebar is a client component inside a server component shell. The client component maintains its own scroll state across navigations because it persists in the component tree. The current architecture handles this correctly -- verify it still works after the h-screen change.
**Warning signs:** Sidebar jumping to top when clicking between admin pages.

### Pitfall 3: Losing the Mobile Hamburger Button Z-Index
**What goes wrong:** After changing to `overflow-hidden` on the outer container, the fixed hamburger button might get clipped.
**Why it happens:** `overflow-hidden` on a parent can affect fixed-positioned children in some stacking contexts.
**How to avoid:** The hamburger button is `fixed` with `z-50` -- this should be fine since `fixed` positions relative to the viewport, not the parent. But verify after the change.
**Warning signs:** Hamburger button disappearing on mobile after the layout change.

### Pitfall 4: Uniform Tile Styling Feeling Like a Prototype
**What goes wrong:** When every element uses the same border/background, the dashboard looks auto-generated.
**Why it happens:** Developers scaffold with one tile style and never differentiate.
**How to avoid:** Apply the visual hierarchy recommendations above -- vary border weight, background shade, and spacing to create intentional grouping without breaking the design language.
**Warning signs:** User feedback like "it looks like a template" or "everything looks the same."

## Code Examples

### Scroll Fix (verified pattern)
```tsx
// src/components/admin/admin-shell.tsx
// Change the outer container from min-h-screen to h-screen + overflow-hidden
<div className="flex h-screen overflow-hidden bg-[#000000]">
  <AdminSidebar
    permissions={sessionPerms.permissions}
    role={sessionPerms.role}
    unreadCount={unreadCount}
  />
  <main className="flex-1 overflow-y-auto">
    <div className="p-6 pt-16 lg:pt-6">{children}</div>
  </main>
</div>
```

### Quick Actions Component Pattern
```tsx
// New component: src/components/admin/quick-actions.tsx
import Link from "next/link"
import { Music, FileText, Inbox, CalendarDays } from "lucide-react"

const actions = [
  { label: "New Beat", href: "/admin/beats", icon: Music },
  { label: "New Post", href: "/admin/blog", icon: FileText },
  { label: "Messages", href: "/admin/inbox", icon: Inbox },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group relative flex items-center gap-3 border border-[#222] bg-[#0a0a0a] px-4 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#000]"
        >
          <action.icon size={16} className="shrink-0" />
          <span>{action.label}</span>
        </Link>
      ))}
    </div>
  )
}
```

### Merged Sidebar Sections Pattern
```tsx
// Updated getNavSections in admin-sidebar.tsx
// Merge single-item sections for cleaner grouping
function getNavSections(unreadCount: number): NavSection[] {
  return [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Content",
      items: [
        { label: "Blog Posts", href: "/admin/blog", icon: FileText, permission: "manage_content" },
        { label: "Services", href: "/admin/services", icon: Briefcase, permission: "manage_content" },
        { label: "Team", href: "/admin/team", icon: Users, permission: "manage_content" },
        { label: "Testimonials", href: "/admin/testimonials", icon: Quote, permission: "manage_content" },
        { label: "Media Library", href: "/admin/media", icon: Image, permission: "manage_media" },
      ],
    },
    {
      title: "Commerce",
      items: [
        { label: "Beats", href: "/admin/beats", icon: Music, permission: "manage_bookings" },
        { label: "Bundles", href: "/admin/bundles", icon: Package, permission: "manage_bookings" },
        { label: "Bookings", href: "/admin/bookings", icon: CalendarDays, permission: "manage_bookings" },
        { label: "Client List", href: "/admin/clients", icon: UserCircle, permission: "view_clients" },
      ],
    },
    {
      title: "Communication",
      items: [
        { label: "Contact Inbox", href: "/admin/inbox", icon: Inbox, permission: "reply_messages", badge: unreadCount },
        { label: "Newsletter", href: "/admin/newsletter", icon: Mail, permission: "send_newsletters" },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "Site Settings", href: "/admin/settings", icon: Settings, permission: "manage_settings" },
        { label: "Homepage", href: "/admin/homepage", icon: Layout, permission: "manage_settings" },
        { label: "Roles & Permissions", href: "/admin/roles", icon: Shield, permission: "manage_roles" },
      ],
    },
  ]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `min-h-screen` for full-height layouts | `h-screen overflow-hidden` (or `h-dvh`) for viewport-locked layouts | Always been correct, widely adopted ~2022+ | Enables independent column scrolling |
| `100vh` in CSS | `100dvh` (dynamic viewport height) | CSS spec ~2023, wide browser support 2024+ | Fixes iOS Safari viewport height bug |
| Sidebar collapse as default | Keep expanded for <20 items | UX research consensus 2024+ | Reduces interaction cost for daily-use tools |

## Open Questions

1. **Section merging: Content vs Media permission boundary**
   - What we know: "Media Library" uses `manage_media` permission while Content items use `manage_content`. Merging them into one section is a visual grouping only -- permissions still gate individually.
   - What's unclear: Whether the visual grouping creates a confusing expectation that "Content" editors can manage media.
   - Recommendation: Merge anyway -- the permission gating is per-item, and the visual grouping is about scanability not access control. The merged section still hides items the user can't access.

2. **Activity feed componentization**
   - What we know: Activity feed is inline JSX in the dashboard page, not a reusable component.
   - What's unclear: Whether future admin pages will need the activity feed.
   - Recommendation: Extract to a component during this phase since we're already touching the file. Keeps things clean.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `admin-shell.tsx`, `admin-sidebar.tsx`, `admin/page.tsx`, `stat-tile.tsx` -- direct file inspection
- `.planning/DESIGN-LANGUAGE.md` -- Cyberpunk Metro design system specification
- Tailwind CSS fixed sidebar pattern -- verified across multiple implementation guides

### Secondary (MEDIUM confidence)
- [Vercel Dashboard Redesign Changelog](https://vercel.com/changelog/dashboard-navigation-redesign-rollout) -- resizable sidebar, mobile bottom bar
- [Linear Collapsible Sidebar](https://linear.app/changelog/unpublished-collapsible-sidebar) -- collapse shortcut, icon-only mode
- [Sidebar Design for Web Apps: UX Best Practices (2026)](https://www.alfdesigngroup.com/post/improve-your-sidebar-design-for-web-apps) -- width recommendations, item count limits, section grouping
- [Admin Dashboard UI/UX Best Practices 2025](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d) -- five-second rule, data visualization, consistency

### Tertiary (LOW confidence)
- None -- all findings verified against multiple sources or direct code inspection

## Metadata

**Confidence breakdown:**
- Scroll fix (D-01): HIGH -- textbook CSS pattern, exact code location identified
- Sidebar density (D-02): HIGH -- researched 4+ industry dashboards, aligned with design language docs
- Dashboard layout (D-03): HIGH -- common admin pattern, uses existing components
- Visual cohesion (D-04, D-05): MEDIUM -- subjective design decisions, but constrained by design language spec
- Responsive (tablet): HIGH -- current breakpoints are already correct

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable -- CSS layout patterns don't change)
