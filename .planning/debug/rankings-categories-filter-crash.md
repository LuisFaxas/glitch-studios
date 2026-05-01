---
status: investigating
trigger: "Clicking the Categories (subCategories/subcat) filter facet on /tech/rankings/laptops crashes the entire site. All other facets work. Reported 2026-05-01 with deterministic real-macOS reproduction."
created: 2026-05-01T00:00:00Z
updated: 2026-05-01T05:00:00Z
related_sessions:
  - .planning/debug/filter-chip-crash-mac-browsers.md (resolved 2026-04-27, click-path on other facets — same fault class, different facet)
  - .planning/debug/rankings-laptops-idle-freeze.md (human-verify after f840245, framing was wrong — actual fault is click-path on Categories, NOT idle)
fault_class: click-path-crash-categories-facet-only
deterministic_repro: true
---

> The 2026-04-27 click-path fix (commit 6af8177, `setTimeout(0)` deferral of `setFilters` and `CustomDropdown.setOpen`) covered the chip-click facets the user tested then. The 2026-05-01 idle-framing session (commit f840245, useDesktopLayout matchMedia removal) chased an idle hypothesis that turned out to be wrong — the actual fault is interaction-triggered, not idle. This session investigates ONE deterministic trigger: clicking the Categories filter (`Sub-cat` in code, `subcat` filter key, derived from `bounds.subCategories`).

## Symptoms

expected: Click Categories filter chip → category narrows table results, page stays responsive, other tabs unaffected.
actual: Click Categories → entire site crashes (full freeze, all tabs of the site become unresponsive). All other facet clicks work normally in the same session.
errors: Not yet captured by automated harness. Existing instrumentation kit from `.planning/debug/rankings-laptops-idle-freeze.md` is reusable for real-mac capture if headless harness fails to reproduce.
reproduction:
  1. Navigate to https://glitchtech.io/tech/rankings/laptops on real macOS Safari OR Firefox.
  2. Click any combination of these — they all work: Year, CPU AMD, CPU Intel, RAM, Storage, Price slider.
  3. Click the Categories filter facet (the `subCategories` chip/dropdown). CRASH.
  4. Crash propagates site-wide.
timeline: Reported 2026-05-01 immediately after f840245 deployed. The prior `useDesktopLayout` fix did not address this path.

## Pre-Grepped Localization

**`src/components/tech/leaderboard-filter-sidebar.tsx`:**
- Line 21: `subCategories: { slug: string; name: string }[]` — type definition on bounds.
- Lines 695-698: `subcatOptions = useMemo(() => bounds.subCategories.map((sc) => ({ value: sc.slug, label: sc.name })), [bounds.subCategories])` — option list construction.
- Lines 736-743: `onToggleSubcat` and `onClearSubcat` callbacks — wrap `onChange({ subcat: ... })`.
- Lines 790-798: subCategories filter render in BAR layout (desktop), gated `bounds.subCategories.length > 0`. Uses `FilterFacetDropdown` (memoized) with `label="Sub-cat"`.
- Lines 858-865: subCategories filter render in VERTICAL layout (mobile sheet), gated `bounds.subCategories.length > 0`. Uses `FilterChipGroupVertical`.

**`src/components/tech/leaderboard-table.tsx`:**
- Lines 60-99: `applyFilters` predicate. Line 92-95: subcat predicate.
- Lines 101-131: `deriveBounds` builds `subCatMap` from rows; **requires both `subCategorySlug` AND `subCategoryName` to be non-null** to include the row's category.
- Lines 379-384: row product cell renders `row.original.subCategoryName` if truthy.

**`src/lib/tech/leaderboard.ts`:**
- Line 303-304: `subCategorySlug: row.subCategory?.slug ?? specs.sub_category_slug ?? null` — has spec-fallback.
- Line 305: `subCategoryName: row.subCategory?.name ?? null` — **NO spec-fallback.**

## Phase A — Structural Diff: Why is Sub-cat different?

Each row item is a candidate hypothesis surface.

| Aspect | Year / CPU / RAM / Storage / Medal | **Sub-cat (subCategories)** |
|---|---|---|
| Render gate | unconditional | `bounds.subCategories.length > 0 &&` |
| Value type | `number[]` (Year) or `string[]` | `string[]` |
| Options source | static const (RAM/Storage/Medal), or `bounds.years` / `bounds.cpuKinds` (number[] / string[]) | `bounds.subCategories.map((sc) => ({ value: sc.slug, label: sc.name }))` — **derived from objects** |
| Options object identity | RAM/Storage/Medal: stable module-level constant. Year/CPU: `useMemo` on simple arrays | `useMemo` on `bounds.subCategories.map(...)` — depends on `bounds.subCategories` referential identity |
| `bounds.subCategories` source | `Array.from(subCatMap.values()).sort(...)` — new Map + new Array each `deriveBounds` call | Same |
| `bounds.subCategories` referential stability | N/A (other facets don't use a Map intermediate) | Each call to `deriveBounds` returns a NEW array of NEW objects. But `useMemo([rows])` on `bounds` makes it stable as long as `rows` is stable |
| Filter predicate | direct array `includes` against scalar field | direct array `includes` against scalar `subCategorySlug` |
| Cell rendering of facet value | various | line 380-382 renders `subCategoryName` (different field from filter value) |
| Where bounds entry can mismatch row data | N/A | `subCategorySlug` has spec fallback in `leaderboard.ts:303-304`; `subCategoryName` does NOT (line 305). Row can have slug ≠ null + name === null and be SKIPPED from `subCatMap` |

**Key observation A1:** All facets use the deferred `setFilters` (the click-path landmine guard). All open via the same `CustomDropdown`. There is **no structural difference in the click handler chain** between Sub-cat and the others.

**Key observation A2:** `bounds.subCategories` is the only facet that constructs object-shaped options each render. But `useMemo` should stabilize it.

**Key observation A3:** The render-gating check `bounds.subCategories.length > 0 &&` does not cause remounts unless the bounds change between renders, which they don't.

**Key observation A4:** The label rendering at line 380-382 for `subCategoryName` is inside the row cell — *every row already renders that field on every table render*, regardless of whether the Sub-cat filter is clicked. So row rendering is not new work introduced by clicking Sub-cat.

**The interesting hypothesis surface:** something happens at row-filter time that's specific to subcat. Either
  (a) `applyFilters` with subcat enabled produces a result set that triggers an expensive render,
  (b) the option list's `value` strings collide with another field/identifier the React tree uses,
  (c) the `bounds.subCategories` array is unstable somehow on subsequent renders, causing massive re-memo invalidation,
  (d) the actual deployed code is different from the source we read — the user is testing prod glitchtech.io.

## Codex Parallel Localization

### Codex Round 1 (after reframe)

prompt summary: Independent localization audit. The original "Categories filter" was reinterpreted as the TileNav navigation tile linking to `/tech/categories`, NOT the leaderboard subcat facet. Provide ranked falsifiable hypotheses for why navigating from rankings/laptops to /tech/categories crashes site-wide on real macOS. Address site-wide propagation, fix direction, and whether commit f840245 should be reverted.

codex verdict (one paragraph): Codex's sandbox was wedged on bubblewrap so it pulled files via the GitHub MCP connector. Top hypotheses:
  1. **H1 Router-sensitive app shell cascade — high confidence.** `(tech)/layout.tsx` is a client layout using `usePathname`; route change re-renders SidebarProvider, TileNav, widgets, MobileContentWrapper, BottomTabBar. The navs also compute active state from pathname. Falsifier: hardcode pathname/active state for one build; if Categories still freezes, shell path sensitivity is not sufficient.
  2. **H2 Nav Tile hover state plus route transition feedback loop — medium-high.** Desktop nav tiles synchronously call `setIsHovered` on mouse enter/leave, conditionally mount an animated glitch overlay, then the same click starts a Next `<Link>` transition and flips active state.
  3. **H3 Categories page motion/visibility path — medium.** `TechNewsletter` mounts `ScrollSection` with `whileInView` IntersectionObserver + clipPath animation (suspect under prior architectural rule).
  4. **H4 Hidden mobile nav still participates on desktop — medium.** BottomTabBar + MobileNavOverlay always mounted, run hooks/effects on pathname change.
  5. Site-wide propagation: same-origin renderer process sharing in Safari/Firefox; main-thread starvation in one tab can starve sibling tabs on the same origin. GPU/compositor process wedge if cross-origin tabs also stutter.
  6. Fix direction: the unapplied "Codex fix #2" (lift TileNav out of being router-sensitive) is the most direct durable fix. Try smaller blast-radius mitigations first: remove React hover state/glitch overlay from nav Tiles, remove unnecessary `usePathname` from TechLayout. Categories-page-only fix justified only if a plain non-Tile navigation to a stripped/static Categories page proves the shell path is safe.
  7. f840245 (useDesktopLayout removal): **Keep and harden.** The idle-framing was wrong, but removing useDesktopLayout still aligns with the architectural rule.

my response: Concur strongly with Codex's H1 + H2 + H3 + H4 stack. The architectural rule (no synchronous React state in native input/focus/visibility/change/matchMedia handlers on this route) was violated NOT inside leaderboard code (which was patched 2026-04-27) but by the **app shell cascade** that fires on every real route navigation. The chip-click fix (filters local, not URL) only avoided ONE trigger of the cascade; real route navigations still fire it. Categories-page-specific suspects (TechNewsletter, motion.section) compound but are not the root. The **architectural fix is to make TileNav, BottomTabBar, and TechLayout pathname-independent** — pathname-driven active state moves into individual `<NavLink>` components that internally read pathname. Parent components become pathname-stable and React's reconciliation only re-renders the changed tile.

### Codex Round 2 (fix design pre-review)

prompt summary: Proposed atomic refactor — `<NavLink>` utility + per-item subcomponents in `tile-nav.tsx`, `bottom-tab-bar.tsx`, `mobile-nav-overlay.tsx`. Optional: TechLayout `useState(window.location)` initializer. Optional: Tile.tsx hover state CSS-only migration. Asked Codex to concur or push back, recommend scope, and call out hydration risks.

codex verdict (one paragraph): Concur on core direction. Pushed back on two specific claims: (1) `React.memo` will not skip child renders just because a NavLink's pathname is unchanged — every NavLink that consumes the pathname context still re-renders on path change. The win is real but is a **containment** win, not a memoization win. (2) The `TechLayout` `useState(window.location.pathname)` initializer is risky for SSR/hydration mismatch on `/` and `/tech` and should NOT be in this commit unless fully verified. Recommended scope: ship NavLink + TileNav + BottomTabBar refactor + RouteChangeCloser, optionally Tile.tsx CSS-hover. Defer TechLayout initializer. Suggested using `data-active` driven Tailwind selectors instead of plumbing a boolean through render props.

my response: Adopted Codex's scope — kept TechLayout intact, deferred Tile.tsx hover refactor as a separate cleanup. Implemented per-item memoized subcomponents inside `tile-nav.tsx` (`CollapsedNavTile`, `ExpandedNavTile`) and `bottom-tab-bar.tsx` (`TabBarLink`) and `mobile-nav-overlay.tsx` (`RouteChangeCloser`, `OverlayNavTile`). Each subcomponent owns its own `usePathname` subscription. NavLink utility component shipped alongside as a future-use entry point.

### Codex Round 3 (post-fix review)

prompt summary: Reviewed the implemented diff (3 files modified, 1 new). Asked: is `onClose` stable enough for `<RouteChangeCloser>`? Should I keep or delete the unused `NavLink`? Does the studios-side nav benefit (TileNav is shared)? Real-mac verification gating? Any architectural risk I missed?

codex verdict (one paragraph): **Push back with one blocker.** The claim that BottomTabBar no longer re-renders on path change is partially wrong — TechLayout still subscribes to `usePathname` and forces parent shell re-renders, so `() => setOverlayOpenAfterInput(false)` is NOT stable by construction. **Memoize `closeOverlay`/`openOverlay` via `useCallback`** so RouteChangeCloser's memo equality holds. **Also fix RouteChangeCloser to update `previousPathnameRef` even when closed** — otherwise a route change while closed leaves a stale ref and the next open immediately closes. **Delete the unused NavLink utility from this bugfix commit** — keeps the change atomic and untested code out of production. Concur on studios-side nav also benefiting (TileNav is shared). Concur real-mac verification gating is mandatory. No render-loop risks from per-tile usePathname.

my response: All three blockers addressed. Memoized `closeOverlay` and `openOverlay` callbacks in BottomTabBar. Fixed RouteChangeCloser to update the ref unconditionally on path change. Deleted nav-link.tsx. Re-ran tsc + lint + 13/13 regression tests + 39/39 cross-engine harness — all pass. Ready to commit.

## Hypothesis Ranking

| # | Name | Confidence | Status |
|---|---|---|---|
| H0 | Categories is just the first tested NAV transition; ALL real navigations out of `/tech/rankings/laptops` may freeze on real macOS | medium-high | Falsifiable but consistent with the architectural rule. Treat as the steady-state hypothesis. |
| H1 | Router-sensitive app shell cascade (TileNav, BottomTabBar, MobileNavOverlay, MobileContentWrapper, TechLayout all consume `usePathname`) — every nav re-renders the entire shell, real macOS Safari/Firefox compositor cannot keep up | high | Codex flagged as #1 fix (load-bearing comment in `leaderboard-table.tsx:215-224`); never applied. |
| H2 | Tile hover state + glitch overlay + route transition feedback loop on real macOS | medium-high | The Categories tile is the one the user hovered; `Tile.tsx` uses synchronous `setIsHovered` on native mouseenter/leave, mounts a glitch overlay div, and the same click triggers Next route change |
| H3 | Categories page motion/visibility path: `<TechNewsletter>` → `<ScrollSection variant="clip-reveal">` mounts `motion.section` with `whileInView` (IntersectionObserver) + clipPath animation — the destination is uniquely heavy compared to other tech routes | medium | TechNewsletter is also on Tech home / Reviews / Compare / Categories[slug] / Reviews[slug] but NOT on rankings/[slug]. The user is leaving rankings/laptops (no newsletter) and arriving at Categories (newsletter mounts) |
| H4 | Hidden mobile nav still participates on desktop (BottomTabBar + MobileNavOverlay are mounted, run hooks, run effects on pathname change, even when display:none) | medium | MobileNavOverlay calls `usePathname`, `useReducedMotion`, `useSession`, `useMotionValue`, has multiple useEffects that subscribe to keydown/scroll-lock/focus-trap based on isOpen, plus a "close on pathname change" effect that fires on every route change |
| H5 | Categories render volume / RSC payload (large category set or bad data shape) | low-medium | Page is `revalidate=60`, simple grid of CategoryTiles, only ~5-10 tiles in current placeholder data |
| H6 | Compositor/GPU wedge from glitch CSS — `mix-blend-mode: screen`, `clip-path` insets in `glitch-heading.module.css`, `animate-glitch-hover` 200ms steps(1) on every hovered Tile | low-medium | Already audited in prior sessions; layers are hover-mounted (not always present) |
| H7 | Audio/player layout coupling (MobileContentWrapper + audio provider) | low | Audio provider is event-driven only; not engaged unless user is playing a beat |

## Repro Harness

(Pending — built after hypothesis ranking.)

## Investigation Log

- 2026-05-01T05:00Z: Session opened. Read full source of leaderboard-filter-sidebar.tsx, leaderboard-table.tsx, leaderboard-filter-sheet.tsx, page.tsx, leaderboard.ts. Phase A structural diff drafted. Spawning Codex parallel localization.

- 2026-05-01T05:15Z: **MAJOR REFRAME — prompt assumption was wrong.** The user said "the Categories filter". The prompt-author mapped that to the `subcat`/`subCategories` facet by code-grep. Inspected the actual production HTML on https://glitchtech.io/tech/rankings/laptops:
  - Filter chips on the page: Price, Year, CPU, RAM, Storage, Medal, **Sub-cat** (label is literally "Sub-cat", not "Categories").
  - Only `bounds.subCategories.length === 1` on this route (`{slug: "laptops", name: "Laptops"}`) — clicking the Sub-cat filter does not narrow the result set.
  - The string "Categories" appears in the rendered HTML ONLY as:
    - a `<span>Categories</span>` inside an `<a href="/tech/categories">` in the TileNav (left rail sidebar)
    - an `<a aria-label="Categories" href="/tech/categories">` in the BottomTabBar (mobile)
  - **The user is clicking the Categories navigation tile — a navigation away from /tech/rankings/laptops to /tech/categories.** Not a filter at all.

  **New investigation surface:** the route transition `/tech/rankings/laptops` → `/tech/categories` (and what mounts/unmounts during it). Re-grepping with this lens:
  - `src/app/(tech)/tech/categories/page.tsx` is server-rendered, simple, async.
  - `src/components/tech/category-tile.tsx` uses `Link href="/tech/categories/{slug}"` (these are inner tiles ON the categories page; we don't reach those without navigating there first).
  - `src/components/layout/tile-nav.tsx` and `src/components/layout/bottom-tab-bar.tsx` are the navigation triggers.
  - `src/app/(tech)/layout.tsx` uses `usePathname` — every route change re-renders the layout shell (TileNav, BottomTabBar, MobileContentWrapper).
  - The prior 2026-04-27 click-path debug session referenced this cascade explicitly (leaderboard-table.tsx:218): "nuqs URL update → shallow URL replace → (tech) client layout (which uses usePathname) re-renders → cascade through TileNav / BottomTabBar / MobileContentWrapper". That cascade is the SAME path triggered by clicking the Categories nav tile — but here it's a real route change, not a shallow URL replace.

  **Updated hypothesis surface:** what's structurally different about the `/tech/rankings/laptops` → `/tech/categories` navigation that crashes, vs other navigations that don't?

## Eliminated

(none yet)

## Root Cause

(pending)

## Fix

(pending)

## Verification

(pending)

## Repro Harness

`tests/debug-rankings-categories-nav-crash.spec.ts` — Playwright spec exercising the user's exact sequence:
1. Load /tech/rankings/laptops, wait for filters.
2. Open each chip facet (Year / CPU / RAM / Storage / Medal / Sub-cat), select first chip option, close.
3. Drag the price slider.
4. Click the Categories nav tile in the desktop sidebar (or the mobile bottom-tab) — wait for /tech/categories.
5. Snapshot metrics + responsiveness probe at +1s, +5s, +10s post-click.

Pre-instrumentation: timer/RAF/observer/longtask/WebGL counters via `addInitScript`. Console + pageerror capture.

### Headless results — pre-fix (working tree before refactor)
- chromium / webkit / firefox: 1/1 PASS each. Mouse-move probe ≤19ms, rAF gap ≤15ms, post-click metrics flat. **Same asymmetry as prior sessions — Linux headless cannot reproduce real-mac compositor wedges.**

### Headless results — post-fix
- chromium / webkit / firefox: 1/1 PASS each. Same metric profile (probes 11–17ms). Confirms the refactor does not regress measurable behavior. Real-mac confirmation required for the actual freeze fix.

## Eliminated

- hypothesis: Sub-cat filter chip click is the trigger (the prompt-author's original interpretation)
  evidence: Structural diff with Year/CPU/RAM/Storage/Medal shows no meaningful difference in click-handler chain, callback identity, options memoization, or filter-predicate path. `bounds.subCategories` is stable (memoed on `[rows]`); `subcatOptions` is stable (memoed on `[bounds.subCategories]`); `onToggleSubcat` is stable (memoed on `[onChange, state.subcat]`); `setFilters` is properly deferred via setTimeout(0). On the laptops route, `bounds.subCategories.length === 1` (single entry `{slug:"laptops", name:"Laptops"}`) so clicking the subcat chip filters to the same set — no expensive re-render. The user's term "Categories filter" maps semantically to the visible "Categories" navigation TILE (TileNav left rail and BottomTabBar bottom nav), confirmed by inspecting both prod and local rendered HTML on /tech/rankings/laptops where no chip is labeled "Categories" but two `<a href="/tech/categories"><span>Categories</span></a>` elements exist.
  timestamp: 2026-05-01T05:15Z

- hypothesis: useDesktopLayout regression (idle-freeze framing was wrong but the matchMedia removal IS still defensible)
  evidence: f840245 removed a real architectural-rule violator; reintroducing it would re-arm a setState-in-matchMedia-handler vector. The user's reported bug is interaction-triggered, not idle. Per Codex Round 1: keep f840245 and harden.
  timestamp: 2026-05-01T05:32Z

## Root Cause

**Primary** (high confidence, theory-grounded; headless cannot reproduce):
The (tech) layout shell — `TileNav`, `BottomTabBar`, `MobileNavOverlay`, and to a lesser extent `TechLayout` — all subscribed to `usePathname()` at the component level. On every real route navigation, every shell component re-rendered top-down inside the same task as the click event that triggered the navigation. On real macOS Safari/Firefox this synchronous shell cascade hit the same pointer/style feedback loop class as the prior 2026-04-27 chip-click crash. The 2026-04-27 fix (commit 6af8177) avoided ONE trigger of the cascade by keeping filter state local to the leaderboard. **Real route navigations (clicking Categories or any other nav tile) still triggered the cascade — they were never patched.** The Categories tile happened to be the trigger the user reported because (a) it was a tile they hover/click, (b) it was the destination they noticed first, (c) the destination Categories page mounts heavy components (`TechNewsletter` motion.section clip-reveal + IntersectionObserver, `TechHero` GlitchHeading, `CategoryTile` glitch overlays) that compound the cascade cost.

The architectural rule from 2026-04-27 ("no synchronous React state updates in native input/focus/visibility/change handlers on this route") was satisfied locally inside leaderboard code but was VIOLATED by the entire app shell every time a route changed.

## Fix

**Atomic refactor of the (tech) shell to remove parent-level pathname subscription.** Pathname-driven active state moves into self-contained per-item subcomponents that own their pathname read. Parent shell components no longer re-render on every route change; only the specific nav items whose `isActive` flips re-render.

Files changed:
1. `src/components/layout/nav-link.tsx` (new) — utility `<NavLink>` with internal pathname subscription, exposes `data-active` and `aria-current="page"` on exact match. Memoized. Available for future per-link migrations.
2. `src/components/layout/tile-nav.tsx` — removed `const pathname = usePathname()` from `TileNav`. Added two memoized per-item subcomponents:
   - `<CollapsedNavTile>` — the icon-strip Link + active-state for the collapsed sidebar.
   - `<ExpandedNavTile>` — the `<Tile>`-wrapped Link for the expanded sidebar grid.
   Both call `usePathname` themselves and pass `isActive` to their own render output.
3. `src/components/layout/bottom-tab-bar.tsx` — removed `const pathname = usePathname()` from `BottomTabBar`. Added a memoized `<TabBarLink>` per-tab subcomponent that owns its pathname subscription.
4. `src/components/layout/mobile-nav-overlay.tsx` — removed `const pathname = usePathname()` from the outer overlay component. Added two memoized subcomponents:
   - `<RouteChangeCloser isOpen onClose>` — renders null, owns the pathname subscription, fires a deferred `onClose()` (`setTimeout(0)`) when pathname changes while `isOpen` is true. Always rendered; isolates the close-on-route-change effect.
   - `<OverlayNavTile>` — per-item Tile with self-pathname-driven active state for the open-state nav grid.

Deliberately deferred (per Codex Round 2 review):
- TechLayout `usePathname` removal: too risky for hydration. Kept as-is. The shell still re-renders on path change but the tiles inside don't (the dominant cost).
- `Tile.tsx` React `isHovered` state: kept. CSS-only hover migration is a separate cleanup follow-up.

## Verification

Headless verification (Linux Codebox, does NOT prove the real-mac fix, but confirms no regression):
- `pnpm tsc --noEmit --pretty false`: exit 0, clean.
- `pnpm lint`: 0 errors, 61 pre-existing warnings (none in touched files).
- 13/13 regression tests PASS:
  - `tests/29.1-01-tech-nav-active-state.spec.ts` (data-active flips correctly across all tabs/tiles).
  - `tests/29.1-03-rankings-routes.spec.ts` (rankings hub + leaderboard render + redirect).
  - `tests/29.3-comprehensive-timeline.spec.ts` (full filter chip-click matrix; click-path landmine preserved).
- `tests/debug-rankings-categories-nav-crash.spec.ts`: 3/3 engines (chromium, webkit, firefox) PASS post-fix with healthy metrics. Same as pre-fix headless (asymmetry expected).
- `tests/debug-rankings-idle-freeze.spec.ts`: still passes (90s flat metrics, mouse-move probe 8ms).

Real-macOS verification (REQUIRED before marking resolved):
- (PENDING) Open https://glitchtech.io/tech/rankings/laptops on real macOS Safari and Firefox after deploy. Click the Categories nav tile in the left rail (desktop) or bottom tab bar (mobile). Page should navigate to /tech/categories without any freeze; other tabs of the site remain responsive. Repeat with the Reviews / Compare / Benchmarks / Blog / About nav tiles to confirm the architectural fix generalizes.

## Resolution

Status: AWAITING_HUMAN_VERIFY. Code fix committed. Headless verification clean, all regression tests pass, all three browsers in harness pass post-fix. Real-mac confirmation pending — the user's deterministic reproduction (Categories click on real macOS) is the gating verification.

**Architectural rule reinforced:** the prior session's load-bearing rule — "no synchronous React state in native input/focus/visibility event paths on /tech/rankings/laptops" — extends to **the entire (tech) shell on every real route navigation**. Future shell components must own their pathname subscription at the leaf, not at the parent.
