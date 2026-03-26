# Phase 02 — UI Review

**Audited:** 2026-03-26
**Baseline:** 02-UI-SPEC.md (approved design contract)
**Screenshots:** Captured — desktop, mobile, tablet at localhost:3004

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Contract copy is 95% correct; "Add Bundle to Cart" and "Save with curated collections" are off-spec |
| 2. Visuals | 3/4 | Visual hierarchy and empty state render correctly; License Beat in PlayerBar is visually wired but functionally orphaned |
| 3. Color | 3/4 | Public-facing UI strictly monochrome; admin components introduce #ccc, #666, #4ade80, text-red-500 off the spec palette |
| 4. Typography | 3/4 | Custom pixel sizes correct in public UI; admin and some CTA buttons use Tailwind text-sm and text-lg instead of explicit pixel values |
| 5. Spacing | 4/4 | All spacing uses standard Tailwind scale or spec-required layout constants (72px player, 384px cart); no arbitrary spacing values |
| 6. Experience Design | 3/4 | Loading, empty, error states well-covered; PlayerBar "License Beat" CTA has no onClick handler (dead button); reduced-motion CSS-only, no Framer Motion variant |

**Overall: 19/24**

---

## Top 3 Priority Fixes

1. **PlayerBar "License Beat" button has no onClick handler** — A user who discovers a beat via the player bar and clicks "License Beat" gets no response. No modal opens, no navigation occurs. The button is visually correct but non-functional. Fix: pass `currentBeat` into a `LicenseModal` instance inside `PlayerBar` and toggle it on click (same pattern used in `BeatDetailPanel`). File: `src/components/player/player-bar.tsx` line 169–175.

2. **Admin components use off-spec colors (#ccc, #666, #ef4444, #4ade80, text-white)** — The design contract defines a strict 7-value monochrome palette. Admin tables and forms introduce `#ccc` (brighter than spec `#f5f5f0` foreground), `#666` (between spec's `#555` and `#888`), `#ef4444` (delete hover not in spec), `#4ade80` (green success checkmark, no color in the system), and `text-white` (pure white vs spec `#f5f5f0`). This creates inconsistency even in admin-only views and sets a precedent for color drift. Fix: Replace `#ccc` → `#f5f5f0`, `#666` → `#555` or `#888`, `#ef4444` → `#dc2626`, `#4ade80` → a text symbol or `#f5f5f0`, `text-white` → `text-[#f5f5f0]`. Files: beat-table.tsx, bundle-table.tsx, beat-form.tsx, upload-zone.tsx, bundle-form.tsx.

3. **Bundle section copy and CTA label are off-spec** — The UI-SPEC copywriting contract does not declare copy for bundle section body text or the add-to-cart button. The implemented text "Save with curated collections" (body) and "Add Bundle to Cart" (CTA) are reasonable, but the contract declares all CTA labels. The primary CTA for the bundle add should follow the inverted tile pattern and the label should match a declared style. "Add Bundle to Cart" also sets $0 price per item (`price: 0`) in `bundle-section.tsx` line 25, meaning cart subtotal is wrong until checkout. Fix: (a) Add bundle CTA to copywriting contract or align to declared pattern "Add to Cart"; (b) pass the actual `discountedTotal / beats.length` per-beat price so cart subtotal is accurate. File: `src/components/beats/bundle-section.tsx` line 24–25.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Passing — contract substantially met:**

- Page title: "BEATS" — matches spec exactly (`beats/page.tsx` line 43)
- Primary CTA (beat row): The spec declares "License Beat" — implemented as "License Beat" in `beat-detail-panel.tsx` line 113
- Primary CTA (player bar): "License Beat" — present in `player-bar.tsx` line 173
- Primary CTA (modal): "Select Tier" — matches spec (`license-modal.tsx` line 157)
- Primary CTA (cart): "Go to Checkout" — matches spec (`cart-drawer.tsx` line 156)
- Add to cart toast: `Added "${beat.title}" (${tierDef.displayName}) to cart` — matches spec format (`license-modal.tsx` line 73)
- Remove from cart toast: `Removed "${beatTitle}" from cart` — matches spec (`cart-drawer.tsx` line 27)
- Empty catalog (no filters): "Catalog coming soon" / "New beats are on the way. Check back soon for fresh releases." — exact match (`beat-list.tsx` lines 21–24)
- Empty catalog (filters active): "No matches for those filters" / "Try adjusting your filters or clearing them to see all available beats." — exact match (`beat-list.tsx` lines 19–26)
- Empty cart: "Your cart is empty" / "Browse beats and add your favorites to get started." — exact match (`cart-drawer.tsx` lines 59–63)
- Error (download failure): matches spec exactly (`purchase-history.tsx` lines 59–60)
- Error (checkout failure): "Payment didn't go through. Please try again or use a different payment method." — matches spec (`checkout/success/page.tsx` line 125–126)
- Delete confirmation: "This will permanently remove..." and "This cannot be undone." — matches spec (`beat-form.tsx` lines 469–470)
- Search placeholder: "Search beats..." — exact match (`beat-search.tsx` line 43)
- Filter clear: "Clear filters" — exact match (`beat-filters.tsx` line 177)
- SOLD label: "SOLD" — exact match (`license-modal.tsx` line 149)
- Guest post-purchase CTA: "Create an account to access your downloads anytime..." — matches spec intent (`checkout/success/page.tsx` line 220)

**Issues found:**

- `bundle-section.tsx` line 39: "Save with curated collections" — not in copywriting contract. The spec does not declare body copy for BundleSection. Minor, but breaks the contract completeness.
- `bundle-section.tsx` line 102: "Add Bundle to Cart" — not in copywriting contract. All CTAs should be declared.
- `checkout/page.tsx` line 35: "Your cart is empty. Add some beats first." — the spec declares the empty cart heading/body for the cart drawer specifically. The checkout page empty state is a new context not covered by the contract; copy is reasonable but not declared.
- Admin "Cancel" labels (`beat-table.tsx` line 172, `beat-form.tsx` line 479, bundle equivalents) — spec flags "Cancel" as generic. In a confirmation dialog context this is standard and defensible, but worth noting.

---

### Pillar 2: Visuals (3/4)

**Passing observations from screenshots:**

- Desktop `/beats`: Clear focal point at top-left (active BEATS nav tile inverted white). Filter area is visually subordinate. Empty state "CATALOG COMING SOON" uses correct heading weight and alignment.
- Visual hierarchy is correct: 40px page title, subordinate body copy below, filter controls clearly secondary.
- The PlayerBar renders at 72px with correct bottom positioning relative to the tab bar (CSS variable `--tab-bar-height`).
- Cart drawer at 384px desktop / full-width mobile — confirmed in code (`cart-drawer.tsx` line 35).
- Beat row cover art is 48x48 on desktop, 40x40 on mobile — matches spec exactly (`beat-row.tsx` lines 65–66).
- Playing accent bar (2px `#f5f5f0`) on current beat row — implemented (`beat-row.tsx` lines 60–62).
- Filter chip inversion on selection — implemented correctly (`beat-filters.tsx` lines 28–31).

**Issues found:**

- `player-bar.tsx` line 169–175: "License Beat" CTA button in PlayerBar has no `onClick` handler and no connection to a `LicenseModal`. When a user is browsing with the player minimized (or has not yet expanded a beat row), this button does nothing. This is the single largest experience gap in the player feature.
- `beat-detail-panel.tsx` line 111: The "License Beat" button uses `text-sm` (Tailwind default ~14px) while the spec declares this should match the 13px or 15px pattern. Minor visual inconsistency.
- Mobile screenshot: At 375px, the filter section only shows the BPM slider (no genre chips are populated because the catalog is empty). The scroll-hint gradient mask is in code but untestable without populated data.
- `bundle-section.tsx` line 56–57: Description uses `text-[13px]` — this size is not in the spec's 4-size type scale (11px / 15px / 28px / 40px). See typography pillar.

---

### Pillar 3: Color (3/4)

**Spec palette declared: #000000, #111111, #222222, #888888, #555555, #f5f5f0, #dc2626**

**Passing — public-facing components are strictly on-palette:**

- `beat-row.tsx`: `#111`, `#0a0a0a`, `#1a1a1a`, `#222`, `#444` hover, `#f5f5f0`, `#555`, `#333` — all within spec
- `beat-filters.tsx`: `#f5f5f0`, `#000`, `#222`, `#444`, `#888`, `#111` — on spec
- `player-bar.tsx`: `#111111`, `#222222`, `#f5f5f0`, `#888888`, `#000000`, `#333333` — on spec
- `cart-drawer.tsx`: All on spec. `#dc2626` used on hover for remove button — correct per spec
- `license-modal.tsx`: `#111`, `#222`, `#f5f5f0`, `#000`, `#555` — on spec
- WaveSurfer: `waveColor: "#555555"`, `progressColor: "#f5f5f0"` — matches spec exactly

**Off-spec colors identified (admin components):**

| File | Line | Value | Issue |
|------|------|-------|-------|
| `beat-table.tsx` | 109, 112, 115 | `text-[#ccc]` | Undeclared — between `#888` and `#f5f5f0`. Use `#f5f5f0` |
| `beat-table.tsx` | 140 | `hover:text-[#ef4444]` | Undeclared hover for destructive. Use `#dc2626` |
| `beat-table.tsx` | 177 | `text-white` | Should be `text-[#f5f5f0]` |
| `beat-form.tsx` | 349, 396 | `text-[#666]` | Between `#555` and `#888`; use `#555` or `#888` |
| `beat-form.tsx` | 418 | `text-red-500` | Tailwind semantic red, not spec `#dc2626` |
| `upload-zone.tsx` | 137 | `text-[#4ade80]` | Green — monochrome system has no green. Use `#f5f5f0` + checkmark symbol |
| `upload-zone.tsx` | 143 | `text-[#666]` | Same as above |
| `bundle-form.tsx` | 175, 200, 254 | `text-[#666]` | Off-spec mid-gray |
| `bundle-form.tsx` | 268 | `text-red-500` | Same as beat-form issue |
| `bundle-table.tsx` | 122 | `hover:text-[#ef4444]` | Use `#dc2626` |
| `bundle-table.tsx` | 159 | `text-white` | Use `text-[#f5f5f0]` |
| `player-bar.tsx` | 137, 222 | `hover:text-white` | Should be `hover:text-[#f5f5f0]` — spec foreground, not pure white |
| `purchase-history.tsx` | 103–112 | `text-[#666]` | Off-spec |
| `bundle-section.tsx` | 92–93 | `bg-[#333]` with `text-[#f5f5f0]` for discount badge | `#333` is not in the spec 7-value palette (nearest is `#222` or `#555`). Minor. |

Registry safety: `components.json` lists zero third-party registries. All shadcn components are official. Registry audit passes.

---

### Pillar 4: Typography (3/4)

**Spec declares:** 4 sizes (11px, 15px, 28px, 40px), 2 weights (400, 700), 2 fonts (Inter body, JetBrains Mono headings/labels).

**Passing — public components use correct explicit pixel sizes:**

- Beat title: `text-[15px] font-bold font-mono` — matches spec
- BPM/Key badges: `text-[11px] font-mono uppercase` — matches spec
- Genre/mood tags: `text-[11px] font-sans` — matches spec
- Price: `text-[15px] font-bold font-mono` — matches spec
- Filter chips: `text-[11px] font-mono uppercase tracking-[0.05em]` — matches spec
- Player bar track title: `text-[15px] font-bold font-mono` — matches spec
- Player bar artist: `text-[11px] font-sans` — matches spec
- Page title: `text-[40px] font-bold font-mono uppercase` — matches spec
- Section heading (BundleSection): `text-[28px] font-bold font-mono uppercase` — matches spec

**Issues found:**

- `beat-list.tsx` line 18: Empty state heading uses `text-lg` (Tailwind default, 18px) instead of explicit `text-[15px]` or `text-[28px]`. The spec does not define `text-lg`; the 4-size contract is violated.
- `beat-detail-panel.tsx` line 111: "License Beat" CTA uses `text-sm` (14px) instead of matching a declared size. The PlayerBar "License Beat" uses `text-[13px]` (also off-spec). Both should use `text-[11px]` or `text-[15px]` per the declared scale.
- Admin components (`beat-table.tsx`, `bundle-table.tsx`, `beat-form.tsx`, `bundle-form.tsx`, `upload-zone.tsx`): Pervasive use of `text-sm` throughout. This is a systematic deviation — admin is internally consistent, but does not match the 4-size spec.
- `bundle-section.tsx` line 56: `text-[13px]` for bundle description — undeclared size between 11px and 15px.
- `bundle-section.tsx` line 87: `text-[13px]` for original price strikethrough — same issue.
- `bundle-section.tsx` line 100: `text-[13px]` for bundle CTA — same.
- `purchase-history.tsx` line 93: `text-[12px]` — off-spec size.
- `purchase-history.tsx` line 96: `text-[14px]` — off-spec size.
- `purchase-history.tsx` line 126: `text-[13px]` — off-spec size.

Summary: Public beat catalog components correctly implement the 4-size spec. The bundle section and purchase history introduce 3 undeclared sizes (12px, 13px, 14px). Admin components use `text-sm` throughout as a consistent pattern, trading spec compliance for internal consistency.

---

### Pillar 5: Spacing (4/4)

**Passing — all spacing is on the Tailwind standard scale:**

- `beat-filters.tsx`: `gap-3`, `gap-4`, `gap-2`, `px-3`, `py-1.5` — all standard scale
- `beat-row.tsx`: `gap-3`, `gap-4`, `px-3`, `py-3`, `px-4` — standard scale
- `player-bar.tsx`: `px-4`, `gap-4`, `p-2`, `gap-2` — standard scale
- `cart-drawer.tsx`: `p-4`, `gap-3`, `py-3`, `p-8` — standard scale
- `beat-detail-panel.tsx`: `gap-6`, `px-4`, `py-6` — on spec (24px gap = lg token)
- Layout constants: Player bar `h-[72px]` — matches spec 72px. Cart drawer `w-[384px]` — matches spec 384px. Both are declared dimension constants, not spacing tokens, and are correct.
- The only arbitrary spacing found is `m-[var(--tab-bar-height,0px)]` which is a CSS variable reference for dynamic layout adjustment — appropriate and intentional.

No arbitrary pixel spacing values found in Phase 2 components. The scale is well-maintained throughout.

---

### Pillar 6: Experience Design (3/4)

**State coverage analysis:**

**Loading states:**
- `midi-piano-roll.tsx` line 53: Has local `loading` state with skeleton-style placeholder during MIDI parse
- `purchase-history.tsx` line 24: Per-item download loading state with `disabled` + cursor-wait
- No skeleton components on the `/beats` page itself — page is a server component with `force-dynamic`, so loading is at the Next.js page level (no custom skeleton UI for the beat list load)

**Error states:**
- `checkout/success/page.tsx`: Full error state with correct copy and retry CTA
- `purchase-history.tsx` lines 57–78: Error toast on download failure with correct spec copy
- `midi-piano-roll.tsx` line 100: Silent catch (no error display to user if MIDI fails to parse) — minor gap
- `beats/page.tsx`: No error boundary — if `getPublishedBeats()` throws, Next.js default error page renders. The spec declares "Couldn't load beats..." copy but there is no custom error.tsx for the beats route.

**Empty states:**
- Beat list (no filters / with filters): Both handled with correct spec copy — `beat-list.tsx` lines 15–29
- Cart drawer empty: Correct with CTA — `cart-drawer.tsx` lines 55–71
- Purchase history empty: Handled with CTA — `purchase-history.tsx` lines 31–45
- Admin tables empty: Both beat and bundle tables have empty state text

**Disabled states:**
- Play button disabled when no `previewAudioUrl` — `beat-row.tsx` line 127
- Download button disabled while loading — `purchase-history.tsx` line 154
- "Select Tier" disabled/replaced with "SOLD" for exclusive beats — `license-modal.tsx` lines 102–159

**Destructive action confirmations:**
- Beat delete: Dialog confirmation with exact spec copy — `beat-form.tsx` lines 461–470, `beat-table.tsx` line 172

**Animation contract compliance:**
- Beat row expand: `height: 0 → auto, opacity: 0 → 1, duration: 0.2, ease: easeOut` — matches spec exactly (`beat-detail-panel.tsx` lines 62–65)
- Player bar slide-up: `y: 72 → 0, duration: 0.2, ease: easeOut` — matches spec (`player-bar.tsx` lines 101–104)
- Cart item remove: `opacity: 0, height: 0, duration: 0.15` — matches spec 150ms (`cart-drawer.tsx` lines 81–85)
- `prefers-reduced-motion`: CSS rule in `globals.css` forces all transitions to 0.01ms — satisfies the contract requirement, though Framer Motion animations are not individually guarded with `useReducedMotion()`

**Critical gap — PlayerBar "License Beat" CTA:**
- `player-bar.tsx` lines 169–175: The "License Beat" button has no `onClick`, no `aria-label`, and no modal instance. A user who reaches the player bar through audio playback and wants to license the currently-playing beat has no functional path. This is the most significant experience gap in Phase 2.

---

## Registry Safety

Registry audit: 0 third-party blocks checked (none declared in UI-SPEC.md or `components.json`). All shadcn components are from the official registry. No flags.

---

## Files Audited

**Beat store public UI:**
- `src/app/(public)/beats/page.tsx`
- `src/app/(public)/checkout/page.tsx`
- `src/app/(public)/checkout/success/page.tsx`
- `src/app/(public)/dashboard/purchases/page.tsx`
- `src/components/beats/beat-catalog.tsx`
- `src/components/beats/beat-detail-panel.tsx`
- `src/components/beats/beat-filters.tsx`
- `src/components/beats/beat-list.tsx`
- `src/components/beats/beat-row.tsx`
- `src/components/beats/beat-search.tsx`
- `src/components/beats/bundle-section.tsx`
- `src/components/beats/license-modal.tsx`
- `src/components/beats/midi-piano-roll.tsx`
- `src/components/cart/cart-drawer.tsx`
- `src/components/cart/cart-icon.tsx`
- `src/components/cart/cart-provider.tsx`
- `src/components/dashboard/purchase-history.tsx`
- `src/components/player/audio-player-provider.tsx`
- `src/components/player/player-bar.tsx`

**Admin UI:**
- `src/components/admin/beats/beat-form.tsx`
- `src/components/admin/beats/beat-table.tsx`
- `src/components/admin/beats/upload-zone.tsx`
- `src/components/admin/bundles/bundle-form.tsx`
- `src/components/admin/bundles/bundle-table.tsx`

**Config:**
- `components.json`
- `src/styles/globals.css`

**Screenshots captured:**
- `.planning/ui-reviews/02-20260326-141613/beats-desktop.png` (1440x900)
- `.planning/ui-reviews/02-20260326-141613/beats-mobile.png` (375x812)
- `.planning/ui-reviews/02-20260326-141613/beats-tablet.png` (768x1024)
- `.planning/ui-reviews/02-20260326-141613/checkout-desktop.png` (1440x900)
- `.planning/ui-reviews/02-20260326-141613/dashboard-desktop.png` (1440x900, redirected to login)
