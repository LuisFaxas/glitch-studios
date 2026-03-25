# Project Research Summary

**Project:** Glitch Studios Website
**Domain:** Music/video production studio website with beat e-commerce, service booking, and client portal
**Researched:** 2026-03-25
**Confidence:** HIGH

## Executive Summary

Glitch Studios is a unified platform combining a beat store (e-commerce), studio service booking, video/audio portfolio showcase, and client accounts under a single cyberpunk-branded website. This type of product sits at the intersection of three well-understood domains -- digital product e-commerce, appointment scheduling, and creative portfolio sites -- but the combination under one roof is uncommon and is itself the primary differentiator. Experts build this with a modern React meta-framework (Next.js App Router), serverless Postgres, and third-party services for payments, email, and file storage, deploying to a platform like Vercel that handles scaling without ops overhead.

The recommended approach is a Next.js 16 + Tailwind CSS 4 + Drizzle ORM + Neon Postgres stack deployed on Vercel, with Better Auth for authentication, Stripe (with PayPal as a payment method) for payments, Resend for email, and Uploadthing for file storage. The architecture uses route groups to isolate four layout contexts (public, auth, client portal, admin dashboard), Server Actions for all mutations, and webhook-driven payment fulfillment. The persistent audio player -- required for beat browsing -- is the single most architecturally significant UI component and must live in the root layout from day one.

The top risks are: (1) serving audio files through serverless functions instead of CDN/object storage, which will break at any real traffic volume; (2) shipping beat previews without watermarks, which exposes the entire catalog to theft; (3) not enforcing licensing rules (especially exclusive sales) in the data model, creating legal liability; (4) iOS Safari audio playback failures that break the core revenue feature for mobile users; and (5) dual payment provider reconciliation complexity. All of these are preventable with upfront architecture decisions documented in the research.

## Key Findings

### Recommended Stack

The stack is fully locked in with high confidence. Next.js 16.2, Tailwind CSS 4.2, and Embla Carousel were user-selected. The remaining choices (Drizzle ORM over Prisma, Better Auth over Auth.js/Clerk, Neon over Supabase, Resend over SendGrid) were research-driven based on bundle size, serverless compatibility, and developer experience.

**Core technologies:**
- **Next.js 16.2 (App Router)**: Full-stack framework -- server components, server actions, Turbopack, native Vercel deployment
- **Tailwind CSS 4.2**: Utility-first CSS with zero-config v4 setup, 5x faster builds
- **Drizzle ORM + Neon Postgres**: Lightweight ORM (7.4kb) with SQL-like syntax, no codegen step; Neon provides serverless Postgres with Vercel-native integration and auto-scaling to zero
- **Better Auth**: TypeScript-first auth with built-in RBAC, Drizzle adapter, email/password + social login -- the active successor to Auth.js
- **Stripe (primary) + PayPal (via Stripe Payment Element)**: Unified payment processing; route PayPal through Stripe for single dashboard and webhook handling
- **Resend + React Email**: Transactional email with React component templates
- **Uploadthing**: File uploads for beats and images, built for Next.js
- **WaveSurfer.js**: Audio waveform visualization for beat previews
- **shadcn/ui**: Copy-into-project component library built on Radix UI + Tailwind, includes admin dashboard components

**Note:** The ARCHITECTURE.md references Prisma and Auth.js v5, which conflicts with the STACK.md recommendation of Drizzle and Better Auth. STACK.md is authoritative -- Drizzle and Better Auth should be used. Architecture patterns (route groups, server actions, webhook-driven fulfillment) remain valid regardless of ORM/auth choice.

### Expected Features

**Must have (table stakes):**
- Persistent audio player with waveform (survives page navigation -- hardest table-stakes feature)
- Tiered licensing system (MP3/WAV/Stems/Unlimited/Exclusive) with auto-generated license PDFs
- Beat watermarking on all previews (protect IP from day one)
- Shopping cart + Stripe/PayPal checkout with instant digital delivery (signed URLs)
- Calendar booking system with deposit payment and timezone handling
- Client accounts with purchase history, re-downloads, and booking management
- Admin dashboard for beats, bookings, content, and pricing management
- Video portfolio with embedded playback and service pages with pricing
- Mobile-responsive design (60%+ of music discovery is mobile)
- Transactional emails for purchase receipts and booking confirmations

**Should have (competitive advantage):**
- Unified platform (beats + services + portfolio under one brand) -- this IS the differentiator
- Cyberpunk/glitch visual identity -- memorability over generic templates
- Video showreel as hero content -- signals production quality beyond typical beat sellers
- Admin analytics dashboard (plays, sales, conversions)
- Beat bundles/collection pricing for higher average order value

**Defer (v2+):**
- Blog/newsletter system (add when SEO strategy and content cadence are defined)
- Co-producer split tracking (add when collaborator beats are listed)
- PWA capabilities, advanced search, client file sharing portal, multi-admin roles

### Architecture Approach

The application is structured as four isolated route groups sharing a common root layout. The root layout holds only global providers (auth, cart, audio player) and the persistent audio player bar. Each route group -- public, auth, client portal, admin -- gets its own layout with appropriate navigation, sidebar, and access control. All mutations flow through Server Actions; API route handlers are reserved exclusively for webhooks (Stripe, PayPal) and the auth catch-all. Database reads happen directly in Server Components.

**Major components:**
1. **Public Pages** -- Marketing, beat catalog, portfolio, services, blog (Server Components, static where possible)
2. **Beat Store Engine** -- Audio player, licensing system, cart, checkout, digital delivery (mix of Server and Client Components)
3. **Booking System** -- Calendar UI, availability management, deposit payment, confirmation flow
4. **Client Portal** -- Auth-gated account pages for bookings, purchases, downloads
5. **Admin Dashboard** -- Task-oriented management for beats, bookings, content, settings, analytics
6. **Webhook Layer** -- Payment confirmation and fulfillment via Stripe/PayPal webhooks
7. **Email System** -- Transactional emails (React Email templates via Resend)

### Critical Pitfalls

1. **Audio files served through serverless functions** -- Store all audio in Uploadthing/Vercel Blob; serve via CDN URLs; deliver purchases via time-limited pre-signed URLs. Never pipe binary data through API routes.
2. **No watermarking on beat previews** -- Pre-generate tagged versions at upload time. The browser must never receive an untagged file. Recovery is expensive (re-process every beat, damage already done if stolen).
3. **Licensing not enforced in data model** -- Model license types as first-class entities. Exclusive purchases must auto-remove beats from catalog. Validate availability server-side before checkout, not after.
4. **iOS Safari audio playback broken** -- Never autoplay. All play actions from user gestures. Test on real iOS device from day one, not DevTools simulation.
5. **Dual payment reconciliation** -- Route PayPal through Stripe Payment Element for a single dashboard and webhook flow. If standalone PayPal is needed, build a payment abstraction layer with unified order/transaction model.
6. **Calendar booking without timezone/concurrency protection** -- Store all times in UTC with timezone metadata. Use database-level unique constraints on resource + timeslot to prevent double bookings.
7. **Admin dashboard too complex for non-technical owner** -- Design around tasks ("Add a beat," "Check today's bookings"), not database tables. Validate with owner early via mockups.

## Implications for Roadmap

Based on dependency analysis across all four research files, the project naturally breaks into 6 phases:

### Phase 1: Foundation + Public Shell
**Rationale:** Every other phase depends on the project skeleton, database schema, auth system, theming, and the root layout (which must include the audio player provider from day one). Public marketing pages have zero dependencies and validate the cyberpunk aesthetic early.
**Delivers:** Working Next.js project with Tailwind cyberpunk theme, Drizzle + Neon database with core schema, Better Auth with admin/client roles, route group structure, root layout with audio player provider shell, public pages (homepage, about, services, contact form, artist profiles).
**Features addressed:** Service pages, contact form, artist profiles, mobile-responsive design, SEO fundamentals, cyberpunk visual identity.
**Pitfalls addressed:** Audio file storage architecture decided (Uploadthing/Blob, not public/ or serverless); database schema includes license types, beat status, and watermark file variants from the start; rate limiting on contact form.

### Phase 2: Beat Catalog + Audio Player
**Rationale:** The beat catalog is the core product and the most technically challenging feature (persistent player, waveform visualization, watermarking). Building it before e-commerce lets the team validate the hardest UX problem (persistent audio across navigation) without payment complexity.
**Delivers:** Beat catalog with filtering (genre, BPM, key, mood), beat detail pages with license tier display, persistent audio player with WaveSurfer.js waveform, watermarked preview pipeline, admin beat CRUD (upload, edit, delete).
**Features addressed:** Persistent audio player, beat categorization/filtering, beat search, watermarked previews, beat catalog browsing.
**Pitfalls addressed:** iOS Safari audio tested on real device; watermarking pipeline in place before any beats go live; audio served from object storage via CDN.

### Phase 3: E-Commerce + Licensing
**Rationale:** Builds on the existing beat catalog by adding the revenue layer. Payment infrastructure (Stripe + PayPal via Stripe) is reused by the booking system in Phase 4, so it must come first.
**Delivers:** Shopping cart, Stripe checkout with PayPal option, webhook-driven order fulfillment, license PDF generation, instant digital delivery via signed URLs, purchase confirmation emails, client accounts with purchase history and re-downloads.
**Features addressed:** Tiered licensing, shopping cart, checkout, digital delivery, license agreements, client accounts, transactional emails (receipts).
**Pitfalls addressed:** Licensing enforced in data model (exclusive sales auto-delist beats); payment confirmation via webhooks only (never client-side); unified payment model regardless of provider; download URLs expire.

### Phase 4: Booking System
**Rationale:** Reuses payment infrastructure from Phase 3 for deposit collection. Calendar/scheduling is a self-contained domain that can be built independently once auth and payments exist.
**Delivers:** Calendar booking UI with timezone handling, availability management, time slot selection with buffer times, deposit payment via Stripe, booking confirmation emails with .ics attachment, client booking history, admin booking management.
**Features addressed:** Calendar booking, booking deposits, booking management in client portal.
**Pitfalls addressed:** UTC storage with timezone metadata; database-level unique constraint prevents double-booking; booking form shows times first (minimal friction); admin blocked-time/override system.

### Phase 5: Portfolio + Content
**Rationale:** Portfolio and blog are lower-priority content features that enhance the marketing site but are not revenue-critical. Building them after the revenue features ensures the business-critical path ships first.
**Delivers:** Video portfolio with lazy-loaded embeds, case study template pages, blog with markdown/rich-text posts, newsletter signup with double opt-in, admin content management (portfolio, blog, testimonials).
**Features addressed:** Video portfolio, audio portfolio/credits, blog, newsletter signup, case studies, testimonials.
**Pitfalls addressed:** Video embeds lazy-loaded (thumbnails first, iframe on click); separate sending domain for marketing vs. transactional email; double opt-in for newsletter.

### Phase 6: Admin Polish + Analytics
**Rationale:** The admin dashboard accumulates CRUD surfaces from all prior phases. This phase focuses on unifying the admin experience, adding analytics, and polishing the overall product for launch readiness.
**Delivers:** Unified admin dashboard with task-oriented UX, analytics (plays, sales, conversions, revenue), bulk operations for beat management, site settings, email campaign management, performance optimization, error boundaries, loading states, OG images.
**Features addressed:** Admin analytics dashboard, bulk operations, site settings, advanced cyberpunk visual effects, performance optimization.
**Pitfalls addressed:** Admin designed around tasks not tables; tested with actual owner; empty states handled throughout; failed payment recovery flow verified.

### Phase Ordering Rationale

- **Foundation before everything** because auth, database schema, and storage architecture decisions propagate to every feature.
- **Beat catalog before e-commerce** because the persistent audio player is architecturally foundational and the hardest UX problem -- solving it early de-risks the project.
- **E-commerce before booking** because payment infrastructure is shared and beat sales are the primary revenue stream.
- **Booking after e-commerce** because it reuses payments and is a secondary revenue stream.
- **Portfolio/content after revenue features** because they enhance marketing but do not generate direct revenue.
- **Admin polish last** because it surfaces management for entities that must exist first, and task-oriented design requires understanding real usage patterns from prior phases.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Beat Catalog):** Persistent audio player across Next.js App Router navigation is a known challenge. WaveSurfer.js integration with React 19 Server Components needs validation. iOS Safari audio handling requires device-specific testing research.
- **Phase 3 (E-Commerce):** License PDF generation approach needs selection (e.g., @react-pdf/renderer vs. puppeteer vs. server-side template). PayPal-via-Stripe integration specifics (settlement timing, refund flows, regional availability) need API-level research.
- **Phase 4 (Booking):** Calendar UI component selection (shadcn/ui date picker vs. react-day-picker vs. custom). Google Calendar sync integration if desired. Buffer time and recurring availability logic.

Phases with standard patterns (skip deep research):
- **Phase 1 (Foundation):** Next.js project setup, Tailwind theming, Drizzle schema, Better Auth -- all well-documented with official guides.
- **Phase 5 (Portfolio/Content):** Standard CRUD with video embeds and markdown rendering. Established patterns.
- **Phase 6 (Admin Polish):** shadcn/ui provides admin dashboard templates. Recharts for analytics. Standard patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified against official docs and npm. Version compatibility confirmed. User-selected core (Next.js, Tailwind, Embla, Vercel, Stripe) plus research-validated additions (Drizzle, Better Auth, Neon, Resend). |
| Features | HIGH | Feature landscape validated against BeatStars, Airbit, and studio booking platforms. Clear separation between table stakes, differentiators, and anti-features. Dependency graph is sound. |
| Architecture | HIGH | App Router route groups, Server Actions, webhook-driven payments are established Next.js patterns. Persistent audio player architecture is the one area with moderate complexity risk. |
| Pitfalls | HIGH | Pitfalls sourced from Vercel docs, Stripe docs, and production incident patterns. Each has concrete prevention strategy and phase mapping. |

**Overall confidence:** HIGH

### Gaps to Address

- **ARCHITECTURE.md references Prisma and Auth.js v5** while STACK.md recommends Drizzle and Better Auth. Architecture patterns are valid but code examples need adjustment. Use STACK.md as authoritative for technology choices.
- **Audio watermarking implementation** is specified as "pre-bake before upload" but the exact tooling (FFmpeg server-side, or a pre-upload script) is not decided. Resolve during Phase 2 planning.
- **License PDF generation** library not selected. Options include @react-pdf/renderer (React components to PDF) or server-side HTML-to-PDF. Resolve during Phase 3 planning.
- **Beat file storage size limits** on Uploadthing free tier (2GB) may be tight for WAV stems. Need to evaluate whether Uploadthing Pro or a switch to Vercel Blob/S3 is needed before Phase 2 builds the upload pipeline.
- **Google Calendar sync** for booking system is mentioned but not researched. If the owner wants calendar sync, this needs API research during Phase 4 planning.
- **Waveform pre-generation** (generating waveform data at upload time vs. client-side rendering) is flagged as a performance concern but no specific approach was selected.

## Sources

### Primary (HIGH confidence)
- Next.js 16.2 Release Blog -- confirmed latest stable, App Router, Turbopack
- Tailwind CSS v4.0 Release -- confirmed CSS-first config, v4 stable
- Better Auth official docs -- Next.js integration, Drizzle adapter, RBAC
- Neon for Vercel Marketplace -- serverless Postgres, Vercel-native integration
- Stripe Embedded Checkout / Payment Element docs -- PCI compliance, PayPal integration
- Vercel Serverless Function Limits -- 4.5 MB body limit, media serving guidance
- MDN Autoplay Guide -- browser autoplay restrictions

### Secondary (MEDIUM confidence)
- BeatStars/Airbit feature comparisons -- informed table-stakes features and licensing tiers
- Studio booking software comparisons (Booknetic, Acuity, Sonido) -- informed booking system requirements
- Community tutorials for Admin Dashboard with shadcn/ui and Next.js -- informed admin patterns
- WaveSurfer.js GitHub discussions -- persistent player in Next.js App Router

### Tertiary (needs validation)
- Beat pricing and licensing tier specifics (stream caps, pricing ranges) -- varies by market, owner should set based on their market position
- Uploadthing storage limits and pricing at scale -- verify current pricing before Phase 2
- PayPal-via-Stripe regional availability and feature parity -- verify against current Stripe docs during Phase 3

---
*Research completed: 2026-03-25*
*Ready for roadmap: yes*
