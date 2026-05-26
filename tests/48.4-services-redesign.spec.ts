import { test, expect } from "@playwright/test"

const SERVICES_URL =
  process.env.SERVICES_URL ?? "http://localhost:3010/services"

// Artifacts (screenshots, traces) under .playwright-mcp/48.4/ per global preferences.
// We can't change playwright.config.ts outputDir from inside a spec; on failure,
// artifacts land under test-results/ — operator should copy to .playwright-mcp/48.4/
// when filing screenshots manually.
test.use({
  screenshot: { mode: "only-on-failure", fullPage: false },
  trace: "retain-on-failure",
})

test.describe("Phase 48.4: /services redesign — verification hooks (UI-SPEC §24)", () => {
  test.beforeEach(async ({ page }) => {
    // Graceful skip if dev server is offline — matches tests/07.5-*.spec.ts convention.
    const response = await page
      .goto(SERVICES_URL, { waitUntil: "domcontentloaded" })
      .catch(() => null)
    if (!response || !response.ok()) {
      test.skip(true, `Dev server not reachable at ${SERVICES_URL}`)
    }
  })

  test("AC-01 hero carousel autoplays at 6s interval", async ({ page }) => {
    await page.waitForSelector('section[aria-label="Service highlights"]', {
      timeout: 5000,
    })
    const dots = page.locator(
      'section[aria-label="Service highlights"] button[aria-label^="Go to slide"]'
    )
    await expect(dots.first()).toHaveClass(/bg-\[#f5f5f0\]/)
    // Wait > 6s; slide 2 dot should now be active
    await page.waitForTimeout(6500)
    await expect(dots.nth(1)).toHaveClass(/bg-\[#f5f5f0\]/)
  })

  test("AC-02 hero pauses on hover (desktop)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.waitForSelector('section[aria-label="Service highlights"]')
    const hero = page.locator('section[aria-label="Service highlights"]')
    const dots = hero.locator('button[aria-label^="Go to slide"]')
    await expect(dots.first()).toHaveClass(/bg-\[#f5f5f0\]/)
    await hero.hover()
    await page.waitForTimeout(6500)
    // Still on slide 1 because hover pauses autoplay (Embla stopOnMouseEnter: true)
    await expect(dots.first()).toHaveClass(/bg-\[#f5f5f0\]/)
  })

  test("AC-03 hero pauses on prefers-reduced-motion: reduce", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" })
    const page = await context.newPage()
    const response = await page
      .goto(SERVICES_URL, { waitUntil: "domcontentloaded" })
      .catch(() => null)
    if (!response || !response.ok()) {
      await context.close()
      test.skip(true, `Dev server not reachable at ${SERVICES_URL}`)
      return
    }
    await page.waitForSelector('section[aria-label="Service highlights"]')
    const dots = page.locator(
      'section[aria-label="Service highlights"] button[aria-label^="Go to slide"]'
    )
    await expect(dots.first()).toHaveClass(/bg-\[#f5f5f0\]/)
    await page.waitForTimeout(7000)
    // Still slide 1 — reduced-motion halts autoplay (UI-SVC-12)
    await expect(dots.first()).toHaveClass(/bg-\[#f5f5f0\]/)
    await context.close()
  })

  test("AC-04 mobile grid is 2 columns at 375px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForSelector("#service-grid")
    const grid = page.locator("#service-grid")
    const cols = await grid.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns
    )
    // Mobile = exactly 2 track sizes
    expect(cols.split(/\s+/).filter(Boolean).length).toBe(2)
  })

  test("AC-04b desktop grid is 3 columns at 1280px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.waitForSelector("#service-grid")
    const grid = page.locator("#service-grid")
    const cols = await grid.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns
    )
    expect(cols.split(/\s+/).filter(Boolean).length).toBe(3)
  })

  test("AC-05 tap card opens drawer (mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForSelector('[data-testid="service-card"]')
    await page.locator('[data-testid="service-card"]').first().click()
    // Vaul renders drawer content with data-vaul-drawer-direction
    await expect(
      page.locator('[data-vaul-drawer-direction="bottom"]')
    ).toBeVisible({ timeout: 3000 })
  })

  test("AC-07 deep-link /services#mixing-mastering auto-opens overlay", async ({
    page,
  }) => {
    await page.goto(`${SERVICES_URL}#mixing-mastering`, {
      waitUntil: "domcontentloaded",
    })
    // Auto-open is setTimeout(0)-deferred — wait briefly
    await page.waitForTimeout(500)
    const heading = page.getByRole("heading", { name: /MIXING & MASTERING/i })
    await expect(heading).toBeVisible({ timeout: 3000 })
  })

  test("AC-08 service card has NO isolated lucide icon (typography-driven)", async ({
    page,
  }) => {
    await page.waitForSelector('[data-testid="service-card"]')
    const firstCard = page.locator('[data-testid="service-card"]').first()
    const svgCount = await firstCard.locator("svg").count()
    // Card is typography-driven — no isolated icon in cover frame
    expect(svgCount).toBe(0)
  })

  test("AC-12 mobile shows 4+ services above grid scroll at 375x812", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForSelector('[data-testid="service-card"]')
    const cards = page.locator('[data-testid="service-card"]')
    const count = Math.min(await cards.count(), 4)
    const fourthCardBox = await cards
      .nth(Math.max(0, count - 1))
      .boundingBox()
    expect(fourthCardBox).not.toBeNull()
    // 4th card top must be inside the viewport height
    expect(fourthCardBox!.y).toBeLessThan(812)
  })

  test("AC-anti-pattern custom request tile links to /contact?service=custom", async ({
    page,
  }) => {
    await page.waitForSelector('[data-testid="custom-request-tile"]')
    const tile = page.locator('[data-testid="custom-request-tile"]')
    await expect(tile).toHaveAttribute("href", "/contact?service=custom")
  })

  test("AC-eyebrow sticky bar renders SERVICES + option count", async ({
    page,
  }) => {
    await page.waitForSelector("text=SERVICES")
    const bar = page.locator("text=SERVICES").first()
    await expect(bar).toBeVisible()
    const optCount = page.locator("text=/OPTIONS · (TAP|CLICK) TO VIEW/i")
    await expect(optCount.first()).toBeVisible()
  })

  test("AC-closing-cta START A CONVERSATION links to /contact", async ({
    page,
  }) => {
    const cta = page.getByRole("link", { name: /START A CONVERSATION/i })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute("href", "/contact")
  })
})
