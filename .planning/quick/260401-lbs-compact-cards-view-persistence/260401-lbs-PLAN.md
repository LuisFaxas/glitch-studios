---
phase: quick
plan: 260401-lbs
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/beats/view-toggle.tsx
  - src/components/beats/beat-catalog.tsx
  - src/components/beats/beat-card-grid.tsx
  - src/components/beats/beat-card.tsx
  - src/components/beats/filter-bar.tsx
autonomous: true
must_haves:
  truths:
    - "Three view toggle buttons visible in filter bar: compact, large, list"
    - "Compact view shows smaller cards with less cover art dominance and more cards per row"
    - "Default view is compact on first visit (no localStorage or URL param)"
    - "Switching views persists choice in localStorage and survives page reload"
    - "URL param still works and takes precedence over localStorage"
  artifacts:
    - path: "src/components/beats/view-toggle.tsx"
      provides: "Three-button toggle with compact/card/list"
    - path: "src/components/beats/beat-card-grid.tsx"
      provides: "Grid layout that adapts to compact vs large variant"
    - path: "src/components/beats/beat-card.tsx"
      provides: "Compact card variant with smaller cover art"
    - path: "src/components/beats/beat-catalog.tsx"
      provides: "View state with localStorage sync and three-mode support"
  key_links:
    - from: "beat-catalog.tsx"
      to: "localStorage"
      via: "useEffect sync on view change"
      pattern: "localStorage\\.(get|set)Item.*beats-view"
    - from: "beat-catalog.tsx"
      to: "beat-card-grid.tsx"
      via: "variant prop"
      pattern: "variant.*compact|large"
---

<objective>
Add a third "compact" card view to the beats catalog that shows smaller cards with less cover art dominance and tighter spacing, fitting more cards per row. Make compact the default. Persist the user's view preference in localStorage so it survives reloads.

Purpose: More beats visible at once improves browsing; persistence respects user preference.
Output: Updated view toggle, catalog, grid, and card components.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/beats/beat-catalog.tsx
@src/components/beats/beat-card.tsx
@src/components/beats/beat-card-grid.tsx
@src/components/beats/view-toggle.tsx
@src/components/beats/filter-bar.tsx

<interfaces>
From src/components/beats/view-toggle.tsx:
```typescript
interface ViewToggleProps {
  view: string
  onViewChange: (view: string) => void
}
```

From src/components/beats/beat-catalog.tsx:
```typescript
// Currently uses nuqs with parseAsString.withDefault("card")
// Validates: view === "list" ? "list" : "card"
```

From src/components/beats/beat-card-grid.tsx:
```typescript
// Currently: single grid layout, no variant prop
export function BeatCardGrid({ beats }: { beats: BeatSummary[] })
```

From src/components/beats/filter-bar.tsx:
```typescript
interface FilterBarProps {
  options: { genres: string[]; keys: string[]; moods: string[] }
  beatCount: number
  view: string
  onViewChange: (view: string) => void
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add compact view mode to ViewToggle, BeatCatalog (with localStorage), and FilterBar types</name>
  <files>src/components/beats/view-toggle.tsx, src/components/beats/beat-catalog.tsx, src/components/beats/filter-bar.tsx</files>
  <action>
**view-toggle.tsx** — Add a third button for "compact" view between nothing (it goes first). Order: compact, card (rename label to "large"), list. Icons: `Grid3x3` for compact (smaller grid icon), `LayoutGrid` for large, `List` for list. All from lucide-react. Tooltip labels: "Compact view", "Large view", "List view". Extract the repeated button styling into a helper to reduce duplication. The active state styling stays the same (border-[#f5f5f0] bg-[#f5f5f0] text-[#000]).

**beat-catalog.tsx** — Change the view state:
1. Change default from `"card"` to `"compact"` in parseAsString.withDefault("compact").
2. Update validation: `const currentView = view === "list" ? "list" : view === "card" ? "card" : "compact"` (three valid values, compact is fallback).
3. Add localStorage sync: On mount, if no URL `view` param exists, read from `localStorage.getItem("beats-view")` and call `setView()` with it (only if valid). On every view change, write to `localStorage.setItem("beats-view", currentView)`. Use a useEffect for the read-on-mount and another useEffect watching currentView for the write.
4. In the AnimatePresence section, render BeatCardGrid for both "compact" and "card" views but pass a `variant` prop: `variant={currentView === "card" ? "large" : "compact"}`. Use different motion keys for each ("compact-view", "card-view", "list-view") so AnimatePresence animates between all three.

**filter-bar.tsx** — No changes needed beyond what ViewToggle handles, since it already passes view/onViewChange as strings. The FilterBarProps type is already `view: string`.
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>ViewToggle shows 3 buttons (compact/large/list). BeatCatalog defaults to compact, syncs to localStorage, validates 3 view modes. Type-checks clean.</done>
</task>

<task type="auto">
  <name>Task 2: Implement compact card variant in BeatCardGrid and BeatCard</name>
  <files>src/components/beats/beat-card-grid.tsx, src/components/beats/beat-card.tsx</files>
  <action>
**beat-card-grid.tsx** — Accept a `variant` prop: `"compact" | "large"` (default "compact"). Change grid classes based on variant:
- Compact: `grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` (more columns, tighter gap)
- Large: `grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3` (current layout)
Pass `variant` down to each BeatCard.

**beat-card.tsx** — Accept optional `variant` prop: `"compact" | "large"` (default "compact"). Adjust layout based on variant:

Compact variant changes (smaller, denser):
- Cover art: Change from `aspect-square` to `aspect-[4/3]` (shorter, less dominant). Keep the play overlay but use smaller icon `h-8 w-8` instead of `h-12 w-12`.
- Waveform strip: Reduce height from 28 to 20. Reduce horizontal padding from `px-4 pt-3` to `px-2 pt-2`.
- Info section: Reduce padding from `p-4` to `px-2 py-2`. Title font size from `text-[15px]` to `text-[13px]`. Price font from `text-[15px]` to `text-[13px]`. Producer name stays `text-[11px]`. Badge font stays `text-[11px]`. Hide mood tags row in compact (keeps card shorter). Reduce badge margin from `mt-2` to `mt-1`.

Large variant: Keep everything exactly as the current BeatCard renders (no changes from current code).

Use a simple conditional approach: `const isCompact = variant !== "large"` and apply classes with ternaries. Do NOT create a separate component — keep it as one BeatCard with variant styling.
  </action>
  <verify>
    <automated>cd /home/faxas/workspaces/projects/personal/glitch_studios && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>Compact cards show 4/3 aspect ratio cover art, smaller text, tighter spacing, no moods row. Grid shows 2 cols mobile / 4-5 cols desktop in compact mode. Large mode unchanged from current. Type-checks clean.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. Visit /beats page — compact view loads by default (smaller cards, more per row)
3. Click large view toggle — cards expand to current full-size layout
4. Click list view — list layout renders as before
5. Switch to large view, reload page — large view persists (localStorage)
6. Visit /beats?view=list — list view shows regardless of localStorage value
7. Clear localStorage, visit /beats — defaults to compact
</verification>

<success_criteria>
- Three view modes work: compact (default), large, list
- Compact shows noticeably more cards per row with smaller cover art
- View preference persists across page reloads via localStorage
- URL param overrides localStorage
- No TypeScript errors
- Existing list view and card interactions (play, license modal) unaffected
</success_criteria>

<output>
After completion, create `.planning/quick/260401-lbs-compact-cards-view-persistence/260401-lbs-SUMMARY.md`
</output>
