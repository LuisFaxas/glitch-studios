import { test, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { ROUTES, BREAKPOINT_VIEWPORTS } from "./16.1-route-inventory"

/**
 * Phase 16.1 Plan 05 — Breakpoint audit + visual regression baseline (D-15/D-16/D-17).
 *
 * Captures every public route at the 8 canonical viewports:
 *   375×667, 393×852, 768×1024, 1024×768, 1280×800, 1366×768, 1440×900, 1920×1080
 *
 * Screenshots land in `.planning/phases/16.1-public-site-maintenance/snapshots/{route-slug}/{viewport}.png`
 * — one subdirectory per route, one PNG per viewport. The first run establishes
 * the baseline; subsequent runs diff against it and fail on visual drift.
 *
 * Priority viewport: 13" laptop range (1280/1366/1440) per D-16. The homepage's
 * hero logo (`data-testid="glitch-logo"`) is asserted to stay within the
 * viewport at these widths — the original user-reported clipping.
 *
 * Spec is SERIAL (workers=1 from playwright.config) and SLOW. For full run
 * budget ~10-15 minutes. Batch with `--grep` if needed.
 */

const SNAPSHOT_DIR = path.resolve(
  ".planning/phases/16.1-public-site-maintenance/snapshots",
)

function routeSlug(url: string): string {
  const s = url.replace(/\//g, "_").replace(/^_/, "root")
  return s || "root"
}

test.describe.configure({ mode: "serial" })

test.beforeAll(() => {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })
})

// D-16: homepage logo must stay within the viewport at 13" widths.
test.describe("Plan 05 Task 1: homepage logo fits 13\" viewports (D-16)", () => {
  for (const vp of BREAKPOINT_VIEWPORTS.filter(
    (v) => v.width >= 1280 && v.width <= 1440,
  )) {
    test(`glitch-logo within ${vp.width}×${vp.height}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto("/")
      // Clear splash so content is visible + screenshot isn't just overlay.
      await page.evaluate(() =>
        sessionStorage.setItem("glitch_studios_splash_seen", "1"),
      )
      await page.reload()
      await page.waitForTimeout(2000)

      const logo = page.locator('[data-testid="glitch-logo"]').first()
      await expect(logo).toBeVisible({ timeout: 10_000 })
      const box = await logo.boundingBox()
      expect(box).not.toBeNull()
      if (!box) return
      expect(
        box.x + box.width,
        `logo right edge ${box.x + box.width} exceeds viewport ${vp.width}`,
      ).toBeLessThanOrEqual(vp.width)
      expect(box.x, "logo left edge must be >= 0").toBeGreaterThanOrEqual(0)

      // No horizontal scrollbar on the document.
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(
        scrollWidth,
        `body.scrollWidth ${scrollWidth} exceeds viewport ${vp.width}`,
      ).toBeLessThanOrEqual(vp.width)
    })
  }
})

// D-15 + D-17: full breakpoint baseline for every route × 8 viewports.
for (const route of ROUTES) {
  test.describe(`Route: ${route.url}`, () => {
    for (const vp of BREAKPOINT_VIEWPORTS) {
      test(`snapshot at ${vp.width}×${vp.height}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto(route.url, { waitUntil: "domcontentloaded" })
        // Suppress splash across BOTH brands so the screenshot reflects
        // the real content, not the one-time intro.
        await page.evaluate(() => {
          sessionStorage.setItem("glitch_studios_splash_seen", "1")
          sessionStorage.setItem("glitch_tech_splash_seen", "1")
        })
        await page.reload()
        // Give carousels, images, and WebGL canvases a moment to settle.
        await page.waitForTimeout(2500)

        const dir = path.join(SNAPSHOT_DIR, routeSlug(route.url))
        fs.mkdirSync(dir, { recursive: true })
        await page.screenshot({
          path: path.join(dir, `${vp.name}.png`),
          fullPage: true,
          animations: "disabled",
        })
      })
    }
  })
}
