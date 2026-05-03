# Rankings Page Filter-State Nav Freeze — Codex Handoff

**Status as of 2026-05-03:** Resolved by Phase 48.1. The `?simple=1` diagnostic proved stable on the affected real Mac, so the default rankings display was partially rebuilt around that simpler custom display architecture. Production verification now passes: filters work, reset works, and site navigation no longer freezes after filter activity.

This document is a complete chronicle of what's been observed, tried, eliminated, decided, and finally resolved.

---

## Phase 48.1 resolution

Phase 48.1, **Rankings Display Stabilization**, closed the critical freeze.

What changed:

- The default `/tech/rankings/laptops` display no longer uses the prior TanStack/full-table rendering path.
- The stable `?simple=1` diagnostic architecture was promoted into the real default display.
- The page still keeps the route, server data, desktop filter bar, mobile filter sheet, reset behavior, product/review links, BPR, GlitchMark, benchmarks, year, price, and buy actions.
- Regression tests now target `[data-leaderboard-display]` and `[data-leaderboard-row]` instead of the removed table DOM.

Production evidence:

- Deployed commit: `c24fab8fdac1366b51b9de38d3e63388c64e71e9`
- Vercel deployment: `dpl_228GukbudMH6VtjJHQRzr2BSUzV6`
- Production URL: `https://glitchtech.io/tech/rankings/laptops`
- User tested the default production page on the affected real Mac and reported that filters, reset, and site navigation now work without the freeze.

Conclusion:

- The real choices narrowed correctly: once `?simple=1` worked and the default full table froze, the table/display architecture was the most valuable layer to replace.
- The practical fix was the partial rebuild, not a full page rewrite and not another round of low-signal compositor guesses.
- Phase 48.1 is the resolution path for this incident.

---

## 1. The bug, in plain language

User loads `https://glitchtech.io/tech/rankings/laptops` on a real macOS device (Safari OR Firefox). User interacts with any filter UI on the page (clicks a filter chip, drags the price slider, opens a filter dropdown). User then clicks any navigation tile in the left sidebar (Categories, Reviews, Compare, Benchmarks, Blog, About) to leave the page. **The entire site freezes.** Every tab of glitchtech.io becomes unresponsive. The freeze persists even when the user resets all filters back to default values before navigating — the trigger is "filter activity having occurred at any point in the session," not the current state of the filter values.

**Empty-state navigation works.** A fresh page load with no filter interaction → click any nav tile → clean route transition.

**Headless reproduction does not exist.** The bug has never been reproduced in Linux Chromium, Linux Firefox, or Linux WebKit (Playwright/headless). Multiple custom Playwright harnesses run clean. Auto-click via Playwright on the Benchmarks nav link did time out at 5 seconds during Playwright MCP investigation, but no visible compositor wedge.

---

## 2. Stack and environment

- **Framework:** Next.js 16.2.1 (App Router, Turbopack)
- **React:** 19.2.4
- **CSS:** Tailwind 4.2.x
- **UI primitives:** Radix UI (via shadcn/ui copy-into-project pattern), Lucide React icons
- **Animation:** Motion (the new Framer Motion package)
- **Carousel:** embla-carousel
- **Audio waveforms:** WaveSurfer.js
- **Table library:** @tanstack/react-table on the rankings page specifically
- **State:** React local state for rankings filters (intentional — not URL/nuqs); nuqs is used elsewhere on `/tech/compare`, `/tech/reviews`
- **Hosting:** Vercel, project name `glitch_studios` (orgId `team_76cgKQCnZExAgMLUMT62BU5Q`)
- **Domain:** glitchtech.io is one of four domains aliased to the same Vercel project (others: glitchstudios.io, glitch.reviews, glitchapparel.com)
- **There is a SECOND Vercel project named `website`** that has been failing every deploy for 8+ days because it was set up without env vars; it is currently a zombie project that does NOT serve traffic. Both glitchtech.io and glitchstudios.io route through the `glitch_studios` project.
- **Database:** Supabase Postgres via `aws-0-us-west-2.pooler.supabase.com:6543`
- **Build pattern:** Vercel auto-deploys from `master` branch on push. ~2 minutes per build.

---

## 3. Project context that matters

The project was migrated from one machine to another on 2026-05-03 due to old machine going offline. On the new machine:
- `node_modules` was platform-mismatched (Linux x64 binaries on macOS arm64) — fixed via `pnpm install` after `rm -rf node_modules`
- Git remote was SSH-only with no SSH key on new machine — switched to HTTPS using `gh` CLI's existing keyring auth
- Local repo was 218 commits ahead of `origin/master` at first push of the day
- `.next` build artifact on disk was from 2026-04-28 (pre-fix-commits) — irrelevant since user only tests prod
- `.env.local` is a copy of the working old-machine setup, plaintext values for production-DB DATABASE_URL plus other production secrets

The 218-commit fast-forward push on 2026-05-03 was the FIRST commit reaching production after April 25. Until that push, `glitchtech.io` had been serving a build older than April 25 because Vercel's `glitch_studios` project auto-deploys from master and master had been frozen.

---

## 4. Symptoms — chronological evolution

The user's framing of the bug has refined three times. Each refinement falsified some earlier hypothesis line.

### v1 (2026-04-27, prior debug session)
**"Clicking a filter chip on `/tech/rankings/laptops` freezes the entire site."**
Result: closed by commit `6af8177` — `setTimeout(0)` deferral of `setFilters` and `CustomDropdown.setOpen` so state updates don't run inside the native input event task. Stable for several days.

### v2 (2026-05-01, current debug session opening)
**"Clicking the Categories filter chip freezes the entire site. All other filter chips work."**
Initial code-grep mapped "Categories" to the `subcat`/`subCategories` facet. Static analysis found no meaningful difference in click-handler chain between Sub-cat and other chips. Inspecting actual production HTML revealed the user's term "Categories filter" actually meant the **TileNav navigation tile** linking to `/tech/categories`, not a leaderboard filter chip at all. The bug was a route navigation crash, not a filter chip crash.

### v3 (2026-05-01)
**"Clicking the Categories nav tile from `/tech/rankings/laptops` freezes the entire site."**
Codex Round 1 hypothesis stack pointed at the (tech) layout shell cascade. Commit `4c49209` shipped: per-item nav `usePathname` subscription via memoized subcomponents (`CollapsedNavTile`, `ExpandedNavTile`, `TabBarLink`, `RouteChangeCloser`, `OverlayNavTile`). Headless tests passed 3/3 cross-engine. Real-mac verification was deferred because old machine went offline that night.

### v4 (2026-05-03, after first prod deploy of session)
**"Empty-state nav works now. Filter-state nav still freezes. ALL nav tiles trigger it."**
Confirmed on real macOS Safari and Firefox. Empty-state nav (no filter interaction) navigates cleanly. Filter-state nav (after any chip click) freezes regardless of which destination tile is clicked. Reviews / Compare / Benchmarks / Blog / About all trigger.

### v5 (2026-05-03, after second prod deploy)
**Persists after `8223905` (TechLayout pathname lift + LeaderboardTable memo + dropdown lifecycle setState defer + HomepageSidebarController removal).**
Same trigger.

### v6 (2026-05-03, after third prod deploy)
**Persists after `c634c1d` (Tile CSS-only hover + GlitchHeading mix-blend-mode/filter removal + Link prefetch=false on tech nav tiles).**
Same trigger.

### v7 (2026-05-03, current)
**The crash is triggered by RESIDUE from filter activity, not the current state of the page.**
User's exact words: "I select a filter. It changes normally. Then I reset the filter. Resets normally. Then I click benchmarks in the sidebar and everything freezes." Filters are visibly back to default values at the moment of the freeze. A fresh page load with no filter interaction navigates cleanly. Therefore the freeze cannot be triggered by current state — it depends on having interacted with a filter at some earlier point in the session.

This is the framing currently in effect.

---

## 5. Reproduction — current

1. Open https://glitchtech.io/tech/rankings/laptops on real macOS (Safari OR Firefox)
2. Click any filter chip (Year, CPU, RAM, Storage, Medal, Sub-cat, or open the Price popover)
3. Optionally: click Reset to clear filters back to default
4. Click any navigation tile in the left rail (Categories, Reviews, Compare, Benchmarks, Blog, About)
5. **Site-wide freeze. All tabs of glitchtech.io become unresponsive.**

Constraints on reproduction:
- Real macOS only. Has not reproduced on any Linux browser via headless or headed Playwright.
- Both Safari and Firefox on real macOS reproduce. Chrome on real macOS not explicitly tested.
- Must be on real-mac because Linux Chromium, even when running the EXACT same code, does not visibly wedge.

---

## 6. What we know with high confidence (after 4 deploys)

- The crash happens on real macOS Safari + Firefox, deterministically.
- Empty-state nav (no filter activity) does NOT crash post-`4c49209`.
- Filter-state nav crashes regardless of:
  - Whether filters are currently set to default (after reset) or non-default
  - Which destination route is clicked (Categories, Reviews, Compare, Benchmarks, Blog, About)
  - Whether filter dropdowns are open at click moment (user has tested with dropdowns explicitly closed via Esc)
- The crash is site-wide — every open tab of glitchtech.io becomes unresponsive simultaneously, which suggests same-origin renderer process sharing in Safari/Firefox.
- The crash class matches a "compositor wedge" / "main-thread starvation" pattern — not a JavaScript exception or runtime error.
- Headless Linux Chromium does not reproduce, even with custom probe instrumentation.

---

## 7. What's been ruled out (with evidence)

| Hypothesis | How eliminated |
|---|---|
| Sub-cat filter chip is the trigger | User's actual term mapped to TileNav `<a href="/tech/categories">`, not a chip. Static-diff with other chips showed no structural difference anyway. |
| `useDesktopLayout` matchMedia regression | f840245 removed it; bug persisted unchanged. |
| Parent shell cascade — TileNav/BottomTabBar/MobileNavOverlay subscribing to pathname | `4c49209` moved subscription into memoized per-item subcomponents. Empty-state nav crash closed. |
| TechLayout subscribing to pathname | `8223905` lifted pathname read into SidebarProvider with memoized context value. Filter-state crash persists. |
| LeaderboardTable re-rendering on parent route changes | `8223905` wrapped LeaderboardTable in React.memo. Filter-state crash persists. |
| CustomDropdown's visibilitychange/pagehide/blur handlers calling synchronous `setOpen(false)` | `8223905` deferred via `setOpenAfterInput`. Filter-state crash persists. |
| Tile.tsx synchronous `setIsHovered` on mouseenter + conditional overlay mount | `c634c1d` migrated to CSS-only hover with `group-hover/tile:` named-group selector. Filter-state crash persists. |
| GlitchHeading mix-blend-mode + filter chain (~57 instances on /tech/benchmarks) | `c634c1d` removed mix-blend-mode and filter chain entirely; layers now flat-color always-mounted. Filter-state crash persists. |
| Link `prefetch` on hover stacking with filter residue + click + transition | `c634c1d` set `prefetch={false}` on all 4 tech nav tile components. Filter-state crash persists. |
| HomepageSidebarController extra layer | Removed in `8223905` as redundant. No effect on bug. |
| Tanstack table internal state churn / leaked listeners / page-leave teardown | Audited statically by gsd-debug-session-manager; clean teardown, paired listeners, zero `useEffect` on LeaderboardTable itself. |
| Sub-cat name spec-fallback null mismatch | Audited; not in click path. |
| Pending `setTimeout(0)` queue during nav (F11) | Playwright runtime probe in headless showed `pending0 = 0` between user actions. Codex Round 6 ranked it "medium" confidence pending real-mac data, then explicitly excluded from `c634c1d` bundle in Round 7. **Not yet falsified by real-mac evidence — only by headless probe.** |

---

## 8. What's been tried — deploy chronology

### Earlier (pre-2026-05-03 session):
- `6af8177` (2026-04-27): `setTimeout(0)` deferral of `setFilters` and `CustomDropdown.setOpen`. Closed v1 chip-click crash.
- `f840245` (2026-05-01): Removed `useDesktopLayout` matchMedia listener. Did not affect v3 nav-tile crash.

### This session:
- **`4c49209` (committed 2026-05-01, deployed 2026-05-03):** Per-item nav `usePathname` refactor.
  - Removed `usePathname()` from outer `TileNav`, `BottomTabBar`, `MobileNavOverlay`.
  - Added memoized per-item subcomponents (`CollapsedNavTile`, `ExpandedNavTile`, `TabBarLink`, `RouteChangeCloser`, `OverlayNavTile`).
  - Each subcomponent owns its own `usePathname` subscription.
  - Result: closed empty-state nav crash. Filter-state nav still freezes.

- **`8223905` (2026-05-03):** Lift TechLayout pathname + memo LeaderboardTable + defer dropdown lifecycle setState.
  - Removed `usePathname()` from `(tech)/layout.tsx`.
  - `SidebarProvider` now reads pathname internally, computes `isHomepage`, emits `useMemo`'d context value keyed on `[collapsed, isHomepage]`.
  - Wrapped `LeaderboardTable` in `React.memo`.
  - Changed `CustomDropdown`'s `visibilitychange` / `pagehide` / `blur` handlers to use the deferred `setOpenAfterInput(false)` instead of synchronous `setOpen(false)`.
  - Deleted `HomepageSidebarController` as redundant; `(public)/layout.tsx` now uses `SidebarProvider` directly.
  - Result: filter-state nav still freezes.

- **`c634c1d` (2026-05-03):** Three architectural reductions in one bundle.
  - Tile.tsx: dropped `useState(isHovered)` and `onMouseEnter/onMouseLeave`. CSS-only hover via named group `group/tile` and `group-hover/tile:` selectors. Glitch overlay always mounted instead of conditionally rendered. Added `group-focus-visible/tile:` for keyboard parity. Added optional `prefetch?: boolean | "auto" | null` prop forwarded to Link.
  - GlitchHeading: dropped `"use client"`, dropped `useState`, dropped mouse handlers. Layers always rendered (opacity 0). Removed `mix-blend-mode: screen`, removed `filter: hue-rotate` chain. Replaced with flat color (#ff66aa, #66ffaa) and same clip-path keyframes.
  - prefetch={false} on `CollapsedNavTile`, `ExpandedNavTile`, `TabBarLink`, `OverlayNavTile`.
  - Result: filter-state nav still freezes.

- **`ffd431b` (2026-05-03, current):** Diagnostic build, NOT a fix.
  - `?simple=1` query param: dispatcher in `LeaderboardTable` renders a flat `<ul>` of filtered rows instead of going through tanstack's `useReactTable`. Same filter sidebar, same filter state setup (duplicated to keep the existing path untouched). Tests whether tanstack is the wedge.
  - `?diag=1` query param: runtime probe wraps `setTimeout`/`clearTimeout`/`setInterval`/`clearInterval`/`requestAnimationFrame`/`cancelAnimationFrame` and document/window `addEventListener`/`removeEventListener` plus a `PerformanceObserver` for longtasks. Renders a fixed banner showing live counters. Writes trace to `localStorage.__diag` for retrieval after a freeze.
  - User has not yet tested either flag on real macOS.

---

## 9. Diagnostic builds currently live

Both flags are deployed at `https://glitchtech.io` as of commit `ffd431b`.

### `?simple=1` — strip-down test

URL: `https://glitchtech.io/tech/rankings/laptops?simple=1`

When this flag is set, the rankings page renders with a green banner saying "SIMPLE-MODE DIAGNOSTIC" and uses a flat `<ul>` of products (rank, name, BPR tier, GlitchMark score, price). No `useReactTable`, no column defs, no row models. Filter sidebar is the same as the full version.

Expected outcomes:
- `?simple=1` does NOT freeze on filter+reset+nav → tanstack is the wedge (could be promoted to permanent)
- `?simple=1` still freezes → tanstack is innocent; wedge is in something else (filter sidebar, layout shell residual, framework-level interaction)

Implementation: dispatcher pattern in `src/components/tech/leaderboard-table.tsx`. `LeaderboardTable` is `memo(LeaderboardTableDispatcher)` which uses `useSearchParams()` to pick between `LeaderboardTableInner` (existing) and `LeaderboardTableSimpleInner` (new).

### `?diag=1` — runtime instrumentation

URL: `https://glitchtech.io/tech/rankings/laptops?diag=1` (or any tech route)

When this flag is set, a green diagnostic banner is fixed to top of the page showing live counters:
- `pending0` — number of pending zero-delay setTimeouts
- `RAF` — pending requestAnimationFrame callbacks
- `int` — active intervals
- `doc.click` / `doc.pointerdown` — document-level listener counts
- `long` — longtasks observed

Plus the most recent nav-link interaction event. Trace dumps to `localStorage.__diag` (last 100 events). After a freeze, reload and run `JSON.parse(localStorage.__diag || "[]")` to retrieve.

Implementation: `src/components/debug/diag-instrumentation.tsx`, mounted in `(tech)/layout.tsx` inside `<Suspense fallback={null}>`. Activates only when URL has `?diag=1`. Wrapping is installed once via `window.__diagInstalled` guard.

### `?simple=1&diag=1` — both at once

Both flags can run simultaneously.

---

## 10. Hypothesis history (all surfaced during investigation)

H = pre-2026-05-03 framing. F = post-2026-05-03 framing. Status as of writing.

| ID | Hypothesis | Status |
|---|---|---|
| H1 | Router-sensitive app shell cascade — outer TileNav/BottomTabBar/MobileNavOverlay/TechLayout all subscribe to pathname | **Closed empty-state nav** (4c49209 + 8223905). Did not close filter-state nav. |
| H2 | Tile hover state + glitch overlay + route transition feedback loop | Eliminated by c634c1d (CSS-only hover migration). Did not close filter-state nav. |
| H3 | Categories page motion/visibility heavy mount | Eliminated by user reporting ALL nav destinations crash, not just Categories. |
| H4 | Hidden mobile nav still runs hooks/effects on desktop | Implicitly tested by 4c49209 + 8223905 fixes. Did not close. |
| H5 | Categories render volume / RSC payload | Low priority, never specifically tested. |
| H6 | Compositor/GPU wedge from glitch CSS layers | Largely eliminated by c634c1d (mix-blend-mode + filter removal). Did not close filter-state nav. |
| H7 | Audio/player layout coupling | Low priority, not tested. |
| F1 | PriceRangeSlider effect rewrite needed | Codex deferred. Not in any shipped commit. |
| F2 | CustomDropdown's `pointerdown` outside-click handler firing synchronously during nav | User testing showed crash even with dropdowns closed first → effectively falsified by repro evolution. |
| F6 | Tile.tsx synchronous setIsHovered on mouseenter | Eliminated by c634c1d. Did not close. |
| F9 | Link prefetch on hover stacking with filter residue | Eliminated by c634c1d (prefetch={false}). Did not close. |
| F11 | Untracked setTimeout(0) queue (6 sites) leaving pending macrotasks at nav time | Headless Playwright probe shows `pending0 = 0` between actions. Real-mac evidence not yet captured. Currently un-falsified for real-mac. |
| F12 | tanstack `useReactTable` internal state churn from data prop changes | Static audit found clean teardown + bounded per-instance state. Currently un-falsified — `?simple=1` deploy is the live test. |
| F13 | Per-chip useState (hover/press/focus) accumulating from filter activity | Not specifically tested. |
| F14 | DOM listeners leaked during filter interaction | Audited statically; hygiene is correct everywhere. Eliminated. |
| F15 | GPU compositor layers from glitch CSS persisting after filter activity | Largely eliminated by c634c1d. Did not close. |
| F16 | React 19 fiber concurrent work pending at transition | Not specifically tested. |

---

## 11. Codex prior verdicts (Rounds 1–8)

The Codex CLI (`codex exec`) was used as a peer reviewer at multiple points. Each round was a stateless invocation; we paste prior context every time.

- **Round 1:** Identified the (tech) shell cascade as the leading hypothesis. Recommended per-item pathname subscription. → became `4c49209`.
- **Round 2:** Reviewed the proposed `4c49209` design pre-implementation. Pushed back on `useState(window.location.pathname)` initializer for TechLayout (hydration risk on `/` and `/tech`). Recommended scope: ship NavLink + per-item refactor, defer TechLayout pathname lift and Tile.tsx hover migration. Adopted.
- **Round 3:** Reviewed implemented `4c49209` diff. Pushed back with one blocker: `closeOverlay`/`openOverlay` callbacks need to be `useCallback`-stable for the new `RouteChangeCloser` memo equality. Also fix `RouteChangeCloser` to update its `previousPathnameRef` even when closed. Also delete the unused `NavLink` utility from this bugfix commit. All adopted before commit.
- **Round 4 (after empty-state fix verified, filter-state still broken):** Approved `8223905` bundle (TechLayout pathname lift + LeaderboardTable memo + dropdown lifecycle defer). Said "ship both A and B, with modifications": named group, focus-visible parity, additional dropdown lifecycle defers.
- **Round 5 (after 8223905 didn't close it):** Reranked hypotheses, F2 at ~50% confidence, F6 at ~25%, F9 residual. Proposed the user-pasted console probe experiment to discriminate F2 from F6.
- **Round 6 (after user reported temporal residue framing):** Eliminated F2 (dropdown explicitly closed first still crashes), F12 (audit showed clean), F14 (hygiene correct). Promoted F11 + F6+F15+benchmarks compound. Said static analysis can't decide; either ship instrumentation or commit to F6+F15 fix bundle.
- **Round 7 (audit of the `c634c1d` bundle pre-commit):** SHIP all three with modifications. Tile CSS-only hover with named group. GlitchHeading converted to fully CSS-only (drop "use client", drop hooks, always-render layers, drop mix-blend-mode AND filter). prefetch={false} on tech nav tiles with passthrough prop on Tile. Explicitly EXCLUDED F11 and F1 from this bundle: Playwright pending0 = 0 falsifies F11 in headless; F1 is gated behind the price popover, not the chip+reset flow.
- **Round 8 (sanity check on `ffd431b` diagnostic build):** Flag 1 (`?simple=1`) SHIP as-is. Flag 2 (`?diag=1`) MODIFY: replace `function (this: unknown, ...cbArgs)` in setTimeout wrapper with arrow function to avoid `this` propagation lint concern. Modification applied.

---

## 12. Playwright MCP investigation (2026-05-03)

A Playwright session was driven against production glitchtech.io with a runtime probe wrapping `setTimeout`/`clearTimeout`/`addEventListener` and tracking pending IDs. Results in headless Chromium:

- After page load: `pending0 = 0`, no longtasks.
- After hovering Benchmarks nav link (empty state): `pending0 = 0`, no longtasks.
- After clicking CPU filter dropdown trigger: `pending0 = 0` (deferred setTimeout had already fired by next evaluate). Document listener counts: `pointerdown` 1 → 2, `keydown` 0 → 1, `visibilitychange` 0 → 1.
- After clicking "AMD" option in dropdown: `pending0 = 0`, listeners unchanged from open state.
- After Esc + Reset button click: `pending0 = 0`, listeners back to baseline.
- After clicking Benchmarks: **Playwright's `click` action timed out at 5s** with the locator reporting "visible, enabled, stable" and "performing click action". No JS exception, no console error. Just a hang that exceeded Playwright's auto-wait timeout.

The Playwright timeout is suggestive but not conclusive. It could indicate (a) the click started a navigation that didn't settle, (b) a heavy destination mount that exceeded the wait threshold, or (c) something more pathological. Playwright follow-up calls were rejected by the user during the timeout window so further state capture was not obtained.

The pending0 = 0 observation across all action steps is the basis for Codex's Round 7 exclusion of F11 from the fix bundle. The argument: if pending0 returns to 0 between human-paced actions, untracked setTimeout queues are not realistically the wedge cause. Counter-argument: real-mac main-thread cost may delay setTimeout firing in ways headless Linux Chromium doesn't.

---

## 13. The architecture, briefly

### Routing
- `(public)` route group: glitchstudios.io brand surface (homepage, beats store, services, etc.)
- `(tech)` route group: glitchtech.io brand surface, including `/tech/rankings/[slug]`, `/tech/benchmarks`, `/tech/reviews`, `/tech/compare`, `/tech/categories`, `/tech/blog`, `/tech/about`
- Both share components like `TileNav`, `BottomTabBar`, `MobileNavOverlay`, `Tile`, `GlitchHeading`
- A middleware rewrites glitchtech.io's `/` to `/tech` internally; usePathname returns the browser URL

### The rankings page tree (when user is on `/tech/rankings/laptops`)
- Server component `RankingsLeaderboardSlugPage` fetches data, passes to client component
- `LeaderboardTable` (client, memoized): owns filter state via React `useState`, renders `LeaderboardFilters` sidebar + tanstack `useReactTable` for the chart + `LeaderboardFilterSheet` for mobile
- `LeaderboardFilters` (`leaderboard-filter-sidebar.tsx`): renders a row of `FilterFacetDropdown` (each is a `CustomDropdown` containing chip groups), a `PriceRangeSlider`, and a Reset button
- `CustomDropdown`: opens a popup with options. While open, registers 5 listeners on document/window: `pointerdown`, `keydown`, `visibilitychange`, `pagehide`, `blur`. All cleaned up when closed.
- `PriceRangeSlider`: hand-rolled slider with `paint()` ref-DOM-mutation, RAF, multiple useEffects for lifecycle. Drag operations register window pointermove/pointerup/blur listeners.
- Filter state lives in `LeaderboardTable`'s local React state. `setFilters` defers via `setTimeout(0)`. State is never reflected to URL/nuqs (intentional — chosen 2026-04-27 to avoid shell cascade through nuqs URL writes).

### The (tech) shell tree
- `TechLayout` (client) — does NOT subscribe to pathname (post-8223905). Renders `SidebarProvider`, `TileNav`, `MobileContentWrapper` containing children + `Footer`, `BottomTabBar`.
- `SidebarProvider` (client) — reads pathname internally, computes `isHomepage`, emits memoized context value.
- `TileNav` (client, post-4c49209) — does not subscribe to pathname. Renders `CollapsedNavTile` or `ExpandedNavTile` per nav item, each owning its own pathname subscription.
- `BottomTabBar` (client, post-4c49209) — same pattern. Renders `TabBarLink` per item.
- `MobileNavOverlay` (client, post-4c49209) — renders `RouteChangeCloser` (closes overlay on path change) and `OverlayNavTile` per item, each with their own pathname subscription.
- `Tile` (post-c634c1d) — pure CSS hover via `group/tile` named group. No React state. Accepts optional `prefetch` prop forwarded to Link.

### Filter→table data flow
1. User clicks chip in `FilterFacetDropdown`
2. `onToggleX` callback → `onChange({ x: [...] })` → bubbles to `LeaderboardTable.setFilters`
3. `setFilters` schedules `setTimeout(() => setFiltersState(prev => ({...prev, ...patch})), 0)`
4. setTimeout fires → React schedules update → render
5. `filteredRows = useMemo(() => applyFilters(rows, filterState), [rows, filterState])` recomputes
6. tanstack receives new `data` prop → rebuilds row models internally
7. Table re-renders with new rows

---

## 14. Files of interest

```
src/app/(tech)/layout.tsx                      — tech shell, mounts DiagInstrumentation
src/app/(public)/layout.tsx                    — public shell
src/app/(tech)/tech/rankings/[slug]/page.tsx   — server component, fetches data
src/components/tech/leaderboard-table.tsx      — main table (785+ lines, dispatcher pattern)
src/components/tech/leaderboard-filter-sidebar.tsx — filter UI (700+ lines, CustomDropdown + PriceRangeSlider here)
src/components/tech/leaderboard-filter-sheet.tsx — mobile filter sheet
src/components/tech/leaderboard-card.tsx       — card view of products
src/components/layout/tile-nav.tsx             — left sidebar (per-item subcomponents)
src/components/layout/bottom-tab-bar.tsx       — mobile bottom bar
src/components/layout/mobile-nav-overlay.tsx   — mobile menu overlay
src/components/layout/sidebar-context.tsx      — SidebarProvider, owns pathname
src/components/tiles/tile.tsx                  — Tile primitive (CSS-only hover)
src/components/ui/glitch-heading.tsx           — GlitchHeading (CSS-only, no use client)
src/components/ui/glitch-heading.module.css    — flat-color hover layers
src/components/debug/diag-instrumentation.tsx  — runtime probe
src/lib/tech/leaderboard.ts                    — server-side leaderboard data assembly
.planning/debug/rankings-categories-filter-crash.md — full chronological investigation log
```

---

## 15. Constraints

- **User can only verify on production glitchtech.io.** They will not run local dev or local prod build. Reasons: project just migrated machines, dev environment still being stabilized, simpler than dual-track testing.
- **Real-mac only repro.** Headless Linux Chromium / Firefox / WebKit do not visibly reproduce. Headed real-mac Chrome not yet tested.
- **Build cycle is ~2 minutes.** Vercel auto-deploys from master push.
- **Each user test cycle is ~5 minutes** (deploy + manual real-mac repro). User's patience for additional cycles is limited.
- **Praxis triangle rule** (per project CLAUDE.md): non-trivial fix commits require Codex peer review before commit. Diagnosis can proceed; substantive fix commits should pause for Codex.

---

## 16. What has not been tested

- **Real-mac diagnostic capture.** `?diag=1` is shipped but no user test cycle has been spent on it yet. The localStorage trace from a real-mac freeze has never been retrieved.
- **The `?simple=1` strip-down.** Shipped but not yet user-tested.
- **Headless real-mac WebKit (not just Linux WebKit).** Playwright on macOS hardware was not attempted; only on Linux Codebox.
- **Chrome on real macOS.** Only Safari and Firefox have been tested on real-mac; Chrome could provide a third data point.
- **Filter sidebar with no table rendering at all.** A more aggressive isolation than `?simple=1` (which still has the filter sidebar + a flat list) — would test whether the filter sidebar alone causes residue. Not implemented.
- **Page with no filter sidebar at all (sortable list only).** The most aggressive isolation; would prove whether filter UI is the cause. Not implemented.
- **Bisecting Codex Round 7's three-change bundle.** All three changes (Tile CSS-only, GlitchHeading, prefetch) shipped together in `c634c1d`. We don't know which contributed what. None alone has been validated against the bug.

---

## 17. State of the project right now

- Latest commit on master: `ffd431b` (diagnostic build).
- Live on glitchtech.io: yes.
- Bug status: **persists** as of last user real-mac test (after `c634c1d`).
- Pending real-mac tests: `?simple=1`, `?diag=1`, `?simple=1&diag=1`.
- User mood: exhausted, considering whether to scrap the rankings page and rebuild from scratch.

The user's last spoken question: "Is it prudent to just scratch this and start over with a more, simpler, better-designed chart?"

The user has authorized any action this session including aggressive code changes, env var changes on Vercel, git push to production, and platform setup. The Praxis triangle rule (Codex review pre-commit) is in effect.
