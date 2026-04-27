---
status: awaiting_human_verify
trigger: "Filter chip click on /tech/rankings/laptops crashes macOS Safari + Firefox tabs. Chrome doesn't crash. 6+ hours debugging across 15+ deploys has not fixed it."
created: 2026-04-26T00:00:00Z
updated: 2026-04-27T16:30:00Z
root_cause_identified: 2026-04-27T00:48:22Z (commit 6af8177)
fact_pattern_supersedes: "image-decode + drop-shadow + min-width hypotheses (kept below for history)"
gating_artifact: .planning/phases/29.3-rebuild-filter/29.3-06-PLAN.md
---

## Current Focus (2026-04-27 — supersedes earlier hypotheses)

root_cause: **Native pointer/style feedback loop on synchronous React state updates inside native input event handlers.** When `setFilters` (or `setOpen` on the dropdown) ran synchronously inside a native pointerdown/click, the resulting style invalidation fired synthetic pointer events that re-entered the input handler before it had unwound — the browser's pointer/style processing cycle started feeding itself. Same class on Safari (Core Animation) and Firefox (WebRender) on Apple Silicon, both Metal-backed.

how_isolated: Codex reproduced the freeze locally on **headless Chromium with REAL MOUSE input** (not synthetic `.click()`). Eliminated transitions/animations, IntersectionObserver/Link prefetch, table row filtering, and even replaced the table with a placeholder — freeze persisted. Only deferring the React state update out of the native event task (via `setTimeout(0)`) cleared it. Closing the dropdown also froze until `setOpen` was deferred the same way.

fix (commit 6af8177, 2026-04-27 00:48 EDT):
  1. `src/components/tech/leaderboard-table.tsx:230` — `setFilters` defers `setFiltersState` via `setTimeout(0)`
  2. `src/components/tech/leaderboard-filter-sidebar.tsx:72` — `CustomDropdown.setOpen` defers via `setOpenAfterInput` helper
  3. Removed unused `ArrowUpDown` import

verified_codex_local: Real mouse open → chip click → close × 6 cycles on Chromium + Firefox + WebKit. Rows toggled correctly (6 → 1 → 6), trigger label toggled (`YEAR` → `YEAR (1)` → `YEAR`).

verified_codebox_headless: Plan 29.3-04 comprehensive timeline test passes 4/4 on chromium + webkit + firefox via dev server (~1m total). dispatchEvent('click') was used because the **chip-bar's setFilters re-render schedule** competes with synthetic Playwright .click() — that finding is now consistent with the native-event hypothesis.

verified_real_macos: **NOT YET.** Plan 29.3-05 verification on real macOS Safari at 03:15Z FAILED, but that test predated commit 6af8177 (the root-cause fix). Plan 29.3-06 deploys the post-6af8177 + post-`ba1e747` + post-`12214c7` + uncommitted gating work and re-verifies on real macOS.

post_root_cause_gating_commits:
  - 6af8177 fix(29.3): defer setFilters + dropdown setOpen out of native input event ← root-cause fix
  - 12214c7 fix(29.3): price slider commit-on-release + revert table-fixed
  - ba1e747 fix(29.3): replace Base UI slider with hand-rolled PriceRangeSlider + defer mobile sheet open
  - c9d8c60 test(29.3): comprehensive timeline test — full interaction matrix on all 3 engines
  - (uncommitted) bpr-medal.tsx — replace Base UI Tooltip with native `title=` (Floating UI portal exhaustion)
  - (uncommitted) leaderboard-table.tsx — additional defer cycles + useEffect for cleanup
  - (uncommitted) leaderboard-filter-sidebar.tsx — `closeBeforePageSuspends` page-lifecycle handler

next_action: Deploy preview from current working tree → real macOS Safari + Firefox chip-click verification per 29.3-06-VERIFICATION.md.

---

## Earlier Focus (2026-04-26 — hypotheses 1 + 2 were necessary but NOT sufficient — kept for history)

> The image-decode + drop-shadow + min-width-1600px hypotheses below are kept as the historical investigation trail. They were *real* GPU/compositor costs and the fixes shipped in Plan 29.3-01 baseline + Plan 29.3-03 chunks remain valid. They were just not the dominant cause. The 03:15Z Safari freeze persisted with all three fixes in place. The real root cause was identified later that morning by Codex via real-mouse headless reproduction (see "Current Focus" above).

hypothesis: Two compounding macOS-GPU costs:
  (1) `<Image src="placehold.co/1200x800.png" unoptimized />` × 7 rows downscaled to 48×48 — re-decoded on every chip click via Metal/ImageIO and WebRender pipelines. This is the strongest single suspect because it explains BOTH the resource exhaustion AND the "first chip click sometimes doesn't register" symptom (long synchronous image decode blocks the commit phase, so the click event fires but the resulting render is dropped/deferred).
  (2) Permanent `filter: drop-shadow()` on the always-mounted LogoTile — adds GPU layer pressure that compounds with (1).

Both are macOS-GPU-only costs that Linux headless tests cannot reproduce.

test: User must verify on real macOS Safari + Firefox. After deploy, navigate to /tech/rankings/laptops, open any filter dropdown, click a chip. Watch for tab CPU + responsiveness. Verify the first chip click registers (aria-pressed flips immediately).

expecting: If image-decode was the dominant cost (likely), tab will stay responsive and chip clicks will register on first try. If the bug persists at all, the remaining cost is the `min-width: 1600px` overflow-scroll surface — that's the next fix to ship (deferred for now to keep this change small and reversible).

next_action: Ship to Vercel preview, ask user to verify on macOS Safari + Firefox.

## Symptoms

expected: Filter chip click toggles selection, table re-renders, page stays responsive
actual: macOS Safari + Firefox tabs consume excessive resources and die on chip click. Chrome handles it. Headless Playwright (Chromium + Webkit) on Linux: 0% CPU, clean cycles, no crash.
errors: No console errors. CDP profile shows no JS hot path. Browser appears genuinely idle in headless tests.
reproduction: Visit https://glitchtech.io/tech/rankings/laptops on macOS Safari/Firefox. Open filter dropdown. Click any chip. Tab dies.
started: Existed before commit 0952d3a (filter rebuild). Pattern persists throughout 29.1 phase.

## Eliminated

- hypothesis: Sticky cells inside overflow-x:auto wrapper
  evidence: Removed all 15 sticky elements; bug persists
  timestamp: prior

- hypothesis: framer-motion template wrapper causing route churn
  evidence: Replaced with plain div; bug persists
  timestamp: prior

- hypothesis: Base UI Popover / Floating UI portals leaking listeners
  evidence: Replaced with hand-rolled CustomDropdown; bug persists
  timestamp: prior

- hypothesis: ~64 Base UI tooltips leaking FloatingPortal listeners
  evidence: Replaced with native title attributes; bug persists
  timestamp: prior

- hypothesis: startTransition wrapping setFilters wedging React
  evidence: Removed; bug persists
  timestamp: prior

- hypothesis: BottomTabBar router.prefetch on every URL change
  evidence: Removed; bug persists
  timestamp: prior

- hypothesis: TanStack table row DOM churn
  evidence: Added getRowId; bug persists
  timestamp: prior

- hypothesis: nuqs URL sync triggering router-sensitive re-renders
  evidence: Replaced with plain useState; bug persists
  timestamp: prior

- hypothesis: Mix-blend-mode on GlitchHeading / LogoTile always-mounted layers
  evidence: Made hover-only mount; bug persists (but may have helped — needs check elsewhere)
  timestamp: prior

- hypothesis: Service worker
  evidence: None registered
  timestamp: prior

- hypothesis: WebGL canvas on this page
  evidence: None present
  timestamp: prior

- hypothesis: Infinite animation / rAF / listener / DOM leak
  evidence: Headless tests show all flat
  timestamp: prior

## Evidence

- timestamp: 2026-04-26
  checked: Initial briefing
  found: Asymmetry — headless Linux Chromium+Webkit show 0% CPU and clean cycles, but real macOS Safari + Firefox both crash on chip click. Chrome on macOS less affected.
  implication: Bug is in something headless software rendering doesn't engage — most likely GPU compositor (Metal / WebRender), hardware-accelerated paths, or macOS-specific Core Animation interaction. Common cause across both Safari and Firefox on macOS = the layer count / compositing complexity, since Safari uses Core Animation and Firefox WebRender, but both are Metal-backed on Apple Silicon and both struggle with the same kinds of GPU-heavy CSS (backdrop-filter, mix-blend-mode, complex filters, will-change abuse).

- timestamp: 2026-04-26
  checked: src/components/tech/leaderboard-table.tsx product cell
  found: Each row renders `<Image src={heroImageUrl} unoptimized width=48 height=48 />` where heroImageUrl is `https://placehold.co/1200x800/0a0a0a/f5f5f0/png?text=Placeholder+Laptop` — the SAME giant PNG for all 7 rows, downscaled in DOM to 48×48. Because `unoptimized` is set, Next.js bypasses image optimization and serves the raw 1200×800 PNG to the browser, then the browser must downscale 7 copies to 48×48 in the GPU. On chip click, React reconciles the table — even with `getRowId` keeping `<tr>` keys stable, the `flexRender` cell function returns a new element tree each render, and `<Image>`'s internal state (loading/loaded ref) may re-evaluate. Safari's ImageIO + Metal pipeline aggressively re-decodes the same large PNG when invalidated.
  implication: This alone could account for a Safari/Firefox CPU spike that does not appear in headless tests because Playwright's image loader is heavily cached/stubbed across navigations.

- timestamp: 2026-04-26
  checked: src/components/tiles/logo-tile.module.css
  found: `.glitchWrapper` has `filter: drop-shadow(0 0 18px rgba(255,255,255,0.35))` permanently applied + `transition: filter 0.3s`. This is on the always-mounted LogoTile in the sidebar. drop-shadow forces a GPU compositing layer for that subtree on Metal/WebRender even when nothing animates. While not directly tied to chip click, it adds permanent GPU memory pressure that compounds when other repaints happen.
  implication: Removing this drop-shadow eliminates one of the few persistent GPU-layer triggers in the always-mounted shell.

- timestamp: 2026-04-26
  checked: src/components/tech/leaderboard-table.tsx
  found: `<table style={{ minWidth: "1600px" }}>` inside a `<div className="overflow-x-auto">`. On a typical macOS laptop viewport (1440-1680px wide), the table extends BEYOND the visible viewport, creating a wide horizontal scroll surface that the GPU must rasterize at full width. On chip click, the table's row count changes (because filter changes filteredRows.length), so the entire table re-flows. Metal/WebRender must invalidate the entire 1600px-wide GPU layer.
  implication: Three vectors compound on each chip click: (1) 1600px wide table forced re-flow, (2) 7 large unoptimized images potentially re-decoding, (3) sidebar drop-shadow GPU layer competing for compositor resources. Headless Linux uses software rendering for all three and so doesn't see the cost.

## Resolution

root_cause: Two compounding macOS-GPU-only costs, neither visible in headless Linux tests:

  1. PRIMARY — Each leaderboard row rendered `<Image src="https://placehold.co/1200x800/0a0a0a/f5f5f0/png?text=Placeholder+Laptop" unoptimized width=48 height=48 />`. Every row pointed at the SAME 1200×800 PNG, downscaled in the browser to 48×48. With `unoptimized`, Next.js bypassed image optimization and shipped the raw 1200×800 file 7×. On chip click, the table re-renders, `flexRender` returns a fresh element tree per cell, and macOS Safari's ImageIO + Firefox's WebRender re-decode the same large PNG 7 times through Metal. Headless Playwright's image cache hides this — real macOS browsers can't.

  2. SECONDARY — `.glitchWrapper` (the LogoTile in the always-mounted sidebar) carried a permanent `filter: drop-shadow(0 0 18px rgba(255,255,255,0.35))` plus a `transition: filter 0.3s`. drop-shadow forces a permanent GPU compositing layer for the wrapper, even when no animation is running. Combined with the chip-click re-paint, this layer competed for GPU/compositor resources on Metal/WebRender. Headless Linux uses software rendering and so doesn't pay this cost.

fix:
  1. src/components/tech/leaderboard-table.tsx — replaced the `<Image>` in the product cell with a CSS-color tile (initial letter on a `bg-[#111]` square). Removed the `next/image` import. Added inline comment noting this should be reverted when real product imagery ships, with a warning to NOT serve a 1200×800 source for a 48×48 render.
  2. src/components/tiles/logo-tile.module.css — removed `filter: drop-shadow()` and `transition: filter 0.3s` from `.glitchWrapper`'s base state. Kept the hover-only filter so the visual glow returns when the user actually mouses the logo.

verification:
  - tsc --noEmit: passes (only pre-existing unrelated forensics-overlay-leak.spec.ts error)
  - eslint on changed files: clean
  - Component contract preserved (heroImageAlt → aria-label on placeholder tile)
  - Awaiting macOS Safari + Firefox real-browser verification by the user.

files_changed:
  - src/components/tech/leaderboard-table.tsx
  - src/components/tiles/logo-tile.module.css
