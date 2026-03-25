---
phase: 01-foundation-public-site
plan: 02
subsystem: auth, ui
tags: [better-auth, drizzle-adapter, admin-rbac, sidebar, bottom-tab-bar, glitch-logo, newsletter, zod, sonner]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js scaffold, Tailwind v4 tokens, shadcn/ui components, Drizzle schema, Neon client
provides:
  - Better Auth server config with admin plugin and Drizzle adapter
  - Better Auth client instance with signIn, signUp, signOut, useSession
  - Auth API catch-all route at /api/auth/[...all]
  - Login page with email/password and zod validation
  - Registration page with name/email/password/confirm
  - Auth layout (centered, minimal, black background)
  - Middleware redirecting unauthenticated /admin requests
  - Admin seed script for role promotion
  - GLITCH logo component with dramatic-then-subtle CSS animation
  - Collapsible desktop side nav using shadcn Sidebar (icon mode)
  - Fixed mobile bottom tab bar with 4 nav items
  - Footer with logo, nav links, social icons, newsletter form
  - Newsletter form with server action and duplicate detection
  - Audio player placeholder component for Phase 2
  - Public layout shell wiring nav + footer
  - Placeholder homepage with dual CTAs
affects: [01-03, 01-04, 02-beat-store, 03-booking, 04-admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [Better Auth server/client split, render prop for shadcn link buttons, zod/v4 form validation, server actions for mutations, base-ui render prop pattern]

key-files:
  created:
    - src/lib/auth.ts
    - src/lib/auth-client.ts
    - src/app/api/auth/[...all]/route.ts
    - src/app/(auth)/layout.tsx
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/register/page.tsx
    - src/middleware.ts
    - src/db/seed-admin.ts
    - src/components/layout/glitch-logo.tsx
    - src/components/layout/side-nav.tsx
    - src/components/layout/bottom-tab-bar.tsx
    - src/components/layout/footer.tsx
    - src/components/layout/audio-player-placeholder.tsx
    - src/components/forms/newsletter-form.tsx
    - src/actions/newsletter.ts
    - src/app/(public)/layout.tsx
    - src/app/(public)/page.tsx
  modified:
    - src/app/layout.tsx
    - src/lib/db.ts

key-decisions:
  - "Used render prop instead of asChild for shadcn/ui components (base-ui v4 pattern)"
  - "Used Globe and ExternalLink icons as social placeholders (lucide-react has no social media icons)"
  - "Made db.ts fallback to dummy URL at build time to avoid neon() throwing during static generation"
  - "Used styled-jsx for glitch logo pseudo-element animations (CSS modules would also work)"

patterns-established:
  - "Better Auth server config in src/lib/auth.ts with Drizzle adapter"
  - "Better Auth client in src/lib/auth-client.ts with named exports for hooks"
  - "Auth pages in (auth) route group with centered layout"
  - "Public pages in (public) route group with side nav + bottom tab bar + footer"
  - "Server actions in src/actions/ directory"
  - "Form components in src/components/forms/ directory"
  - "Layout components in src/components/layout/ directory"
  - "render prop pattern for polymorphic shadcn/ui components (Link, etc.)"

requirements-completed: [AUTH-01, AUTH-02, AUTH-05, CONT-02, INFR-03, INFR-05]

# Metrics
duration: 15min
completed: 2026-03-25
---

# Phase 1 Plan 2: Auth + Layout Shell Summary

**Better Auth with admin/client roles, GLITCH logo with CSS glitch animation, collapsible side nav, mobile bottom tab bar, footer with newsletter, and public layout shell**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-25T08:32:39Z
- **Completed:** 2026-03-25T08:47:33Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments
- Complete auth system: server config with admin plugin, client hooks, API route, login/register pages with zod validation and toast feedback
- GLITCH logo component with dramatic 1.5s load animation settling to continuous subtle glitch, CSS pseudo-elements with clip-path keyframes
- Responsive navigation: collapsible side nav (desktop, shadcn Sidebar in icon mode) + fixed bottom tab bar (mobile, 4 items with safe area padding)
- Footer with 3-column grid (logo+tagline, nav+social, newsletter form), newsletter server action with duplicate detection
- Public layout shell wiring all navigation and footer components
- Placeholder homepage with GLITCH logo (lg), tagline, and dual CTAs (Book a Session, Browse Beats)

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure Better Auth with admin plugin and create auth pages** - `25a0743` (feat)
2. **Task 2: Build GLITCH logo, navigation, footer, and public layout** - `da9414e` (feat)

Additional commits:
- `f4b6a0d` - chore: update package-lock.json from npm install

## Files Created/Modified
- `src/lib/auth.ts` - Better Auth server config with admin plugin and Drizzle adapter
- `src/lib/auth-client.ts` - Client auth instance with signIn, signUp, signOut, useSession exports
- `src/app/api/auth/[...all]/route.ts` - Better Auth catch-all API route
- `src/app/(auth)/layout.tsx` - Centered auth layout (min-h-screen, max-w-md)
- `src/app/(auth)/login/page.tsx` - Login form with email/password, zod validation, error toasts
- `src/app/(auth)/register/page.tsx` - Registration form with name/email/password/confirm
- `src/middleware.ts` - Auth middleware redirecting unauthenticated /admin requests
- `src/db/seed-admin.ts` - Admin user seed script (register + promote to admin role)
- `src/components/layout/glitch-logo.tsx` - CSS animated GLITCH text with dramatic/subtle modes
- `src/components/layout/side-nav.tsx` - Collapsible desktop sidebar with user session display
- `src/components/layout/bottom-tab-bar.tsx` - Fixed mobile bottom tab bar with 4 items
- `src/components/layout/footer.tsx` - 3-column footer with logo, links, social, newsletter
- `src/components/layout/audio-player-placeholder.tsx` - Hidden placeholder for Phase 2 player
- `src/components/forms/newsletter-form.tsx` - Inline email + button newsletter form
- `src/actions/newsletter.ts` - Server action for newsletter subscription with duplicate check
- `src/app/(public)/layout.tsx` - Public layout shell with SidebarProvider, SideNav, BottomTabBar, Footer
- `src/app/(public)/page.tsx` - Placeholder homepage with GLITCH logo and CTAs
- `src/app/layout.tsx` - Added Toaster component for toast notifications
- `src/lib/db.ts` - Added build-time fallback for missing DATABASE_URL

## Decisions Made
- Used `render` prop instead of `asChild` for shadcn/ui link buttons -- this version of shadcn/ui uses base-ui which replaces Radix's asChild with a render prop pattern
- Used Globe and ExternalLink icons as social media icon placeholders since lucide-react does not include brand/social icons (Instagram, YouTube, SoundCloud, Twitter)
- Made db.ts fall back to a dummy connection string at build time to prevent neon() from throwing during Next.js static page generation
- Used styled-jsx for glitch logo pseudo-element animations since Tailwind cannot target ::before/::after with dynamic animation names
- Removed root src/app/page.tsx since (public)/page.tsx serves the same / route via the route group

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed node_modules for worktree**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** Worktree had no node_modules directory, all imports unresolved
- **Fix:** Ran `npm install` to install all dependencies
- **Files modified:** package-lock.json
- **Verification:** TypeScript check passes clean
- **Committed in:** f4b6a0d

**2. [Rule 1 - Bug] Fixed shadcn/ui asChild to render prop pattern**
- **Found during:** Task 2 (TypeScript verification)
- **Issue:** This version of shadcn/ui uses base-ui's render prop instead of Radix's asChild prop
- **Fix:** Replaced `asChild` with `render={<Link href="..." />}` on all SidebarMenuButton and Button components
- **Files modified:** src/components/layout/side-nav.tsx, src/app/(public)/page.tsx
- **Verification:** TypeScript check passes, build succeeds
- **Committed in:** da9414e (Task 2 commit)

**3. [Rule 1 - Bug] Fixed non-existent lucide-react social media icons**
- **Found during:** Task 2 (TypeScript verification)
- **Issue:** lucide-react does not export Instagram, Youtube, or Twitter icons
- **Fix:** Replaced with Globe and ExternalLink icons as placeholders
- **Files modified:** src/components/layout/footer.tsx
- **Verification:** TypeScript check passes, build succeeds
- **Committed in:** da9414e (Task 2 commit)

**4. [Rule 3 - Blocking] Fixed db.ts build-time crash on missing DATABASE_URL**
- **Found during:** Task 2 (build verification)
- **Issue:** neon() throws when DATABASE_URL is undefined, preventing static page generation
- **Fix:** Added fallback dummy URL for build time
- **Files modified:** src/lib/db.ts
- **Verification:** npm run build exits 0
- **Committed in:** da9414e (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (2 bugs, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correctness and build success. No scope creep.

## Issues Encountered
- Next.js 16.2.1 shows deprecation warning for middleware ("use proxy instead") -- middleware still works, keeping as-is since proxy convention may not support auth session checking yet
- shadcn/ui v4 uses base-ui instead of Radix, changing the polymorphic component API from asChild to render prop

## Known Stubs
None -- all files contain real implementations. The auth system requires DATABASE_URL and BETTER_AUTH_SECRET environment variables to function at runtime. The admin seed script requires a running dev server to call the sign-up endpoint.

## User Setup Required
The following environment variables must be configured in `.env.local` before auth features work:
- `DATABASE_URL` - Neon Postgres connection string
- `BETTER_AUTH_SECRET` - Random 32-character string for session signing
- `BETTER_AUTH_URL` - Base URL (http://localhost:3000 for dev)

After setting these, run:
```bash
npx better-auth generate   # Generate Better Auth tables
npm run db:push             # Push schema to Neon
npm run db:seed             # Seed sample data
tsx src/db/seed-admin.ts    # Create admin user (requires dev server running)
```

## Next Phase Readiness
- Auth system complete, ready for protected routes and admin dashboard
- Layout shell complete, ready for homepage sections (01-03) and content pages (01-04)
- All navigation components wired, new pages just need to be added to route groups
- Newsletter subscription functional, email delivery deferred to Phase 4

## Self-Check: PASSED

---
*Phase: 01-foundation-public-site*
*Completed: 2026-03-25*
