# Phase 5: Admin Dashboard UX - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the admin dashboard so it feels like a polished, daily-use product. Fix the sidebar independent scroll bug, refine dashboard content and layout, and ensure visual cohesion — all within the Cyberpunk Metro design language. No new admin features — purely UX/layout quality.

</domain>

<decisions>
## Implementation Decisions

### Sidebar Behavior
- **D-01:** Fix the core scroll bug: outer wrapper uses `min-h-screen` which lets the page grow beyond viewport. Change to `h-screen` (or equivalent) so sidebar and main content scroll independently within a fixed viewport container.
- **D-02:** Sidebar navigation density/collapsibility is Claude's Discretion — research industry-leading admin dashboards (Vercel, Linear, Stripe, Notion) and pick the best approach for 18 items across 7 sections.

### Dashboard Content
- **D-03:** Dashboard overview content (stats, activity feed, quick actions, layout) is Claude's Discretion — research what industry-leading dashboards show and pick the best layout for a studio admin who uses this daily. Current: 4 stat tiles + activity feed.

### Visual Cohesion
- **D-04:** Admin dashboard MUST follow the Cyberpunk Metro aesthetic — same monochrome palette, glitch effects, and tile-based design as the public site. Admin is part of the same product, not a separate utility dashboard.
- **D-05:** Visual refinements should make sections feel intentional rather than scaffolded. Current tiles all use `border-[#222] bg-[#111]` uniformly — differentiate where it improves hierarchy without breaking the design language.

### Claude's Discretion
- Sidebar collapse/expand behavior and section grouping approach
- Dashboard overview layout and content (stats, activity, quick actions)
- Spacing and visual weight distribution between sections
- Any responsive refinements for tablet-sized viewports

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Admin Layout
- `src/app/admin/layout.tsx` — Thin wrapper rendering AdminShell
- `src/components/admin/admin-shell.tsx` — Main layout: flex row with sidebar + main content area. The `min-h-screen` vs `h-screen` issue lives here.
- `src/components/admin/admin-sidebar.tsx` — Sidebar with 18 nav items, 7 sections, permission gating, mobile slide-in. Already has `overflow-y-auto`.

### Dashboard Page
- `src/app/admin/page.tsx` — Dashboard overview: stat tiles (revenue, bookings, messages, subscribers) + activity feed (inline JSX, not componentized).
- `src/components/admin/stat-tile.tsx` — Stat tile component with motion animation, takes icon as ReactNode.

### Design Language
- `.planning/DESIGN-LANGUAGE.md` — Cyberpunk Metro design system (spacing tokens, typography scale, color palette, tile states, animation system)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatTile` component: animated tile with icon, label, value — already follows design language
- `AdminSidebar`: full nav with permission gating, mobile slide-in, glitch hover effects
- `AdminShell`: server component that fetches permissions and unread count before rendering

### Established Patterns
- `flex` layout for sidebar + main split (not CSS Grid)
- `border-[#222] bg-[#111]` as universal card/tile background
- `font-mono text-[13px] uppercase` for section headers and labels
- `motion/react` for entry animations with staggered delays
- Permission-based nav item visibility via `getSessionPermissions()`
- Active nav item: inverted colors (`bg-[#f5f5f0] text-[#000]`)

### Integration Points
- Admin layout wraps all /admin/* routes — layout changes propagate everywhere
- Sidebar navigation items are hardcoded (not dynamic) — changes are in the component file
- Dashboard page queries DB directly (server component) — stat queries are inline SQL

</code_context>

<specifics>
## Specific Ideas

- User explicitly wants this to feel like a real product, not a scaffold
- Research Vercel, Linear, Stripe, Notion dashboards for sidebar and overview patterns
- The admin should be simple enough for non-technical daily use (from PROJECT.md constraints)
- Playwright verification: screenshot the dashboard at desktop and mobile viewports to verify scroll behavior and visual cohesion

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-admin-dashboard-ux*
*Context gathered: 2026-03-28*
