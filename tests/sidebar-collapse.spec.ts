import { test, expect } from "@playwright/test"

test.describe("Scroll-aware sidebar collapse", () => {
  test("homepage load - sidebar collapsed, hero centered @desktop", async ({ page }) => {
    // Set sessionStorage to skip splash
    await page.goto("http://localhost:3004")
    await page.evaluate(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("http://localhost:3004")
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: "test-results/sidebar-01-homepage-collapsed.png",
      fullPage: false,
    })
  })

  test("homepage scrolled past hero - sidebar expanded @desktop", async ({ page }) => {
    await page.goto("http://localhost:3004")
    await page.evaluate(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("http://localhost:3004")
    await page.waitForTimeout(1000)
    // Scroll past hero (90vh)
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: "instant" }))
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: "test-results/sidebar-02-homepage-expanded.png",
      fullPage: false,
    })
  })

  test("beats page - sidebar expanded by default @desktop", async ({ page }) => {
    await page.goto("http://localhost:3004/beats")
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: "test-results/sidebar-04-beats-expanded.png",
      fullPage: false,
    })
  })
})

test.describe("Mobile sidebar", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("homepage mobile - no sidebar visible", async ({ page }) => {
    await page.goto("http://localhost:3004")
    await page.evaluate(() => sessionStorage.setItem("glitch-splash-seen", "true"))
    await page.goto("http://localhost:3004")
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: "test-results/sidebar-03-homepage-mobile.png",
      fullPage: false,
    })
  })
})
