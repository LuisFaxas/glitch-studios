# Glitch Studios — Design Language Specification

> **Style:** Cyberpunk Metro — Dark Brutalist Grid
> **Influences:** Metro Design Language (Microsoft), Neo-Brutalism, Swiss Typographic Grid, Cyberpunk Aesthetic
> **References:** resn.co.nz (dark tile portfolio), hoverstat.es (tile grid gallery), locomotive.ca (premium dark nav), activetheory.net (canvas-driven dark UI), Slider Revolution Cyber Glitch (glitch transitions)
> **Palette:** Strictly monochrome — no accent colors. Black, white, grays only.

---

## 1. Design Philosophy

### Core Principles
1. **Tiles are the UI.** Navigation is not a list of links — it's a grid of thick, expressive, flat tiles. Every major interaction happens through tiles.
2. **Monochrome only.** Pure black `#000`, off-white `#f5f5f0`, and grays (`#111`, `#222`, `#555`, `#888`). No accent colors. Hierarchy comes from size, weight, and motion — not color.
3. **Flat and raw.** No gradients, no rounded corners beyond 2px, no drop shadows. Depth comes from borders, contrast, and animation.
4. **Glitch is the brand.** Clip-path distortion, horizontal scan shifts, and typographic jitter are the signature motion language. Used on hover, transitions, and load states.
5. **The sidebar is a control panel.** Not a nav list — a vertical dashboard packed with tiles and widgets that makes the studio feel alive.

### Mood
- A terminal crossed with a recording studio control surface
- Windows 8 Start Screen if it was designed by a cyberpunk studio
- Clean enough to be professional, raw enough to be memorable

---

## 2. Layout System

### Grid Foundation
- **Base unit:** 4px grid for all spacing
- **Tile grid:** CSS Grid with `repeat(auto-fill, minmax(size, 1fr))` — tiles snap to a modular grid
- **Gap:** 2px-4px between tiles (tight, like Metro — tiles almost touch)
- **No rounded corners:** 0px or max 2px border-radius. Tiles are sharp rectangles.

### Page Structure (Desktop)
```
┌─────────────────────┬──────────────────────────────────────────┐
│                     │                                          │
│   SIDEBAR           │   MAIN CONTENT                           │
│   (280px fixed)     │   (fluid)                                │
│                     │                                          │
│  ┌───────────────┐  │                                          │
│  │  GLITCH LOGO  │  │                                          │
│  │  (tile)       │  │                                          │
│  ├───────┬───────┤  │                                          │
│  │ BEATS │SERVICES│  │                                          │
│  │       │       │  │                                          │
│  ├───────┴───────┤  │                                          │
│  │  PORTFOLIO    │  │                                          │
│  │  (wide tile)  │  │                                          │
│  ├───────┬───────┤  │                                          │
│  │ ABOUT │ BLOG  │  │                                          │
│  │       │       │  │                                          │
│  ├───────┴───────┤  │                                          │
│  │  CONTACT      │  │                                          │
│  │  (wide tile)  │  │                                          │
│  ├───────────────┤  │                                          │
│  │               │  │                                          │
│  │  WIDGETS      │  │                                          │
│  │  - Now Playing│  │                                          │
│  │  - Studio     │  │                                          │
│  │    Status     │  │                                          │
│  │  - Social     │  │                                          │
│  │  - Latest     │  │                                          │
│  │    Post       │  │                                          │
│  │               │  │                                          │
│  └───────────────┘  │                                          │
│                     │                                          │
│  [Sign In]          │                                          │
└─────────────────────┴──────────────────────────────────────────┘
```

### Page Structure (Mobile)
- Sidebar collapses completely
- Bottom tab bar with icon-only tiles (same visual language)
- Full-screen tile grid for main navigation accessible via hamburger or swipe

---

## 3. Tile System

### Tile Anatomy
```
┌─────────────────────────┐
│                         │
│  ICON (Lucide, 20px)    │
│                         │
│  LABEL                  │
│  (JetBrains Mono,       │
│   uppercase, bold)      │
│                         │
│  sublabel (optional)    │
│  (Inter, sm, gray-400)  │
│                         │
└─────────────────────────┘
```

### Tile Sizes (Metro-style mixed grid)
| Size | Dimensions | Use |
|------|-----------|-----|
| **Small** | 1x1 (equal width/height) | Secondary nav items, widget indicators |
| **Medium** | 2x1 (double width) | Primary nav items (Services, Portfolio) |
| **Large** | 2x2 (full width, double height) | Logo tile, featured content, hero widget |
| **Wide** | 2x1 (full sidebar width) | Contact CTA, now playing widget |

### Tile States

**Default:**
- Background: `#111` (gray-900)
- Border: 1px solid `#222` (gray-800)
- Text: `#f5f5f0` (off-white)
- No shadow, no glow

**Hover — THE SHOWSTOPPER:**
- Background shifts to `#1a1a1a` (subtle lift)
- Border brightens to `#444`
- **Glitch effect activates:** tile content (label + icon) gets a 150ms clip-path jitter animation
- **Scan line:** a horizontal white line (1px, `rgba(255,255,255,0.1)`) sweeps top-to-bottom across the tile (300ms)
- **Text distortion:** label shifts 1-2px horizontally with a brief RGB split (white text gets offset copies at low opacity)
- Transition: `cubic-bezier(0.215, 0.61, 0.355, 1)` — fast in, smooth out

**Active/Current Page:**
- Background: `#f5f5f0` (inverted — white tile)
- Text: `#000` (black)
- Border: 1px solid `#f5f5f0`
- Subtle glow: `0 0 20px rgba(255,255,255,0.08)`
- NO glitch on current — it's "locked in"

**Pressed:**
- Scale: `transform: scale(0.97)` — quick 100ms press-in
- Background: `#0a0a0a`

---

## 4. Sidebar Widgets

The sidebar is not just navigation. Below the nav tiles, widgets make the studio feel alive:

### Widget: Now Playing
```
┌─────────────────────────┐
│  ▶  Track Name           │
│     Artist — 2:34/4:12   │
│  ━━━━━━━━━━━━░░░░░░░░░  │
└─────────────────────────┘
```
- Shows currently previewed beat (ties into future audio player)
- Waveform or progress bar in white on dark
- Pulses subtly when playing

### Widget: Studio Status
```
┌─────────────────────────┐
│  ● STUDIO OPEN           │
│  Next available: 2pm     │
└─────────────────────────┘
```
- Simple status indicator (dot + label)
- Dot: white when open, gray-600 when closed
- Could pull from a simple CMS field or be hardcoded initially

### Widget: Latest Post
```
┌─────────────────────────┐
│  LATEST                  │
│  "5 Vocal Recording      │
│   Tips for Home..."      │
│  Mar 10, 2026            │
└─────────────────────────┘
```
- Shows most recent blog post title (truncated)
- Links to the post
- Monochrome, text-only

### Widget: Social Links
```
┌──────┬──────┬──────┬──────┐
│  IG  │  YT  │  SC  │  X   │
└──────┴──────┴──────┴──────┘
```
- 4 small square tiles in a row
- Icon-only (Lucide icons)
- Each tile gets independent glitch hover

---

## 5. Typography

### Font Stack
| Role | Font | Weight | Style |
|------|------|--------|-------|
| Headings, labels, nav | JetBrains Mono | 700 | Uppercase, letter-spacing: 0.05em |
| Body text | Inter | 400 | Normal case |
| Code/data | JetBrains Mono | 400 | Normal case |

### Scale
| Token | Size | Use |
|-------|------|-----|
| `text-xs` | 11px | Widget sublabels, timestamps |
| `text-sm` | 13px | Tile sublabels, card metadata |
| `text-base` | 15px | Body text, descriptions |
| `text-lg` | 18px | Tile labels (sidebar nav) |
| `text-xl` | 22px | Section subheadings |
| `text-2xl` | 28px | Section headings |
| `text-4xl` | 40px | Page titles |
| `text-6xl` | 64px | Hero "GLITCH" |

---

## 6. Glitch Animation System

### Glitch Hover (tiles, buttons, interactive elements)
```css
@keyframes glitch-hover {
  0%   { clip-path: inset(0 0 0 0); transform: translate(0); }
  20%  { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 0); }
  40%  { clip-path: inset(60% 0 10% 0); transform: translate(2px, 0); }
  60%  { clip-path: inset(40% 0 30% 0); transform: translate(-1px, 0); }
  80%  { clip-path: inset(80% 0 5% 0); transform: translate(1px, 0); }
  100% { clip-path: inset(0 0 0 0); transform: translate(0); }
}
/* Duration: 200ms, timing: steps(1), plays once on hover */
```

### Scan Line (tile hover accent)
```css
@keyframes scan-line {
  0%   { top: -1px; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
/* A 1px white line sweeps down the tile. Duration: 400ms */
```

### Page Transition Glitch
- On route change: main content area gets a 200ms full-area glitch (clip-path + translate)
- Content fades in after glitch clears
- Framer Motion `layoutId` for shared tile-to-page animations

### Reduced Motion
- All glitch animations respect `prefers-reduced-motion: reduce`
- Fallback: simple opacity fade (200ms)

---

## 7. Component Patterns

### Page Headers
- No traditional hero banners
- Page title as large uppercase JetBrains Mono text, left-aligned
- Optional 1-line description in Inter below
- Horizontal rule (1px `#222`) separating header from content

### Content Cards (portfolio, blog, artists)
- Flat dark tiles matching sidebar tile visual language
- Tight 2-4px gap grid
- Image fills tile completely (no padding inside card for image)
- Text overlay at bottom with dark gradient fade OR text below image
- Hover: same glitch system as nav tiles but subtler (100ms, less displacement)

### Service Tiles (services page)
- Replace current tab UI with tile grid
- Each service is a large tile (can be mixed sizes)
- Selected service tile inverts (white bg, black text)
- Service detail expands below or beside the grid (no page change)

### Forms (contact, auth)
- Inputs: flat, no border-radius, 1px `#333` border
- Focus state: border goes white, subtle white glow
- Buttons: flat tiles — same visual as nav tiles
- Primary button: inverted (white bg, black text)

---

## 8. Spacing Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--gap-tile` | 2px | Between tiles in a grid |
| `--gap-section` | 48px | Between page sections |
| `--pad-tile` | 16px | Internal tile padding |
| `--pad-page` | 24px | Page content margin |
| `--sidebar-width` | 280px | Fixed sidebar width (desktop) |

---

## 9. What NOT to Do

- **No rounded corners** beyond 2px — this is flat, sharp, brutalist
- **No color accents** — resist the urge to add cyan, neon green, or purple. The monochrome IS the brand.
- **No soft shadows** — use borders and contrast for depth, not box-shadow blur
- **No thin/delicate UI** — tiles should feel chunky, thick, substantial
- **No generic hover states** — every hover should have some glitch energy, even if subtle
- **No empty space in the sidebar** — if there's room, add a widget. The sidebar should feel packed and alive.
- **No gradients** on UI elements — flat fills only. Gradients only allowed on image overlays.

---

## 10. Implementation Priority

### Phase 1: Sidebar + Tile Nav (highest impact)
1. Replace sidebar link list with tile grid layout
2. Implement tile sizes (small, medium, wide)
3. Add glitch hover animation to all tiles
4. Implement active/current page tile inversion
5. Add widgets below nav tiles (now playing, studio status, latest post, social)

### Phase 2: Page-Level Tile Language
1. Convert service tabs to service tile grid
2. Apply tile card style to portfolio, blog, artist grids
3. Flatten all cards to match tile visual language (sharp corners, tight gaps)
4. Add page transition glitch

### Phase 3: Polish + Motion
1. Scan line hover effect
2. RGB split text distortion on hover
3. Shared layout animations (tile-to-page transitions)
4. Mobile tile grid navigation
5. Micro-interactions (pressed states, loading glitch)

---

## 11. Acceptance Criteria

The design overhaul is successful when:
- [ ] The sidebar immediately reads as a "tile dashboard" not a "nav list"
- [ ] Hovering any tile triggers visible glitch distortion
- [ ] Current page tile is clearly inverted (white on black)
- [ ] At least 3 widgets are visible below nav tiles at all times
- [ ] Every page's content cards follow the tile visual language
- [ ] Zero accent colors exist anywhere in the UI
- [ ] The site feels like a creative studio control panel, not a generic SaaS app
