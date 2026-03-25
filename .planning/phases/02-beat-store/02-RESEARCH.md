# Phase 2: Beat Store - Research

**Researched:** 2026-03-25
**Domain:** E-commerce / Digital Product Store (Audio Beats)
**Confidence:** HIGH

## Summary

Phase 2 builds a complete digital beat store on top of the existing Glitch Studios foundation. The phase covers seven major technical domains: (1) database schema for beats, licenses, cart, orders, and downloads, (2) file storage and upload via the existing Cloudflare R2 setup, (3) persistent audio player with WaveSurfer.js waveform visualization, (4) MIDI parsing and piano-roll visualization with @tonejs/midi, (5) Stripe Embedded Checkout with PayPal as a Stripe-native payment method, (6) server-side PDF license generation with pdf-lib, and (7) transactional email via Resend + React Email.

The project already has Cloudflare R2 configured with presigned URL helpers (`src/lib/r2.ts`), Drizzle ORM with postgres-js driver, Better Auth with admin plugin, and the full Cyberpunk Metro design system. The CLAUDE.md stack spec recommends Uploadthing, but R2 is already wired up and has no egress fees -- use R2 directly. Stripe Checkout natively supports PayPal as a payment method (enable in Stripe Dashboard), so a separate @paypal/react-paypal-js integration is unnecessary.

**Primary recommendation:** Use Stripe Embedded Checkout (ui_mode: 'embedded') with PayPal enabled in Dashboard, R2 for all file storage with presigned URLs for upload and download, WaveSurfer.js for waveform visualization in a root-layout-mounted persistent player, @tonejs/midi for client-side MIDI parsing, pdf-lib for server-side license PDF generation, and Resend + React Email for purchase receipts.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Hybrid layout -- list rows for scanning, expand on click to reveal detail card with per-instrument MIDI sequence visualization
- **D-02:** List rows show: cover art thumbnail, title, BPM/key badges, genre/mood tags, price, play button
- **D-03:** Expanded detail shows: full waveform, MIDI piano-roll per instrument track (kick, snare, hi-hat, bass, melody), license CTA, description
- **D-04:** MIDI visualization uses `@tonejs/midi` to parse uploaded .mid files client-side, rendered as colored horizontal bars per instrument on a timeline grid (cyberpunk terminal/sequencer aesthetic)
- **D-05:** Tile filter bar -- horizontal row of small tile-styled filter chips (Genre, BPM range, Key, Mood) matching Cyberpunk Metro nav tile aesthetic. Filters toggle on/off.
- **D-06:** Search input styled as flat monochrome field. Uses `nuqs` for URL query state.
- **D-07:** Dual player -- sidebar "Now Playing" widget is compact display (track name, artist, mini progress). Full bottom bar appears when beat is actively playing with WaveSurfer.js waveform, full controls, and licensing CTA.
- **D-08:** Bottom bar sits above mobile tab bar. Can minimize back to sidebar-only mode.
- **D-09:** Player persists across page navigation via React context provider at root layout level.
- **D-10:** Sidebar widget and bottom bar are synced (same audio state, same track).
- **D-11:** Modal comparison table -- click "License" on a beat opens modal with comparison table showing all tiers. User picks tier and adds to cart.
- **D-12:** License tiers: MP3 Lease, WAV Lease, Stems, Unlimited, Exclusive -- each with different pricing, usage rights, and deliverables.
- **D-13:** Auto-generated PDF license agreement per tier on purchase (BEAT-05).
- **D-14:** Slide-out drawer cart -- cart icon in nav shows item count badge. Click opens drawer from right.
- **D-15:** Stripe Embedded Checkout for payment.
- **D-16:** Guest checkout with optional account -- buyers can purchase without an account. After purchase, offer to create account for download history.
- **D-17:** Form-based admin page with drag-drop upload zones for audio files. Uploadthing handles file storage.
- **D-18:** Beat form fields: title, BPM, key, genre, mood tags, description, license tier pricing.
- **D-19:** Co-producer splits as simple percentage inputs per beat. Display/tracking only.

### Claude's Discretion
- Database schema design for beats, licenses, cart, orders, downloads
- Stripe webhook handling for payment confirmation
- Signed URL generation for digital delivery
- Watermark audio processing approach (FFmpeg or pre-upload)
- Bundle/collection pricing logic
- Purchase receipt email template design (Resend + React Email)

### Deferred Ideas (OUT OF SCOPE)
- Full Stripe Connect payout integration for co-producer splits
- Spreadsheet-style bulk beat manager
- Audio watermarking automation
- Beat recommendation engine / algorithmic sorting

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BEAT-01 | Persistent audio player with waveform visualization that survives page navigation | WaveSurfer.js + @wavesurfer/react in root layout AudioPlayerProvider context |
| BEAT-02 | Beat catalog with genre, BPM, key, and mood filtering | Drizzle query with nuqs URL state, tile filter chips |
| BEAT-03 | Beat search across title, tags, and genre | Drizzle `ilike` queries on indexed columns, nuqs for search param |
| BEAT-04 | Tiered licensing system (MP3 Lease, WAV Lease, Stems, Unlimited, Exclusive) | License tiers table + beat-tier pricing join, modal comparison UI |
| BEAT-05 | Auto-generated PDF license agreement per tier on purchase | pdf-lib server-side PDF generation in Stripe webhook handler |
| BEAT-06 | Watermarked audio previews on all beats | Pre-upload manual watermarking (deferred automation); store watermarked MP3 as separate R2 key |
| BEAT-07 | Shopping cart supporting multiple beats with persistent state | localStorage cart with React context, cart drawer UI |
| BEAT-08 | Stripe + PayPal checkout for beat purchases | Stripe Embedded Checkout with PayPal enabled in Dashboard |
| BEAT-09 | Instant digital delivery via signed download URLs after purchase | R2 `getDownloadUrl` presigned URLs (already in r2.ts), short expiry |
| BEAT-10 | Beat bundles/collections with discounted pricing | Bundles table with beat junction, percentage discount on total |
| BEAT-11 | Co-producer split tracking with percentage assignments per beat | beat_producers junction table with name + percentage |
| MAIL-01 | Purchase receipt emails with download links on beat sale | Resend + React Email template, triggered from Stripe webhook |
| AUTH-03 | Client dashboard showing purchase history and re-download links | Orders + order_items tables, client dashboard page |
| ADMN-01 | Beat management -- CRUD for beats with metadata, files, pricing, licensing tiers | Admin form with R2 presigned upload, Drizzle CRUD actions |

</phase_requirements>

## Standard Stack

### Core (New for Phase 2)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | 20.4.1 | Server-side Stripe SDK | Payment session creation, webhook verification. Latest stable. |
| @stripe/stripe-js | 8.11.0 | Client-side Stripe.js loader | Loads Stripe.js for EmbeddedCheckout component. |
| @stripe/react-stripe-js | latest | React components for Stripe | EmbeddedCheckoutProvider + EmbeddedCheckout components. |
| wavesurfer.js | 7.12.5 | Audio waveform rendering | Lightweight waveform visualization. v7 is current major. |
| @wavesurfer/react | 1.0.12 | React wrapper for WaveSurfer.js | Official React hook/component for WaveSurfer.js v7. |
| @tonejs/midi | 2.0.28 | MIDI file parser | Parses .mid files into JSON with note/track data for piano-roll. |
| pdf-lib | 1.17.1 | Server-side PDF generation | Zero native dependencies. Creates license agreement PDFs. |
| resend | 6.9.4 | Email delivery API | Transactional email for purchase receipts. |
| @react-email/components | 1.0.10 | Email template components | React components for building email templates. |
| nuqs | 2.8.9 | URL query state | Already in stack decision. Type-safe search params for filters. |
| date-fns | 4.1.0 | Date utilities | Lightweight date formatting for orders, receipts. |

### Already Installed (Reuse)
| Library | Current | Purpose |
|---------|---------|---------|
| drizzle-orm | 0.45.x | Database ORM -- extend schema |
| @aws-sdk/client-s3 | 3.x | R2 file operations (already in r2.ts) |
| @aws-sdk/s3-request-presigner | 3.x | Presigned URLs (already in r2.ts) |
| zod | 4.3.x | Form/API validation |
| sonner | 2.x | Toast notifications |
| embla-carousel-react | 8.6.0 | Carousels if needed for beat browsing |
| motion | 12.x | Animations |
| shadcn | 4.x | UI components (Sheet for cart drawer, Dialog for license modal) |

### NOT Needed (Deviations from CLAUDE.md)
| CLAUDE.md Says | Actual Decision | Reason |
|----------------|-----------------|--------|
| Uploadthing for file uploads | Use R2 directly | R2 already configured with presigned URL helpers. Zero egress fees. Uploadthing 2GB free tier too small for WAV/stems. R2 is unlimited on free tier (10GB storage). |
| @paypal/react-paypal-js as fallback | Not needed | Stripe Embedded Checkout natively supports PayPal as a payment method. Enable in Stripe Dashboard, zero extra code. |

**Installation:**
```bash
pnpm add stripe @stripe/stripe-js @stripe/react-stripe-js wavesurfer.js @wavesurfer/react @tonejs/midi pdf-lib resend @react-email/components nuqs date-fns
```

## Architecture Patterns

### Project Structure (New Files)
```
src/
├── app/
│   ├── (public)/beats/
│   │   ├── page.tsx                    # Beat catalog (server component)
│   │   └── [slug]/page.tsx             # Beat detail (optional, or handled via expand)
│   ├── (public)/cart/page.tsx           # Cart page (fallback for drawer)
│   ├── (public)/checkout/page.tsx       # Stripe Embedded Checkout page
│   ├── (public)/checkout/success/page.tsx # Post-purchase success + downloads
│   ├── (public)/dashboard/
│   │   ├── page.tsx                    # Client dashboard (AUTH-03)
│   │   └── purchases/page.tsx          # Purchase history + re-downloads
│   ├── api/
│   │   ├── checkout/route.ts           # Create Stripe Checkout Session
│   │   ├── checkout/session-status/route.ts # Check session status for return
│   │   └── webhooks/stripe/route.ts    # Stripe webhook handler
│   └── admin/
│       └── beats/
│           ├── page.tsx                # Beat list (admin)
│           ├── new/page.tsx            # Create beat form
│           └── [id]/edit/page.tsx       # Edit beat form
├── actions/
│   ├── beats.ts                        # Beat CRUD server actions
│   ├── cart.ts                         # Cart operations (if server-side)
│   └── orders.ts                       # Order queries for dashboard
├── components/
│   ├── beats/
│   │   ├── beat-list.tsx               # Main beat catalog list
│   │   ├── beat-row.tsx                # Collapsed beat row
│   │   ├── beat-detail.tsx             # Expanded beat detail panel
│   │   ├── beat-filters.tsx            # Tile filter bar
│   │   ├── beat-search.tsx             # Search input
│   │   ├── midi-piano-roll.tsx         # MIDI visualization per instrument
│   │   └── license-modal.tsx           # License tier comparison modal
│   ├── player/
│   │   ├── audio-player-provider.tsx   # React context for audio state
│   │   ├── player-bar.tsx              # Bottom bar with WaveSurfer waveform
│   │   └── widget-now-playing.tsx      # Sidebar widget (replace existing)
│   ├── cart/
│   │   ├── cart-provider.tsx           # Cart context (localStorage)
│   │   ├── cart-drawer.tsx             # Slide-out drawer (shadcn Sheet)
│   │   └── cart-item.tsx               # Individual cart item row
│   └── admin/
│       └── beats/
│           ├── beat-form.tsx           # Beat create/edit form
│           └── upload-zone.tsx         # Drag-drop file upload component
├── db/
│   └── schema.ts                       # Extended with beat store tables
├── lib/
│   ├── stripe.ts                       # Stripe server client
│   ├── pdf-license.ts                  # License PDF generation
│   └── email/
│       └── purchase-receipt.tsx        # React Email template
└── types/
    └── index.ts                        # Extended with beat store types
```

### Pattern 1: Persistent Audio Player via Root Layout Context
**What:** Mount AudioPlayerProvider and PlayerBar in root layout so they persist across all page navigations. Use a shared HTMLAudioElement ref in context.
**When to use:** Always -- this is how BEAT-01 and D-09 are satisfied.
**Example:**
```typescript
// src/components/player/audio-player-provider.tsx
"use client"
import { createContext, useContext, useRef, useState, useCallback } from "react"

interface AudioPlayerState {
  currentBeat: BeatSummary | null
  isPlaying: boolean
  currentTime: number
  duration: number
  play: (beat: BeatSummary) => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const AudioPlayerContext = createContext<AudioPlayerState | null>(null)

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentBeat, setCurrentBeat] = useState<BeatSummary | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  // ... state management for play/pause/seek

  return (
    <AudioPlayerContext.Provider value={{ currentBeat, isPlaying, /* ... */ audioRef }}>
      {children}
      {/* Hidden audio element -- WaveSurfer will use this via media prop */}
      <audio ref={audioRef} />
    </AudioPlayerContext.Provider>
  )
}

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext)
  if (!ctx) throw new Error("useAudioPlayer must be inside AudioPlayerProvider")
  return ctx
}
```

### Pattern 2: WaveSurfer.js with External Audio Element
**What:** WaveSurfer.js v7 accepts a `media` option to use an existing HTMLAudioElement instead of creating its own. This lets the context-owned audio element drive both the waveform and the sidebar widget.
**When to use:** For the bottom player bar waveform.
**Example:**
```typescript
// src/components/player/player-bar.tsx
"use client"
import { useEffect, useRef } from "react"
import WaveSurfer from "wavesurfer.js"
import { useAudioPlayer } from "./audio-player-provider"

export function PlayerBar() {
  const { currentBeat, audioRef, isPlaying } = useAudioPlayer()
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    if (!containerRef.current || !audioRef.current) return
    wsRef.current = WaveSurfer.create({
      container: containerRef.current,
      media: audioRef.current, // Use the shared audio element
      waveColor: "#555555",
      progressColor: "#f5f5f0",
      height: 40,
      barWidth: 2,
      barGap: 1,
      cursorWidth: 0,
    })
    return () => wsRef.current?.destroy()
  }, [currentBeat]) // Recreate when track changes

  if (!currentBeat) return null
  return (
    <div className="fixed bottom-[var(--tab-bar-height)] md:bottom-0 left-0 right-0 z-40 bg-[#111111] border-t border-[#222222] p-4">
      <div ref={containerRef} />
      {/* Controls, track info, license CTA */}
    </div>
  )
}
```

### Pattern 3: localStorage Cart with React Context
**What:** Cart state persisted in localStorage, wrapped in a React context for reactivity. No server-side cart needed since guests can purchase.
**When to use:** For BEAT-07 (persistent cart) and D-16 (guest checkout).
**Example:**
```typescript
// src/components/cart/cart-provider.tsx
"use client"
import { createContext, useContext, useState, useEffect } from "react"

interface CartItem {
  beatId: string
  beatTitle: string
  coverArtUrl: string
  licenseTier: string
  price: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (beatId: string, tier: string) => void
  clearCart: () => void
  total: number
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("glitch-cart")
    if (stored) setItems(JSON.parse(stored))
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem("glitch-cart", JSON.stringify(items))
  }, [items])

  // ... addItem, removeItem, clearCart, total computed

  return <CartContext.Provider value={{ items, /* ... */ }}>{children}</CartContext.Provider>
}
```

### Pattern 4: Stripe Embedded Checkout Flow
**What:** Server Action creates a Stripe Checkout Session with `ui_mode: 'embedded'`. Client renders `EmbeddedCheckout` component. Stripe webhook confirms payment and triggers fulfillment.
**When to use:** For BEAT-08 (checkout).
**Flow:**
1. Client clicks "Checkout" in cart drawer
2. Navigate to `/checkout` page
3. Page calls server action to create Checkout Session with line items from cart
4. `EmbeddedCheckoutProvider` renders Stripe's embedded form (handles card, Apple Pay, Google Pay, PayPal)
5. On completion, Stripe redirects to `/checkout/success?session_id=...`
6. Success page polls session status, shows download links
7. Meanwhile, Stripe webhook fires `checkout.session.completed` -- server creates order records, generates license PDFs, sends receipt email

### Pattern 5: R2 Presigned Upload for Admin
**What:** Admin form requests a presigned PUT URL from a server action, then uploads directly from the browser to R2. No server relay needed for large audio files.
**When to use:** For ADMN-01 (admin beat upload).
**Example:**
```typescript
// Server action
"use server"
import { getUploadUrl } from "@/lib/r2"

export async function getPresignedUploadUrl(filename: string, contentType: string) {
  const key = `beats/${Date.now()}-${filename}`
  const url = await getUploadUrl(key, contentType)
  return { url, key }
}

// Client: fetch presigned URL, then PUT directly to R2
const { url, key } = await getPresignedUploadUrl(file.name, file.type)
await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
// Save `key` to database as the file reference
```

### Pattern 6: MIDI Piano-Roll Visualization
**What:** Parse uploaded .mid files client-side with @tonejs/midi, render colored horizontal bars per instrument track on a canvas/SVG timeline grid.
**When to use:** For D-04 (expanded beat detail).
**Example:**
```typescript
import { Midi } from "@tonejs/midi"

// Load and parse MIDI file
const response = await fetch(midiFileUrl)
const arrayBuffer = await response.arrayBuffer()
const midi = new Midi(arrayBuffer)

// Access tracks and notes
midi.tracks.forEach(track => {
  track.notes.forEach(note => {
    // note.midi - MIDI number (0-127)
    // note.time - start time in seconds
    // note.duration - duration in seconds
    // note.name - e.g. "C4"
    // Render as horizontal bar: x = time, y = midi number, width = duration
  })
})
```

### Anti-Patterns to Avoid
- **Mounting player inside page components:** Player will unmount on navigation, losing audio state. Always mount in root layout.
- **Server-side cart for guest users:** Unnecessary complexity. localStorage is sufficient and requires no auth. Sync to server only after purchase.
- **Using Stripe API routes for checkout creation:** Use Server Actions instead -- cleaner, no separate API route needed.
- **Storing full file URLs in database:** Store R2 keys only. Generate presigned URLs on demand with short expiry for security.
- **Creating WaveSurfer instance per beat row:** Heavy. Only the active player bar needs a WaveSurfer instance. Beat rows use a simple play button that triggers the context player.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment processing | Custom card handling | Stripe Embedded Checkout | PCI compliance, fraud detection, Apple Pay/Google Pay/PayPal built-in |
| PDF generation | HTML-to-PDF with Puppeteer | pdf-lib | No headless browser needed, no native deps, works in serverless |
| Email delivery | SMTP/Nodemailer | Resend | Deliverability, bounce handling, templates |
| Waveform rendering | Canvas-based custom waveform | WaveSurfer.js | Decade of edge cases solved, seeking, responsive, performant |
| MIDI parsing | Custom binary MIDI parser | @tonejs/midi | MIDI spec is complex, library handles all edge cases |
| URL query state sync | Manual useSearchParams + useRouter | nuqs | Type safety, serialization, history management |
| File upload presigned URLs | Custom S3 signing | Existing r2.ts helpers | Already built, tested, working |

**Key insight:** This phase has many moving parts (audio, payments, files, email, PDF). Using proven libraries for each domain keeps the custom code focused on the Cyberpunk Metro UI and business logic (licensing, pricing, fulfillment).

## Common Pitfalls

### Pitfall 1: Audio Player Losing State on Navigation
**What goes wrong:** Player stops and resets when user navigates between pages.
**Why it happens:** Player component is mounted inside a page or route group layout that unmounts on navigation.
**How to avoid:** Mount AudioPlayerProvider and PlayerBar in the root layout (`src/app/layout.tsx`), NOT in the public layout. The root layout never unmounts.
**Warning signs:** Audio stops when clicking any link.

### Pitfall 2: WaveSurfer Container Not Ready
**What goes wrong:** WaveSurfer.create() fails or renders nothing because the container div hasn't mounted yet.
**Why it happens:** useEffect runs before the DOM is painted, or the container ref is null when the component conditionally renders.
**How to avoid:** Guard with `if (!containerRef.current) return`. Destroy and recreate WaveSurfer when the track changes. Use a cleanup function in useEffect.
**Warning signs:** Empty waveform area, console errors about container.

### Pitfall 3: Stripe Webhook Signature Verification Failure
**What goes wrong:** Webhook handler rejects all events with 400 errors.
**Why it happens:** Next.js automatically parses the request body as JSON, but Stripe webhook verification requires the raw body buffer.
**How to avoid:** In the webhook route handler, read the raw body with `await request.text()` and pass that to `stripe.webhooks.constructEvent()`. Do NOT use `request.json()`.
**Warning signs:** Webhook events show as failed in Stripe Dashboard.

### Pitfall 4: Cart Hydration Mismatch
**What goes wrong:** React hydration error on cart badge or cart drawer on first load.
**Why it happens:** Server renders cart as empty (no localStorage on server), but client hydrates with stored items.
**How to avoid:** Initialize cart state as empty array. Hydrate from localStorage in a useEffect (client-only). Use a `mounted` flag to suppress cart badge rendering until hydrated.
**Warning signs:** Console hydration mismatch warnings, cart count flashing from 0 to N.

### Pitfall 5: R2 CORS Issues on Direct Upload
**What goes wrong:** Browser blocks PUT request to R2 presigned URL.
**Why it happens:** R2 bucket doesn't have CORS configured for the app's domain.
**How to avoid:** Configure CORS on the R2 bucket in Cloudflare dashboard. Allow PUT method from the app domain and localhost for dev.
**Warning signs:** Network tab shows CORS error on upload requests.

### Pitfall 6: Large Audio File Upload Timeout
**What goes wrong:** WAV files (50-200MB) and stems ZIPs time out during upload.
**Why it happens:** Default fetch timeout, slow connection, no progress feedback.
**How to avoid:** Use XMLHttpRequest for upload progress tracking. Consider multipart upload for files > 100MB. Show upload progress bar in admin UI.
**Warning signs:** Upload appears to hang, then fails silently.

### Pitfall 7: Exclusive License Not Removed After Purchase
**What goes wrong:** Two buyers purchase the same "Exclusive" license.
**Why it happens:** No server-side inventory check at checkout time.
**How to avoid:** In the Stripe webhook handler, check if exclusive license was already sold before creating the order. If already sold, refund the charge. Also mark the beat as "exclusive sold" in the database and hide the exclusive tier from the license modal.
**Warning signs:** Multiple orders for same beat's exclusive license.

## Code Examples

### Stripe Embedded Checkout Session Creation
```typescript
// src/app/api/checkout/route.ts
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { items } = await request.json()
  // items: Array<{ beatId, beatTitle, licenseTier, price }>

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.beatTitle} - ${item.licenseTier}`,
          metadata: { beatId: item.beatId, licenseTier: item.licenseTier },
        },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: 1,
    })),
    mode: "payment",
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    // PayPal is enabled via Stripe Dashboard -- no code needed
  })

  return Response.json({ clientSecret: session.client_secret })
}
```

### Stripe Webhook Handler
```typescript
// src/app/api/webhooks/stripe/route.ts
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text() // RAW body, not .json()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    // 1. Create order + order_items in database
    // 2. Generate license PDFs (pdf-lib)
    // 3. Upload license PDFs to R2
    // 4. Send receipt email (Resend)
    // 5. If guest, store email for download access
  }

  return Response.json({ received: true })
}
```

### PDF License Generation
```typescript
// src/lib/pdf-license.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

export async function generateLicensePdf(params: {
  buyerName: string
  buyerEmail: string
  beatTitle: string
  licenseTier: string
  usageRights: string[]
  orderId: string
  purchaseDate: Date
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792]) // Letter size
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

  // Header
  page.drawText("GLITCH STUDIOS", { x: 50, y: 720, size: 24, font: boldFont })
  page.drawText("Beat License Agreement", { x: 50, y: 690, size: 16, font })

  // License details
  let y = 650
  const fields = [
    ["Order ID:", params.orderId],
    ["Date:", params.purchaseDate.toLocaleDateString()],
    ["Beat:", params.beatTitle],
    ["License:", params.licenseTier],
    ["Licensee:", params.buyerName],
    ["Email:", params.buyerEmail],
  ]
  for (const [label, value] of fields) {
    page.drawText(label, { x: 50, y, size: 11, font: boldFont })
    page.drawText(value, { x: 150, y, size: 11, font })
    y -= 20
  }

  // Usage rights
  y -= 20
  page.drawText("Usage Rights:", { x: 50, y, size: 12, font: boldFont })
  y -= 18
  for (const right of params.usageRights) {
    page.drawText(`  - ${right}`, { x: 50, y, size: 10, font })
    y -= 16
  }

  return doc.save()
}
```

### Database Schema (Beats, Orders, Licenses)
```typescript
// Additions to src/db/schema.ts
import { pgTable, text, timestamp, uuid, integer, boolean, pgEnum, numeric, jsonb } from "drizzle-orm/pg-core"

export const beatStatusEnum = pgEnum("beat_status", ["draft", "published", "sold_exclusive"])
export const licenseTierEnum = pgEnum("license_tier", ["mp3_lease", "wav_lease", "stems", "unlimited", "exclusive"])
export const orderStatusEnum = pgEnum("order_status", ["pending", "completed", "refunded"])

export const beats = pgTable("beats", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  bpm: integer("bpm").notNull(),
  key: text("key").notNull(),           // e.g. "C minor", "F# major"
  genre: text("genre").notNull(),
  moods: text("moods").array(),          // e.g. ["dark", "aggressive", "melodic"]
  description: text("description"),
  coverArtKey: text("cover_art_key"),    // R2 key
  previewAudioKey: text("preview_audio_key"), // Watermarked MP3, R2 key
  wavFileKey: text("wav_file_key"),      // Full WAV, R2 key
  stemsZipKey: text("stems_zip_key"),    // Stems ZIP, R2 key
  midiFileKey: text("midi_file_key"),    // MIDI file, R2 key
  status: beatStatusEnum("status").default("draft"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const beatPricing = pgTable("beat_pricing", {
  id: uuid("id").defaultRandom().primaryKey(),
  beatId: uuid("beat_id").references(() => beats.id, { onDelete: "cascade" }).notNull(),
  tier: licenseTierEnum("tier").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
})

export const beatProducers = pgTable("beat_producers", {
  id: uuid("id").defaultRandom().primaryKey(),
  beatId: uuid("beat_id").references(() => beats.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  splitPercent: integer("split_percent").notNull(), // 0-100
})

export const bundles = pgTable("bundles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  discountPercent: integer("discount_percent").notNull(), // e.g. 20 = 20% off
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const bundleBeats = pgTable("bundle_beats", {
  id: uuid("id").defaultRandom().primaryKey(),
  bundleId: uuid("bundle_id").references(() => bundles.id, { onDelete: "cascade" }).notNull(),
  beatId: uuid("beat_id").references(() => beats.id, { onDelete: "cascade" }).notNull(),
})

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),              // null for guest purchases
  guestEmail: text("guest_email"),      // for guest purchases
  stripeSessionId: text("stripe_session_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: orderStatusEnum("status").default("pending"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  beatId: uuid("beat_id").references(() => beats.id).notNull(),
  licenseTier: licenseTierEnum("license_tier").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  licensePdfKey: text("license_pdf_key"), // R2 key for generated PDF
  downloadCount: integer("download_count").default(0),
})

// License tier definitions (reference data, not per-beat)
export const licenseTierDefs = pgTable("license_tier_defs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tier: licenseTierEnum("tier").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  usageRights: text("usage_rights").array(), // ["Up to 5000 streams", "1 music video", etc.]
  deliverables: text("deliverables").array(), // ["MP3 file", "WAV file", "Stems"]
  sortOrder: integer("sort_order").default(0),
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stripe Hosted Checkout (redirect) | Stripe Embedded Checkout (in-page) | 2024 | No redirect, users stay on site, better conversion |
| Separate PayPal integration | PayPal as Stripe payment method | 2024-2025 | Enable in Dashboard, zero code for PayPal |
| Howler.js for audio | WaveSurfer.js v7 | 2024 | Built-in waveform, lighter API, React wrapper |
| jsPDF for server PDFs | pdf-lib | Stable since 2021 | No DOM dependency, works in serverless, isomorphic |
| SendGrid for email | Resend + React Email | 2023-2024 | React components for templates, better DX |
| Auth.js / NextAuth | Better Auth | Sept 2025 | Auth.js team joined Better Auth, active development |

## Open Questions

1. **Watermark Audio Processing**
   - What we know: Deferred from automation (CONTEXT.md). Need watermarked MP3 previews for all beats.
   - What's unclear: Whether to require admin to upload pre-watermarked files manually, or add a lightweight server-side watermark step.
   - Recommendation: For v1, require admin to upload already-watermarked preview MP3 as a separate file. Add a note in admin UI: "Upload watermarked preview MP3." Automate later.

2. **Exclusive License Inventory**
   - What we know: Once exclusive is sold, beat should no longer offer that tier.
   - What's unclear: Should the entire beat be hidden from the store, or just the exclusive tier removed?
   - Recommendation: Keep beat visible with remaining tiers. Set beat status to `sold_exclusive` which hides only the exclusive tier. Show "Exclusive SOLD" badge on the beat card.

3. **Guest Purchase Download Access**
   - What we know: D-16 says guest checkout with optional account creation after.
   - What's unclear: How do guests re-download? Email link only? Token-based access?
   - Recommendation: Generate a unique download token per order. Include token-based download link in receipt email. If guest creates account later, link order to their user ID.

4. **R2 Bucket CORS Configuration**
   - What we know: R2 is set up but CORS may not be configured for browser uploads.
   - What's unclear: Current CORS settings on the R2 bucket.
   - Recommendation: Verify and configure CORS in Cloudflare dashboard before starting admin upload work. Allow PUT from `glitch-studios.codebox.local` and production domain.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | v24 | -- |
| pnpm | Package manager | Yes | Latest | -- |
| PostgreSQL (Supabase) | Database | Yes | Remote managed | -- |
| Cloudflare R2 | File storage | Yes | Configured in .env | -- |
| Stripe account | Payments | Needs setup | -- | Cannot proceed without |
| Stripe CLI (local webhooks) | Dev testing | Needs install | -- | Use Stripe Dashboard webhook forwarding |
| Resend account | Email | Needs setup | -- | Console.log emails during dev |
| FFmpeg | Audio watermark (deferred) | Not checked | -- | Manual pre-watermarked uploads |

**Missing dependencies with no fallback:**
- Stripe account + API keys (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET) must be created before checkout work begins

**Missing dependencies with fallback:**
- Resend API key -- can console.log email content during dev, add real sending later
- Stripe CLI for local webhook testing -- can use Stripe Dashboard forwarding or ngrok

## New Environment Variables Needed
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
```

## Sources

### Primary (HIGH confidence)
- Stripe Embedded Checkout docs: https://docs.stripe.com/checkout/embedded/quickstart -- Checkout Session creation, EmbeddedCheckout component, return URL pattern
- Stripe PayPal integration: https://docs.stripe.com/payments/paypal -- PayPal as native Stripe payment method, Dashboard-only setup
- WaveSurfer.js v7 docs: https://wavesurfer.xyz/ -- API, React wrapper, media option for external audio element
- @wavesurfer/react npm: https://www.npmjs.com/package/@wavesurfer/react -- Official React wrapper v1.0.12
- @tonejs/midi GitHub: https://github.com/Tonejs/Midi -- MIDI parsing API, track/note data structure
- pdf-lib GitHub: https://github.com/Hopding/pdf-lib -- Server-side PDF generation, no native deps
- Resend Next.js docs: https://resend.com/docs/send-with-nextjs -- Server Actions integration pattern
- Existing codebase: `src/lib/r2.ts` -- R2 presigned URL helpers already implemented

### Secondary (MEDIUM confidence)
- WaveSurfer persistent player discussion: https://github.com/katspaugh/wavesurfer.js/discussions/3190 -- Pattern for shared audio element across components
- Stripe webhook raw body pattern: verified across multiple Next.js + Stripe tutorials -- `request.text()` not `request.json()`

### Tertiary (LOW confidence)
- Uploadthing vs R2 cost comparison -- general developer sentiment, not benchmarked for this specific use case
- Audio watermarking approaches -- deferred, no specific tool researched

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified on npm with current versions, APIs confirmed via official docs
- Architecture: HIGH - Patterns based on existing codebase conventions (Drizzle, R2, server actions) extended for new domain
- Pitfalls: HIGH - Common issues verified across multiple sources (Stripe webhook body, WaveSurfer container, cart hydration)
- Database schema: MEDIUM - Schema is a recommendation (Claude's Discretion), may need adjustment during implementation
- MIDI visualization: MEDIUM - @tonejs/midi parsing confirmed, but custom canvas/SVG rendering for piano-roll is custom code

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable domain, libraries are mature)
