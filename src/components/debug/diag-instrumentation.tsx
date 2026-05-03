"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

/**
 * Real-mac diagnostic instrumentation for the rankings-categories-filter-crash
 * debug session. Activates when the URL has `?diag=1`.
 *
 * Wraps `setTimeout`, `setInterval`, `requestAnimationFrame`, plus document and
 * window `addEventListener`/`removeEventListener`, to track:
 *   - pending zero-delay timers (the F11 hypothesis: untracked `setTimeout(0)`
 *     queues left in flight at route-transition time)
 *   - active intervals
 *   - pending RAFs
 *   - document/window listener counts by type (catches leaked listeners)
 *   - longtasks via PerformanceObserver
 *
 * Plus: tracks pointerover/pointerdown/click on any `<a>` link so we can see
 * the exact registry state at the moment the user clicks a nav tile.
 *
 * On every event, dumps state into a fixed banner at top of page AND writes
 * the trace to localStorage.__diag for retrieval after the freeze.
 *
 * Usage: append `?diag=1` to any URL on glitchtech.io. Reproduce the bug.
 * After the page recovers, reload the same URL (without `?diag=1` is fine)
 * and check the banner OR run in console:
 *
 *   JSON.parse(localStorage.__diag || "[]")
 *
 * Investigation: .planning/debug/rankings-categories-filter-crash.md
 */
export function DiagInstrumentation() {
  const searchParams = useSearchParams()
  const isDiag = searchParams?.get("diag") === "1"
  const [bannerText, setBannerText] = useState("[diag] arming...")

  useEffect(() => {
    if (!isDiag) return
    if (typeof window === "undefined") return
    const w = window as typeof window & { __diagInstalled?: boolean }
    if (w.__diagInstalled) return
    w.__diagInstalled = true

    const realSet = window.setTimeout.bind(window)
    const realClear = window.clearTimeout.bind(window)
    const realInterval = window.setInterval.bind(window)
    const realClearInterval = window.clearInterval.bind(window)
    const realRAF = window.requestAnimationFrame.bind(window)
    const realCAF = window.cancelAnimationFrame.bind(window)

    const pending0 = new Map<unknown, number>()
    const pendingRAFs = new Set<unknown>()
    const activeIntervals = new Set<unknown>()
    const docListeners = new Map<string, number>()
    const winListeners = new Map<string, number>()
    const trace: Array<Record<string, unknown>> = []
    const longtasks: Array<{ t: number; dur: number }> = []

    const updateBanner = (latest: Record<string, unknown>) => {
      const summary = `pending0=${pending0.size} RAF=${pendingRAFs.size} int=${activeIntervals.size} doc.click=${docListeners.get("click") ?? 0} doc.pointerdown=${docListeners.get("pointerdown") ?? 0} long=${longtasks.length}`
      setBannerText(`[diag] ${latest.type} ${summary} t=${latest.t}ms`)
    }

    const save = (type: string, extra: Record<string, unknown> = {}) => {
      const row = {
        t: Math.round(performance.now()),
        type,
        path: location.pathname,
        search: location.search,
        pending0: pending0.size,
        pendingRAFs: pendingRAFs.size,
        activeIntervals: activeIntervals.size,
        docListenerTotal: Array.from(docListeners.values()).reduce((a, b) => a + b, 0),
        winListenerTotal: Array.from(winListeners.values()).reduce((a, b) => a + b, 0),
        longtasksSinceStart: longtasks.length,
        ...extra,
      }
      trace.push(row)
      try {
        localStorage.__diag = JSON.stringify(trace.slice(-100))
      } catch {
        /* quota exceeded — drop oldest */
      }
      updateBanner(row)
    }

    // Wrap setTimeout — track 0-delay timers. The `id` binding is in TDZ at
    // function-creation time but resolved by the time the callback fires (one
    // tick later at minimum), so referencing `id` inside the callback is safe.
    // Arrow function avoids any `this` propagation concerns — setTimeout's
    // callbacks have no meaningful `this` in either browsers' implementation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.setTimeout = function (fn: any, delay: any = 0, ...args: any[]) {
      const d = Number(delay) || 0
      const id = realSet(
        (...cbArgs: unknown[]) => {
          if (d === 0) pending0.delete(id)
          return typeof fn === "function" ? fn(...cbArgs) : (0, eval)(fn)
        },
        delay,
        ...args,
      )
      if (d === 0) pending0.set(id, performance.now())
      return id
    } as typeof window.setTimeout

    window.clearTimeout = function (id?: number) {
      pending0.delete(id)
      return realClear(id)
    } as typeof window.clearTimeout

    // Wrap setInterval
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.setInterval = function (fn: any, delay?: number, ...args: any[]) {
      const id = realInterval(fn, delay, ...args)
      activeIntervals.add(id)
      return id
    } as typeof window.setInterval

    window.clearInterval = function (id?: number) {
      activeIntervals.delete(id)
      return realClearInterval(id)
    } as typeof window.clearInterval

    // Wrap RAF — same TDZ pattern as setTimeout above.
    window.requestAnimationFrame = function (fn) {
      const id = realRAF((ts) => {
        pendingRAFs.delete(id)
        return fn(ts)
      })
      pendingRAFs.add(id)
      return id
    }

    window.cancelAnimationFrame = function (id) {
      pendingRAFs.delete(id)
      return realCAF(id)
    }

    // Wrap addEventListener on document and window
    for (const target of [document, window] as const) {
      const map = target === document ? docListeners : winListeners
      const realAdd = target.addEventListener.bind(target)
      const realRemove = target.removeEventListener.bind(target)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target.addEventListener = function (type: any, listener: any, opts?: any) {
        map.set(type, (map.get(type) ?? 0) + 1)
        return realAdd(type, listener, opts)
      } as typeof target.addEventListener
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target.removeEventListener = function (type: any, listener: any, opts?: any) {
        const c = map.get(type) ?? 0
        if (c > 0) map.set(type, c - 1)
        return realRemove(type, listener, opts)
      } as typeof target.removeEventListener
    }

    // PerformanceObserver — longtasks
    try {
      const lto = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          longtasks.push({ t: Math.round(e.startTime), dur: Math.round(e.duration) })
          save("longtask", { dur_ms: Math.round(e.duration) })
        }
      })
      lto.observe({ entryTypes: ["longtask"] })
    } catch {
      /* not all browsers support */
    }

    // Track navigation-relevant pointer events on links — capture state at click moment
    for (const type of ["pointerover", "pointerdown", "click"] as const) {
      document.addEventListener(
        type,
        (e: Event) => {
          const t = e.target as Element | null
          const a = t?.closest?.("a[href]")
          if (a) {
            const href = a.getAttribute("href")
            if (href && (href.startsWith("/") || href.startsWith("/tech"))) {
              save(`nav:${type}`, { href })
            }
          }
        },
        true,
      )
    }

    save("installed")
  }, [isDiag])

  if (!isDiag) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#000",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: "11px",
        padding: "4px 8px",
        borderBottom: "1px solid #0f0",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        pointerEvents: "none",
      }}
    >
      {bannerText}
    </div>
  )
}
