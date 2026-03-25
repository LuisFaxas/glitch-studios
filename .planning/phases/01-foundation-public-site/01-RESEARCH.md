# Phase 1: Foundation + Public Site - Research

**Researched:** 2026-03-25
**Domain:** Next.js greenfield scaffold, cyberpunk visual identity, auth, public pages, database, media storage
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire project foundation: Next.js 16 scaffold with Tailwind v4, Drizzle ORM connected to Neon Postgres, Better Auth with admin/client roles, Cloudflare R2 for media storage, and all public-facing pages (homepage, services, portfolio, artist profiles, blog, contact). The visual identity is a flat black-and-white cyberpunk aesthetic with monospace typography, CSS/SVG glitch logo animation, and Framer Motion scroll effects. Navigation uses a collapsible side nav on desktop and bottom tab bar on mobile.

The primary technical risks for this phase are: (1) Framer Motion page transitions in Next.js App Router require a FrozenRouter workaround to prevent animation interruption, (2) the GLITCH logo CSS/SVG recreation requires careful implementation to match the fragmented/distorted reference, and (3) the root layout must be architected to accommodate the persistent audio player placeholder, side nav, bottom tab bar, and auth provider from day one since retrofitting is expensive.

**Primary recommendation:** Scaffold with `create-next-app`, init shadcn/ui for base components (sidebar, tabs, dialog, form), establish the visual identity system (colors, typography, glitch effects) as a design token layer in Tailwind v4's `@theme`, wire up Better Auth with Drizzle + Neon early, and build pages as Server Components with Framer Motion scroll-in animations (not full page transitions -- those are fragile in App Router).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Hero section is a hybrid -- video showreel background with split text overlay and dual CTAs (Book a Session + Browse Beats), both equally prominent
- **D-03:** Below hero sections in order: Services overview -> Featured beats carousel -> Video portfolio carousel -> Testimonials
- **D-04:** Sections use contained card panels (max-width container), not full-width blocks
- **D-05:** Scroll behavior: Framer Motion scroll-in animations + parallax background layers + subtle glitch effects on section transitions
- **D-06:** GLITCH logo must be recreated in CSS/SVG (not from PNG). Animates with glitch effect on page load, then settles into subtle continuous conservative glitch
- **D-07:** Color palette: Pure black and white + off-white + white glow effects for depth. NO neon, NO color accents, NO glassmorphic panels. Flat design
- **D-08:** Typography: Monospace tech direction -- JetBrains Mono or similar monospace for headings/display, clean sans-serif for body text
- **D-09:** Design references: faxas.net/design (component quality), Graphite.com (dark elegance), Resend (minimal), Feastables (bold type contrast)
- **D-10:** Desktop: Collapsible side navigation -- toggles between icon-only (slim) and full labels + icons (wider). User controls the toggle
- **D-11:** Mobile: Fixed bottom tab bar (app-like navigation)
- **D-12:** Nav items: Beats, Services, Portfolio, About
- **D-13:** Persistent audio player will share space with navigation (player lives in root layout, established as placeholder for Phase 2)
- **D-14:** Services page: Single page with tabs/sections switching between service types
- **D-15:** Portfolio page: Embla carousel as primary navigation through projects
- **D-16:** Artist/producer profiles: Full page per artist with bio, photo, role, credits/work list, social links, embedded audio
- **D-17:** Blog: Database-driven (stored in Neon Postgres via Drizzle). Phase 1 seeds with sample content
- **D-18:** Contact form: Simple form (name, email, service interest, message). Routes to admin inbox (email delivery in Phase 4)
- **D-19:** Newsletter signup: Email capture form on homepage and footer. Subscriber storage in database. Actual sending in Phase 4
- **D-20:** Media hosting: Cloudflare R2 for all images, audio, and video files
- **D-21:** Portfolio videos: YouTube embeds for public showcase + self-hosted (R2) for premium/exclusive content
- **D-22:** Blog images: Uploaded to R2, referenced from database

### Claude's Discretion
- Hero section viewport height (D-02) -- pick what creates the best first impression
- Exact monospace font selection -- JetBrains Mono recommended but open to alternatives
- Scroll animation timing and intensity -- tasteful, not overwhelming
- Side nav width in expanded/collapsed states
- Footer design and content

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFR-01 | Caddy dev server configuration reserved for this project | Caddy NOT installed on system -- must install or defer. Caddyfile config is straightforward once installed. |
| INFR-02 | Vercel deployment with production configuration | Next.js 16.2.1 has native Vercel support. Standard `vercel.json` + env var config. |
| INFR-03 | Mobile-first responsive design across all pages with desktop optimization | Tailwind v4 mobile-first utilities. Side nav (desktop) + bottom tab bar (mobile) pattern via shadcn/ui Sidebar. |
| INFR-04 | Cyberpunk/glitch visual identity -- flat black & white, futuristic, sleek, dramatic typography | Tailwind v4 @theme for design tokens. CSS clip-path + pseudo-elements for glitch effects. JetBrains Mono font. |
| INFR-05 | Framer Motion page transitions and UI animations throughout | Motion 12.x (the `motion` npm package). Use scroll-triggered animations (whileInView, useScroll) rather than full page transitions. FrozenRouter needed if exit animations required. |
| INFR-06 | Embla Carousel components for mobile-friendly content browsing | embla-carousel-react 8.6.0 + embla-carousel-autoplay 8.6.0. Plugin system for parallax. |
| BOOK-01 | Service pages with clear pricing for studio sessions, mixing/mastering, video production, SFX, graphic design | Single tabbed page (D-14). Data from services table in Neon Postgres via Drizzle. |
| BOOK-05 | Contact form with name, email, service interest, message routing to admin inbox | Server Action form submission. Store in contact_submissions table. Email delivery deferred to Phase 4. |
| BOOK-06 | Testimonials section with admin-managed client quotes | Seed data in testimonials table. Embla carousel on homepage. Admin CRUD in Phase 4. |
| PORT-01 | Video portfolio grid with embedded playback, categorized by type | YouTube embeds with lazy loading (thumbnail placeholder, load iframe on click). Embla carousel navigation (D-15). |
| PORT-02 | Audio portfolio/credits section for finished work and placements | Database-driven credits list. Audio playback placeholder for Phase 2 player. |
| PORT-03 | Artist/producer profile pages with bio, photo, role, credits, social links | Dynamic route `/artists/[slug]`. Data from team_members table. |
| PORT-04 | Video showreel hero on homepage (auto-playing muted, 30-60s) | HTML5 video element with autoPlay, muted, loop, playsInline attributes. R2-hosted or YouTube embed. |
| PORT-05 | Case study pages with client, challenge, approach, result, media embeds | Dynamic route `/portfolio/[slug]`. Rich content from database. |
| CONT-01 | Blog/news section with rich-text posts, pagination, categories | Database-driven blog (D-17). Seed sample content. Pagination via offset/limit. Categories as enum or tags table. |
| CONT-02 | Newsletter signup form with email capture | Form on homepage + footer. Store in newsletter_subscribers table. Double opt-in deferred to Phase 4. |
| CONT-03 | SEO fundamentals -- metadata, Open Graph, structured data, sitemap | Next.js Metadata API (generateMetadata). next-sitemap or built-in sitemap.ts. JSON-LD structured data. |
| AUTH-01 | Client account registration and login | Better Auth email/password. Registration form, login form, auth route group with centered layout. |
| AUTH-02 | Admin account with role-based access (admin vs client) | Better Auth admin plugin. Role field on user table. Layout-level role checks. Seed admin user. |
| AUTH-05 | Session persistence across browser refresh | Better Auth session management with database-backed sessions via Drizzle adapter. Cookies persist across refresh. |
</phase_requirements>

## Standard Stack

### Core (Phase 1 Specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | Full-stack React framework | Locked in. App Router, Turbopack dev, native Vercel deployment. |
| React | 19.2.4 | UI library | Required by Next.js 16. |
| Tailwind CSS | 4.2.2 | Utility-first CSS | Locked in. CSS-first config via @theme directive. No tailwind.config.js needed. |
| @tailwindcss/postcss | 4.2.2 | PostCSS plugin for Tailwind v4 | Required for Next.js integration with Tailwind v4. |
| motion | 12.38.0 | Animation library (formerly Framer Motion) | The `motion` npm package is the current name. Import from `motion/react`. API identical to framer-motion. |
| embla-carousel-react | 8.6.0 | Carousel component | Locked in. Lightweight, excellent swipe precision. |
| embla-carousel-autoplay | 8.6.0 | Autoplay plugin for Embla | Autoplay for homepage carousels. |
| better-auth | 1.5.6 | Authentication & authorization | Self-hosted, TypeScript-first, admin plugin for RBAC, Drizzle adapter built-in. |
| drizzle-orm | 0.45.1 | Database ORM | Lighter than Prisma, SQL-like syntax, first-class Neon support. |
| drizzle-kit | 0.31.10 | Migrations & schema management | CLI companion for Drizzle. `drizzle-kit push` for dev, `drizzle-kit generate` for production. |
| @neondatabase/serverless | 1.0.2 | Neon Postgres driver | Serverless HTTP driver for Neon. No persistent connections needed. |
| shadcn/ui | latest (copied) | UI component library | Radix primitives + Tailwind. Sidebar component for collapsible nav. Tabs, Form, Dialog, Card. |
| lucide-react | 1.6.0 | Icons | Default icon set for shadcn/ui. Tree-shakable. |
| zod | 4.3.6 | Schema validation | Validate form inputs, Server Action payloads, env vars. |
| sonner | 2.0.7 | Toast notifications | Default toast for shadcn/ui. Form submission feedback. |
| sharp | 0.34.5 | Image processing | Required by Next.js Image on Vercel for custom processing. |

### Media Storage (Cloudflare R2)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @aws-sdk/client-s3 | 3.1016.0 | S3-compatible API client | R2 is S3-compatible. AWS SDK is the standard way to interact with R2. |
| @aws-sdk/s3-request-presigner | 3.1016.0 | Presigned URL generation | Generate temporary upload/download URLs for R2 objects. |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| TypeScript | 5.x | Type safety (bundled with create-next-app) |
| ESLint | 9.x | Linting (flat config, bundled with create-next-app) |
| Prettier | 3.x | Code formatting |
| prettier-plugin-tailwindcss | latest | Tailwind class sorting |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cloudflare R2 | Uploadthing | Uploadthing is simpler (2GB free tier) but R2 is locked decision from CONTEXT.md. R2 has no egress fees, unlimited storage on paid tier. |
| Cloudflare R2 | Vercel Blob | Vercel Blob is simpler but more expensive at scale. R2 is the user's choice. |
| motion (Framer Motion) | CSS animations only | CSS is simpler but cannot do scroll-linked parallax, spring physics, or AnimatePresence exit animations. |
| shadcn/ui Sidebar | Custom sidebar | shadcn/ui Sidebar has collapsible icon mode built in, mobile sheet fallback, cookie-persisted state. No reason to build custom. |

### Installation

```bash
# Initialize Next.js project
npx create-next-app@latest glitch-studios --typescript --tailwind --eslint --app --src-dir --turbopack

# Database & ORM
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Authentication
npm install better-auth

# UI Components (shadcn/ui -- init then add components)
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label select sidebar tabs toast sheet separator avatar dropdown-menu

# Animation & Carousel
npm install motion embla-carousel-react embla-carousel-autoplay

# Media storage (Cloudflare R2 via S3 SDK)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Supporting
npm install zod sonner sharp

# Dev tools
npm install -D prettier prettier-plugin-tailwindcss
```

**Version verification:** All versions confirmed against npm registry on 2026-03-25.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (public)/              # Public-facing pages (no auth required)
│   │   ├── layout.tsx         # Side nav (desktop) + bottom tab bar (mobile) + footer
│   │   ├── page.tsx           # Homepage: hero, services, beats carousel, portfolio, testimonials
│   │   ├── services/
│   │   │   └── page.tsx       # Tabbed services page
│   │   ├── portfolio/
│   │   │   ├── page.tsx       # Embla carousel portfolio browser
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Case study / project detail
│   │   ├── artists/
│   │   │   ├── page.tsx       # Team grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Individual artist profile
│   │   ├── blog/
│   │   │   ├── page.tsx       # Blog index with pagination
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Individual blog post
│   │   └── contact/
│   │       └── page.tsx       # Contact form
│   │
│   ├── (auth)/                # Auth pages (centered layout, no nav)
│   │   ├── layout.tsx         # Minimal centered layout
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts   # Better Auth catch-all route
│   │   └── upload/
│   │       └── route.ts       # R2 presigned URL generation
│   │
│   ├── layout.tsx             # Root layout: html, body, providers, audio player placeholder
│   ├── not-found.tsx          # Custom 404
│   └── sitemap.ts             # Dynamic sitemap generation
│
├── components/
│   ├── ui/                    # shadcn/ui primitives (auto-generated)
│   ├── layout/
│   │   ├── side-nav.tsx       # Collapsible side navigation (desktop)
│   │   ├── bottom-tab-bar.tsx # Fixed bottom tab bar (mobile)
│   │   ├── footer.tsx         # Site footer with newsletter signup
│   │   ├── glitch-logo.tsx    # CSS/SVG animated GLITCH logo
│   │   └── audio-player-placeholder.tsx  # Placeholder for Phase 2
│   ├── home/
│   │   ├── hero-section.tsx   # Video showreel hero with CTAs
│   │   ├── services-overview.tsx
│   │   ├── featured-carousel.tsx  # Embla carousel for beats/portfolio
│   │   └── testimonials-carousel.tsx
│   ├── portfolio/
│   │   ├── video-card.tsx     # YouTube embed with lazy-load placeholder
│   │   ├── portfolio-carousel.tsx
│   │   └── case-study-content.tsx
│   ├── blog/
│   │   ├── post-card.tsx
│   │   └── post-content.tsx
│   └── forms/
│       ├── contact-form.tsx
│       └── newsletter-form.tsx
│
├── lib/
│   ├── db.ts                  # Drizzle client singleton (Neon serverless)
│   ├── auth.ts                # Better Auth server configuration
│   ├── auth-client.ts         # Better Auth client instance
│   ├── r2.ts                  # Cloudflare R2 S3 client + helpers
│   └── utils.ts               # Shared utilities (cn, slugify, etc.)
│
├── db/
│   ├── schema.ts              # Drizzle schema (all tables)
│   ├── relations.ts           # Drizzle relation definitions
│   ├── seed.ts                # Seed data for development
│   └── migrations/            # Generated SQL migrations
│
├── actions/
│   ├── contact.ts             # Contact form submission
│   ├── newsletter.ts          # Newsletter signup
│   └── auth.ts                # Auth-related server actions (if needed beyond Better Auth)
│
├── styles/
│   └── globals.css            # Tailwind @import + @theme + glitch keyframes
│
└── types/
    └── index.ts               # Shared TypeScript types
```

### Pattern 1: Tailwind v4 CSS-First Theme System

**What:** Define all design tokens (colors, fonts, spacing) in CSS using Tailwind v4's `@theme` directive instead of a JavaScript config file. Every token automatically becomes a utility class.

**When to use:** All styling in this project.

**Example:**
```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  /* Colors -- flat B&W + off-white + glow */
  --color-black: #000000;
  --color-white: #f5f5f0;        /* off-white, not pure #fff */
  --color-pure-white: #ffffff;
  --color-gray-100: #e5e5e0;
  --color-gray-200: #cccccc;
  --color-gray-400: #888888;
  --color-gray-600: #555555;
  --color-gray-800: #222222;
  --color-gray-900: #111111;
  --color-glow: rgba(255, 255, 255, 0.15);

  /* Typography */
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  /* Spacing scale additions */
  --spacing-nav-collapsed: 4rem;     /* 64px icon-only sidebar */
  --spacing-nav-expanded: 16rem;     /* 256px full sidebar */
  --spacing-tab-bar: 4rem;           /* 64px bottom tab bar */
  --spacing-player: 4.5rem;          /* 72px audio player bar */
}
```

### Pattern 2: Collapsible Side Nav + Bottom Tab Bar

**What:** Desktop uses shadcn/ui Sidebar component in "icon" collapsible mode. Mobile uses a fixed bottom tab bar. Both render from the `(public)` layout.

**When to use:** All public pages.

**Example:**
```typescript
// src/app/(public)/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SideNav } from "@/components/layout/side-nav"
import { BottomTabBar } from "@/components/layout/bottom-tab-bar"
import { Footer } from "@/components/layout/footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Desktop side nav -- hidden on mobile */}
      <SideNav />
      <main className="flex-1 min-h-screen pb-16 md:pb-0">
        <SidebarTrigger className="hidden md:block fixed top-4 left-4 z-50" />
        {children}
        <Footer />
      </main>
      {/* Mobile bottom tab bar -- hidden on desktop */}
      <BottomTabBar />
    </SidebarProvider>
  )
}
```

### Pattern 3: Root Layout with Future-Proof Slots

**What:** Root layout establishes providers and persistent UI elements (audio player placeholder) that survive all route group transitions. Keep it minimal.

**When to use:** Root `app/layout.tsx` only.

**Example:**
```typescript
// src/app/layout.tsx
import "@/styles/globals.css"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: { default: "Glitch Studios", template: "%s | Glitch Studios" },
  description: "Music and video production studio",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-black text-white font-sans antialiased">
        {children}
        {/* Phase 2: AudioPlayerBar will mount here */}
        <div id="audio-player-root" />
      </body>
    </html>
  )
}
```

### Pattern 4: Server Components by Default, Client Islands for Interaction

**What:** All pages are Server Components. Interactive elements (carousels, forms, animations, navigation state) are extracted into Client Component islands marked with `"use client"`.

**When to use:** Every page and component decision.

**Key principle:** Fetch data in Server Components, pass to Client Components as props. Never fetch data in Client Components unless it needs to be real-time.

### Pattern 5: Better Auth with Admin Plugin

**What:** Better Auth handles registration, login, session persistence. Admin plugin adds role field to user table with `admin` and `user` roles. Layout-level checks gate admin routes.

**Example:**
```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { db } from "./db"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
    }),
  ],
})
```

```typescript
// src/lib/auth-client.ts
"use client"
import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [adminClient()],
})
```

### Pattern 6: Drizzle Schema for Phase 1 Tables

**What:** Define all Phase 1 database tables in a single schema file. Use `drizzle-kit push` during development, `drizzle-kit generate` for production migrations.

**Tables needed for Phase 1:**
- `users` + `sessions` + `accounts` + `verifications` (Better Auth managed)
- `services` (studio sessions, mixing, video, SFX, design)
- `team_members` (artist/producer profiles)
- `portfolio_items` (video portfolio + case studies)
- `blog_posts` (blog content)
- `blog_categories` (blog categorization)
- `testimonials` (client quotes)
- `contact_submissions` (contact form entries)
- `newsletter_subscribers` (email capture)

### Pattern 7: CSS Glitch Logo Animation

**What:** Recreate GLITCH text logo using CSS pseudo-elements with `clip-path` animations and slight color channel offsets. The technique uses `::before` and `::after` pseudo-elements with `data-text` attribute to create layered text that clips and shifts.

**When to use:** Logo component only.

**Technique:** Two pseudo-element layers of the same text, each with `clip-path: inset()` keyframe animations that rapidly change which portion of text is visible, combined with slight `transform: translate()` offsets to create the RGB-split / scan-line glitch appearance. On load: dramatic (fast clip changes, larger offsets). Then settle to continuous subtle (slow, small offsets).

### Pattern 8: Framer Motion Scroll Animations (NOT Page Transitions)

**What:** Use Motion's `whileInView` prop and `useScroll` hook for scroll-triggered animations on homepage sections. Avoid full page exit/enter transitions -- they require the FrozenRouter hack and are fragile in App Router.

**When to use:** Homepage section reveals, portfolio items, any scroll-into-view content.

**Example:**
```typescript
"use client"
import { motion, useScroll, useTransform } from "motion/react"

function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.section>
  )
}
```

### Anti-Patterns to Avoid

- **Do NOT use full page transitions with AnimatePresence in App Router.** The FrozenRouter workaround exists but is fragile and may break on Next.js updates. Use scroll-in animations and component-level animations instead.
- **Do NOT put animation logic in Server Components.** All Motion components must be in `"use client"` files. Extract animated wrappers as thin Client Component shells around Server Component content.
- **Do NOT use `tailwind.config.js` with Tailwind v4.** Use the CSS-first `@theme` directive in `globals.css`. The JavaScript config is the v3 approach.
- **Do NOT embed YouTube iframes eagerly on portfolio pages.** Use thumbnail placeholders and load the iframe on click. Each iframe is a full browser context that destroys scroll performance.
- **Do NOT store media files in `public/` directory.** Use Cloudflare R2 for all images, audio, and video. The `public/` directory bloats deployments and cannot be access-controlled.
- **Do NOT use `framer-motion` package name.** Use `motion` (the current package name). Import from `motion/react`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible sidebar navigation | Custom sidebar with useState | shadcn/ui Sidebar component | Handles collapse animation, cookie-persisted state, mobile sheet fallback, keyboard shortcuts, accessibility |
| Form validation | Manual regex checks | zod schemas + shadcn/ui Form (react-hook-form) | Type-safe, composable, server/client shared validation, integrated error display |
| Authentication | Custom JWT/bcrypt auth | Better Auth | Session management, CSRF protection, token rotation, password reset, role management -- all solved |
| Database migrations | Manual SQL files | drizzle-kit | Generates migrations from schema diff, handles rollbacks, tracks migration state |
| Toast notifications | Custom notification system | sonner (via shadcn/ui) | Stacking, auto-dismiss, accessible, themed, works with Server Actions |
| Image optimization | Manual resize/compress | Next.js Image component | Automatic WebP/AVIF, responsive sizing, lazy loading, Vercel CDN caching |
| Presigned URLs for R2 | Custom signing logic | @aws-sdk/s3-request-presigner | Handles URL signing, expiration, S3 compatibility layer |
| SEO metadata | Manual meta tags | Next.js Metadata API (generateMetadata) | Type-safe, handles Open Graph, Twitter cards, structured data, per-page overrides |
| Sitemap | Manual XML generation | Next.js sitemap.ts convention | Auto-generates from route structure, supports dynamic routes |

**Key insight:** This phase establishes patterns that every future phase builds on. Using standard solutions now prevents lock-in to custom implementations that break under Phase 2-4 complexity.

## Common Pitfalls

### Pitfall 1: Architecture Not Accounting for Persistent Audio Player

**What goes wrong:** Root layout and public layout are built without reserving space for the persistent audio player. When Phase 2 adds the player, it overlaps content, breaks scroll positions, or requires layout rewrites.

**Why it happens:** The audio player is a Phase 2 feature, so Phase 1 ignores it. But it lives in the root layout and affects every page's padding/margin calculations.

**How to avoid:** Reserve a `div#audio-player-root` in the root layout. Add `pb-[var(--spacing-player)]` to the main content area. The player mounts into this slot in Phase 2 without layout changes. On mobile, the bottom tab bar and player share the bottom space -- plan the stacking now.

**Warning signs:** No reserved space for the player in root layout. No CSS custom property for player height. Main content extends to the bottom of the viewport with no padding.

### Pitfall 2: Framer Motion Page Transitions Breaking on Navigation

**What goes wrong:** AnimatePresence exit animations cause the old page to flash or jump because Next.js App Router unmounts components before the animation completes.

**Why it happens:** App Router updates the layout router context during navigation, causing component remounting that interrupts Framer Motion's animation lifecycle.

**How to avoid:** Use `whileInView` scroll animations and component-level `animate`/`exit` on modals and overlays. Do NOT attempt full-page exit/enter transitions. If absolutely needed, use the FrozenRouter pattern with `useSelectedLayoutSegment` as the motion key, but understand this may break on Next.js updates.

**Warning signs:** Pages flash white on navigation. Exit animations don't play. Content jumps when navigating between routes.

### Pitfall 3: Tailwind v4 Config Confusion

**What goes wrong:** Developer creates a `tailwind.config.js` file (v3 pattern) and custom theme values don't work. Or uses `@apply` with custom classes that aren't defined in `@theme`.

**Why it happens:** Most tutorials and AI training data still reference Tailwind v3 patterns. v4 is CSS-first with no JavaScript config.

**How to avoid:** All customization goes in `globals.css` inside `@theme { }` blocks. Custom colors, fonts, spacing -- everything is CSS custom properties. The `@tailwindcss/postcss` plugin handles the rest.

**Warning signs:** A `tailwind.config.js` file exists in the project root. Custom utility classes not resolving. Theme values not applying.

### Pitfall 4: Better Auth Schema Mismatch with Drizzle

**What goes wrong:** Better Auth expects specific table names and columns. If the Drizzle schema defines tables with different names (e.g., `users` instead of `user`), auth operations fail silently or throw cryptic errors.

**Why it happens:** Better Auth uses `user`, `session`, `account`, `verification` as default table names. Drizzle schemas often use plural names.

**How to avoid:** Either (a) use Better Auth's CLI to generate the schema: `npx auth@latest generate`, then integrate into your Drizzle schema, or (b) pass a schema mapping to the Drizzle adapter with `usePlural: true` or explicit table name mapping.

**Warning signs:** Auth API returns 500 errors. Registration silently fails. Session not persisting. "Table not found" errors in Neon logs.

### Pitfall 5: YouTube Embeds Destroying Portfolio Page Performance

**What goes wrong:** Portfolio page loads 10+ YouTube iframes eagerly. Each iframe loads the YouTube player JavaScript (~1MB), creating massive page weight, blocking the main thread, and destroying scroll performance.

**Why it happens:** Using `<iframe src="...">` directly for every portfolio item.

**How to avoid:** Show a static thumbnail image for each video. On click, replace the thumbnail with the actual YouTube iframe. Libraries like `react-lite-youtube-embed` or a simple custom component handle this pattern. This is called "facade" pattern.

**Warning signs:** Portfolio page takes 5+ seconds to load. Scroll jank on portfolio page. Network tab shows 10+ YouTube player.js loads.

### Pitfall 6: Contact Form Without Spam Protection

**What goes wrong:** Contact form goes live, bots find it within days, admin inbox fills with spam submissions.

**Why it happens:** No rate limiting, no honeypot field, no CAPTCHA.

**How to avoid:** At minimum, add a honeypot field (hidden input that humans don't fill but bots do -- reject submissions where it's filled). Rate limit by IP (1 submission per minute). For production, add Cloudflare Turnstile (free, privacy-friendly CAPTCHA alternative).

**Warning signs:** No hidden honeypot field on the form. No rate limiting on the server action. Form submits on every click without debouncing.

## Code Examples

### Cloudflare R2 Client Setup

```typescript
// src/lib/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(r2, command, { expiresIn: 3600 })
}

export async function getDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  })
  return getSignedUrl(r2, command, { expiresIn: 3600 })
}
```

### Drizzle + Neon Singleton

```typescript
// src/lib/db.ts
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

### Better Auth API Route

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { POST, GET } = toNextJsHandler(auth)
```

### Server Action with Zod Validation

```typescript
// src/actions/contact.ts
"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { contactSubmissions } from "@/db/schema"

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  service: z.string().optional(),
  message: z.string().min(10).max(2000),
  honeypot: z.string().max(0), // must be empty
})

export async function submitContactForm(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    service: formData.get("service"),
    message: formData.get("message"),
    honeypot: formData.get("website"), // honeypot field
  })

  if (!parsed.success) {
    return { error: "Invalid form data" }
  }

  if (parsed.data.honeypot) {
    // Bot detected -- silently succeed (don't reveal honeypot)
    return { success: true }
  }

  await db.insert(contactSubmissions).values({
    name: parsed.data.name,
    email: parsed.data.email,
    serviceInterest: parsed.data.service ?? null,
    message: parsed.data.message,
  })

  return { success: true }
}
```

### Lazy YouTube Embed Component

```typescript
"use client"
import { useState } from "react"
import Image from "next/image"

export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-lg"
      />
    )
  }

  return (
    <button
      onClick={() => setLoaded(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-lg bg-gray-900"
    >
      <Image
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title}
        fill
        className="object-cover transition-transform group-hover:scale-105"
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
          <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package (import from `motion/react`) | Late 2024 | Same API, new package name. New projects use `motion`. |
| `tailwind.config.js` (JavaScript config) | `@theme {}` in CSS (CSS-first config) | Tailwind v4.0, Jan 2025 | No config file needed. Design tokens are CSS custom properties. |
| Auth.js / NextAuth v5 | Better Auth | Sept 2025 (Auth.js team joined) | Better Auth is the active project. Auth.js gets security patches only. |
| Prisma ORM | Drizzle ORM (for serverless) | 2024-2025 shift | Drizzle is lighter, no codegen, faster cold starts on Vercel serverless. |
| Vercel Blob / Uploadthing | Cloudflare R2 (for this project) | User decision | R2 has zero egress fees, S3-compatible API, more cost-effective at scale. |
| `npx shadcn-ui@latest` | `npx shadcn@latest` | 2025 | Package name changed. Old name still works but new name is canonical. |

**Deprecated/outdated:**
- `framer-motion` package name: Use `motion` instead. Same library, rebranded.
- `tailwind.config.js`: Do not create this file for Tailwind v4 projects.
- Auth.js v5 / NextAuth: No new features. Use Better Auth for new projects.
- `@shadcn/ui` or `shadcn-ui`: Use `shadcn` (the latest CLI package name).

## Open Questions

1. **Hero video source for Phase 1**
   - What we know: D-04 specifies video showreel hero, auto-playing muted. D-20 says R2 for media hosting.
   - What's unclear: Does the owner have a showreel video ready, or do we use a placeholder? If using a real video, it needs to be uploaded to R2 before the homepage can be built.
   - Recommendation: Use a placeholder (dark gradient with subtle animation) for Phase 1 development. Replace with real video when available. The component should accept either a video URL or a fallback mode.

2. **GLITCH logo recreation fidelity**
   - What we know: Must be CSS/SVG, must match the fragmented/distorted style from Capture.PNG. Animates on load then settles.
   - What's unclear: The reference image is small and low quality. Exact letterforms are hard to discern.
   - Recommendation: Use JetBrains Mono bold as the base font for "GLITCH" text. Apply CSS clip-path glitch animation. The distortion style in the reference shows horizontal slice offsets -- achievable with `clip-path: inset()` keyframes on pseudo-elements.

3. **Neon Postgres provisioning for development**
   - What we know: Neon free tier covers dev. Need a database URL.
   - What's unclear: Whether the owner has a Neon account already.
   - Recommendation: Include Neon account creation and database provisioning as the first task. Document the env vars needed: `DATABASE_URL`.

4. **Cloudflare R2 bucket setup**
   - What we know: R2 is the media hosting choice. Needs bucket, API keys, CORS configuration.
   - What's unclear: Whether the owner has a Cloudflare account with R2 enabled.
   - Recommendation: Include R2 bucket creation as an early task. Document env vars: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`. Configure CORS for the development domain.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Everything | Yes | 24.14.1 | -- |
| npm | Package management | Yes | 11.11.0 | -- |
| Git | Version control | Yes | 2.53.0 | -- |
| Caddy | INFR-01 (local dev) | **No** | -- | Use Next.js dev server directly (`next dev --turbopack`). Install Caddy later when HTTPS local dev is needed. |
| Neon Postgres | Database | External service | -- | Must create account and provision database. Free tier available. |
| Cloudflare R2 | Media storage (D-20) | External service | -- | Must create account and configure bucket. Free tier: 10GB storage, 10M reads/month. |
| Vercel | Deployment (INFR-02) | External service | -- | Must connect GitHub repo. Free tier available. |

**Missing dependencies with no fallback:**
- Neon Postgres account (blocks database features)
- Cloudflare R2 bucket (blocks media upload features)

**Missing dependencies with fallback:**
- Caddy (not installed) -- fallback: use `next dev --turbopack` directly on localhost:3000. Caddy adds HTTPS local dev but is not blocking. Can install later via `scoop install caddy` or direct download.

## Project Constraints (from CLAUDE.md)

CLAUDE.md describes this as a personal workspace for Trap Snyder (Josh), not a software project in itself. The `website/` subdirectory is the Glitch Studios project. Key constraints:
- Owner communication style: direct, wants fast results, not deeply technical
- Never touch Waves software (not relevant to this phase)
- The `SENSITIVE/` folder contains plaintext passwords -- never output contents
- Owner uses FL Studio, Pro Tools, Premiere Pro, Streamlabs -- context for understanding the studio services offered

## Sources

### Primary (HIGH confidence)
- [Better Auth Drizzle Adapter docs](https://better-auth.com/docs/adapters/drizzle) -- adapter setup, schema generation, table mapping
- [Better Auth Installation docs](https://better-auth.com/docs/installation) -- server/client setup, Next.js handler, env vars
- [Better Auth Admin Plugin docs](https://better-auth.com/docs/plugins/admin) -- RBAC roles, user management APIs, schema additions
- [Cloudflare R2 Presigned URLs docs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) -- S3 compatibility, signing approach
- [shadcn/ui Sidebar component](https://ui.shadcn.com/docs/components/radix/sidebar) -- collapsible sidebar, icon mode, mobile sheet
- [Tailwind CSS v4 release](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, @theme directive
- [Next.js 16 installation docs](https://nextjs.org/docs/app/getting-started/installation) -- create-next-app, Tailwind v4 support
- npm registry version checks (2026-03-25) -- all package versions verified

### Secondary (MEDIUM confidence)
- [Framer Motion App Router page transitions solution](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router) -- FrozenRouter technique, confirmed working with Next.js 16.0.7 and motion 11.2.10
- [CSS-Tricks glitch effect on text/images/SVG](https://css-tricks.com/glitch-effect-text-images-svg/) -- clip-path pseudo-element technique
- [Cloudflare R2 + Next.js integration guide (March 2026)](https://athiyagu6.medium.com/how-to-set-up-cloudflare-r2-and-connect-it-with-next-js-for-image-document-uploads-df1013ed56aa) -- presigned URL upload flow
- [Motion (formerly Framer Motion) complete guide 2026](https://inhaq.com/blog/framer-motion-complete-guide-react-nextjs-developers) -- motion package, React import path

### Tertiary (LOW confidence)
- None -- all claims verified with official documentation or multiple sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry, official docs consulted for integration patterns
- Architecture: HIGH -- patterns derived from official Next.js, shadcn/ui, and Better Auth documentation. Architecture research already completed at project level.
- Pitfalls: HIGH -- pitfalls from project-level research plus phase-specific issues (Framer Motion App Router, Tailwind v4 config) verified with official sources
- Design implementation: MEDIUM -- CSS glitch effect technique is well-documented but recreating the specific GLITCH logo requires iterative visual work

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable technologies, 30-day validity)
