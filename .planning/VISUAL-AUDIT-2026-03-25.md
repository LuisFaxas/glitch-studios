# Visual Audit Report — 2026-03-25

**Auditor:** Claude (manual Playwright screenshot review)
**Site:** http://192.168.1.122:3004
**Viewports:** Desktop 1440x900, Mobile 390x844
**Pages tested:** / (home), /beats, /services, /portfolio, /about, /blog, /contact + mobile nav overlay + footer
**Overall Score: 4/10**

---

## CRITICAL Issues (Blocks credibility)

### C1. Logo Tile is Invisible
- **Where:** Desktop sidebar (top), Mobile nav overlay
- **What:** `LogoTile` renders `Untitled-2.png` as a background image. The PNG is **black text on white background**. The tile has `bg-[#111111]`. The logo blends into the dark tile — completely invisible.
- **Fix:** Either invert the logo with `filter: invert(1)` on dark backgrounds, or create a white-on-transparent version of the logo PNG.
- **Impact:** The brand identity tile — the single most important element — is a blank dark rectangle.

### C2. Home Page is Completely Empty
- **Where:** `/` — both desktop and mobile
- **What:** The entire main content area is pure black. The hero section renders a `bg-black` placeholder div (90vh) with a `GlitchLogo` text overlay and two CTA buttons — but the black-on-black gradient overlay makes everything nearly invisible. Below the hero, the services overview, carousels, and testimonials sections appear to render nothing (likely empty DB queries returning `[]`).
- **Evidence:** Desktop full-page screenshot shows sidebar + massive black void + footer at the very bottom. Mobile shows nothing but black + bottom tab bar.
- **Fix:** (a) Make hero visible with contrast — the GlitchLogo text + buttons need to be visible against the placeholder. (b) Add fallback/placeholder content for empty DB sections or hide them when empty.
- **Impact:** First impression is a broken/empty site. No user would stay.

### C3. Sidebar Nav Tiles Stack Icon Above Label (Vertical Layout)
- **Where:** Desktop sidebar, all nav tiles
- **What:** The `Tile` component uses `flex-col items-start` — this stacks icon on top, label below. Each tile wastes vertical space and reads like a button with a caption, not a compact metro tile. The design spec shows icon + label **side-by-side** (icon left, label right) like a Windows Metro tile. The vertical stacking makes tiles unnecessarily tall and the sidebar feels bloated.
- **Code:** `tile.tsx:53` — `flex flex-col items-start justify-start gap-2`
- **Fix:** Change to `flex-row items-center gap-3` for nav tiles. Icon and label should sit on the same horizontal line.
- **Impact:** Makes the sidebar feel amateur and wastes critical vertical space that pushes widgets and sign-in off screen.

### C4. Sidebar Has No Visible Scroll / Sign-In Hidden Off Screen
- **Where:** Desktop sidebar
- **What:** The sidebar content (logo + 6 nav tiles + separator + 4 widgets + sign-in button) exceeds viewport height on 900px screens. The Sign In button at the bottom is completely hidden. There is no scroll indicator, no scroll hint, no gradient fade at the bottom to suggest more content exists. The sidebar has `overflow-y-auto` but the scrollbar is invisible (likely browser default hidden scrollbar).
- **Fix:** (a) Reduce tile vertical size by switching to horizontal icon+label layout. (b) Add a subtle scroll hint (gradient fade or thin scrollbar styling). (c) Consider reducing sidebar padding to reclaim space.
- **Impact:** Auth/sign-in action is completely inaccessible without knowing to scroll.

### C5. Sidebar Padding Wastes Too Much Space
- **Where:** Desktop sidebar
- **What:** `tile-nav.tsx` uses `p-6` (24px all sides) on a 280px wide sidebar. That's 48px of horizontal padding, leaving only 232px for tile content. The tiles themselves add another `p-4` (16px) internally. Combined with the vertical icon stacking, tiles feel cramped inside yet the sidebar frame wastes space.
- **Fix:** Reduce sidebar padding to `p-3` (12px) or `px-3 py-4`. This gives tiles ~256px to work with — much more breathing room for horizontal icon+label layout.

### C6. Logo Tile Needs Glow Effect
- **Where:** Desktop sidebar, logo tile
- **What:** Even after fixing visibility (C1), the logo tile has a warm glow defined (`shadow-[0_0_15px_rgba(255,250,240,0.15)]`) but it's extremely subtle — nearly invisible against the dark background. The logo tile should be the visual anchor of the sidebar with a noticeable warm glow that makes it feel "powered on."
- **Fix:** Increase glow intensity (e.g., `0 0 25px rgba(255,250,240,0.25)`) and consider adding a second larger glow ring (`0 0 50px rgba(255,250,240,0.08)`).

### C7. No Hover Styling / Glitch Effect Visible on Tiles
- **Where:** Desktop sidebar tiles
- **What:** The glitch hover animation applies `animate-glitch-hover` to an overlay `<span>` on hover, but this overlay has no background color — it's an invisible span with clip-path animation on nothing. The tile itself only changes background from `#111` to `#1a1a1a` and border from `#222` to `#444` — this is nearly imperceptible. The scan line is similarly invisible (1px white line at 10% opacity). The "showstopper" hover effect described in the design spec is functionally invisible.
- **Code:** The glitch overlay span in `tile.tsx:84-88` animates clip-path but has no visible content to distort. The actual tile content (icon + label) doesn't participate in the glitch animation.
- **Fix:** The glitch overlay needs to duplicate the tile content (or use a pseudo-element approach) so the clip-path actually distorts visible content. Or apply the animation directly to the tile content wrapper. The hover bg/border change also needs more contrast.
- **Impact:** The signature interaction — the thing that makes the site feel like "Glitch Studios" — is completely missing visually.

### C8. No Sidebar Collapse / Compact Mode
- **Where:** Desktop sidebar
- **What:** The sidebar is fixed at 280px with no way to collapse or minimize it. On smaller desktop screens (1024-1280px), this eats 20-27% of the viewport. There is no toggle, no icon-only compact mode, no responsive breakpoint that shrinks it.
- **Fix:** Add an icon-only compact mode (~64px wide) with a toggle, or make the sidebar responsive (full tiles on >1280px, icon-only on 1024-1280px, hidden on <1024px).

### C9. Two Major Routes Return 404
- **Where:** `/beats` and `/about`
- **What:** Both show the custom 404 page ("GLITCH 404 PAGE NOT FOUND"). The sidebar links to `/beats` and `/artists` (labeled "About"). There is no `/beats/page.tsx` — beats is a Phase 2 feature. `/about` doesn't exist; the "About" tile links to `/artists` which does exist.
- **Fix:** (a) Remove or disable the Beats tile until Phase 2 builds it, or create a placeholder "Coming Soon" page. (b) The About→Artists mapping works but is confusing — sidebar labels "About" but routes to `/artists`. Decide: rename the tile to "Artists" or create an `/about` page.
- **Impact:** 2 of 6 navigation tiles lead to dead ends. That's 33% of the nav broken.

---

## MAJOR Issues (Significantly hurts quality)

### M1. Social Widget Missing from Sidebar
- **Where:** Desktop sidebar, bottom of widget section
- **What:** The `WidgetSocial` component (4 small icon tiles) is partially visible or cut off at the bottom of the sidebar. In the sidebar detail screenshot it's barely visible — just the top edges of 4 tiny boxes. The sidebar doesn't scroll properly to reveal them, or they're clipped.
- **Fix:** Ensure sidebar `overflow-y-auto` works and the social widget is fully visible, or move it above other widgets.

### M2. Footer Uses Non-Monochrome Design Language
- **Where:** Footer on all pages (desktop and mobile)
- **What:** Footer uses `bg-gray-900`, `border-gray-800`, `text-gray-400` — these are Tailwind default grays, not the monochrome hex palette (`#111`, `#222`, `#888`, `#f5f5f0`) established by the design language. It also uses rounded "Join the List" button which violates the sharp-corner rule.
- **Evidence:** Footer visually feels like a different site — generic dark footer, not Cyberpunk Metro.
- **Fix:** Restyle footer to match tile aesthetic: monochrome hex colors, sharp corners on all elements, mono font for headings.

### M3. Services Page — Detail Panel Doesn't Open
- **Where:** `/services` desktop
- **What:** Clicking a service tile doesn't visually change anything in the screenshots. The "Studio Session" tile appears to have a white background (selected state) on initial load, but no detail panel is visible on the right side. The master-detail layout doesn't appear to be working — the entire page content fits in one viewport with just the tile grid visible.
- **Fix:** Verify the service detail panel renders with real content. May need DB-seeded service data with descriptions, features, and pricing.

### M4. Mobile Nav Overlay Opens But Shows Nothing
- **Where:** Mobile, after tapping center grid icon
- **What:** The nav overlay screenshot is identical to the home page — pure black with bottom tab bar. The overlay either isn't rendering content, or it's rendering the same invisible elements (logo tile invisible, no content visible).
- **Fix:** Debug overlay rendering. Ensure nav tiles, widgets, and logo are visible against the dark background.

### M5. Blog Cards Have No Images
- **Where:** `/blog` desktop and mobile
- **What:** Blog post cards show large dark gray rectangles where featured images should be. The cards themselves work (title, excerpt, date, category tag visible) but the image placeholder areas are ~60% of each card's height and are just flat dark boxes.
- **Fix:** Either add placeholder images (even generated patterns/gradients) or restructure cards to be text-only when no image exists.

### M6. Portfolio Page Uses Placeholder Content
- **Where:** `/portfolio` desktop and mobile
- **What:** Rick Astley "Never Gonna Give You Up" is the portfolio content — clearly placeholder data. The video cards themselves look decent (image fills card, text overlay at bottom, category tags) but the content undermines credibility.
- **Fix:** This is expected for dev, but should be noted for when real content is added. The carousel presentation is reasonable.

---

## MODERATE Issues (Polish & consistency)

### P1. Typography Inconsistencies
- **Where:** Footer, contact form, blog filter tabs
- **What:** Several elements use default Tailwind text classes instead of the design system's JetBrains Mono (headings) + Inter (body) pattern. Blog filter tabs ("All", "News", "Behind the Scenes") use mixed styling. Footer nav links use generic `text-sm text-gray-400` instead of mono uppercase.
- **Fix:** Audit all text elements for font-family consistency.

### P2. Contact Form Doesn't Match Tile Aesthetic
- **Where:** `/contact`
- **What:** The form card has a subtle dark background but uses default-looking input styling. The "Send Message" button appears to be a generic dark button, not an inverted white tile as specified in the design language. The form container has visible rounded corners.
- **Fix:** Restyle inputs (flat, 0px radius, 1px `#333` border, white border on focus), make submit button an inverted tile (white bg, black text, sharp corners).

### P3. Active Page Tile Inversion Works But Is Subtle
- **Where:** Desktop sidebar on `/services`, `/portfolio`, `/blog`, `/contact`
- **What:** The active tile does invert (white bg, black text) — verified on Services, Portfolio, Blog, Contact screenshots. However, the effect is quite subtle because the tiles are small and the white inversion doesn't have much visual weight compared to the large dark content area.
- **Fix:** Consider adding the subtle glow shadow (`0 0 20px rgba(255,255,255,0.08)`) if not already present, and ensuring the active tile has slightly more visual prominence.

### P4. Bottom Tab Bar — No Active State on Home
- **Where:** Mobile home page
- **What:** On the home page (`/`), none of the 5 bottom tab icons show an active/inverted state. Home isn't in the tab bar (it's accessed via the center grid menu). This means on the landing page, the tab bar looks inactive/disconnected.
- **Fix:** Consider making the center grid icon active/inverted when on home, or add a visual indicator for the current section.

### P5. Footer Social Icons Are Generic Globes
- **Where:** Footer on all pages
- **What:** Social links in footer show Globe and ExternalLink icons instead of platform-specific icons. This is a known Lucide limitation (brand icons removed), but the visual result is 3 nearly identical globe icons that don't communicate which platform they link to.
- **Fix:** Use SVG brand icons from a different source (e.g., simple-icons), or add text labels next to the generic icons.

### P6. Services Mobile — Accordion Layout Lacks Visual Hierarchy
- **Where:** `/services` mobile
- **What:** Services are listed as flat text blocks with no visual tile treatment. Each service shows name + description in a simple list format. No borders, no tile backgrounds, no visual separation except vertical spacing. Doesn't feel like the tile design language at all.
- **Fix:** Wrap each accordion item in a tile-styled container (dark bg, border, sharp corners).

---

## MINOR Issues

### N1. Page Padding on Desktop
- Content pages (blog, contact, services) have inconsistent left padding from the sidebar edge. Some pages feel cramped against the sidebar, others have generous spacing.

### N2. Blog Category Filter Pills
- The "All" filter tab has a different background than inactive tabs on desktop but uses a white bg that's slightly rounded — conflicts with sharp-corner rule.

### N3. No Loading/Skeleton States
- Pages that query the DB (home, blog, portfolio) show no loading indicators or skeleton placeholders during server render.

### N4. Home Page "Back to Home" on 404
- The 404 page's "Back to Home" button has subtle rounded corners visible in the screenshot.

---

## What's Working Well

1. **Sidebar tile grid layout** — The Metro grid with mixed tile sizes (wide, medium, small) reads as a dashboard, not a link list. The 2-col grid works.
2. **Glitch hover animations** — The `animate-glitch-hover` and `animate-scan-line` keyframes are implemented in CSS. Can't verify visually from static screenshots but code is correct.
3. **Active tile inversion** — The white bg / black text inversion on current page is implemented and visible.
4. **Widget system** — Now Playing, Studio Status, and Latest Post widgets all render with real content and proper tile styling.
5. **Page transition glitch** — `template.tsx` implements the Framer Motion glitch overlay on route change.
6. **Portfolio video cards** — Good use of image fills, text overlays, and category tags in the Embla carousel.
7. **Blog page structure** — Category filters + card grid is a solid foundation.
8. **Contact form** — Functional with proper labels, validation hints, and service dropdown.
9. **Mobile bottom tab bar** — Clean icon-only tiles with proper active inversion, good touch targets.

---

## Priority Ranking for Next Phase

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 1 | C2: Home page empty/invisible | Blocks all first impressions | Medium |
| 2 | C1: Logo tile invisible | Brand identity missing | Low |
| 3 | C3: /beats and /about 404 | 33% nav broken | Low-Medium |
| 4 | M4: Mobile nav overlay empty | Mobile nav broken | Medium |
| 5 | M2: Footer non-monochrome | Design inconsistency | Low |
| 6 | M3: Services detail panel | Feature incomplete | Medium |
| 7 | M5: Blog card images | Visual emptiness | Low |
| 8 | P2: Contact form styling | Design inconsistency | Low |
| 9 | P6: Services mobile accordion | Design inconsistency | Low |
| 10 | P1: Typography audit | Polish | Low |

---

*Audit completed: 2026-03-25*
*Screenshots: .planning/audit-screenshots/*
