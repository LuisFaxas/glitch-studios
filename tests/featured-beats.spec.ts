import { test, chromium } from "@playwright/test"

const BASE_URL = "http://localhost:3004"
const DIR = ".planning/phases/07.3-mobile-menu-overhaul/screenshots"

test("featured beats section", async () => {
  test.setTimeout(60000)
  const browser = await chromium.launch()

  // Desktop view
  const desktopCtx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  const desktopPage = await desktopCtx.newPage()
  await desktopPage.addInitScript(() => {
    sessionStorage.setItem("glitch-splash-seen", "true")
  })
  await desktopPage.goto(BASE_URL, { waitUntil: "networkidle" })
  await desktopPage.waitForTimeout(2000)

  // Slow scroll through entire page to trigger intersection observers
  const pageHeight = await desktopPage.evaluate(() => document.body.scrollHeight)
  for (let pos = 0; pos < pageHeight; pos += 200) {
    await desktopPage.evaluate((y) => window.scrollTo(0, y), pos)
    await desktopPage.waitForTimeout(100)
  }
  // Scroll to Featured Beats
  await desktopPage.evaluate(() => {
    const headings = [...document.querySelectorAll('h2')]
    const featured = headings.find(h => h.textContent?.includes('Featured'))
    if (featured) featured.scrollIntoView({ block: 'start' })
  })
  await desktopPage.waitForTimeout(1500)
  await desktopPage.screenshot({ path: `${DIR}/featured-beats-desktop.png` })

  // Mobile view
  const mobileCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  })
  const mobilePage = await mobileCtx.newPage()
  await mobilePage.addInitScript(() => {
    sessionStorage.setItem("glitch-splash-seen", "true")
  })
  await mobilePage.goto(BASE_URL, { waitUntil: "networkidle" })
  await mobilePage.waitForTimeout(2000)

  for (let i = 0; i < 30; i++) {
    await mobilePage.evaluate(() => window.scrollBy(0, 400))
    await mobilePage.waitForTimeout(150)
  }
  await mobilePage.evaluate(() => {
    const headings = [...document.querySelectorAll('h2')]
    const featured = headings.find(h => h.textContent?.includes('Featured'))
    if (featured) featured.scrollIntoView({ block: 'start' })
  })
  await mobilePage.waitForTimeout(1000)
  await mobilePage.screenshot({ path: `${DIR}/featured-beats-mobile.png` })

  await desktopCtx.close()
  await mobileCtx.close()
  await browser.close()
})
