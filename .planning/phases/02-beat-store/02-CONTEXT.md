# Phase 2: Beat Store - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Clients can browse a beat catalog, preview audio with a persistent player, view per-instrument MIDI sequences, select license tiers, add to cart, checkout with Stripe/PayPal, and instantly download purchased files. Admin can upload and manage beats with metadata, files, pricing, and co-producer splits.

</domain>

<decisions>
## Implementation Decisions

### Beat Browsing Experience
- **D-01:** Hybrid layout — list rows for scanning, expand on click to reveal detail card with per-instrument MIDI sequence visualization
- **D-02:** List rows show: cover art thumbnail, title, BPM/key badges, genre/mood tags, price, play button
- **D-03:** Expanded detail shows: full waveform, MIDI piano-roll per instrument track (kick, snare, hi-hat, bass, melody), license CTA, description
- **D-04:** MIDI visualization uses `@tonejs/midi` to parse uploaded .mid files client-side, rendered as colored horizontal bars per instrument on a timeline grid (cyberpunk terminal/sequencer aesthetic)

### Filters & Search
- **D-05:** Tile filter bar — horizontal row of small tile-styled filter chips (Genre, BPM range, Key, Mood) matching the Cyberpunk Metro nav tile aesthetic. Filters toggle on/off.
- **D-06:** Search input styled as flat monochrome field. Uses `nuqs` for URL query state (already in stack).

### Audio Player
- **D-07:** Dual player — sidebar "Now Playing" widget is the compact display (track name, artist, mini progress). Full bottom bar appears when a beat is actively playing with WaveSurfer.js waveform, full controls, and licensing CTA.
- **D-08:** Bottom bar sits above mobile tab bar. Can minimize back to sidebar-only mode.
- **D-09:** Player persists across page navigation via React context provider at root layout level.
- **D-10:** Sidebar widget and bottom bar are synced (same audio state, same track).

### Licensing & Pricing
- **D-11:** Modal comparison table — click "License" on a beat → modal with comparison table showing all tiers (MP3 Lease, WAV Lease, Stems, Unlimited, Exclusive). Each row shows what's included. User picks tier and adds to cart.
- **D-12:** License tiers: MP3 Lease, WAV Lease, Stems, Unlimited, Exclusive — each with different pricing, usage rights, and deliverables.
- **D-13:** Auto-generated PDF license agreement per tier on purchase (BEAT-05).

### Cart & Checkout
- **D-14:** Slide-out drawer cart — cart icon in nav shows item count badge. Click opens drawer from right with beat list, license tiers selected, totals, and "Checkout" button.
- **D-15:** Stripe Embedded Checkout for payment (handles PCI compliance, supports Apple Pay, Google Pay, PayPal).
- **D-16:** Guest checkout with optional account — buyers can purchase without an account. After purchase, offer to create account for download history access.

### Admin Beat Management
- **D-17:** Form-based admin page with drag-drop upload zones for audio files (MP3 preview, WAV, stems ZIP), MIDI files, and cover art. Uploadthing handles file storage.
- **D-18:** Beat form fields: title, BPM, key, genre, mood tags, description, license tier pricing.
- **D-19:** Co-producer splits as simple percentage inputs per beat. Add co-producers by name + percentage. Must total 100%. Display/tracking only — actual payouts handled manually or in a future phase.

### Claude's Discretion
- Database schema design for beats, licenses, cart, orders, downloads
- Stripe webhook handling for payment confirmation
- Signed URL generation for digital delivery
- Watermark audio processing approach (FFmpeg or pre-upload)
- Bundle/collection pricing logic
- Purchase receipt email template design (Resend + React Email)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.planning/DESIGN-LANGUAGE.md` — Cyberpunk Metro tile grid spec, monochrome palette, typography, spacing tokens
- `.planning/VISUAL-AUDIT-2026-03-25.md` — Visual defects and fixes applied in Phase 1.4

### Technology Stack
- `CLAUDE.md` §Technology Stack — Full stack decisions including WaveSurfer.js, Uploadthing, Stripe, nuqs, Drizzle ORM
- `CLAUDE.md` §Alternatives Considered — Why Neon over Supabase, Drizzle over Prisma, etc.

### Existing Code
- `src/db/schema.ts` — Current Drizzle schema (services, blog, portfolio, testimonials, users)
- `src/lib/db.ts` — Database client setup
- `src/lib/auth.ts` / `src/lib/auth-client.ts` — Better Auth server/client split
- `src/components/tiles/tile.tsx` — Base Tile component with layout/compact props
- `src/components/tiles/widget-now-playing.tsx` — Existing hardcoded Now Playing widget (to be replaced with real player)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Tile` component (src/components/tiles/tile.tsx): layout prop for horizontal/vertical, size variants — reuse for beat cards, filter chips, license tier cards
- `GlitchLogo` component: CSS glitch animation pattern — reuse for beat card hover effects
- Embla Carousel: already installed for portfolio/testimonials — could use for beat browsing on mobile
- `nuqs`: already in stack for URL query state — use for filter/search params
- Sonner: toast notifications for cart actions

### Established Patterns
- Server components with `force-dynamic` for DB queries
- Drizzle ORM with Supabase Postgres
- Monochrome hex palette (#000, #111, #222, #333, #555, #888, #f5f5f0)
- Sharp corners (rounded-none), flat tile aesthetic
- JetBrains Mono for headings, Inter for body

### Integration Points
- `/beats` route already exists as Coming Soon page (replace with real catalog)
- Sidebar "Now Playing" widget needs to connect to real audio player context
- Bottom tab bar needs cart icon addition
- Root layout needs audio player context provider
- Admin area needs new beat management pages

</code_context>

<specifics>
## Specific Ideas

- MIDI sequence visualization per instrument in expanded beat detail — piano-roll style with colored bars per track, parsed from uploaded .mid files using @tonejs/midi. Should look like a cyberpunk terminal/sequencer readout.
- Sidebar widget + bottom bar player are synced — same React context, same audio state. Sidebar is the "display", bottom bar is the "controller" with WaveSurfer.js waveform.
- The expanded beat detail row should feel like opening a control panel — MIDI sequences, waveform, license options all in one view.

</specifics>

<deferred>
## Deferred Ideas

- Full Stripe Connect payout integration for co-producer splits — currently tracking-only, payouts manual
- Spreadsheet-style bulk beat manager — start with single-beat form, bulk import later
- Audio watermarking automation — resolve FFmpeg vs pre-upload approach during planning
- Beat recommendation engine / algorithmic sorting

</deferred>

---

*Phase: 02-beat-store*
*Context gathered: 2026-03-25*
