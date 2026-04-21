# Stack Research

**Domain:** Music/video production studio website with e-commerce, booking, and client accounts
**Researched:** 2026-03-25
**Confidence:** HIGH

## Recommended Stack

### Core Technologies (Locked In)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.x | Full-stack React framework | User-selected. App Router is stable, Turbopack dev is fast, native Vercel deployment. Current stable is 16.2.1. |
| Tailwind CSS | 4.2.x | Utility-first CSS | User-selected. v4 is CSS-first config (no tailwind.config.js needed), 5x faster builds, zero-config setup. |
| Embla Carousel | 8.6.0 | Carousel/slider component | User-selected. Lightweight (~3kb gzip), excellent swipe precision, extensible via plugins. Use `embla-carousel-react` wrapper. |
| Vercel | -- | Hosting/deployment | User-selected. Native Next.js integration, edge functions, preview deployments, image optimization CDN. |
| Caddy | latest | Local dev reverse proxy | User-selected. Automatic HTTPS for local dev, simple Caddyfile config. |
| Stripe | latest SDK | Primary payment processing | User-selected. Use Stripe Payment Element with Embedded Checkout for PCI compliance. Supports cards, Apple Pay, Google Pay. |
| PayPal | latest SDK | Secondary payment option | User-selected. Integrate via Stripe Payment Element (Stripe supports PayPal as a payment method) OR use @paypal/react-paypal-js as standalone fallback. |

### Database & ORM

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Neon Postgres | -- (managed) | Primary database | Serverless Postgres with Vercel-native integration. Free tier covers dev/MVP. Instant branching for preview deployments. Vercel's own Postgres is powered by Neon. Auto-scales to zero when idle. |
| Drizzle ORM | 0.45.x | Database ORM & query builder | Lighter than Prisma (~7.4kb gzip), no code generation step, SQL-like syntax, first-class Neon support, faster cold starts on serverless. Schema-in-TypeScript means no separate schema language. |
| drizzle-kit | 0.30.x | Migrations & schema management | Companion CLI for Drizzle. Generates SQL migrations from schema changes. `drizzle-kit push` for rapid prototyping, `drizzle-kit generate` for production migrations. |

### Authentication

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Better Auth | latest | Authentication & authorization | Auth.js team joined Better Auth in Sept 2025, making it the recommended path forward. TypeScript-first, plugin architecture, built-in RBAC (roles/permissions for admin vs client), email/password + social login, session management. Has Drizzle adapter. Free, self-hosted, MIT license. |

### Email

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Resend | latest SDK | Transactional & marketing email delivery | Developer-first email API. Works natively with Next.js Server Actions. Webhook support for delivery tracking. Free tier: 100 emails/day (enough for dev, cheap to scale). |
| React Email | 5.2.x | Email template authoring | Build email templates as React components with TypeScript. Same mental model as building UI. Dark mode support, responsive by default. Made by the Resend team. |

### UI Components

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| shadcn/ui | latest (not versioned -- copies components into project) | UI component library | Not a dependency -- components are copied into your codebase as local TypeScript files. Built on Radix UI primitives + Tailwind. Includes Sidebar, Command (Cmd+K search), Dialog, Table, Form components needed for admin dashboard. Fully customizable since you own the code. |
| Radix UI | (via shadcn/ui) | Accessible primitives | Headless, accessible, composable. shadcn/ui wraps these. No need to install separately. |
| Lucide React | latest | Icons | Default icon set for shadcn/ui. Consistent, tree-shakable, 1400+ icons. |
| Recharts | 2.x | Dashboard charts | Composable chart components for admin analytics (booking trends, revenue). Works with shadcn/ui's chart wrappers. |

### Booking & Calendar

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Custom booking system | -- | Service scheduling | Build custom rather than embedding Cal.com. Reasons: (1) Cal.com embed styling clashes with cyberpunk aesthetic, (2) you need tight integration with your own auth/payment/notification system, (3) Cal.com free tier is limited for commercial use. Use a date picker from shadcn/ui + custom availability logic backed by Neon. |

### Media & Content

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Uploadthing | latest | File uploads (beat files, images) | Built for Next.js. Handles large file uploads with presigned URLs. Free tier: 2GB. Simple API. Better than rolling your own S3 integration. |
| Next.js Image | (built-in) | Image optimization | Built into Next.js. Automatic WebP/AVIF, lazy loading, responsive sizing. Vercel CDN handles caching. |
| HTML5 Audio API | (native) | Beat preview player | Custom audio player component with waveform visualization. No heavy library needed for basic play/pause/seek. |
| WaveSurfer.js | 7.x | Audio waveform visualization | Lightweight waveform renderer for beat previews. Provides the visual feedback producers/clients expect when browsing beats. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 3.x | Schema validation | Validate all form inputs, API payloads, env vars. Used by Better Auth, shadcn/ui forms, and Server Actions. |
| nuqs | latest | URL query state | Type-safe search params for beat catalog filters, booking date selection. Replaces manual useSearchParams. |
| date-fns | 4.x | Date manipulation | Lightweight date utility for booking calendar logic. Tree-shakable (only import what you use). |
| @tanstack/react-table | 8.x | Data tables | Admin dashboard tables (bookings, clients, orders). Headless -- style with shadcn/ui Table component. |
| sonner | latest | Toast notifications | Notification toasts for booking confirmations, payment status. Default toast for shadcn/ui. |
| sharp | latest | Image processing | Server-side image optimization. Required by Next.js Image on Vercel for custom processing. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript | 5.x | Type safety across entire stack | Non-negotiable for a project this size. Drizzle, Better Auth, and shadcn/ui all assume TypeScript. |
| ESLint | 9.x (flat config) | Code linting | Next.js 16 includes eslint config. Use flat config format. |
| Prettier | 3.x | Code formatting | Pair with prettier-plugin-tailwindcss for automatic class sorting. |
| prettier-plugin-tailwindcss | latest | Tailwind class sorting | Auto-sorts Tailwind classes in consistent order. Eliminates style debates. |

## Installation

```bash
# Initialize Next.js project
npx create-next-app@latest glitch-studios --typescript --tailwind --eslint --app --src-dir

# Database & ORM
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Authentication
npm install better-auth

# Payments
npm install stripe @stripe/react-stripe-js @stripe/stripe-js
npm install @paypal/react-paypal-js

# UI Components (shadcn/ui -- init then add components)
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label select sidebar table tabs toast command

# Email
npm install resend @react-email/components
npm install -D react-email

# Media
npm install uploadthing @uploadthing/react
npm install wavesurfer.js

# Carousel (locked in)
npm install embla-carousel-react embla-carousel-autoplay

# Supporting
npm install zod nuqs date-fns @tanstack/react-table sonner
npm install sharp

# Dev tools
npm install -D prettier prettier-plugin-tailwindcss
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Neon Postgres | Supabase | If you want auth + DB + storage + realtime in one platform. Supabase is a "platform" while Neon is "just a database." We chose Neon because we want Better Auth (not Supabase Auth) and want tighter Vercel integration. |
| Neon Postgres | PlanetScale | If you need MySQL or YouTube-scale sharding. Overkill for this project. |
| Drizzle ORM | Prisma | If your team prefers a schema-first DSL over TypeScript-defined schemas, or you need MongoDB support. Prisma's code generation step and larger bundle size are downsides on Vercel serverless. |
| Better Auth | Clerk | If you want zero auth code (fully managed). Clerk is excellent but costs money at scale ($0.02/MAU after 10K) and you don't own the auth data. For a studio site with client accounts, self-hosted auth gives full control. |
| Better Auth | Auth.js v5 | Auth.js team joined Better Auth. Auth.js gets security patches but no new features. Better Auth is the active project going forward. |
| Resend + React Email | SendGrid | If you need 100 emails/day free (SendGrid gives that too). SendGrid's API is older, templates are HTML-string based. Resend + React Email is a much better DX for a Next.js project. |
| Resend + React Email | Postmark | If email deliverability is critical above all else. Postmark has best-in-class deliverability. Consider if booking confirmation emails must never hit spam. |
| Custom booking | Cal.com embed | If you want booking done in days not weeks. Cal.com embed works but styling it to match a cyberpunk aesthetic is painful, and the free tier is limited. |
| Uploadthing | AWS S3 + presigned URLs | If you need unlimited storage or complex CDN rules. S3 is more work to set up. Uploadthing abstracts it all away for the common case. |
| WaveSurfer.js | Peaks.js (BBC) | If you need server-side waveform pre-computation for very large audio files. WaveSurfer.js is simpler for beat preview use case. |
| nuqs | Manual useSearchParams | If you have trivial URL state. nuqs adds type safety and serialization which matters for a beat catalog with multiple filters. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| NextAuth.js / Auth.js v4 | Legacy. v5 is beta-forever and the team moved to Better Auth. | Better Auth |
| Tailwind CSS v3 | v4 is stable, faster, and requires less config. No reason to use v3 for a new project. | Tailwind CSS v4 |
| Next.js Pages Router | Legacy routing model. App Router is stable and is the only path forward. | App Router |
| Mongoose / MongoDB | Wrong tool for relational data (bookings, orders, users, licenses). SQL is the right choice here. | Neon Postgres + Drizzle |
| Material UI / Chakra UI | Heavy runtime CSS-in-JS. Conflicts with Tailwind utility approach. Large bundle sizes. | shadcn/ui (Radix + Tailwind) |
| Swiper.js | Heavier than Embla, more opinionated styling. Embla is already decided. | Embla Carousel |
| Nodemailer (direct) | Low-level SMTP. You'd need to manage delivery, bounces, reputation yourself. | Resend (managed API) |
| Firebase | Vendor lock-in, NoSQL limitations for relational data, Google ecosystem dependency. | Neon + Better Auth + Uploadthing |
| Moment.js | Deprecated, massive bundle size. | date-fns |
| Redux / Zustand | Overkill for this app. Server Components + React Context + nuqs handle state. If you find yourself reaching for global state, reconsider the data flow first. | React Server Components + Context |

## Stack Patterns

**If you need real-time features later (e.g., live booking availability):**
- Add Neon's logical replication + a lightweight websocket layer
- Or add Supabase Realtime as a standalone service

**If beat catalog grows beyond 500 items:**
- Add Algolia or Meilisearch for full-text search with faceted filtering
- Drizzle's SQL queries will work fine up to ~500 beats with proper indexing

**If email volume exceeds Resend free tier (100/day):**
- Resend Pro is $20/mo for 50K emails -- reasonable for a growing studio
- Only upgrade when you actually hit the limit

**If you need a CMS for blog content:**
- Add Contentlayer or MDX for file-based blog posts (keeps content in repo)
- Or add Sanity/Payload CMS if non-technical team members need to edit

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.2.x | React 19.x | Next.js 16 requires React 19. `create-next-app` handles this. |
| Tailwind CSS 4.2.x | Next.js 16.x | Native support via `@tailwindcss/postcss` or `@tailwindcss/vite`. No config file needed in v4. |
| Drizzle ORM 0.45.x | @neondatabase/serverless | Use `drizzle-orm/neon-serverless` adapter. Neon's serverless driver works over HTTP (no persistent connection needed). |
| Better Auth | Drizzle ORM | Better Auth has a built-in `drizzleAdapter`. Pass your Drizzle instance directly. |
| shadcn/ui | Tailwind CSS 4.x | shadcn/ui supports Tailwind v4 as of late 2025. Use `npx shadcn@latest init` (not the old `shadcn-ui` package). |
| Embla Carousel 8.6.x | React 19.x | Compatible. Use `embla-carousel-react` wrapper. |
| Uploadthing | Next.js 16.x | Uploadthing v7+ supports App Router and Server Actions natively. |

## Sources

- [Next.js 16.2 Release Blog](https://nextjs.org/blog/next-16-2) -- confirmed latest stable version
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) -- confirmed v4 stable, CSS-first config
- [Embla Carousel npm](https://www.npmjs.com/package/embla-carousel-react) -- confirmed v8.6.0
- [Better Auth official docs](https://better-auth.com/docs/integrations/next) -- Next.js integration guide
- [Auth.js joins Better Auth announcement](https://better-auth.com/blog/authjs-joins-better-auth) -- Auth.js team migration (Sept 2025)
- [Neon for Vercel Marketplace](https://vercel.com/marketplace/neon) -- Vercel-native Postgres integration
- [Drizzle ORM npm](https://www.npmjs.com/package/drizzle-orm) -- confirmed v0.45.x
- [Resend Next.js docs](https://resend.com/docs/send-with-nextjs) -- Server Actions integration
- [React Email npm](https://www.npmjs.com/package/react-email) -- confirmed v5.2.x
- [shadcn/ui Admin Dashboard Vercel Template](https://vercel.com/templates/next.js/next-js-and-shadcn-ui-admin-dashboard) -- production patterns
- [Stripe Embedded Checkout with Next.js](https://dev.to/sameer_saleem/the-ultimate-guide-to-stripe-nextjs-2026-edition-2f33) -- payment integration patterns

---
*Stack research for: Glitch Studios -- music/video production studio website*
*Researched: 2026-03-25*

---

## v3.0 GlitchTek Launch — Stack Gaps

**Added:** 2026-04-20
**Scope:** New capabilities only — JSONL ingest, leaderboard tables, BPR rollup, medal UI, YAML parsing, methodology page. Everything above this line is already live.

### What Is Already Installed (confirmed from package.json as of 2026-04-20)

| Package | Installed Version | Notes |
|---------|-------------------|-------|
| `zod` | ^4.3.6 | Already covers JSONL schema validation |
| `nuqs` | ^2.8.9 | Already covers leaderboard URL state |
| `recharts` | ^3.8.1 | Already in use for compare charts |
| `@tiptap/*` | ^3.20.5 | Already covers methodology page editor |
| `isomorphic-dompurify` | ^3.9.0 | Already covers methodology HTML rendering |
| `@tanstack/react-table` | NOT IN package.json | Listed in original STACK.md as planned; never actually installed. Must be added. |
| `@next/mdx` | NOT IN package.json | Not referenced in next.config.ts either. Skip — see methodology section below. |

shadcn/ui components confirmed present in `src/components/ui/`: `table.tsx`, `tabs.tsx`, `badge.tsx`, `sheet.tsx`, `select.tsx`, `input.tsx`, `button.tsx`, `separator.tsx`. `toggle-group.tsx` is NOT present.

### New Dependencies Required

#### 1. Leaderboard Table Engine

| Library | Version | Purpose | Integration Point |
|---------|---------|---------|-------------------|
| `@tanstack/react-table` | `^8.21.3` | Sortable/filterable headless table for leaderboards | `src/components/tech/leaderboard-table.tsx` (new client component); data fetched server-side in page, passed as prop |

**Why `@tanstack/react-table` over alternatives:** The existing `src/components/ui/table.tsx` is a plain HTML `<table>` wrapper — no sort or filter logic. For a leaderboard requiring multi-column sort (score, name, price, BPR), text filter, and nuqs URL state sync, a headless engine is required. `@tanstack/react-table` v8 is headless, TypeScript-native, React 19 compatible, and the existing `table.tsx` shadcn primitive is designed to wrap it for rendering. The alternative — rolling custom sort with `Array.prototype.sort` + `useState` — breaks down at multi-column sort and doesn't give keyboard-accessible column headers for free.

**Architecture decision — client vs server sort/filter:** At MVP (≤200 products per category), pass the full dataset to the client table and let `@tanstack/react-table` sort/filter in memory. `nuqs` syncs sort column + direction + filter text to the URL. If a category grows past ~500 rows, switch the page to read sort/filter params from the URL at the Server Component level, pass them to a Drizzle query, and stream pre-sorted rows to the client table (which then does no client-side sorting). The table component interface stays the same — only the data-fetching layer changes.

#### 2. Missing shadcn/ui Primitive

| Component | Install Command | Needed For |
|-----------|----------------|------------|
| `toggle-group` | `pnpm dlx shadcn@latest add toggle-group` | Leaderboard metric column picker (e.g., "show: Score / BPR / Price") |

This adds `src/components/ui/toggle-group.tsx` and installs `@radix-ui/react-toggle-group` as a dependency. The `tabs.tsx`, `table.tsx`, `badge.tsx`, and other primitives already present cover all other leaderboard UI needs.

### What Requires NO New Libraries

#### JSONL Ingest — Server Action + Zod

The JSONL format from `logging.sh` is minimal: one JSON object per line. Header line has `_header: true`, `discipline`, `tool`, `timestamp`, `macos_build`, `hostname`, `rubric_version`. Data lines have discipline-specific numeric fields.

**Ingest approach:** Admin Server Action with `FormData` + `<input type="file" accept=".jsonl">`. No Uploadthing — this is structured data going directly into Postgres, not a media asset being stored in cloud storage.

```typescript
// src/app/admin/tech/benchmarks/ingest/actions.ts
const text = await file.text()
const lines = text.split("\n").filter(Boolean)
const records = lines.map((l) => JSON.parse(l))
```

Then validate with `zod` (already installed at ^4.3.6). The largest realistic file is one discipline run = 5–20 lines. No streaming, no readline — `file.text()` is fine.

Zod schema shape:

```typescript
const BenchHeaderSchema = z.object({
  _header: z.literal(true),
  discipline: z.string(),
  tool: z.string(),
  timestamp: z.string(),
  macos_build: z.string(),
  hostname: z.string(),
  rubric_version: z.string(),
})

const BenchDataSchema = z.object({
  _header: z.undefined().optional(),
}).catchall(z.unknown())
// Discipline-specific schemas extend BenchDataSchema for strict validation per tool
```

Product and test IDs are resolved by name lookup against `techBenchmarkTests` before inserting into `techBenchmarkRuns`. The action returns a summary of rows inserted and any validation errors per line.

#### BPR Rollup — Pure Math

No library. Geometric mean of `(battery_score / ac_score)` ratios is `Math.exp(sum of Math.log(ratios) / n)`. Add to `src/lib/tech/bpr.ts`:

```typescript
export function geometricMean(values: number[]): number {
  if (values.length === 0) return 0
  return Math.exp(values.reduce((acc, v) => acc + Math.log(v), 0) / values.length)
}

export function computeBpr(pairs: Array<{ ac: number; battery: number }>): number {
  return geometricMean(pairs.map(({ ac, battery }) => battery / ac)) * 100
}

export type MedalTier = "platinum" | "gold" | "silver" | "bronze" | "none"

export function bprMedal(bpr: number): MedalTier {
  if (bpr >= 90) return "platinum"
  if (bpr >= 80) return "gold"
  if (bpr >= 70) return "silver"
  if (bpr >= 60) return "bronze"
  return "none"
}
```

Thresholds confirmed from `00_README.md` §3.13: "90%+ = Platinum, 80%+ = Gold, etc."

BPR is computed at query time from `techBenchmarkRuns` rows with `ac`/`battery` power state metadata. No stored rollup column needed at MVP. If computing BPR for 1000+ products becomes slow, add a `bpr_score numeric` column to `techProducts` and update it on ingest.

Note: the schema currently has no `power_state` field on `techBenchmarkRuns`. The ingest action will need to accept power state as a form field (not from the JSONL itself — the header has no power_state field in v1.1). Either (a) add it as a form field on the admin ingest UI, or (b) add it to the JSONL header in v1.2 of the harness.

#### Medal Badge Component — Pure CSS

No library. Extend the existing `src/components/ui/badge.tsx` with medal variants. Medal colors are a deliberate deviation from the flat monochrome palette — they communicate tier at a glance. Flag this with Josh before shipping; he has strong opinions about the design.

```tsx
// src/components/tech/medal-badge.tsx
// Uses badge.tsx as the base, adds medal-specific color classes
const MEDAL = {
  platinum: "bg-[#e2e8f0] text-[#1e293b] border border-[#94a3b8]",
  gold:     "bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]",
  silver:   "bg-[#f1f5f9] text-[#475569] border border-[#94a3b8]",
  bronze:   "bg-[#fef9c3] text-[#78350f] border border-[#d97706]",
  none:     "bg-[#1a1a1a] text-[#555555] border border-[#333333]",
} as const
```

#### Methodology Page — DB-Driven via Existing Tiptap

Do NOT install `@next/mdx`. Rationale: Josh is a non-technical user; methodology content that lives in a `.mdx` file in git cannot be updated without a git commit. The Tiptap review editor is already in the project for writing review body HTML. The same pattern applies here.

Approach: add a `tech_pages` table (or a single `methodology_content` text column in a settings-like table) storing HTML. Admin edits via a Tiptap editor at `/admin/tech/methodology`. `/tech/methodology` renders it server-side with `isomorphic-dompurify` (already installed). Zero new dependencies.

#### YAML Manifest Parsing — Skip for v3.0

The `pack/manifests/tool-versions.yaml` and related files live on the review Mac and are not ingested into the website DB. The methodology page will describe tool versions as static editorial content (what the rubric requires), not as a dynamic reflection of what the harness has pinned. Skip `js-yaml` entirely for this milestone. Revisit only if a future phase wants to auto-generate the "Tools Used" section of a review from a YAML manifest that travels alongside the JSONL logs.

### Install Commands (v3.0 additions only)

```bash
# Required: headless table engine for leaderboards
pnpm add @tanstack/react-table@^8.21.3

# Required: shadcn toggle-group primitive for leaderboard column picker
pnpm dlx shadcn@latest add toggle-group
```

Total new production npm packages: **1** (`@tanstack/react-table`).
Total shadcn components: **1** (`toggle-group`, which pulls in `@radix-ui/react-toggle-group` as a transitive dep).
Everything else — JSONL parsing, BPR, medal badges, methodology page — is pure TypeScript using already-installed dependencies.

### Integration Map

| Feature | New Dep | New File(s) | Calls Into |
|---------|---------|-------------|------------|
| Leaderboard table | `@tanstack/react-table` | `src/components/tech/leaderboard-table.tsx` | `src/components/ui/table.tsx`, `nuqs` for URL state |
| Leaderboard data | none | `src/lib/tech/queries.ts` — new `listLeaderboardRows()` | Drizzle + Neon |
| Leaderboard column picker | `toggle-group` (shadcn) | Inside `leaderboard-table.tsx` | `src/components/ui/toggle-group.tsx` |
| JSONL ingest action | none (zod already installed) | `src/app/admin/tech/benchmarks/ingest/actions.ts` | `techBenchmarkRuns` Drizzle insert |
| BPR rollup | none | `src/lib/tech/bpr.ts` | Called from leaderboard query + review detail |
| Medal badge | none | `src/components/tech/medal-badge.tsx` | `src/components/ui/badge.tsx` |
| Methodology page (admin) | none (Tiptap already installed) | `src/app/admin/tech/methodology/page.tsx` | Existing Tiptap editor component |
| Methodology page (public) | none (dompurify already installed) | `src/app/(tech)/tech/methodology/page.tsx` | `isomorphic-dompurify` |

### Confidence Assessment

| Claim | Confidence | Basis |
|-------|------------|-------|
| `@tanstack/react-table` NOT in package.json | HIGH | Direct grep of package.json — no match |
| `@tanstack/react-table` v8.21.3 is latest | HIGH | `pnpm info @tanstack/react-table version` returned 8.21.3 |
| `@next/mdx` NOT installed | HIGH | Not in package.json, not referenced in next.config.ts |
| `toggle-group` NOT in shadcn components | HIGH | `ls src/components/ui/` confirms no toggle-group.tsx |
| JSONL lines are small (5–20 per file) | HIGH | Confirmed from logging.sh — one file per discipline+tool, header + data lines only |
| BPR formula is geometric mean | HIGH | Confirmed from 00_README.md §3.13 verbatim |
| Medal thresholds are 90/80/70/60 | HIGH | Confirmed from 00_README.md §3.13 verbatim |
| `power_state` gap in schema | HIGH | Reviewed techBenchmarkRuns table in schema.ts — no power_state column |
| `js-yaml` not needed for v3.0 | MEDIUM | YAML files stay on Mac harness; no current ingest path for manifests. Could change if harness evolves. |

### Sources (v3.0 section)

- `package.json` — confirmed installed packages, absence of @tanstack/react-table
- `src/components/ui/` directory listing — confirmed shadcn component inventory
- `src/db/schema.ts` — confirmed techBenchmarkRuns column set (no power_state)
- `src/lib/tech/queries.ts` — confirmed existing query patterns for context
- `pack/disciplines/_lib/logging.sh` — confirmed JSONL format and line structure
- `00_README.md` §3.13 — confirmed BPR formula and medal thresholds verbatim
- `pnpm info @tanstack/react-table version` → 8.21.3 (live query, 2026-04-20)
- `pnpm info js-yaml version` → 4.1.1 (live query, 2026-04-20)
