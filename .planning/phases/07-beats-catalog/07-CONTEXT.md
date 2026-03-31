# Phase 7: Beats Catalog - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete overhaul of the beats catalog page to match industry leaders (BeatStars, Airbit, Traktrain, SoundCloud). The current page is rated 4/10 — scattered filters, tiny cover art, no visual impact. Redesign the beat display, filter UX, and overall page quality to the same standard as the homepage. Upload and test with a real beat (BREAK 5.mp3 by Trap Snyder).

</domain>

<decisions>
## Implementation Decisions

### Beat Display Format
- **D-01:** Claude's Discretion — research BeatStars, Airbit, Traktrain, SoundCloud and pick the best display approach. User specifically liked Airbit's clean player style.
- **D-02:** Must support a **toggle between card view and list view**. Card view for visual browsing (large cover art), list view for detailed tracklist with waveform visualization.
- **D-03:** The page needs a complete visual overhaul to match the quality level established in the homepage phases.

### Filter & Search UX
- **D-04:** Claude's Discretion — research best filter UX for beat marketplaces. User leans toward a **unified filter bar** (single horizontal row with dropdowns/controls) since the sidebar is already used for navigation. But research should confirm the best approach.
- **D-05:** All filters (genre, key, mood, BPM range) and search must be grouped cohesively — not scattered across multiple rows.

### Real Beat Testing
- **D-06:** Upload BREAK 5.mp3 to R2 and add it as a real beat via the admin dashboard. Test the full production flow (upload, catalog display, player, cart, checkout).
- **D-07:** Use Trap Snyder logo as cover art: `_RESOURECES/BEATS/TRAP_SNYDER/trap_snyder_logo.png`
- **D-08:** Both files must be uploaded to R2 during this phase for end-to-end testing.

### Design Language
- **D-09:** Must follow Cyberpunk Metro aesthetic — monochrome, flat, no rounded corners, glitch effects.
- **D-10:** Playwright verification at 1440px and 375px required.

### Claude's Discretion
- Exact beat card design and information density
- List view layout and waveform integration
- Filter bar design (dropdowns vs chips vs hybrid)
- Card/list toggle mechanism and default view
- Mobile layout for both views
- How to handle empty states and loading states

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Beats Page
- `src/app/(public)/beats/page.tsx` — Server component, data fetching, filter params
- `src/components/beats/beat-catalog.tsx` — Client wrapper with NuqsAdapter
- `src/components/beats/beat-list.tsx` — Current row list with expand/collapse
- `src/components/beats/beat-row.tsx` — Current beat row (40px art, title, BPM/key, price, play)
- `src/components/beats/beat-detail-panel.tsx` — Expanded row with waveform + license modal
- `src/components/beats/beat-search.tsx` — Search input with 300ms debounce
- `src/components/beats/beat-filters.tsx` — 3 rows of chips + BPM slider
- `src/components/beats/license-modal.tsx` — License tier selection + add to cart

### Player
- `src/components/player/audio-player-provider.tsx` — Shared audio context
- `src/components/player/player-bar.tsx` — Fixed bottom player bar

### Data
- `src/actions/beats.ts` — getPublishedBeats, getBeatFilterOptions
- `src/db/schema.ts` — beats, beatPricing, beatProducers tables

### Real Beat Files
- `_RESOURECES/BEATS/TRAP_SNYDER/BREAK 5.mp3` — First real beat (4.9MB MP3)
- `_RESOURECES/BEATS/TRAP_SNYDER/trap_snyder_logo.png` — Cover art (2.5MB PNG)

### Design Language
- `.planning/DESIGN-LANGUAGE.md` — Cyberpunk Metro design system

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AudioPlayerProvider` + `PlayerBar`: full player integration already working
- `LicenseModal`: license tier selection + cart integration
- `nuqs` URL state management for filters (debounced, shallow: false)
- `WaveSurfer.js` already installed and used in detail panel + player bar
- `Embla Carousel` available if card view needs horizontal scrolling
- `motion/react` for animations and transitions

### Established Patterns
- Server component page fetches data, passes to client BeatCatalog
- Filter state lives in URL params via nuqs
- Beat play triggers AudioPlayerProvider context
- Expand/collapse detail panel with motion height animation
- R2 upload via admin dashboard (existing upload-zone pattern)

### Integration Points
- Player bar is global (root layout) — beat play from any view triggers it
- Cart integration via LicenseModal → CartProvider context
- Admin beat CRUD at /admin/beats (create/edit/delete, file uploads)
- Homepage featured carousel references beats — changes here should be compatible

</code_context>

<specifics>
## Specific Ideas

- User specifically liked Airbit's clean player style — research and reference
- Card/list toggle is a must — user wants both views available
- "Waveform chart" in list view (user called it "the whole beat chart of music")
- Upload BREAK 5.mp3 + trap_snyder_logo.png to R2 via admin, not seed script
- Verify full flow: browse → play → license → cart → checkout with real beat

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-beats-catalog*
*Context gathered: 2026-03-30*
