import { test } from "@playwright/test"
import fs from "fs"
import path from "path"

const dir = path.resolve(
  __dirname,
  "../.planning/phases/14-global-polish/screenshots/filter-audit"
)
fs.mkdirSync(dir, { recursive: true })

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "ipad-portrait-768", width: 768, height: 1024 },
  { name: "ipad-landscape-1024", width: 1024, height: 768 },
  { name: "iphone-375", width: 375, height: 812 },
  { name: "iphone-small-320", width: 320, height: 568 },
]

async function bypassSplash(page: import("@playwright/test").Page) {
  await page.addInitScript(() =>
    sessionStorage.setItem("glitch-splash-seen", "true")
  )
}

test.describe("Phase 14 — Filter bar audit (screenshot-only)", () => {
  test.setTimeout(180_000)

  for (const vp of VIEWPORTS) {
    test(`filter bar @ ${vp.name} (${vp.width}x${vp.height})`, async ({ browser }) => {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.width <= 768,
        hasTouch: vp.width <= 768,
      })
      const page = await ctx.newPage()
      await bypassSplash(page)
      await page.goto("/beats", { waitUntil: "networkidle" })
      await page.waitForTimeout(400)

      const filterBar = page.locator('[data-testid="filter-bar"]')
      // Crop screenshot to just the filter bar region + 24px padding
      const box = await filterBar.boundingBox()
      if (!box) {
        await page.screenshot({
          path: path.join(dir, `${vp.name}-fallback-fullpage.png`),
          fullPage: true,
        })
        await ctx.close()
        return
      }
      await page.screenshot({
        path: path.join(dir, `${vp.name}-filter.png`),
        clip: {
          x: 0,
          y: Math.max(0, box.y - 8),
          width: vp.width,
          height: Math.min(vp.height, box.height + 120),
        },
      })

      // Also scroll the filter row horizontally to the end (if mobile) to capture what's after the initial viewport
      if (vp.width <= 768) {
        const scrollRow = filterBar.locator("> div > div").nth(1) // the overflow-x-auto row
        await scrollRow.evaluate((el) => {
          el.scrollLeft = 10_000 // scroll to end
        })
        await page.waitForTimeout(200)
        await page.screenshot({
          path: path.join(dir, `${vp.name}-filter-scrolled-end.png`),
          clip: {
            x: 0,
            y: Math.max(0, box.y - 8),
            width: vp.width,
            height: Math.min(vp.height, box.height + 120),
          },
        })
      }

      await ctx.close()
    })
  }
})
