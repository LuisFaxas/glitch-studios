import { test, chromium } from "@playwright/test"

const BASE_URL = "http://localhost:3004"
const DIR = ".planning/phases/07.2-mobile-experience-overhaul/screenshots/audit"

test("mobile menu screenshots", async () => {
  test.setTimeout(60000)
  const browser = await chromium.launch()

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  })
  const page = await context.newPage()
  await page.addInitScript(() => {
    sessionStorage.setItem("glitch-splash-seen", "true")
  })
  await page.goto(BASE_URL, { waitUntil: "networkidle" })
  await page.waitForTimeout(2500)

  // Screenshot before opening menu
  await page.screenshot({ path: `${DIR}/menu-closed.png` })

  // Find and tap the MENU tab bar button
  const menuBtn = page.locator('text=MENU').last()
  if (await menuBtn.isVisible()) {
    await menuBtn.tap()
  } else {
    // Try finding by the grid/menu icon in tab bar
    const tabButtons = page.locator('nav button, nav a').last()
    await tabButtons.tap()
  }
  await page.waitForTimeout(800)

  // Screenshot with menu open
  await page.screenshot({ path: `${DIR}/menu-open.png` })

  // Full page screenshot
  await page.screenshot({ path: `${DIR}/menu-open-fullpage.png`, fullPage: true })

  await context.close()
  await browser.close()
})
