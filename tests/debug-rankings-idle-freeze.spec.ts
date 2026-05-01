/**
 * Debug: rankings-laptops-idle-freeze
 *
 * Reproduces the idle/site-wide freeze on `/tech/rankings/laptops`. The page
 * is reported to freeze randomly when sitting idle (no user interaction);
 * after ~60 seconds the freeze propagates site-wide.
 *
 * Strategy:
 *   1. Wrap setInterval, setTimeout, requestAnimationFrame, IntersectionObserver,
 *      ResizeObserver, MutationObserver, and HTMLCanvasElement.getContext BEFORE
 *      the page mounts so we count creations vs. cleanups across the full
 *      lifetime of the test.
 *   2. Snapshot performance.memory.usedJSHeapSize, active counts, and
 *      performance.getEntriesByType('longtask') at t=0, 30, 60, 90 seconds.
 *   3. Capture all console output and pageerror events.
 *   4. After 90s of pure idle, attempt a synthetic mouse move and measure the
 *      latency to verify the page is still responsive.
 *   5. Write the metrics dump to .planning/debug/artifacts/.
 *
 * Pass criteria (post-fix):
 *   - usedJSHeapSize at t=90s is within +50% of t=0s (no unbounded growth)
 *   - active timer count at t=90s ≤ active timer count at t=30s (no leak)
 *   - active observer count at t=90s ≤ active observer count at t=30s
 *   - longtask total duration < 500ms across the full 90s window
 *   - synthetic mouse move at t=90s completes in <100ms
 *   - no console errors, no pageerror events
 *
 * Run on prod (recommended — codebox dev server cache currently corrupted):
 *   PLAYWRIGHT_BASE_URL=https://glitchtech.io pnpm exec playwright test \
 *     tests/debug-rankings-idle-freeze.spec.ts --project=desktop
 *
 * Run locally:
 *   pnpm exec playwright test tests/debug-rankings-idle-freeze.spec.ts --project=desktop
 */
import { test, expect } from "@playwright/test"
import * as fs from "node:fs"
import * as path from "node:path"

interface MetricSnapshot {
  t: number
  usedJSHeapSize: number | null
  totalJSHeapSize: number | null
  activeTimers: { intervals: number; timeouts: number; rafs: number }
  activeObservers: { intersection: number; resize: number; mutation: number }
  webglContexts: number
  longTasks: { count: number; totalDurationMs: number; maxDurationMs: number }
  consoleErrors: number
  pageErrors: number
}

const HARNESS_INIT_SCRIPT = `
(function() {
  const counters = {
    intervals: { created: 0, cleared: 0 },
    timeouts: { created: 0, cleared: 0 },
    rafs: { created: 0, cancelled: 0 },
    intersection: { created: 0, disconnected: 0 },
    resize: { created: 0, disconnected: 0 },
    mutation: { created: 0, disconnected: 0 },
    webgl: { created: 0, lost: 0 },
  };
  const longTasks = [];

  // Patch setInterval / clearInterval
  const _setInterval = window.setInterval.bind(window);
  const _clearInterval = window.clearInterval.bind(window);
  const intervalIds = new Set();
  window.setInterval = function(...args) {
    const id = _setInterval(...args);
    counters.intervals.created++;
    intervalIds.add(id);
    return id;
  };
  window.clearInterval = function(id) {
    if (intervalIds.has(id)) {
      counters.intervals.cleared++;
      intervalIds.delete(id);
    }
    return _clearInterval(id);
  };

  // Patch setTimeout / clearTimeout
  const _setTimeout = window.setTimeout.bind(window);
  const _clearTimeout = window.clearTimeout.bind(window);
  const timeoutIds = new Set();
  window.setTimeout = function(...args) {
    const id = _setTimeout(...args);
    counters.timeouts.created++;
    timeoutIds.add(id);
    // Auto-decrement when callback fires (we treat fired timeouts as cleared
    // because they're no longer pending).
    if (typeof args[0] === 'function') {
      // Best-effort: wrap the callback.
      // Skipped to avoid altering call signatures — instead measure via
      // cleared count alone. Pending count = created - cleared - fired.
    }
    return id;
  };
  window.clearTimeout = function(id) {
    if (timeoutIds.has(id)) {
      counters.timeouts.cleared++;
      timeoutIds.delete(id);
    }
    return _clearTimeout(id);
  };

  // Patch requestAnimationFrame / cancelAnimationFrame — pending rafs are
  // a strong leak signal because they should fire each frame and be
  // re-issued, not stack.
  const _raf = window.requestAnimationFrame.bind(window);
  const _caf = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = function(cb) {
    const id = _raf(function(ts) {
      counters.rafs.cancelled++;
      cb(ts);
    });
    counters.rafs.created++;
    return id;
  };
  window.cancelAnimationFrame = function(id) {
    counters.rafs.cancelled++;
    return _caf(id);
  };

  // Patch IntersectionObserver
  const _IO = window.IntersectionObserver;
  if (_IO) {
    const wrapped = function(...args) {
      const inst = new _IO(...args);
      counters.intersection.created++;
      const _disconnect = inst.disconnect.bind(inst);
      inst.disconnect = function() {
        counters.intersection.disconnected++;
        return _disconnect();
      };
      return inst;
    };
    wrapped.prototype = _IO.prototype;
    window.IntersectionObserver = wrapped;
  }

  // Patch ResizeObserver
  const _RO = window.ResizeObserver;
  if (_RO) {
    const wrapped = function(...args) {
      const inst = new _RO(...args);
      counters.resize.created++;
      const _disconnect = inst.disconnect.bind(inst);
      inst.disconnect = function() {
        counters.resize.disconnected++;
        return _disconnect();
      };
      return inst;
    };
    wrapped.prototype = _RO.prototype;
    window.ResizeObserver = wrapped;
  }

  // Patch MutationObserver
  const _MO = window.MutationObserver;
  if (_MO) {
    const wrapped = function(...args) {
      const inst = new _MO(...args);
      counters.mutation.created++;
      const _disconnect = inst.disconnect.bind(inst);
      inst.disconnect = function() {
        counters.mutation.disconnected++;
        return _disconnect();
      };
      return inst;
    };
    wrapped.prototype = _MO.prototype;
    window.MutationObserver = wrapped;
  }

  // Patch HTMLCanvasElement.getContext for WebGL detection
  const _getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, ...rest) {
    const ctx = _getContext.call(this, type, ...rest);
    if (typeof type === 'string' && type.toLowerCase().includes('webgl')) {
      counters.webgl.created++;
      try {
        this.addEventListener('webglcontextlost', () => {
          counters.webgl.lost++;
        });
      } catch (e) {}
    }
    return ctx;
  };

  // PerformanceObserver for longtasks
  try {
    if (typeof PerformanceObserver !== 'undefined') {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          longTasks.push({ start: entry.startTime, duration: entry.duration });
        }
      });
      obs.observe({ entryTypes: ['longtask'] });
    }
  } catch (e) {}

  // Expose to test
  window.__debugCounters = counters;
  window.__debugLongTasks = longTasks;
})();
`

async function snapshotMetrics(page: import("@playwright/test").Page, t: number, consoleErrors: number, pageErrors: number): Promise<MetricSnapshot> {
  const data = await page.evaluate(() => {
    const c = (window as unknown as { __debugCounters: Record<string, { created: number; cleared?: number; cancelled?: number; disconnected?: number; lost?: number }> }).__debugCounters
    const lt = (window as unknown as { __debugLongTasks: Array<{ start: number; duration: number }> }).__debugLongTasks
    const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
    const ltArr = lt ?? []
    return {
      usedJSHeapSize: mem?.usedJSHeapSize ?? null,
      totalJSHeapSize: mem?.totalJSHeapSize ?? null,
      activeTimers: {
        intervals: (c.intervals.created ?? 0) - (c.intervals.cleared ?? 0),
        timeouts: (c.timeouts.created ?? 0) - (c.timeouts.cleared ?? 0),
        rafs: (c.rafs.created ?? 0) - (c.rafs.cancelled ?? 0),
      },
      activeObservers: {
        intersection: (c.intersection.created ?? 0) - (c.intersection.disconnected ?? 0),
        resize: (c.resize.created ?? 0) - (c.resize.disconnected ?? 0),
        mutation: (c.mutation.created ?? 0) - (c.mutation.disconnected ?? 0),
      },
      webglContexts: (c.webgl.created ?? 0) - (c.webgl.lost ?? 0),
      longTasks: {
        count: ltArr.length,
        totalDurationMs: ltArr.reduce((s, e) => s + e.duration, 0),
        maxDurationMs: ltArr.reduce((m, e) => Math.max(m, e.duration), 0),
      },
    }
  })
  return {
    t,
    ...data,
    consoleErrors,
    pageErrors,
  }
}

test.describe("rankings-laptops idle freeze", () => {
  test.setTimeout(180_000) // 3 min — accommodates 90s idle + page load + final probe

  test("90s idle does not leak timers, observers, heap, or longtasks", async ({ page, browserName }) => {
    const consoleEvents: { type: string; text: string }[] = []
    const pageErrorEvents: string[] = []

    page.on("console", (msg) => {
      consoleEvents.push({ type: msg.type(), text: msg.text() })
    })
    page.on("pageerror", (err) => {
      pageErrorEvents.push(err.message)
    })

    await page.addInitScript(HARNESS_INIT_SCRIPT)

    const url = (process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3004") + "/tech/rankings/laptops"
    console.log(`[harness] Loading ${url}`)
    const navStart = Date.now()
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 })
    const navEnd = Date.now()
    console.log(`[harness] Page loaded in ${navEnd - navStart}ms`)

    // Settle for 2s to let initial hydration/decode complete
    await page.waitForTimeout(2_000)

    const errCount = () => consoleEvents.filter((e) => e.type === "error").length
    const snap0 = await snapshotMetrics(page, 2, errCount(), pageErrorEvents.length)
    console.log(`[harness] t=2s: ${JSON.stringify(snap0)}`)

    await page.waitForTimeout(28_000) // → t=30s
    const snap30 = await snapshotMetrics(page, 30, errCount(), pageErrorEvents.length)
    console.log(`[harness] t=30s: ${JSON.stringify(snap30)}`)

    await page.waitForTimeout(30_000) // → t=60s
    const snap60 = await snapshotMetrics(page, 60, errCount(), pageErrorEvents.length)
    console.log(`[harness] t=60s: ${JSON.stringify(snap60)}`)

    await page.waitForTimeout(30_000) // → t=90s
    const snap90 = await snapshotMetrics(page, 90, errCount(), pageErrorEvents.length)
    console.log(`[harness] t=90s: ${JSON.stringify(snap90)}`)

    // Responsiveness probe — synthetic mouse move + small scroll, measure latency
    const probeStart = Date.now()
    await page.mouse.move(100, 100)
    await page.mouse.move(200, 200)
    const probeEnd = Date.now()
    console.log(`[harness] responsiveness probe (mouse move): ${probeEnd - probeStart}ms`)

    const artifactsDir = path.resolve(__dirname, "..", ".planning", "debug", "artifacts")
    fs.mkdirSync(artifactsDir, { recursive: true })
    const filename = `rankings-idle-${browserName}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    const filepath = path.join(artifactsDir, filename)
    fs.writeFileSync(
      filepath,
      JSON.stringify(
        {
          url,
          browser: browserName,
          navigationMs: navEnd - navStart,
          probeMs: probeEnd - probeStart,
          snapshots: [snap0, snap30, snap60, snap90],
          consoleEvents,
          pageErrors: pageErrorEvents,
        },
        null,
        2,
      ),
    )
    console.log(`[harness] artifact written to ${filepath}`)

    // Pass/fail thresholds (intentionally generous on first run; we tighten
    // once we have a baseline)
    const heapGrowthRatio = snap0.usedJSHeapSize && snap90.usedJSHeapSize
      ? snap90.usedJSHeapSize / snap0.usedJSHeapSize
      : 1
    console.log(`[harness] heapGrowthRatio (t=90 / t=2): ${heapGrowthRatio.toFixed(3)}`)

    // Document — don't assert hard yet; we want the data, not a pass/fail.
    expect.soft(probeEnd - probeStart, "Responsiveness probe at t=90s should complete in <500ms").toBeLessThan(500)
    expect.soft(pageErrorEvents.length, "No pageerror events during 90s idle").toBe(0)
    expect.soft(snap90.activeTimers.intervals - snap30.activeTimers.intervals, "No new intervals between t=30s and t=90s").toBeLessThan(5)
    expect.soft(snap90.activeObservers.intersection - snap30.activeObservers.intersection, "No new IntersectionObservers between t=30s and t=90s").toBeLessThan(10)
    expect.soft(snap90.activeObservers.resize - snap30.activeObservers.resize, "No new ResizeObservers between t=30s and t=90s").toBeLessThan(10)
    expect.soft(snap90.webglContexts, "No accumulated WebGL contexts").toBeLessThan(5)
    expect.soft(snap90.longTasks.totalDurationMs - snap30.longTasks.totalDurationMs, "Long-task budget across t=30..90s").toBeLessThan(2000)
  })
})
