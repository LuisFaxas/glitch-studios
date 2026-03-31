# Phase 7: Beats Catalog - Research

**Researched:** 2026-03-30
**Domain:** UI/UX overhaul of beat catalog page (card/list views, unified filter bar, industry-standard layout)
**Confidence:** HIGH

## Summary

Phase 7 is a UI-only overhaul of the existing beats catalog page. All backend infrastructure is already complete -- server actions, database schema, filter logic, audio player, license modal, cart integration, and WaveSurfer.js waveform rendering all work. The task is purely about replacing the current scattered filter chips and minimal list view with an industry-standard dual-view (card + list) layout with a unified filter bar.

The existing codebase provides strong foundations: nuqs for URL state, AudioPlayerProvider for playback, AnimatePresence for transitions, and all shadcn components needed (select, slider, badge, skeleton, tooltip, button, input) are already installed. The main work is creating 3-4 new components (beat-card, beat-card-grid, filter-bar, view-toggle) and redesigning 3 existing ones (beat-row, beat-filters/search merged into filter-bar, beat-catalog to support view switching).

**Primary recommendation:** Follow the 07-UI-SPEC.md design contract exactly. Build card view first (new components), then adapt list view (redesign existing), then build the unified filter bar, and finally handle the real beat upload to R2 for end-to-end testing.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Claude's Discretion -- research BeatStars, Airbit, Traktrain, SoundCloud and pick the best display approach. User specifically liked Airbit's clean player style.
- D-02: Must support a toggle between card view and list view. Card view for visual browsing (large cover art), list view for detailed tracklist with waveform visualization.
- D-03: The page needs a complete visual overhaul to match the quality level established in the homepage phases.
- D-04: Claude's Discretion -- research best filter UX for beat marketplaces. User leans toward a unified filter bar (single horizontal row with dropdowns/controls) since the sidebar is already used for navigation. But research should confirm the best approach.
- D-05: All filters (genre, key, mood, BPM range) and search must be grouped cohesively -- not scattered across multiple rows.
- D-06: Upload BREAK 5.mp3 to R2 and add it as a real beat via the admin dashboard. Test the full production flow (upload, catalog display, player, cart, checkout).
- D-07: Use Trap Snyder logo as cover art: `_RESOURECES/BEATS/TRAP_SNYDER/trap_snyder_logo.png`
- D-08: Both files must be uploaded to R2 during this phase for end-to-end testing.
- D-09: Must follow Cyberpunk Metro aesthetic -- monochrome, flat, no rounded corners, glitch effects.
- D-10: Playwright verification at 1440px and 375px required.

### Claude's Discretion
- Exact beat card design and information density
- List view layout and waveform integration
- Filter bar design (dropdowns vs chips vs hybrid)
- Card/list toggle mechanism and default view
- Mobile layout for both views
- How to handle empty states and loading states

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BEATS-01 | Beat catalog has industry-standard layout with prominent cover art on each beat card | Card view with 1:1 cover art as primary visual element, 3/2/1 column grid. UI-SPEC defines exact card anatomy. |
| BEATS-02 | Search and filter controls are grouped and intuitive, not scattered across the page | Unified horizontal filter bar component replaces 3 scattered chip rows + separate search. All controls in one sticky bar. |
| BEATS-03 | Mood tags are organized and visually clean, not chaotic | Mood tags rendered as subtle comma-separated text or minimal pills within card info section, limited to 2 visible. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Next.js | 16.2.x | App Router, Server Components | Installed |
| Tailwind CSS | 4.2.x | Utility-first CSS | Installed |
| motion | 12.38.0 | AnimatePresence for view toggle crossfade | Installed |
| nuqs | 2.8.9 | URL state for filters + view toggle param | Installed |
| wavesurfer.js | 7.12.5 | Waveform visualization in list rows | Installed |
| embla-carousel-react | 8.6.0 | Bundle section carousel | Installed |
| Lucide React | latest | LayoutGrid, List, Play, Pause, Music, Search icons | Installed |

### shadcn Components (Already Installed)
| Component | Usage |
|-----------|-------|
| select | Genre, Key, Mood filter dropdowns |
| slider | BPM range dual-thumb slider |
| badge | BPM, Key metadata badges |
| skeleton | Loading state placeholders |
| tooltip | View toggle labels |
| button | Play/pause, clear filters |
| input | Search input in filter bar |
| dialog + drawer | License modal (existing) |

**Installation:** Nothing new to install. All dependencies are present.

## Architecture Patterns

### Component Structure (Changes)

```
src/components/beats/
  beat-card.tsx          NEW  -- Card view beat display
  beat-card-grid.tsx     NEW  -- CSS Grid container for cards
  view-toggle.tsx        NEW  -- Card/list toggle buttons
  filter-bar.tsx         NEW  -- Unified horizontal filter bar (replaces beat-filters + beat-search)
  beat-catalog.tsx       REDESIGN  -- Add view state, render card-grid or beat-list
  beat-row.tsx           REDESIGN  -- Larger cover art (56px), producer name, waveform strip
  beat-list.tsx          MINOR  -- Add column headers, wrap rows
  beat-detail-panel.tsx  KEEP  -- No changes needed
  license-modal.tsx      KEEP  -- No changes needed
  beat-filters.tsx       DELETE  -- Replaced by filter-bar.tsx
  beat-search.tsx        DELETE  -- Merged into filter-bar.tsx
  bundle-section.tsx     KEEP  -- No changes needed
  midi-piano-roll.tsx    KEEP  -- No changes needed
```

### Pattern: View Toggle via URL State

The view toggle should persist in URL params using nuqs, same pattern as existing filters.

```typescript
// In beat-catalog.tsx
const [view, setView] = useQueryState(
  "view",
  parseAsStringLiteral(["card", "list"] as const)
    .withDefault("card")
    .withOptions({ shallow: true }) // No server re-fetch needed
)
```

Key detail: view toggle should use `shallow: true` since both views render the same data. Only filter changes need `shallow: false` to trigger server re-fetch.

### Pattern: Filter Bar State Consolidation

Currently, `beat-filters.tsx` and `beat-search.tsx` each independently manage nuqs state. The new `filter-bar.tsx` consolidates all filter state into one component:

```typescript
// filter-bar.tsx manages all URL state
const [genre, setGenre] = useQueryState("genre", parseAsString.withOptions({ shallow: false }))
const [keyFilter, setKeyFilter] = useQueryState("key", parseAsString.withOptions({ shallow: false }))
const [mood, setMood] = useQueryState("mood", parseAsString.withOptions({ shallow: false }))
const [bpmMin, setBpmMin] = useQueryState("bpmMin", parseAsInteger.withOptions({ shallow: false }))
const [bpmMax, setBpmMax] = useQueryState("bpmMax", parseAsInteger.withOptions({ shallow: false }))
const [query, setQuery] = useQueryState("q", parseAsString.withOptions({ shallow: false }))
```

### Pattern: Card Click Zones

Beat cards need distinct click zones to avoid play/license conflicts:

```typescript
// Card play overlay -- stops propagation, only plays audio
<button onClick={(e) => { e.stopPropagation(); handlePlay() }} />

// Card info area -- opens license modal
<div onClick={() => setLicenseModalOpen(true)} />
```

This is different from list view where row click expands the detail panel. In card view, clicking the info section goes directly to the license modal.

### Pattern: WaveSurfer Mini Waveform in List Rows

The existing `beat-detail-panel.tsx` creates a WaveSurfer instance that ties to the shared `audioRef` from AudioPlayerProvider. For the inline mini waveform in list rows, a different approach is needed -- these should be static waveform visualizations (not tied to playback) to avoid creating dozens of WaveSurfer instances:

```typescript
// Option A: Use WaveSurfer with interact: false and no media binding
// Renders a static waveform from the audio URL
const ws = WaveSurfer.create({
  container: ref.current,
  waveColor: "#333",
  progressColor: "#f5f5f0",
  height: 32,
  barWidth: 1,
  barGap: 1,
  cursorWidth: 0,
  normalize: true,
  interact: false,
  url: beat.previewAudioUrl, // loads independently, not tied to shared audio element
})
```

**Warning:** Creating WaveSurfer instances for every visible row is expensive. Limit to visible rows only (e.g., only create for rows in viewport, or only for the currently playing beat). The UI-SPEC specifies 120px wide, 32px tall waveform strips. Consider lazy-loading these or only showing them for the active/playing beat to avoid performance issues.

### Pattern: AnimatePresence View Crossfade

```typescript
<AnimatePresence mode="wait">
  {view === "card" ? (
    <motion.div
      key="card-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <BeatCardGrid beats={beats} />
    </motion.div>
  ) : (
    <motion.div
      key="list-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <BeatList beats={beats} />
    </motion.div>
  )}
</AnimatePresence>
```

### Anti-Patterns to Avoid
- **Creating WaveSurfer per row eagerly:** Will cause dozens of HTTP requests and DOM thrashing. Lazy-load or limit to playing beat only.
- **Using rounded corners anywhere:** Cyberpunk Metro is strictly `rounded-none`. The existing codebase correctly uses this everywhere.
- **Adding accent colors:** The monochrome palette is sacred. Active states use inverted colors (white bg, black text), not colored highlights.
- **Separate filter/search components:** The whole point is unification. Do not keep beat-search.tsx and beat-filters.tsx as separate imports.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Filter dropdowns | Custom dropdown menus | shadcn Select component | Accessible, keyboard-navigable, already styled for the project |
| URL state sync | Manual useSearchParams | nuqs (already in use) | Type-safe, debounced, serialization handled |
| View transition animation | Custom CSS transitions | motion AnimatePresence | Already used in beat-detail-panel, consistent with codebase |
| Dual-thumb BPM slider | Custom range input | shadcn Slider (already in use) | Already works with dual values |
| Tooltips on view toggle | Custom hover labels | shadcn Tooltip | Accessible, positioned correctly |

## Common Pitfalls

### Pitfall 1: WaveSurfer Performance in List View
**What goes wrong:** Creating a WaveSurfer instance for every beat row loads the audio file to generate the waveform. With 20+ beats, this means 20+ network requests and DOM elements.
**Why it happens:** WaveSurfer needs the audio data to render waveforms. There is no "placeholder" mode.
**How to avoid:** Only create WaveSurfer for the currently playing beat's row, or use a static placeholder (CSS bars) for non-playing beats. The detail panel already handles the full waveform on expand.
**Warning signs:** Slow initial page load, high network waterfall, janky scrolling.

### Pitfall 2: Filter Bar Mobile Overflow
**What goes wrong:** A horizontal filter bar with search + 3 dropdowns + BPM slider + clear + view toggle overflows on mobile.
**Why it happens:** Too many controls for 375px width.
**How to avoid:** UI-SPEC already addresses this: Row 1 is search (full width), Row 2 is horizontally scrollable filter controls. Implement exactly as specified.
**Warning signs:** Horizontal page scroll on mobile, controls cut off.

### Pitfall 3: Sticky Filter Bar Z-Index Conflicts
**What goes wrong:** The sticky filter bar overlaps the sidebar or the global player bar.
**Why it happens:** Multiple sticky/fixed elements competing for z-index space.
**How to avoid:** The filter bar should be `z-index: 10`. The player bar is fixed at bottom with higher z-index. The sidebar is in a separate layout column so no overlap on desktop. On mobile, verify the sticky bar does not conflict with the bottom nav.
**Warning signs:** Filter bar appearing behind sidebar tiles, or dropdowns rendering behind the player bar.

### Pitfall 4: Select Dropdown Portal Rendering
**What goes wrong:** shadcn Select dropdown menu renders inside the filter bar container, gets clipped by `overflow: hidden` or `overflow-x: auto`.
**Why it happens:** Radix Select uses a portal by default, but if the filter bar has unusual positioning or containment, the portal may not work correctly.
**How to avoid:** Ensure the filter bar does not have `overflow: hidden` on the container that holds the Select components. The horizontal scroll for mobile row 2 should only apply to the inner scroll container, not the entire filter bar.
**Warning signs:** Dropdown menus appearing clipped or in wrong position.

### Pitfall 5: Card View License Modal Click Zone
**What goes wrong:** Clicking a card to open the license modal also triggers play, or vice versa.
**Why it happens:** Overlapping click handlers without proper event propagation control.
**How to avoid:** The play overlay is an absolutely positioned button on the cover art area. The info section below is a separate clickable area. Use `e.stopPropagation()` on the play button. Do NOT make the entire card a single click target.
**Warning signs:** Playing audio when trying to license, or opening license modal when trying to play.

### Pitfall 6: nuqs parseAsStringLiteral Import
**What goes wrong:** `parseAsStringLiteral` may not exist in nuqs 2.8.9.
**Why it happens:** API surface differs between nuqs versions.
**How to avoid:** Use `parseAsString.withDefault("card")` and validate the value manually, or check nuqs docs for the correct API. The existing codebase uses `parseAsString` and `parseAsInteger` only.
**Warning signs:** TypeScript compilation error on import.

## Code Examples

### Beat Card Component Structure
```typescript
// Source: UI-SPEC beat card anatomy
interface BeatCardProps {
  beat: BeatSummary
}

export function BeatCard({ beat }: BeatCardProps) {
  const { currentBeat, isPlaying, play, pause } = useAudioPlayer()
  const [licenseModalOpen, setLicenseModalOpen] = useState(false)
  const isCurrentBeat = currentBeat?.id === beat.id
  const isActivePlaying = isCurrentBeat && isPlaying

  const lowestPrice = beat.pricing
    .filter((p) => p.isActive)
    .sort((a, b) => Number(a.price) - Number(b.price))[0]

  return (
    <div className="group border border-[#222] bg-[#111] hover:border-[#444] hover:bg-[#1a1a1a] transition-colors">
      {/* Cover art with play overlay */}
      <div className="relative aspect-square">
        {beat.coverArtUrl ? (
          <Image src={beat.coverArtUrl} alt={beat.title} fill className="object-cover" sizes="(min-width:1024px)33vw,(min-width:768px)50vw,100vw" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#222]">
            <Music className="h-6 w-6 text-[#555]" />
          </div>
        )}
        {/* Play overlay on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePlay() }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          aria-label={isActivePlaying ? `Pause ${beat.title}` : `Play ${beat.title}`}
        >
          {isActivePlaying ? <Pause className="h-12 w-12 text-white" /> : <Play className="h-12 w-12 text-white" />}
        </button>
      </div>
      {/* Info section */}
      <div className="p-4 cursor-pointer" onClick={() => setLicenseModalOpen(true)}>
        <div className="flex items-start justify-between">
          <span className="truncate font-mono text-[15px] font-bold text-[#f5f5f0] group-hover:glitch-hover">{beat.title}</span>
          {lowestPrice && <span className="shrink-0 font-mono text-[15px] font-bold text-[#f5f5f0]">FROM ${Number(lowestPrice.price).toFixed(0)}</span>}
        </div>
        <span className="block truncate font-sans text-[11px] text-[#888]">{beat.producers[0]?.name ?? "Glitch Studios"}</span>
        {/* Metadata badges */}
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge className="rounded-none border-[#333] bg-[#222] font-mono text-[11px] uppercase text-[#f5f5f0]">{beat.genre}</Badge>
          <Badge className="rounded-none border-[#333] bg-[#222] font-mono text-[11px] uppercase text-[#f5f5f0]">{beat.bpm} BPM</Badge>
          <Badge className="rounded-none border-[#333] bg-[#222] font-mono text-[11px] uppercase text-[#f5f5f0]">{beat.key}</Badge>
        </div>
        {/* Mood tags */}
        {beat.moods && beat.moods.length > 0 && (
          <span className="mt-1 block font-sans text-[11px] text-[#888]">{beat.moods.slice(0, 2).join(", ")}</span>
        )}
      </div>
      <LicenseModal beat={beat} isOpen={licenseModalOpen} onClose={() => setLicenseModalOpen(false)} />
    </div>
  )
}
```

### Card Grid Responsive Layout
```typescript
// Source: UI-SPEC layout specifications
export function BeatCardGrid({ beats }: { beats: BeatSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  )
}
```

### Filter Bar with shadcn Select
```typescript
// Source: UI-SPEC filter bar anatomy
// Genre dropdown example using shadcn Select
<Select value={genre ?? ""} onValueChange={(v) => setGenre(v || null)}>
  <SelectTrigger className="w-auto min-w-[100px] rounded-none border-[#222] bg-[#111] font-mono text-[11px] uppercase text-[#f5f5f0]">
    <SelectValue placeholder="Genre" />
  </SelectTrigger>
  <SelectContent className="rounded-none border-[#222] bg-[#111]">
    {options.genres.map((g) => (
      <SelectItem key={g} value={g} className="font-mono text-[11px] uppercase text-[#f5f5f0]">
        {g}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Existing Code Inventory

### What Works and Should NOT Be Changed
| Component | Reason |
|-----------|--------|
| `AudioPlayerProvider` + `PlayerBar` | Global player is working, beat play integration is solid |
| `LicenseModal` | License tier table, cart integration, dialog/drawer responsive pattern all work |
| `beat-detail-panel.tsx` | Waveform + MIDI + description + license CTA -- reused in list view expand |
| `bundle-section.tsx` | Embla carousel for beat packs, independent of catalog layout |
| Server action `getPublishedBeats` | Filter logic is correct, returns all needed data |
| Server action `getBeatFilterOptions` | Returns genres/keys/moods for dropdowns |
| `BeatSummary` type | Has all fields needed for both card and list views |

### What Needs Redesign
| Component | Current State | Target State |
|-----------|--------------|--------------|
| `beat-catalog.tsx` | Renders search + filters + list | Renders filter-bar + view toggle + card-grid or beat-list |
| `beat-row.tsx` | 40px cover art, no producer name, no waveform strip | 56px cover art, producer name, optional waveform strip, column alignment |
| `beat-filters.tsx` | 3 rows of scattered chips + BPM slider | DELETE -- replaced by filter-bar.tsx |
| `beat-search.tsx` | Standalone search input | DELETE -- merged into filter-bar.tsx |
| `beat-list.tsx` | Simple column of rows, basic empty state | Add column headers, updated empty state copy per UI-SPEC |

### What Is New
| Component | Description |
|-----------|-------------|
| `beat-card.tsx` | Card view beat display with 1:1 cover art, play overlay, info section, license modal |
| `beat-card-grid.tsx` | CSS Grid responsive container |
| `filter-bar.tsx` | Unified horizontal bar with search, 3 Select dropdowns, BPM slider, clear button, beat count |
| `view-toggle.tsx` | Two icon buttons (LayoutGrid + List) with inverted selected state |

## Real Beat Upload (D-06, D-07, D-08)

### Files to Upload
| File | Path | Size | R2 Destination |
|------|------|------|---------------|
| BREAK 5.mp3 | `_RESOURECES/BEATS/TRAP_SNYDER/BREAK 5.mp3` | ~4.9MB | beats/audio/ (via admin upload) |
| trap_snyder_logo.png | `_RESOURECES/BEATS/TRAP_SNYDER/trap_snyder_logo.png` | ~2.5MB | beats/covers/ (via admin upload) |

### Upload Flow
1. Navigate to admin dashboard `/admin/beats`
2. Create new beat with metadata (title: "BREAK 5", producer: "Trap Snyder", BPM/key/genre/mood TBD from the track)
3. Upload audio file via existing upload zone
4. Upload cover art via existing upload zone
5. Set pricing tiers and publish
6. Verify on public `/beats` page in both card and list views
7. Test play, license modal, add to cart

**Note:** The admin beat CRUD and R2 upload functionality already exists from Phase 2. This is manual testing through the existing admin UI, not new backend code.

## Playwright Verification Matrix

Per D-10 and UI-SPEC:

| Viewport | URL | Verification |
|----------|-----|-------------|
| 1440px | /beats | Card view default, filter bar, beat cards with cover art, proper grid |
| 1440px | /beats?view=list | List view with column headers, 56px cover art, waveform strips |
| 375px | /beats | Mobile card view, stacked filter bar (search row 1, scroll row 2) |
| 375px | /beats?view=list | Mobile list view, condensed rows, hidden BPM/Key badges |
| 1440px | /beats?genre=Hip-Hop | Active filter state shown, filtered results |
| 1440px | /beats (empty) | Empty state display with correct copy |

## Open Questions

1. **Mini waveform strategy for list rows**
   - What we know: UI-SPEC specifies 120px x 32px WaveSurfer strips in each list row (desktop only). Creating a WaveSurfer per row is expensive.
   - What's unclear: Whether performance will be acceptable with 10+ rows each loading audio to generate waveforms.
   - Recommendation: Start with waveform only on the currently playing beat's row. If performance testing shows it works, expand to all visible rows. Use a CSS placeholder (gray bars pattern) for non-playing rows.

2. **nuqs parseAsStringLiteral availability**
   - What we know: The codebase uses `parseAsString` and `parseAsInteger` from nuqs 2.8.9.
   - What's unclear: Whether `parseAsStringLiteral` exists in this version.
   - Recommendation: Use `parseAsString.withDefault("card")` and validate the value in code. Safe fallback that definitely works.

## Sources

### Primary (HIGH confidence)
- Project codebase -- all component files, types, actions read directly
- `07-UI-SPEC.md` -- approved design contract with exact specifications
- `07-CONTEXT.md` -- user decisions from discussion phase
- `DESIGN-LANGUAGE.md` -- Cyberpunk Metro design system

### Secondary (MEDIUM confidence)
- nuqs API patterns inferred from existing codebase usage (version 2.8.9 confirmed via pnpm list)
- WaveSurfer.js 7.12.5 API based on existing `beat-detail-panel.tsx` usage

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed, versions confirmed via pnpm list
- Architecture: HIGH -- existing patterns are clear, UI-SPEC is detailed, component structure is straightforward
- Pitfalls: HIGH -- identified from reading actual codebase (WaveSurfer perf, z-index, click zones, mobile overflow)

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable -- no dependency changes needed)
