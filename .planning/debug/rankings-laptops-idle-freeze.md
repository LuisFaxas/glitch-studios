---
status: superseded-wrong-framing
trigger: "/tech/rankings/laptops freezes when idle (no interaction); freeze propagates site-wide after ~1 minute. Reported 2026-05-01 — separate fault class from the prior click-path crash."
created: 2026-05-01T00:00:00Z
updated: 2026-05-01T05:55:00Z
superseded_by: .planning/debug/rankings-categories-filter-crash.md (the actual user-reproducible trigger is interaction, not idle)
related_session: .planning/debug/filter-chip-crash-mac-browsers.md (resolved 2026-04-27, click-path — different fault class)
fault_class: idle-freeze-with-site-wide-propagation
fix_commits:
  - c5b488b test(48-22): add idle-freeze repro harness for /tech/rankings/laptops
  - f840245 fix(48-22): remove useDesktopLayout to close idle-freeze vector on /tech/rankings/laptops
---

> **STATUS UPDATE 2026-05-01T05:55Z — framing was wrong.** The user's 2026-05-01 reproduction proved this is NOT an idle freeze. It is a deterministic interaction-triggered crash on clicking the "Categories" navigation tile from /tech/rankings/laptops. Investigation continues in `.planning/debug/rankings-categories-filter-crash.md`. The f840245 useDesktopLayout removal IS still defensible standalone (consistent with the architectural rule of no setState in matchMedia/visibility/focus handlers on this route) and is being kept per Codex Round 1 of the new session.

> **Related (different fault class):** `.planning/debug/filter-chip-crash-mac-browsers.md` was the click-path freeze on the same surface, resolved 2026-04-27 via deferred-update pattern (commit 6af8177). The architectural constraint from that session — **no synchronous React state in native input/focus/visibility event handlers** — must be preserved by any fix produced here.

## Symptoms

expected: Page renders, sits idle, stays responsive. Other site pages unaffected.
actual: Page freezes randomly even with NO user interaction. After ~1 minute idle, the freeze propagates site-wide — other tabs/pages of the site also become unresponsive.
errors: Not yet captured. Repro harness must capture console logs, page errors, network state, JS heap, active timer/observer counts, and WebGL context count.
reproduction: Open https://glitchtech.io/tech/rankings/laptops in production OR `pnpm dev` on local. Leave idle ~60–90s. Observe freeze with no input.
timeline: Reported 2026-05-01. Prior click-path freeze on the same page was fixed 2026-04-27 (commit 6af8177). The idle/site-wide pattern is either always-present-but-unnoticed or emerged in subsequent commits (Phase 29.2 site-wide hero rollout, Phase 47/48 launch-blocker work).

## Forensic Map

Site shell on `/tech/rankings/laptops`, mounted always (top-down):

- **`RootLayout`** (`src/app/layout.tsx`):
  - `NuqsAdapter` → URL state (no listeners)
  - `AudioPlayerProvider` — `<audio preload="metadata">` global element. Event-driven only (timeupdate/loadedmetadata/ended). NO polling, NO setInterval, NO AudioContext unless user explicitly plays a beat.
  - `CartProvider` — `localStorage` hydrate via `setTimeout(0)`. Persists on items change. NO storage event listener. NO BroadcastChannel.
  - `TooltipProvider` (Radix) — passive context, no listeners.
  - children
  - `CartDrawer` — `Sheet` only renders content when `isOpen=true`.
  - `FloatingCartButton` — static button, no listeners.
  - `Toaster` (sonner) — sonner's internals attach `document.addEventListener('visibilitychange', cb)` per `useIsDocumentHidden` mount. Cleanup tries to remove from `window` (LIBRARY BUG) — net effect: one persistent visibility listener that survives. Does NOT cause idle work; only fires on visibility change.

- **`(tech)/layout.tsx`** (`use client`, uses `usePathname`):
  - `SidebarProvider` (collapsed state)
  - `TileNav` — uses `useSession()` (better-auth), renders `TechLogoTile` (calls `LogoTile`), navigation tiles, cart button, auth tile, widgets (`WidgetLatestReview`, `WidgetFeaturedProduct`, `WidgetSocialTech`), `StudiosCrossLinkTile`. Sidebar `<aside>` has `transition-[width,min-width] duration-300`.
  - `MobileContentWrapper` — uses `useAudioPlayer()` for `playerActive` derived value. CSS `transition-[padding-bottom] duration-200 ease-out`.
  - `BottomTabBar` — uses `usePathname` and `MobileNavOverlay` (which uses `useSession`). `setOverlayOpenAfterInput` defers via `setTimeout(0)`.

- **Page** (`src/app/(tech)/tech/rankings/[slug]/page.tsx`):
  - Breadcrumb (server-rendered links)
  - `TechHero` — one `GlitchHeading` (hover-only mount), one `Link`. No auto animations.
  - `LeaderboardTable` (TanStack table, plain useState filters):
    - `useDesktopLayout` hook — `matchMedia("(min-width: 768px)")` change listener with `setTimeout(0)` debounce
    - `LeaderboardFilters` (bar layout) — `CustomDropdown` per facet (only when `open=true` does it attach pointerdown/keydown/visibilitychange/pagehide/blur listeners)
    - `LeaderboardFilterSheet` (mobile only) — Base UI Sheet with deferred open

Long-lived idle work in app code: NONE FOUND.

Long-lived idle work in dependencies:
- **better-auth `WindowBroadcastChannel`** — `localStorage.setItem("better-auth.message")` + `addEventListener("storage")` cross-tab. Recipient does `triggerRefetch({event:"storage"})` → `sessionSignal.set(!sessionSignal.get())` → ONE `/get-session` fetch. Only fires on app-initiated `broadcastSessionUpdate` (sign in / sign out / etc), which idle does NOT trigger.
- **better-auth `WindowFocusManager`** — `document.addEventListener("visibilitychange", visibilityHandler)`. With `refetchOnWindowFocus: false` set in `auth-client.ts`, the refetch is short-circuited inside `setupFocusRefetch()`. Net effect: one passive visibility listener.
- **better-auth `WindowOnlineManager`** — online/offline listeners on `window`. Only fires on real network state change.
- **sonner `useIsDocumentHidden`** — `document.addEventListener('visibilitychange', cb)` + buggy cleanup that removes from `window` instead of `document`. Net effect: one persistent visibility listener (since Toaster never unmounts).

## Codex Parallel Audit

(See INVESTIGATION LOG below for full Codex round-trips.)

## Hypothesis Ranking

| # | Name | Confidence | Status |
|---|---|---|---|
| H1 | Cross-tab storage/channel feedback loop | high | ELIMINATED — no idle-driven message poster in app code; better-auth broadcast only fires on app-initiated session changes |
| H2 | GPU/compositor exhaustion (post-29.2) | med-high | ELIMINATED on rankings — no WebGL/canvas/video on this route; CSS infinite animations are gated to non-rankings surfaces or hover-only |
| H3 | 60s shared timer/refetch storm | med-high | ELIMINATED — only `setInterval` in src/ is admin-only `use-autosave.ts` |
| H4 | Service worker / cache controller | med | ELIMINATED — no SW registered |
| H5 | AudioPlayerProvider decode/progress leak | med | ELIMINATED — event-driven, no polling, no AudioContext |
| H6 | React idle/concurrent starvation | med-low | ELIMINATED on rankings — no `useTransition`/`useDeferredValue`/`requestIdleCallback` in this code path |
| H7 | Image decode cache pressure | med | ELIMINATED — placeholder rows are CSS-only tiles; no `<Image>` on TechHero/Leaderboard |
| H8 | Native visibility/focus regression of click-path landmine | med-low | UNFALSIFIED — possible but no obvious vector found in app code |
| H9 | Third-party widget idle script | low-med | ELIMINATED — `WidgetSocialTech` is plain `<a>` tiles, no iframes/scripts |

After Round 1: all "obvious" hypotheses falsified by code-only audit.

## Repro Harness

`tests/debug-rankings-idle-freeze.spec.ts` — Playwright spec that:
1. Patches `setInterval`/`setTimeout`/`requestAnimationFrame`/`IntersectionObserver`/`ResizeObserver`/`MutationObserver`/`HTMLCanvasElement.getContext` BEFORE page mount via `addInitScript`.
2. Snapshots `performance.memory.usedJSHeapSize`, active counts, and `performance.getEntriesByType('longtask')` at t=2,30,60,90s.
3. After 90s, fires synthetic mouse-move and measures latency.
4. Writes `.planning/debug/artifacts/rankings-idle-<browser>-<timestamp>.json`.

Run: `PLAYWRIGHT_BASE_URL=https://glitchtech.io pnpm exec playwright test tests/debug-rankings-idle-freeze.spec.ts --project=desktop`

### Run 1 results — chromium against PROD glitchtech.io

```
t=2s:  heap=18.2MB intervals=0 timeouts=6 rafs=0 IO=1 RO=0 MO=0 webgl=0 longTasks=174ms err=0
t=30s: heap=18.2MB intervals=0 timeouts=6 rafs=0 IO=1 RO=0 MO=0 webgl=0 longTasks=174ms err=0
t=60s: heap=18.2MB intervals=0 timeouts=6 rafs=0 IO=1 RO=0 MO=0 webgl=0 longTasks=174ms err=0
t=90s: heap=18.2MB intervals=0 timeouts=6 rafs=0 IO=1 RO=0 MO=0 webgl=0 longTasks=174ms err=0
mouse-move probe at t=90s: 16ms
```

### Run 2 results — webkit against PROD glitchtech.io

Same flat profile. Mouse-move probe: 13ms.

**Conclusion:** headless harness on Codebox cannot reproduce the freeze. Same asymmetry as the prior session.

## Investigation Log

- 2026-05-01T00:00Z: Session opened. Spawning Codex parallel audit. Beginning forensic map.
- 2026-05-01T04:21Z: Codex Round 1 returned 9 hypotheses (H1–H9). Strongest: H1 (cross-tab) + H2 (GPU) + H3 (60s timer).
- 2026-05-01T04:22Z: Forensic map complete. Falsifier-grep run on app code:
  - `BroadcastChannel`: 0 matches in app code (only in better-auth dependency, app-initiated only)
  - `setInterval`: 1 match — `use-autosave.ts` (admin-only)
  - `requestAnimationFrame`: 3 matches — `PixelCard` (not on rankings), `leaderboard-filter-sidebar.tsx` (price slider drag only), `Waveform` (canvas, not on tech route)
  - `new IntersectionObserver`: 1 match — `comparison-benchmark-list.tsx` (not on rankings)
  - `new ResizeObserver`: 2 matches — `PixelCard` (not on rankings), `Waveform` (not on tech route)
  - `new MutationObserver`: 0 matches
  - `getContext('webgl`: 0 matches in app code
  - `localStorage.`: 4 matches — `cart-provider.tsx` (write-only on items change), `beat-catalog.tsx` (not on rankings)
  - `addEventListener.*storage`: 0 matches in app code
  - `visibilitychange / focus / blur / pagehide / pageshow`: 4 matches all in `leaderboard-filter-sidebar.tsx` (gated to dropdown.open or active drag)
- 2026-05-01T04:25Z: Build harness `tests/debug-rankings-idle-freeze.spec.ts`. Run against PROD chromium + webkit. **Both pass with completely flat metrics. Headless cannot reproduce.**
- 2026-05-01T04:30Z: Inspected `node_modules/better-auth` to verify the broadcast/focus/online-manager behavior. Confirmed: app-initiated message poster only; passive listeners; `refetchOnWindowFocus: false` short-circuits the refetch.
- 2026-05-01T04:31Z: Inspected `node_modules/sonner`. Found library bug — `useIsDocumentHidden` adds listener to `document` but cleanup removes from `window`. Net: one persistent passive listener. Not idle-causing.
- 2026-05-01T04:32Z: Spawning Codex Round 2 with full evidence and asking for: instrumentation kit for real-mac console, falsification of "headless can't reproduce", next-best intervention.

### Codex Round 1

prompt summary: ranked-list of hypotheses for idle-with-site-wide-propagation freeze on `/tech/rankings/laptops`. Note prior eliminated set; require falsifiable, idle-explaining, site-wide-propagation-explaining hypotheses.
codex verdict (one paragraph): Generated 9 hypotheses. Strongest signal: H1 cross-tab (BroadcastChannel/storage), then H2 GPU/compositor regression from Phase 29.2 hero rollout, then H3 60-second timer/refetch storm. Cheapest first move: grep for storage/channel/timer constructs.
my response: Concur the rankings prioritized H1/H2/H3 are sensible. Falsified all three by code audit + harness. Continuing to Round 2 with fuller evidence.

## Eliminated

- hypothesis: Cross-tab storage/channel feedback loop (H1)
  evidence: `rg "BroadcastChannel|addEventListener.*storage" src` → 0 matches in app code. Only better-auth has a `WindowBroadcastChannel` and it only posts on app-initiated session events (signIn/signOut), never idle.
  timestamp: 2026-05-01T04:22Z
- hypothesis: GPU/compositor exhaustion (H2)
  evidence: No WebGL/canvas/video on `/tech/rankings/laptops`. CSS `mix-blend-mode`/`filter: drop-shadow()` are hover-only mounted. Infinite CSS animations are on non-rankings surfaces.
  timestamp: 2026-05-01T04:22Z
- hypothesis: 60s shared timer storm (H3)
  evidence: `rg "setInterval" src` → only `use-autosave.ts` (admin-only).
  timestamp: 2026-05-01T04:22Z
- hypothesis: Service worker (H4)
  evidence: No SW registered, no `next-pwa`, no `sw.js`.
  timestamp: 2026-05-01T04:22Z
- hypothesis: Audio decode leak (H5)
  evidence: `AudioPlayerProvider` is event-driven only; no polling, no `AudioContext` allocated unless user plays.
  timestamp: 2026-05-01T04:22Z
- hypothesis: React concurrent starvation (H6)
  evidence: `rg "useTransition|useDeferredValue|requestIdleCallback" 'src/app/(tech)' src/components/tech` → 0 matches.
  timestamp: 2026-05-01T04:22Z
- hypothesis: Image decode cache pressure (H7)
  evidence: Rankings rows render CSS-only tiles. No `<Image>` on rankings code path.
  timestamp: 2026-05-01T04:22Z
- hypothesis: Third-party widget idle script (H9)
  evidence: `WidgetSocialTech` is plain `<a>` tiles. No iframes, no scripts, no analytics.
  timestamp: 2026-05-01T04:22Z

### Codex Round 2

prompt summary: full evidence dump (harness data flat across 90s, all 9 Round-1 hypotheses falsified by code audit), ask Codex to (a) try to falsify "headless can't reproduce", (b) propose specific instrumentation kit for real-mac console, (c) rank highest-EV intervention.
codex verdict (one paragraph): Concurs with eliminations of WebGL/JS-loop/poll/SW vectors. Flags that "no WebGL/canvas/video" does NOT fully eliminate GPU/compositor failure on real macOS — the visual pipeline can wedge while JS is flat. Strongest remaining LOCAL suspect: `useDesktopLayout` because it has all three risk ingredients (matchMedia + setState + setTimeout(0)) and Safari/Firefox on real macOS can fire spurious `change` events on wake/refocus, near-breakpoint resize/zoom, or external monitor DPR changes. Best NEXT TEST: remove `useDesktopLayout` and use CSS-only responsive switching. Provided a comprehensive instrumentation kit for real-mac Safari console (rAF gap detection, longtask/layout-shift PerformanceObservers, GPU/WebGL probe, lifecycle event log, freeze detector that writes to localStorage every iteration so the user can recover the log after the page unfreezes). Disagreement: do not treat headless pass as proof of idle-safe; better-auth multiple-useSession theory is weak.
my response: Concur. The `useDesktopLayout` intervention is path-local, low-risk, and doesn't regress the click-path landmine. Apply it now.

### Codex Round 3

prompt summary: full diff of the proposed `useDesktopLayout` removal + the `{renderDesktop && ...}` / `{renderMobile && ...}` JSX gate removals. Ask for review focused on click-path landmine, behavior change, hydration cost, SSR risks, Sheet portal mount.
codex verdict (one paragraph): No blocking findings. Concurs ship-it. Important nuance: SSR + first client render already rendered both subtrees because `isDesktopLayout` started `null`, so initial hydration cost does NOT increase — the change is purely steady-state (hidden subtree stays mounted instead of being unmounted after the matchMedia effect resolves). Sheet portal/focus machinery stays absent until `open=true` so always-mounting `<Sheet>` is safe. Residual risk: this fix may have masked rather than resolved if the freeze is triggered by another native focus/visibility path on real macOS. Verdict: SHIP IT. Best follow-on defensive intervention if the freeze persists: a route-local guard/harness that fails on synchronous setState-like updates from native focus/visibilitychange/input/matchMedia/resize paths during `/tech/rankings/laptops` idle/click probes — turns the landmine into something observable.
my response: Concur. Committed.

## Root Cause

**Highest-EV remaining hypothesis:** `useDesktopLayout` in `src/components/tech/leaderboard-table.tsx` has the same three risk ingredients as the prior session's click-path landmine (matchMedia + setTimeout(0) + setState). On real macOS Safari/Firefox the `mq.change` listener can fire on tab wake/refocus, system sleep recovery, external monitor DPR changes, or near-breakpoint resize/zoom — each fire triggered a re-render of the entire LeaderboardTable subtree. Headless Linux Chromium does not engage these macOS lifecycle paths, which is why every Playwright harness run was flat.

**Caveat (per Codex Round 3):** Headless tests cannot prove this is the root cause for a real-mac-only freeze. The fix removes the strongest path-local suspicious vector and aligns with the prior session's "no synchronous React state in native input/focus/visibility event paths on this route" load-bearing rule. Final verification must come from the user on real macOS Safari + Firefox.

## Fix

**Commit:** `f840245 fix(48-22): remove useDesktopLayout to close idle-freeze vector on /tech/rankings/laptops`

Files changed:
- `src/components/tech/leaderboard-table.tsx`:
  - Dropped `useEffect` import; `useDesktopLayout` hook fully removed.
  - Removed the `isDesktopLayout` / `renderDesktop` / `renderMobile` derived flags from `LeaderboardTable`.
  - Removed all `{renderDesktop && (...)}` and `{renderMobile && (...)}` JSX gates. The wrapped subtrees keep their `hidden md:block` / `block md:hidden` Tailwind classes — Tailwind responsive utilities now handle visibility. The hidden subtree is `display: none` so the browser does not paint or composite it.
  - Both desktop and mobile DOM subtrees mount once on hydration and stay there.
  - `LeaderboardFilterSheet` is rendered unconditionally — its trigger button is `md:hidden`, so it stays display-hidden on desktop, and the Sheet content portal only renders when `open=true` (per Codex Round 3 verification).

**Click-path landmine preserved:** the fix REMOVES a setState path from a native event handler. It cannot regress the click-path crash.

**SSR/hydration unchanged:** before the fix, `isDesktopLayout` started `null`, so SSR + first client render already rendered both subtrees. Steady-state DOM is slightly larger (hidden subtree stays mounted), but `display: none` keeps it inert.

## Verification

Headless verification (codebox) — does NOT prove the real-mac fix, but confirms no regression in measurable behavior:
- `pnpm tsc --noEmit --pretty false` — exit 0, clean
- `pnpm lint` — 0 errors, 61 pre-existing warnings, none in this file
- `tests/29.3-comprehensive-timeline.spec.ts` — PASS on local dev (port 3050) — year-batch-clicks (1.9s), year-filter-applied (0.5s), cross-facet-medal (0.2s), reset-filters (0.2s), price-slider-drag (1.5s), stress-open-close-cycles (12.8s). Click-path landmine confirmed preserved.
- `tests/29.1-03-rankings-routes.spec.ts` — 4/4 PASS (rankings hub heading, leaderboard render, redirect, View Rankings CTA)
- `tests/debug-rankings-idle-freeze.spec.ts` against local dev port 3050 — 90s idle stays flat: heap=24.5MB constant, intervals=1 (HMR), timeouts=18 (HMR), 1 IO/RO/MO each (HMR), 0 longTasks beyond initial 312ms, mouse-move probe 12ms, 0 console/page errors.
- Stale test: `tests/29.3-filter-chip-crash.spec.ts` fails on `[role="dialog"][data-open]` selector — that test was written for the old Base UI Popover and has been broken since the CustomDropdown rebuild (NOT a regression of this fix). Update or retire it as a separate follow-up.

Real-macOS verification (REQUIRED before marking resolved):
- (PENDING) Open `https://glitchtech.io/tech/rankings/laptops` in real macOS Safari and Firefox (NOT headless, NOT preview). Leave idle 90+ seconds. Observe whether the freeze still occurs.
- (PENDING) If freeze persists, paste the instrumentation kit (Codex Round 2, embedded in this debug file) into Safari Web Inspector Console BEFORE the freeze. The kit logs rAF gaps, lifecycle events, and a heartbeat every 1 second to localStorage. After the freeze (recover via clicking out, force quit, or letting it timeout), retrieve the log via `localStorage.getItem('__rankings_idle_probe_v1')` and attach to this debug session.

## Resolution

**Status:** AWAITING_HUMAN_VERIFY. Code fix committed. Headless verification clean. Real-mac confirmation pending.

**Follow-on if freeze persists on real macOS** (per Codex Round 3 recommendation): add a route-local guard/harness that logs/fails on synchronous setState-like updates from native focus/visibilitychange/input/matchMedia/resize paths during `/tech/rankings/laptops` idle/click probes — this turns the architectural landmine into something observable, smaller blast radius than another UI refactor.

**Architectural rule reinforced:** the prior session's load-bearing rule — "no synchronous React state in native input/focus/visibility event paths on `/tech/rankings/laptops`" — now extends to **media-query change paths** as well. Future media-query-driven layout decisions on this route should use CSS responsive utilities, not JS state.

## Instrumentation Kit (for real-mac Safari/Firefox console)

Paste this into the Safari Web Inspector Console on `https://glitchtech.io/tech/rankings/laptops` BEFORE the freeze. It logs every event to localStorage and survives the freeze. Recover via `localStorage.getItem('__rankings_idle_probe_v1')`. Stop with `window.__rankingsIdleProbe.stop()`.

```js
(() => {
  const KEY = "__rankings_idle_probe_v1";
  const LAST = KEY + ":last";
  const MAX = 2500;
  const runId = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  const entries = [];
  const cleanups = [];
  const observers = [];
  let seq = 0, stopped = false, rafId = 0, timeoutId = 0;
  let lastRaf = performance.now(), lastRafTs = lastRaf, lastTick = performance.now();
  let frames = 0, tickFrames = 0, tick = 0;

  const round = n => Math.round(n * 10) / 10;
  const mem = () => performance.memory ? {
    usedMB: round(performance.memory.usedJSHeapSize / 1048576),
    totalMB: round(performance.memory.totalJSHeapSize / 1048576),
    limitMB: round(performance.memory.jsHeapSizeLimit / 1048576)
  } : null;
  const vv = () => window.visualViewport ? {
    w: round(visualViewport.width), h: round(visualViewport.height),
    scale: round(visualViewport.scale), x: round(visualViewport.offsetLeft),
    y: round(visualViewport.offsetTop)
  } : null;
  const snap = () => ({
    perf: round(performance.now()),
    wall: new Date().toISOString(),
    vis: document.visibilityState,
    focus: document.hasFocus(),
    online: navigator.onLine,
    w: innerWidth, h: innerHeight, dpr: devicePixelRatio,
    scrollY: round(scrollY), vv: vv(), mem: mem()
  });
  const payload = {
    runId,
    started: new Date().toISOString(),
    url: location.href,
    ua: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    entries
  };

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(payload));
      localStorage.setItem(LAST, JSON.stringify({ runId, seq, state: snap(), last: entries[entries.length - 1] || null }));
    } catch (e) {
      entries.splice(0, Math.ceil(entries.length / 2));
      try { localStorage.setItem(KEY, JSON.stringify(payload)); } catch (_) {}
    }
  }

  function log(type, detail = {}, warn = false) {
    const entry = { seq: ++seq, type, state: snap(), detail };
    entries.push(entry);
    if (entries.length > MAX) entries.splice(0, entries.length - MAX);
    save();
    (warn ? console.warn : console.log)("[idle-probe]", type, entry);
  }

  function add(target, name, fn, opts) {
    try {
      target.addEventListener(name, fn, opts);
      cleanups.push(() => target.removeEventListener(name, fn, opts));
    } catch (_) {}
  }

  log("start", {
    nav: performance.getEntriesByType("navigation")[0] || null,
    screen: { w: screen.width, h: screen.height, aw: screen.availWidth, ah: screen.availHeight, colorDepth: screen.colorDepth },
    webgpu: !!navigator.gpu,
    scheduler: !!window.scheduler,
    isInputPending: !!(navigator.scheduling && navigator.scheduling.isInputPending)
  });

  const mqs = {
    desktop: "(min-width: 1024px)",
    nearDesktop: "(min-width: 900px) and (max-width: 1150px)",
    hover: "(hover: hover)",
    pointerFine: "(pointer: fine)",
    reducedMotion: "(prefers-reduced-motion: reduce)",
    reducedTransparency: "(prefers-reduced-transparency: reduce)",
    dark: "(prefers-color-scheme: dark)",
    contrast: "(prefers-contrast: more)",
    dynamicRange: "(dynamic-range: high)"
  };
  Object.keys(mqs).forEach(name => {
    try {
      const q = mqs[name], mq = matchMedia(q);
      log("mq_initial", { name, query: q, matches: mq.matches });
      const h = e => log("mq_change", { name, query: q, matches: e.matches }, true);
      mq.addEventListener ? mq.addEventListener("change", h) : mq.addListener(h);
      cleanups.push(() => mq.removeEventListener ? mq.removeEventListener("change", h) : mq.removeListener(h));
    } catch (e) {
      log("mq_error", { name, error: String(e) });
    }
  });

  ["visibilitychange", "freeze", "resume", "fullscreenchange"].forEach(n => add(document, n, e => {
    log("page_event", { name: n, persisted: !!e.persisted });
  }, true));
  ["focus", "blur", "online", "offline", "pagehide", "pageshow", "resize", "orientationchange"].forEach(n => add(window, n, e => {
    log("window_event", { name: n, persisted: !!e.persisted });
  }, true));
  if (window.visualViewport) {
    add(visualViewport, "resize", () => log("visualViewport_resize", vv()), true);
    add(visualViewport, "scroll", () => log("visualViewport_scroll", vv()), true);
  }

  ["pointerdown", "click", "keydown"].forEach(n => add(window, n, e => {
    let ts = e.timeStamp;
    if (ts > performance.timeOrigin) ts -= performance.timeOrigin;
    log("input_" + n, { delayMs: round(performance.now() - ts), key: e.key, x: e.clientX, y: e.clientY });
  }, { capture: true, passive: true }));

  function observe(type, opts) {
    try {
      const po = new PerformanceObserver(list => {
        list.getEntries().forEach(e => {
          if (type === "longtask") log("longtask", { start: round(e.startTime), dur: round(e.duration), name: e.name }, true);
          else if (type === "layout-shift" && !e.hadRecentInput) log("layout_shift", { start: round(e.startTime), value: e.value }, true);
          else if (type === "event" && e.duration >= 50) log("slow_event", { name: e.name, start: round(e.startTime), dur: round(e.duration) }, true);
        });
      });
      po.observe(opts);
      observers.push(po);
      log("observer_enabled", { type });
    } catch (e) {
      log("observer_unavailable", { type, error: String(e) });
    }
  }
  observe("longtask", { type: "longtask", buffered: true });
  observe("layout-shift", { type: "layout-shift", buffered: true });
  observe("event", { type: "event", buffered: true, durationThreshold: 16 });

  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const gl = c.getContext("webgl2", { powerPreference: "default" }) || c.getContext("webgl", { powerPreference: "default" });
    const info = { webgl: !!gl, webgpu: !!navigator.gpu, backdrop: CSS.supports("backdrop-filter: blur(1px)") || CSS.supports("-webkit-backdrop-filter: blur(1px)") };
    if (gl) {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      info.version = gl.getParameter(gl.VERSION);
      info.vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      info.renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      info.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      add(c, "webglcontextlost", e => { e.preventDefault(); log("webgl_context_lost", info, true); }, false);
      add(c, "webglcontextrestored", () => log("webgl_context_restored", info, true), false);
      window.__rankingsIdleProbeGL = gl;
      window.__rankingsIdleProbeCanvas = c;
    }
    log("gpu_probe", info);
  } catch (e) {
    log("gpu_probe_error", { error: String(e) }, true);
  }

  function raf(ts) {
    if (stopped) return;
    frames++; tickFrames++;
    const gap = ts - lastRafTs;
    if (gap > 250) log("raf_gap", { gapMs: round(gap), frames }, gap > 1000);
    lastRaf = performance.now();
    lastRafTs = ts;
    rafId = requestAnimationFrame(raf);
  }

  function heartbeat() {
    if (stopped) return;
    const now = performance.now();
    const elapsed = now - lastTick;
    const drift = elapsed - 1000;
    const sinceRaf = now - lastRaf;
    const detail = {
      tick: ++tick,
      timeoutDriftMs: round(drift),
      sinceLastRafMs: round(sinceRaf),
      fpsApprox: round(tickFrames / (elapsed / 1000)),
      frames
    };
    tickFrames = 0;
    lastTick = now;
    log((sinceRaf > 2000 || drift > 2000) ? "freeze_gap" : "heartbeat", detail, sinceRaf > 2000 || drift > 2000);
    timeoutId = setTimeout(heartbeat, 1000);
  }

  window.__rankingsIdleProbe = {
    key: KEY,
    lastKey: LAST,
    dump: () => localStorage.getItem(KEY),
    last: () => localStorage.getItem(LAST),
    stop: () => {
      log("stop");
      stopped = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      observers.forEach(o => o.disconnect());
      cleanups.forEach(fn => { try { fn(); } catch (_) {} });
    }
  };

  rafId = requestAnimationFrame(raf);
  timeoutId = setTimeout(heartbeat, 1000);
  console.info("[idle-probe] started. Recover with localStorage.getItem('" + KEY + "') or window.__rankingsIdleProbe.dump().");
})();
```
