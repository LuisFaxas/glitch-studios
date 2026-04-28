---
phase: 48-launch-blocker-proof-pass
plan: 08
subsystem: auth
tags: [auth, react-compiler, eslint, react-hooks, ui]

requires:
  - phase: 48-launch-blocker-proof-pass
    provides: "AUTH-32 command output showing refs, purity, and static-components lint blockers"
provides:
  - "Scoped React compiler lint pass for MagicRings, Dither, CategoryTile, and HeroSection"
  - "Render-safe mutable ref and shader uniform update patterns"
  - "Static category icon rendering and deterministic hero dither color"
affects: [AUTH-32, react-compiler, homepage, tech-categories]

tech-stack:
  added: []
  patterns:
    - "Mutable shader uniforms are passed through a memoized JSX value and updated via material refs in frame/effect callbacks."
    - "Dynamic icon compatibility exports stay available while rendered JSX uses a static top-level helper."

key-files:
  created:
    - .planning/phases/48-launch-blocker-proof-pass/48-08-SUMMARY.md
  modified:
    - src/components/MagicRings.jsx
    - src/components/ui/dither.jsx
    - src/components/tech/category-tile.tsx
    - src/components/home/hero-section.tsx

key-decisions:
  - "Use scoped ESLint as the RED/GREEN signal because this plan is compiler-lint code-shape work, not unit-testable business logic."
  - "Keep CATEGORY_ICON_MAP and getCategoryIcon compatibility exports, but render icons through a switch-based helper."
  - "Use HERO_DITHER_COLOR as a deterministic top-level palette tuple instead of render-phase randomness."

patterns-established:
  - "React compiler ref rule: write ref-backed animation props only inside effects or callbacks."
  - "React compiler immutability rule: do not mutate objects returned by useState/useMemo directly; mutate Three material uniforms through refs outside render."

requirements-completed:
  - AUTH-32

duration: 4min
completed: 2026-04-28
---

# Phase 48 Plan 08: React Compiler Lint Blocker Summary

**AUTH-32 React compiler blockers for refs, purity, and static component rendering were removed from the scoped files.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-28T11:36:35Z
- **Completed:** 2026-04-28T11:40:06Z
- **Tasks:** 1
- **Files modified:** 4 source files plus this summary

## Accomplishments

- Moved `MagicRings` prop ref writes out of render and into an effect with full prop dependencies.
- Replaced `Dither` render-phase `waveUniformsRef.current` access with memoized uniforms passed to JSX and material-ref updates inside effects/frame callbacks.
- Replaced dynamic `const Icon = iconFor(...)` rendering with a static `renderCategoryIcon` helper while preserving compatibility exports.
- Replaced hero render-time `Math.random()` color selection with top-level `HERO_DITHER_COLOR`.

## TDD Signal

- **RED:** `pnpm exec eslint src/components/MagicRings.jsx src/components/ui/dither.jsx src/components/tech/category-tile.tsx src/components/home/hero-section.tsx` exited 1 before changes with `react-hooks/refs`, `react-hooks/purity`, and `react-hooks/static-components` errors.
- **GREEN:** The same scoped ESLint command exits 0 after the task commit.
- No extra test file was added because the plan-owned behavior is the compiler lint output and the task ownership was limited to the four source files.

## Task Commits

1. **Task 1: Remove render-phase ref access, randomness, and dynamic component creation** - `92b8402` (`fix`)

## Files Created/Modified

- `src/components/MagicRings.jsx` - Initializes `propsRef` with initial props and updates it from an effect instead of render.
- `src/components/ui/dither.jsx` - Passes `uniforms={waveUniforms}` in JSX and updates Three uniforms through the shader material ref.
- `src/components/tech/category-tile.tsx` - Adds `renderCategoryIcon` and removes dynamic component creation from `CategoryTile`.
- `src/components/home/hero-section.tsx` - Adds `HERO_DITHER_COLOR` and removes render-phase randomness.
- `.planning/phases/48-launch-blocker-proof-pass/48-08-SUMMARY.md` - Records the plan result.

## Verification

Stale pattern check:

```bash
rg -n 'waveUniformsRef\.current|Math\.random\(|const Icon = iconFor' src/components/ui/dither.jsx src/components/tech/category-tile.tsx src/components/home/hero-section.tsx
```

Result: exit 1, no matches.

Conforming pattern check:

```bash
rg -n 'propsRef\.current =|useEffect\(|useMemo\(|renderCategoryIcon|HERO_DITHER_COLOR|uniforms=\{waveUniforms\}' src/components/MagicRings.jsx src/components/ui/dither.jsx src/components/tech/category-tile.tsx src/components/home/hero-section.tsx
```

Result: exit 0, expected conforming patterns present.

Scoped ESLint:

```bash
pnpm exec eslint src/components/MagicRings.jsx src/components/ui/dither.jsx src/components/tech/category-tile.tsx src/components/home/hero-section.tsx
```

Result: exit 0. ESLint still reports two pre-existing warnings for unused `title` and `backgroundMediaUrl` props in `hero-section.tsx`; there are 0 errors.

## Decisions Made

- Used the scoped ESLint command as the test cycle because this task is explicitly about compiler lint blockers.
- Updated Dither through the material ref after ESLint rejected mutating a hook-returned uniforms object.
- Left unrelated hero unused-prop warnings unchanged because they do not block the React compiler rule group and are outside this plan's stated blockers.

## Deviations from Plan

None - plan code changes were executed as written.

## Issues Encountered

- An initial lazy-state uniforms attempt triggered `react-hooks/immutability`; it was replaced before commit with memoized JSX uniforms plus material-ref mutation in frame/effect callbacks.
- Concurrent executors modified unrelated files during this run. Only the four owned source files were staged for the task commit.

## Known Stubs

- `src/components/tech/category-tile.tsx:59` - `COMING SOON` is an existing empty-category UI label for categories with no products or reviews. It does not block this plan's AUTH-32 lint objective.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The scoped React compiler lint blockers named in `auth-command-output.md` are fixed. Any remaining AUTH-32 command evidence should re-run the broader command set separately, because this plan intentionally verified only the scoped files listed in its acceptance criteria.

## Self-Check: PASSED

- FOUND: `.planning/phases/48-launch-blocker-proof-pass/48-08-SUMMARY.md`
- FOUND: `src/components/MagicRings.jsx`
- FOUND: `src/components/ui/dither.jsx`
- FOUND: `src/components/tech/category-tile.tsx`
- FOUND: `src/components/home/hero-section.tsx`
- FOUND: `92b8402`

---
*Phase: 48-launch-blocker-proof-pass*
*Completed: 2026-04-28*
