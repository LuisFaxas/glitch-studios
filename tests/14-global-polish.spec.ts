import { test, expect } from "@playwright/test"
import fs from "fs"
import path from "path"

const screenshotDir = path.resolve(
  __dirname,
  "../.planning/phases/14-global-polish/screenshots"
)
fs.mkdirSync(screenshotDir, { recursive: true })

async function bypassSplash(page: import("@playwright/test").Page) {
  await page.addInitScript(() =>
    sessionStorage.setItem("glitch-splash-seen", "true")
  )
}

const PAGES = [
  { name: "homepage", path: "/" },
  { name: "blog", path: "/blog" },
  { name: "portfolio", path: "/portfolio" },
  { name: "artists", path: "/artists" },
]

test.describe("Phase 14 — Global Polish verification", () => {
  test.setTimeout(120_000)

  for (const page of PAGES) {
    test(`${page.name}: footer has Stay in the loop label + Subscribe button`, async ({ page: pw }) => {
      await bypassSplash(pw)
      await pw.goto(page.path, { waitUntil: "networkidle" })

      await pw.screenshot({
        path: path.join(screenshotDir, `desktop-${page.name}.png`),
        fullPage: true,
      })

      const footer = pw.locator("footer")
      await expect(footer).toBeVisible()
      await expect(pw.locator("footer p", { hasText: "Stay in the loop" })).toBeVisible()

      const subscribeBtn = pw.locator('footer button[type="submit"]')
      await expect(subscribeBtn).toBeVisible()
      await expect(subscribeBtn).toHaveText(/subscribe/i)
    })
  }

  test("mobile footer: newsletter full-width, no overflow", async ({ browser }) => {
    const mobile = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    })
    const mobilePage = await mobile.newPage()
    await bypassSplash(mobilePage)
    await mobilePage.goto("/", { waitUntil: "networkidle" })
    await mobilePage.waitForTimeout(400)

    await mobilePage.screenshot({
      path: path.join(screenshotDir, "mobile-homepage.png"),
      fullPage: true,
    })

    await expect(
      mobilePage.locator("footer p", { hasText: "Stay in the loop" })
    ).toBeVisible()

    const widths = await mobilePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1)

    await mobile.close()
  })

  test("artists page: social link anchors present (brand icons)", async ({ page: pw }) => {
    await bypassSplash(pw)
    await pw.goto("/artists", { waitUntil: "networkidle" })

    const cardLinks = pw.locator('a[href^="/artists/"]')
    const cardCount = await cardLinks.count()
    test.skip(cardCount === 0, "No artist members in seed data")

    await pw.screenshot({
      path: path.join(screenshotDir, "desktop-artists-cards.png"),
      fullPage: false,
    })

    const socialAnchors = pw.locator('article a[target="_blank"]')
    const socialCount = await socialAnchors.count()
    test.skip(
      socialCount === 0,
      "No social links on artist cards (members have no socialLinks JSON)"
    )

    const firstSocial = socialAnchors.first()
    await expect(firstSocial).toBeVisible()
    const svg = firstSocial.locator("svg").first()
    const viewBox = await svg.getAttribute("viewBox")
    expect(viewBox).toBe("0 0 24 24")
  })

  test("player bar: License Beat Link href /beats + NOW PLAYING label when playing", async ({ page: pw, viewport }) => {
    // NOW PLAYING label + License Beat CTA live inside the desktop md:flex block only.
    test.skip((viewport?.width ?? 0) < 768, "Player bar NOW PLAYING + License Beat are desktop-only")

    await bypassSplash(pw)
    await pw.goto("/beats", { waitUntil: "networkidle" })

    const playButton = pw.locator('[aria-label*="Play"]').first()
    const playButtonExists = await playButton.isVisible().catch(() => false)
    test.skip(!playButtonExists, "No beats in seed data — player bar interaction skipped")

    await playButton.click()
    await pw.waitForTimeout(600)

    await expect(pw.locator("text=NOW PLAYING").first()).toBeVisible()

    const licenseBeatLink = pw.locator('a:has-text("License Beat")')
    await expect(licenseBeatLink).toBeVisible()
    const href = await licenseBeatLink.getAttribute("href")
    expect(href).toBe("/beats")

    await pw.screenshot({
      path: path.join(screenshotDir, "desktop-player-bar-active.png"),
      fullPage: false,
    })
  })
})
