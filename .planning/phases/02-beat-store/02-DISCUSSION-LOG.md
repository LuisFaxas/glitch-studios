# Phase 2: Beat Store - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 02-beat-store
**Areas discussed:** Beat browsing, Filters, Player, Licensing, Cart & Checkout, Admin

---

## Beat Browsing Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Card grid | Album-art-sized cards in a grid | |
| List rows | Horizontal rows with waveform, dense info | |
| Hybrid | List rows that expand into detail card on click | ✓ |

**User's choice:** Hybrid — but with a holistic approach. Expanded detail should show per-instrument MIDI sequences (piano-roll visualization). Sidebar widget should work as the real player. User asked to research @tonejs/midi for parsing .mid files.
**Notes:** User emphasized: "if you could show on expand, a visual beat sequence, show each midi file per instrument on the expansion"

---

## Filters & Search

| Option | Description | Selected |
|--------|-------------|----------|
| Tile filter bar | Horizontal tile-styled chips matching nav aesthetic | ✓ |
| Sidebar filters | Filters in left sidebar below widgets | |
| Dropdown filters | Traditional dropdown selects | |

**User's choice:** Tile filter bar (Recommended)

---

## Audio Player

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom bar player | Fixed bar at bottom with waveform | |
| Sidebar widget player | Existing Now Playing widget becomes real player | |
| Both — sidebar + bottom bar | Sidebar = display, bottom bar = controller | ✓ |

**User's choice:** Both — likes the sidebar player but also wants the full bottom bar. Research best approach.
**Notes:** Dual synced player decided: sidebar compact display + bottom bar full waveform controller.

---

## Licensing & Pricing

| Option | Description | Selected |
|--------|-------------|----------|
| Modal comparison table | Click License → modal with tier comparison | ✓ |
| Inline expansion | Tiers expand below beat row | |
| Dedicated license page | Full /beats/[slug] page | |

**User's choice:** Modal comparison table (Recommended)

---

## Cart & Checkout

| Option | Description | Selected |
|--------|-------------|----------|
| Slide-out drawer | Cart icon → right drawer with items + checkout | ✓ |
| Dedicated cart page | Full /cart page | |
| Quick checkout | No cart, buy one at a time | |

**User's choice:** Slide-out drawer (Recommended)

### Auth for Checkout

| Option | Description | Selected |
|--------|-------------|----------|
| Guest checkout with optional account | Buy without account, offer account after | ✓ |
| Login required | Must log in before checkout | |
| Guest for small, login for exclusive | Tiered auth requirement | |

**User's choice:** Guest checkout with optional account (Recommended)

---

## Admin Beat Management

| Option | Description | Selected |
|--------|-------------|----------|
| Form-based with drag-drop | Admin form with file upload zones | ✓ |
| Spreadsheet-style bulk | Table with inline editing + CSV import | |
| CLI/API only | No admin UI | |

**User's choice:** Form-based with drag-drop uploads (Recommended)

### Co-Producer Splits

| Option | Description | Selected |
|--------|-------------|----------|
| Simple percentage inputs | Name + percentage per beat, tracking only | ✓ |
| Full payout integration | Stripe Connect auto-payouts | |
| Notes field only | Free-text split notes | |

**User's choice:** Simple percentage inputs (Recommended)

---

## Claude's Discretion

- Database schema design
- Stripe webhook handling
- Signed URL generation
- Watermark processing approach
- Bundle pricing logic
- Email template design

## Deferred Ideas

- Stripe Connect auto-payouts for co-producers
- Bulk beat import/manager
- Audio watermarking automation
- Beat recommendation engine
