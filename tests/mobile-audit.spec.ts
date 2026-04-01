import { test, expect, type BrowserContext } from "@playwright/test"
import path from "path"
import fs from "fs"

const screenshotDir = path.resolve(
  __dirname,
  "../.planning/phases/07.2-mobile-experience-overhaul/screenshots"
)

// Ensure screenshot directory exists
fs.mkdirSync(screenshotDir, { recursive: true })

const viewports = [
  { name: "375", width: 375, height: 812, isMobile: true, hasTouch: true },
  { name: "390", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "430", width: 430, height: 932, isMobile: true, hasTouch: true },
]

const pages = [
  { name: "home", path: "/" },
  { name: "beats", path: "/beats" },
  { name: "beat-detail", path: "/beats/midnight-drive" },
  { name: "services", path: "/services" },
  { name: "portfolio", path: "/portfolio" },
  { name: "artists", path: "/artists" },
  { name: "blog", path: "/blog" },
  { name: "blog-post", path: "/blog/studio-tips-for-beginners" },
  { name: "contact", path: "/contact" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
]

async function createMobileContext(
  browser: any,
  vp: (typeof viewports)[number]
): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  })
}

// ── Describe block 1: Default page state screenshots + overflow assertions ──
test.describe("Mobile audit - default page states", () => {
  for (const vp of viewports) {
    for (const pg of pages) {
      test(`${pg.name} at ${vp.name}px`, async ({ browser }) => {
        const context = await createMobileContext(browser, vp)
        const page = await context.newPage()

        // Skip splash animation
        await page.addInitScript(() => {
          sessionStorage.setItem("glitch-splash-seen", "true")
        })

        await page.goto(pg.path, { waitUntil: "networkidle" })
        await page.waitForTimeout(500)

        // Overflow detection (audit -- log but do not fail)
        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth
        )
        const innerWidth = await page.evaluate(() => window.innerWidth)
        const hasOverflow = scrollWidth > innerWidth

        test.info().annotations.push({
          type: hasOverflow ? "overflow-detected" : "no-overflow",
          description: `${pg.name} at ${vp.name}px: scrollWidth=${scrollWidth}, innerWidth=${innerWidth}`,
        })

        await page.screenshot({
          path: path.join(screenshotDir, `${pg.name}-${vp.name}-default.png`),
          fullPage: true,
        })

        await context.close()
      })
    }
  }
})

// ── Describe block 2: Overlay-open state (home page only) ──
test.describe("Mobile audit - overlay-open state", () => {
  for (const vp of viewports) {
    test(`overlay-open at ${vp.name}px`, async ({ browser }) => {
      const context = await createMobileContext(browser, vp)
      const page = await context.newPage()

      // Skip splash animation
      await page.addInitScript(() => {
        sessionStorage.setItem("glitch-splash-seen", "true")
      })

      await page.goto("/", { waitUntil: "networkidle" })
      await page.waitForTimeout(500)

      // Click the menu trigger button in bottom tab bar
      const menuButton = page.locator(
        'button[aria-label="Open navigation menu"]'
      )
      const menuVisible = await menuButton.isVisible().catch(() => false)

      if (menuVisible) {
        await menuButton.click()
        await page.waitForTimeout(300)
      } else {
        test.info().annotations.push({
          type: "menu-not-found",
          description: `No menu button found at ${vp.name}px`,
        })
      }

      await page.screenshot({
        path: path.join(screenshotDir, `overlay-open-${vp.name}.png`),
        fullPage: true,
      })

      await context.close()
    })
  }
})

// ── Describe block 3: Player-active state (beats page) ──
test.describe("Mobile audit - player-active state", () => {
  for (const vp of viewports) {
    test(`player-active at ${vp.name}px`, async ({ browser }) => {
      const context = await createMobileContext(browser, vp)
      const page = await context.newPage()

      // Skip splash animation
      await page.addInitScript(() => {
        sessionStorage.setItem("glitch-splash-seen", "true")
      })

      await page.goto("/beats", { waitUntil: "networkidle" })
      await page.waitForTimeout(500)

      // Try to trigger playback by clicking a play button on a beat card
      const playButton = page
        .locator(
          'button[aria-label*="Play"], button:has(svg.lucide-play), [data-testid="play-button"]'
        )
        .first()

      const playVisible = await playButton.isVisible().catch(() => false)

      if (playVisible) {
        await playButton.click()
        await page.waitForTimeout(1000) // Wait for player bar to appear
      } else {
        test.info().annotations.push({
          type: "no-play-button-found",
          description: `No play button found on beats page at ${vp.name}px`,
        })
      }

      await page.screenshot({
        path: path.join(screenshotDir, `player-active-${vp.name}.png`),
        fullPage: true,
      })

      await context.close()
    })
  }
})
