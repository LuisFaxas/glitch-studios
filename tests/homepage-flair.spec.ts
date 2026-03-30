import { test, expect } from "@playwright/test"
import path from "path"

const screenshotDir = path.resolve(
  __dirname,
  "../.planning/phases/06.1-homepage-flair/screenshots"
)

test.describe("Homepage flair visual verification", () => {
  test("captures page content (splash skipped)", async ({ page }, testInfo) => {
    const projectName = testInfo.project.name

    // Skip splash animation by marking it as already seen in sessionStorage
    await page.addInitScript(() => {
      sessionStorage.setItem("glitch-splash-seen", "true")
    })

    await page.goto("/", { waitUntil: "networkidle" })

    // Wait a moment for animations to settle
    await page.waitForTimeout(1000)

    // Full-page screenshot
    await page.screenshot({
      path: path.join(screenshotDir, `homepage-${projectName}-full.png`),
      fullPage: true,
    })

    // Hero section screenshot (first section element)
    const hero = page.locator("section").first()
    await expect(hero).toBeVisible()
    await hero.screenshot({
      path: path.join(screenshotDir, `hero-${projectName}.png`),
    })
  })

  test("splash overlay renders on first visit", async ({ page }, testInfo) => {
    const projectName = testInfo.project.name

    // Do NOT set sessionStorage -- splash should appear
    await page.goto("/", { waitUntil: "commit" })

    // Wait for splash to be visible
    await page.waitForTimeout(500)

    // Screenshot the page with splash overlay visible
    await page.screenshot({
      path: path.join(screenshotDir, `splash-${projectName}.png`),
      fullPage: false,
    })
  })
})
