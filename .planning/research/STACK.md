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
