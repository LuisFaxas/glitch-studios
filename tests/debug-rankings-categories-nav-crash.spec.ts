/**
 * Debug: rankings-categories-filter-crash
 *
 * Reframed reproduction (2026-05-01): the user's "Categories filter" is the
 * NAVIGATION TILE in the TileNav (left rail, desktop) and BottomTabBar (mobile)
 * that links to /tech/categories — NOT the leaderboard chip-bar Sub-cat facet.
 *
 * Real-mac repro: on /tech/rankings/laptops, clicking the Categories nav tile
 * (route transition to /tech/categories) freezes the site. All filters work.
 *
 * Strategy:
 *  1. Pre-instrument: timer/observer/raf/longtask counts, console + pageerror.
 *  2. Replicate the user's exact sequence: load /tech/rankings/laptops, exercise
 *     each filter facet (the ones the user said "all work"), then click the
 *     Categories nav tile.
 *  3. Capture metrics + responsiveness probe at each step.
 *  4. Run on chromium / webkit / firefox + desktop and mobile viewports.
 *  5. Write artifact.
 *
 * Run:
 *   PLAYWRIGHT_BASE_URL=http://localhost:3004 \
 *     pnpm exec playwright test tests/debug-rankings-categories-nav-crash.spec.ts \
 *     --project=desktop
 *
 * Headless on Linux Codebox is expected to PASS (no crash) for the same reason
 * the prior idle-freeze and click-path harnesses passed in spite of real-mac
 * crashes. The harness is a baseline + regression detector; the diagnostic
 * value comes from comparing pre-fix vs post-fix metric deltas.
 */
import { test, expect } from "@playwright/test"
import * as fs from "node:fs"
import * as path from "node:path"

interface MetricSnapshot {
  label: string
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
    if (intervalIds.has(id)) { counters.intervals.cleared++; intervalIds.delete(id); }
    return _clearInterval(id);
  };
  const _setTimeout = window.setTimeout.bind(window);
  const _clearTimeout = window.clearTimeout.bind(window);
  const timeoutIds = new Set();
  window.setTimeout = function(...args) {
    const id = _setTimeout(...args);
    counters.timeouts.created++;
    timeoutIds.add(id);
    return id;
  };
  window.clearTimeout = function(id) {
    if (timeoutIds.has(id)) { counters.timeouts.cleared++; timeoutIds.delete(id); }
    return _clearTimeout(id);
  };
  const _raf = window.requestAnimationFrame.bind(window);
  const _caf = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = function(cb) {
    const id = _raf(function(ts) { counters.rafs.cancelled++; cb(ts); });
    counters.rafs.created++;
    return id;
  };
  window.cancelAnimationFrame = function(id) { counters.rafs.cancelled++; return _caf(id); };
  const _IO = window.IntersectionObserver;
  if (_IO) {
    const wrapped = function(...args) {
      const inst = new _IO(...args);
      counters.intersection.created++;
      const _disconnect = inst.disconnect.bind(inst);
      inst.disconnect = function() { counters.intersection.disconnected++; return _disconnect(); };
      return inst;
    };
    wrapped.prototype = _IO.prototype;
    window.IntersectionObserver = wrapped;
  }
  const _RO = window.ResizeObserver;
  if (_RO) {
    const wrapped = function(...args) {
      const inst = new _RO(...args);
      counters.resize.created++;
      const _disconnect = inst.disconnect.bind(inst);
      inst.disconnect = function() { counters.resize.disconnected++; return _disconnect(); };
      return inst;
    };
    wrapped.prototype = _RO.prototype;
    window.ResizeObserver = wrapped;
  }
  const _MO = window.MutationObserver;
  if (_MO) {
    const wrapped = function(...args) {
      const inst = new _MO(...args);
      counters.mutation.created++;
      const _disconnect = inst.disconnect.bind(inst);
      inst.disconnect = function() { counters.mutation.disconnected++; return _disconnect(); };
      return inst;
    };
    wrapped.prototype = _MO.prototype;
    window.MutationObserver = wrapped;
  }
  const _getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, ...rest) {
    const ctx = _getContext.call(this, type, ...rest);
    if (typeof type === 'string' && type.toLowerCase().includes('webgl')) {
      counters.webgl.created++;
    }
    return ctx;
  };
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
  window.__debugCounters = counters;
  window.__debugLongTasks = longTasks;
})();
`

async function snapshot(
  page: import("@playwright/test").Page,
  label: string,
  t: number,
  consoleErrors: number,
  pageErrors: number,
): Promise<MetricSnapshot> {
  const data = await page.evaluate(() => {
    const c = (window as unknown as {
      __debugCounters: Record<
        string,
        { created: number; cleared?: number; cancelled?: number; disconnected?: number; lost?: number }
      >
    }).__debugCounters
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
  return { label, t, ...data, consoleErrors, pageErrors }
}

async function probeResponsive(
  page: import("@playwright/test").Page,
): Promise<{ probeMs: number; rafGapMs: number }> {
  const probeStart = Date.now()
  await page.mouse.move(50 + Math.random() * 100, 50 + Math.random() * 100)
  await page.mouse.move(150 + Math.random() * 100, 150 + Math.random() * 100)
  const probeMs = Date.now() - probeStart
  const rafGapMs = await page.evaluate<number>(
    () =>
      new Promise<number>((res) => {
        const t0 = performance.now()
        requestAnimationFrame(() => res(performance.now() - t0))
      }),
  )
  return { probeMs, rafGapMs }
}

test.describe("rankings → categories navigation crash repro", () => {
  test.setTimeout(180_000)

  test("filter sequence + Categories nav-tile click", async ({ page, browserName }) => {
    const consoleEvents: { type: string; text: string }[] = []
    const pageErrorEvents: string[] = []

    page.on("console", (m) => consoleEvents.push({ type: m.type(), text: m.text() }))
    page.on("pageerror", (e) => pageErrorEvents.push(e.message))

    await page.addInitScript(HARNESS_INIT_SCRIPT)

    const errCount = () => consoleEvents.filter((e) => e.type === "error").length
    const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3004"
    const url = base + "/tech/rankings/laptops"

    console.log(`[harness] loading ${url}`)
    const navStart = Date.now()
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 })
    await page.waitForSelector('[data-leaderboard-filters]', { timeout: 30_000 })
    await page.waitForTimeout(1500)
    const navEnd = Date.now()
    console.log(`[harness] page loaded in ${navEnd - navStart}ms`)

    const snaps: MetricSnapshot[] = []
    const probes: Array<{ label: string; probeMs: number; rafGapMs: number }> = []

    snaps.push(await snapshot(page, "post-mount", Date.now() - navStart, errCount(), pageErrorEvents.length))
    probes.push({ label: "post-mount", ...(await probeResponsive(page)) })

    // ---- USER SEQUENCE: exercise the working filters (the user said all of these work) ----
    // Also exercise Sub-cat (the leaderboard "Categories" facet candidate) — if THAT is the
    // crash trigger (alternate interpretation of the user's "Categories filter") the harness
    // metrics post-Sub-cat will show the spike. Headless is expected to pass either way.
    const facets: Array<{ label: string; opt?: string }> = [
      { label: "Year" },
      { label: "CPU" },
      { label: "RAM" },
      { label: "Storage" },
      { label: "Medal" },
      { label: "Sub-cat" },
    ]

    for (const f of facets) {
      const trig = page.locator(`[data-facet-dropdown="${f.label}"]`).first()
      if (await trig.count() === 0) {
        console.log(`[harness] facet ${f.label} not present, skipping`)
        continue
      }
      await trig.click()
      await page.waitForTimeout(80)
      // click the first chip option inside the popover
      const popover = page.locator('div[role="menu"]').first()
      const firstChip = popover.locator("button[aria-pressed]").first()
      if (await firstChip.count()) {
        await firstChip.click()
        await page.waitForTimeout(80)
      }
      // close popover
      await page.locator("body").click({ position: { x: 5, y: 5 } })
      await page.waitForTimeout(80)
      snaps.push(await snapshot(page, `after-${f.label}`, Date.now() - navStart, errCount(), pageErrorEvents.length))
      probes.push({ label: `after-${f.label}`, ...(await probeResponsive(page)) })
    }

    // Price slider drag — the user says this works too
    const priceTrigger = page.locator("[data-price-popover-trigger]").first()
    if (await priceTrigger.count()) {
      await priceTrigger.click()
      await page.waitForTimeout(80)
      const minThumb = page.locator('button[aria-label="Minimum price"]').first()
      if (await minThumb.count()) {
        const box = await minThumb.boundingBox()
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
          await page.mouse.down()
          await page.mouse.move(box.x + 30, box.y + box.height / 2, { steps: 4 })
          await page.mouse.up()
          await page.waitForTimeout(120)
        }
      }
      await page.locator("body").click({ position: { x: 5, y: 5 } })
      await page.waitForTimeout(120)
    }
    snaps.push(await snapshot(page, "after-Price", Date.now() - navStart, errCount(), pageErrorEvents.length))
    probes.push({ label: "after-Price", ...(await probeResponsive(page)) })

    // ---- THE SUSPECT EVENT: Categories nav tile click ----
    const categoriesNav = page
      .locator('aside[class*="md:flex"] a[href="/tech/categories"]')
      .first()
    const categoriesBottomNav = page
      .locator('a[aria-label="Categories"][href="/tech/categories"]')
      .first()
    const target = (await categoriesNav.count())
      ? categoriesNav
      : categoriesBottomNav
    expect(await target.count()).toBeGreaterThan(0)

    snaps.push(await snapshot(page, "pre-Categories-click", Date.now() - navStart, errCount(), pageErrorEvents.length))
    probes.push({ label: "pre-Categories-click", ...(await probeResponsive(page)) })

    const tNavStart = Date.now()
    await target.click()
    // Expect navigation to /tech/categories — wait for it
    await page.waitForURL(/\/tech\/categories\/?$/, { timeout: 30_000 }).catch(() => {})
    const tNav1 = Date.now() - tNavStart
    console.log(`[harness] Categories nav completed in ${tNav1}ms`)
    await page.waitForTimeout(1000)

    snaps.push(await snapshot(page, "post-Categories-click+1s", Date.now() - navStart, errCount(), pageErrorEvents.length))
    probes.push({ label: "post-Categories-click+1s", ...(await probeResponsive(page)) })

    await page.waitForTimeout(4000)

    snaps.push(await snapshot(page, "post-Categories-click+5s", Date.now() - navStart, errCount(), pageErrorEvents.length))
    probes.push({ label: "post-Categories-click+5s", ...(await probeResponsive(page)) })

    await page.waitForTimeout(5000)

    snaps.push(await snapshot(page, "post-Categories-click+10s", Date.now() - navStart, errCount(), pageErrorEvents.length))
    probes.push({ label: "post-Categories-click+10s", ...(await probeResponsive(page)) })

    const artifactsDir = path.resolve(__dirname, "..", ".planning", "debug", "artifacts")
    fs.mkdirSync(artifactsDir, { recursive: true })
    const filename = `categories-nav-${browserName}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    const filepath = path.join(artifactsDir, filename)
    fs.writeFileSync(
      filepath,
      JSON.stringify(
        {
          url,
          browser: browserName,
          navigationMs: navEnd - navStart,
          categoriesNavMs: tNav1,
          probes,
          snapshots: snaps,
          consoleEvents,
          pageErrors: pageErrorEvents,
        },
        null,
        2,
      ),
    )
    console.log(`[harness] artifact written to ${filepath}`)

    // Assertions: post-Categories responsiveness must remain healthy
    const postProbe = probes.find((p) => p.label === "post-Categories-click+5s")
    expect.soft(postProbe?.probeMs ?? 0, "Mouse-move probe at post-click+5s under 200ms").toBeLessThan(200)
    expect.soft(postProbe?.rafGapMs ?? 999, "rAF gap at post-click+5s under 100ms").toBeLessThan(100)
    expect.soft(pageErrorEvents.length, "No pageerror events").toBe(0)
    const final = snaps[snaps.length - 1]
    expect.soft(final.activeObservers.intersection, "Observer count bounded").toBeLessThan(50)
    expect.soft(final.webglContexts, "No accumulated WebGL contexts").toBeLessThan(3)
  })
})
