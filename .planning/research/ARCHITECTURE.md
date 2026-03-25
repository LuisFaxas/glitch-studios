# Architecture Research

**Domain:** Music/video production studio website with e-commerce, booking, and admin dashboard
**Researched:** 2026-03-25
**Confidence:** HIGH

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Public    │  │  Client   │  │  Admin     │  │  Shared    │  │
│  │  Pages     │  │  Portal   │  │  Dashboard │  │  Layout    │  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬──────┘  └─────┬──────┘  │
│        │              │              │               │          │
├────────┴──────────────┴──────────────┴───────────────┴──────────┤
│                     SERVER ACTION LAYER                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Payments │ │ Bookings │ │ Content  │ │ Auth     │           │
│  │ Actions  │ │ Actions  │ │ Actions  │ │ Actions  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                  │
├───────┴────────────┴────────────┴────────────┴──────────────────┤
│                     ROUTE HANDLER LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Stripe       │  │ PayPal       │  │ Email        │          │
│  │ Webhooks     │  │ Webhooks     │  │ Webhooks     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     DATA LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Prisma ORM   │  │ File Storage │  │ Auth.js v5   │          │
│  │ (Postgres)   │  │ (Vercel Blob)│  │ (Sessions)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     EXTERNAL SERVICES                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐     │
│  │ Stripe │ │ PayPal │ │ Resend │ │ Vercel │ │ Vercel   │     │
│  │        │ │        │ │ (Email)│ │ Blob   │ │ Postgres │     │
│  └────────┘ └────────┘ └────────┘ └────────┘ └──────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Public Pages | Marketing, service pages, beat catalog, portfolio, blog, artist profiles | Next.js Server Components with static generation where possible |
| Client Portal | View bookings, download purchases, purchase history | Auth-gated route group with Auth.js session checks |
| Admin Dashboard | Manage content, bookings, clients, site settings, pricing, team | Auth-gated route group with role-based access (admin role) |
| Server Actions | All mutations: create booking, process payment, update content | `"use server"` functions co-located with features |
| Route Handlers | Webhook endpoints for Stripe, PayPal, and email services | `app/api/webhooks/` — these MUST be Route Handlers, not Server Actions |
| Prisma ORM | All database reads/writes, schema definition, migrations | Singleton client, called from Server Components and Server Actions |
| Auth.js v5 | Authentication, session management, role-based access control | NextAuth v5 with Prisma adapter, credentials + optional OAuth |
| File Storage | Audio files (beats), images, video thumbnails | Vercel Blob for production; local `public/` for dev |
| Email | Transactional emails (booking confirmations, receipts), newsletters | Resend (fits Vercel ecosystem, React Email templates) |

## Recommended Project Structure

```
src/
├── app/
│   ├── (public)/              # Public-facing pages (no auth required)
│   │   ├── layout.tsx         # Public layout: header + footer
│   │   ├── page.tsx           # Homepage / landing
│   │   ├── beats/             # Beat catalog + individual beat pages
│   │   │   ├── page.tsx       # Catalog with filters, search, audio previews
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Individual beat page with licensing options
│   │   ├── services/          # Service pages
│   │   │   ├── page.tsx       # Services overview
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Individual service detail
│   │   ├── book/              # Booking flow
│   │   │   └── page.tsx       # Calendar + time slot selection
│   │   ├── portfolio/         # Video portfolio
│   │   │   ├── page.tsx       # Portfolio grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Individual project showcase
│   │   ├── artists/           # Artist/producer profiles
│   │   │   ├── page.tsx       # Team grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Individual artist profile
│   │   ├── blog/              # Blog/news
│   │   │   ├── page.tsx       # Blog index
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Individual post
│   │   ├── checkout/          # Payment flow (Stripe + PayPal)
│   │   │   ├── page.tsx       # Cart review + payment selection
│   │   │   └── success/
│   │   │       └── page.tsx   # Post-payment confirmation
│   │   ├── contact/
│   │   │   └── page.tsx       # Contact form
│   │   └── about/
│   │       └── page.tsx       # About page
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
│   ├── (client)/              # Client portal (requires auth, client role)
│   │   ├── layout.tsx         # Client layout: sidebar + header
│   │   └── account/
│   │       ├── page.tsx       # Dashboard overview
│   │       ├── bookings/
│   │       │   └── page.tsx   # View/manage bookings
│   │       ├── purchases/
│   │       │   └── page.tsx   # Download history, license keys
│   │       └── settings/
│   │           └── page.tsx   # Profile settings
│   │
│   ├── (admin)/               # Admin dashboard (requires auth, admin role)
│   │   ├── layout.tsx         # Admin layout: collapsible sidebar + topbar
│   │   └── admin/
│   │       ├── page.tsx       # Admin overview / stats
│   │       ├── beats/
│   │       │   ├── page.tsx   # Manage beat catalog
│   │       │   └── new/
│   │       │       └── page.tsx
│   │       ├── bookings/
│   │       │   └── page.tsx   # View/manage all bookings
│   │       ├── clients/
│   │       │   └── page.tsx   # Client management
│   │       ├── content/
│   │       │   ├── blog/
│   │       │   │   └── page.tsx
│   │       │   ├── portfolio/
│   │       │   │   └── page.tsx
│   │       │   └── artists/
│   │       │       └── page.tsx
│   │       ├── email/
│   │       │   └── page.tsx   # Email campaigns + inbox
│   │       └── settings/
│   │           └── page.tsx   # Site settings, pricing, service config
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   │   └── route.ts   # Stripe webhook handler
│   │   │   └── paypal/
│   │   │       └── route.ts   # PayPal webhook handler
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts   # Auth.js catch-all route
│   │
│   ├── layout.tsx             # Root layout (html, body, providers)
│   └── not-found.tsx          # Custom 404
│
├── components/
│   ├── ui/                    # Reusable primitives (buttons, inputs, modals, cards)
│   ├── layout/                # Header, Footer, Sidebar, Navigation
│   ├── beats/                 # AudioPlayer, BeatCard, WaveformDisplay, LicenseSelector
│   ├── booking/               # CalendarPicker, TimeSlotGrid, BookingForm
│   ├── checkout/              # CartSummary, PaymentMethodSelector, StripeForm, PayPalButton
│   ├── portfolio/             # VideoCard, VideoPlayer, ProjectGallery
│   └── admin/                 # DataTable, StatsCard, ContentEditor
│
├── lib/
│   ├── db.ts                  # Prisma client singleton
│   ├── auth.ts                # Auth.js configuration
│   ├── stripe.ts              # Stripe client + helpers
│   ├── paypal.ts              # PayPal client + helpers
│   ├── email.ts               # Resend client + email sending helpers
│   ├── storage.ts             # Vercel Blob upload/download helpers
│   └── utils.ts               # Shared utilities (formatting, slugs, etc.)
│
├── actions/
│   ├── beats.ts               # CRUD for beats, license generation
│   ├── bookings.ts            # Create/update/cancel bookings
│   ├── payments.ts            # Payment intent creation, order fulfillment
│   ├── content.ts             # Blog, portfolio, artist CRUD
│   ├── email.ts               # Send transactional + marketing emails
│   └── admin.ts               # Site settings, pricing, user management
│
├── types/
│   └── index.ts               # Shared TypeScript types and interfaces
│
├── hooks/
│   ├── use-audio-player.ts    # Audio playback state management
│   ├── use-cart.ts            # Shopping cart state
│   └── use-booking.ts         # Booking flow state
│
├── styles/
│   └── globals.css            # Tailwind directives + custom CSS (glitch effects)
│
└── prisma/
    ├── schema.prisma          # Database schema
    └── seed.ts                # Seed data for development
```

### Structure Rationale

- **Route groups `(public)`, `(auth)`, `(client)`, `(admin)`:** Each gets its own layout. Public pages have full header/footer. Auth pages are minimal and centered. Client portal has a simple sidebar. Admin dashboard has a full sidebar with navigation. Route groups do NOT affect URLs -- `/admin/beats` is the URL, not `/(admin)/admin/beats`.
- **`components/` by domain:** Components grouped by feature domain (beats, booking, checkout) rather than by type (buttons, forms). The `ui/` subfolder holds truly generic primitives.
- **`actions/` separate from `app/`:** Server Actions co-located in a dedicated folder keeps them importable from multiple routes. A beat action might be called from both the public catalog and the admin dashboard.
- **`lib/` for service clients:** Third-party client initialization (Stripe, Prisma, Resend) lives in `lib/` as singletons. These are imported by Server Actions and Route Handlers but never by Client Components.
- **`hooks/` for client state:** Audio player state, cart state, and booking flow state are complex enough to warrant dedicated hooks. These are client-side only.

## Architectural Patterns

### Pattern 1: Server-Action-First Mutations

**What:** All data mutations (creating bookings, processing payments, updating content) go through Server Actions, not API routes. API routes are reserved exclusively for webhooks and Auth.js.
**When to use:** Every form submission, every data write.
**Trade-offs:** Simpler than building a REST API. Type-safe end-to-end. Cannot be called from external services (that is what webhooks are for).

**Example:**
```typescript
// actions/bookings.ts
"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createBooking(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const booking = await db.booking.create({
    data: {
      userId: session.user.id,
      serviceId: formData.get("serviceId") as string,
      date: new Date(formData.get("date") as string),
      timeSlot: formData.get("timeSlot") as string,
      notes: formData.get("notes") as string,
      status: "PENDING",
    },
  })

  // Trigger confirmation email
  await sendBookingConfirmation(booking)
  revalidatePath("/account/bookings")
  revalidatePath("/admin/bookings")
  return { success: true, bookingId: booking.id }
}
```

### Pattern 2: Route Group Layout Isolation

**What:** Each route group gets a completely independent layout tree. The admin dashboard layout (sidebar, topbar, dark theme) shares zero code with the public layout (header, footer, marketing design).
**When to use:** When different sections of the app have fundamentally different UI shells.
**Trade-offs:** Some duplication in layout code, but avoids conditional layout logic that gets messy fast.

**Example:**
```typescript
// app/(admin)/layout.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
```

### Pattern 3: Persistent Audio Player via Root Layout

**What:** The beat audio player persists across page navigations by living in the root layout, outside of route group layouts. It floats at the bottom of the screen (like Spotify/SoundCloud). Cart state also persists this way via a context provider in the root layout.
**When to use:** Any UI element that must survive navigation (audio player, cart indicator, toast notifications).
**Trade-offs:** The root layout renders on every page. Keep it lightweight -- only global providers and persistent UI.

**Example:**
```typescript
// app/layout.tsx (root)
import { AudioPlayerProvider } from "@/hooks/use-audio-player"
import { CartProvider } from "@/hooks/use-cart"
import { AudioPlayerBar } from "@/components/beats/AudioPlayerBar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <CartProvider>
          <AudioPlayerProvider>
            {children}
            <AudioPlayerBar />  {/* Fixed bottom bar, visible on public pages */}
          </AudioPlayerProvider>
        </CartProvider>
      </body>
    </html>
  )
}
```

### Pattern 4: Dual Payment Gateway with Unified Order Model

**What:** Stripe and PayPal both write to the same `Order` and `Payment` tables. The checkout page lets the user choose their method. Payment confirmation comes via webhooks (not client-side callbacks) to ensure reliability.
**When to use:** Any dual-payment setup.
**Trade-offs:** Webhook-driven fulfillment adds complexity but prevents the "paid but not fulfilled" bug that plagues client-side confirmation flows.

**Flow:**
```
User selects payment method
    ├── Stripe → Server Action creates PaymentIntent → Stripe.js confirms → Webhook fires → Order fulfilled
    └── PayPal → Server Action creates PayPal Order → PayPal SDK redirects → Webhook fires → Order fulfilled
```

## Data Flow

### Beat Purchase Flow

```
[Browse Catalog] (Server Component, static)
    ↓
[Preview Beat] → AudioPlayer (Client Component, Web Audio API)
    ↓
[Select License] → Cart (Client state via Context)
    ↓
[Checkout Page] → Choose Stripe or PayPal
    ↓
[Server Action: createPaymentIntent] → Stripe API / PayPal API
    ↓
[Client: confirm payment] → Stripe.js / PayPal SDK
    ↓
[Webhook: payment.succeeded] → Route Handler → Mark order PAID
    ↓
[Generate download link] → Vercel Blob signed URL
    ↓
[Send receipt email] → Resend
    ↓
[Revalidate] → Client portal shows purchase
```

### Booking Flow

```
[Select Service] (Server Component)
    ↓
[Pick Date] → Calendar (Client Component, react-day-picker)
    ↓
[Pick Time Slot] → fetch available slots from DB
    ↓
[Confirm + Pay Deposit] → Server Action: createBooking + createPaymentIntent
    ↓
[Webhook: payment.succeeded] → Mark booking CONFIRMED
    ↓
[Send confirmation email] → Resend (with calendar .ics attachment)
    ↓
[Revalidate] → Admin dashboard + client portal updated
```

### Admin Content Flow

```
[Admin Dashboard] (Server Component, role-gated)
    ↓
[Edit Content] → Rich text editor (Client Component)
    ↓
[Upload Media] → Server Action → Vercel Blob
    ↓
[Save] → Server Action → Prisma → DB
    ↓
[revalidatePath] → Public pages reflect changes immediately
```

### Key Data Flows

1. **Audio streaming:** Beat files stored in Vercel Blob. Public catalog pages reference signed URLs with expiration. Full-quality files only available after purchase via time-limited download links.
2. **Authentication propagation:** Auth.js v5 `auth()` function works in Server Components, Server Actions, Route Handlers, and Middleware. Middleware handles redirect logic for protected routes. Role checks happen in layouts (admin layout checks for ADMIN role).
3. **Real-time revalidation:** After any mutation (booking created, beat purchased, content updated), `revalidatePath()` ensures cached pages update without manual cache busting. On-demand ISR keeps public pages fast while staying current.

## Database Schema (Core Models)

```
User           ─── one-to-many ──→ Booking
  │            ─── one-to-many ──→ Order
  │            ─── one-to-many ──→ Session (Auth.js)
  │            ─── one-to-many ──→ Account (Auth.js OAuth)
  └── role: ADMIN | CLIENT

Beat           ─── one-to-many ──→ License (pricing tiers)
  │            ─── many-to-many ─→ Tag
  └── audioUrl, coverUrl, bpm, key, slug

Order          ─── one-to-many ──→ OrderItem
  │            ─── one-to-one ───→ Payment
  └── status: PENDING | PAID | FAILED | REFUNDED

Booking        ─── many-to-one ──→ Service
  │            ─── many-to-one ──→ User
  └── status: PENDING | CONFIRMED | COMPLETED | CANCELLED

Service        ─── category: STUDIO | MIXING | VIDEO | SFX | DESIGN
  └── name, description, pricing, duration

BlogPost       ─── many-to-one ──→ User (author)
  └── title, slug, content, publishedAt

PortfolioItem  ─── videoUrl, thumbnailUrl, description
Artist         ─── name, slug, bio, photoUrl, role
SiteSettings   ─── key-value store for admin-configurable options
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 users | Current architecture is fine. Vercel Postgres free/hobby tier. Vercel Blob for storage. Single Prisma client. |
| 500-5k users | Add connection pooling (Prisma Accelerate or pgBouncer). Move to Vercel Pro for more bandwidth. Add CDN caching headers for audio previews. |
| 5k+ users | Consider dedicated Postgres (Neon/Supabase). Audio file CDN (Cloudflare R2 is cheaper than Vercel Blob at scale). Add rate limiting on booking/checkout endpoints. |

### Scaling Priorities

1. **First bottleneck: Audio file serving.** Beat previews get hammered on the catalog page. Solution: aggressive cache headers on audio files, consider a CDN in front of Vercel Blob, and use audio sprites (30-second previews) rather than serving full tracks.
2. **Second bottleneck: Database connections.** Serverless functions each open a connection. Prisma Accelerate or a connection pooler solves this without architecture changes.

## Anti-Patterns

### Anti-Pattern 1: Client-Side Payment Confirmation

**What people do:** Listen for Stripe.js `paymentIntent.succeeded` on the client and mark the order as paid via a Server Action.
**Why it's wrong:** Users can close the browser, lose connection, or manipulate client-side code. You end up with paid orders that never get fulfilled.
**Do this instead:** Always confirm payment via webhooks. The client redirect to `/checkout/success` is cosmetic -- the webhook is the source of truth for fulfillment.

### Anti-Pattern 2: Putting Auth Checks Only in Middleware

**What people do:** Rely solely on Next.js middleware for authentication, assuming it covers all access.
**Why it's wrong:** Middleware runs on the Edge and cannot do database lookups efficiently. It also does not protect Server Actions called directly.
**Do this instead:** Use middleware for redirects (unauthenticated user hits `/admin` -> redirect to `/login`). Use `auth()` checks inside Server Actions and Server Components for actual authorization. Defense in depth.

### Anti-Pattern 3: Single Mega Layout with Conditional Rendering

**What people do:** One root layout that conditionally renders admin sidebar, client nav, or public header based on the current route.
**Why it's wrong:** Bloated layout component, layout shift on navigation, and the admin JS bundle ships to public users.
**Do this instead:** Use route groups with separate layouts. Each group loads only what it needs.

### Anti-Pattern 4: Storing Audio Files in the Database

**What people do:** Store beat files as BLOBs in Postgres.
**Why it's wrong:** Destroys database performance, makes backups massive, and cannot leverage CDN caching.
**Do this instead:** Store files in Vercel Blob (or S3/R2). Store only the URL/path in the database.

### Anti-Pattern 5: Building a Custom Auth System

**What people do:** Roll their own JWT-based auth with bcrypt password hashing.
**Why it's wrong:** Session management, CSRF protection, token rotation, and password reset flows are solved problems. Custom auth is a security liability.
**Do this instead:** Use Auth.js v5. It handles sessions, CSRF, database-backed sessions via Prisma adapter, and role-based access out of the box.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Stripe | Server-side SDK for PaymentIntents + client-side Stripe.js for card UI | Webhook to `/api/webhooks/stripe` for payment confirmation. Use Stripe Checkout or Payment Element. |
| PayPal | Server-side REST SDK for order creation + client-side PayPal JS SDK | Webhook to `/api/webhooks/paypal`. PayPal requires redirect flow for buyer authorization. |
| Resend | Server-side SDK called from Server Actions | React Email for templates. Transactional (receipts, confirmations) + marketing (newsletters). |
| Vercel Blob | `@vercel/blob` SDK for upload/download | Used for audio files, images, video thumbnails. Signed URLs for protected downloads. |
| Vercel Postgres | Via Prisma ORM | Provisioned through Vercel dashboard. Connection string in env vars. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Public pages <-> Data | Server Components call Prisma directly | Read-only. No Server Actions needed for reads. |
| Client Components <-> Server | Server Actions via `useFormAction` or direct import | All mutations go through actions. Client never talks to DB. |
| Webhooks <-> Business Logic | Route Handlers call same Prisma queries as Actions | Shared `lib/` functions prevent duplication between actions and webhooks. |
| Admin <-> Public content | `revalidatePath()` / `revalidateTag()` | Admin saves content, public pages update via on-demand ISR. |
| Auth <-> All protected routes | Middleware (redirects) + `auth()` (authorization) | Two layers: middleware for UX redirects, `auth()` for security. |

## Build Order (Dependencies)

This ordering reflects what must exist before the next piece can work:

1. **Foundation** -- Project setup, Tailwind config (cyberpunk theme), Prisma schema, Auth.js, root layout, route group shells
2. **Public shell** -- Public layout (header/footer), homepage, static pages (about, contact, services)
3. **Content system** -- Blog and portfolio with admin CRUD (establishes the content management pattern reused everywhere)
4. **Beat catalog** -- Beat model, catalog page, audio player, beat detail pages (core product, no payment yet)
5. **E-commerce** -- Cart, checkout flow, Stripe + PayPal integration, webhooks, order fulfillment, download delivery
6. **Booking system** -- Calendar UI, time slot management, booking flow with deposit payment, confirmation emails
7. **Client portal** -- Account pages showing bookings, purchases, downloads
8. **Admin dashboard** -- Full admin with stats, all management pages, email campaigns, site settings
9. **Polish** -- SEO, OG images, analytics, performance optimization, error boundaries, loading states

**Ordering rationale:**
- Auth must exist before any protected routes (phases 1-2 establish it)
- Content management patterns (phase 3) inform how beats and bookings are managed
- Beat catalog (phase 4) is the core product and can launch without payment for portfolio purposes
- E-commerce (phase 5) builds on beat catalog -- adding payment to existing product pages
- Booking (phase 6) reuses the payment infrastructure from e-commerce
- Client portal (phase 7) requires bookings + orders to exist
- Admin dashboard (phase 8) is last because it manages all entities that must exist first

## Sources

- [Next.js Official Project Structure Docs](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Auth.js v5 Role-Based Access Control](https://authjs.dev/guides/role-based-access-control)
- [Prisma + Next.js Guide](https://www.prisma.io/docs/guides/nextjs)
- [Vercel + Prisma Postgres Starter](https://vercel.com/kb/guide/nextjs-prisma-postgres)
- [Auth.js v5 + Next.js + Role-Based Access Tutorial](https://noqta.tn/en/tutorials/nextjs-authjs-v5-authentication-guide-2026)
- [WaveSurfer.js Discussion: Multiple instances with bottom player](https://github.com/katspaugh/wavesurfer.js/discussions/3190)
- [Next.js App Router 2026 Complete Guide](https://dev.to/ottoaria/nextjs-app-router-in-2026-the-complete-guide-for-full-stack-developers-5bjl)
- [Admin Dashboard with shadcn/ui and Next.js](https://adminlte.io/blog/build-admin-dashboard-shadcn-nextjs/)

---
*Architecture research for: Glitch Studios -- music/video production studio website*
*Researched: 2026-03-25*
