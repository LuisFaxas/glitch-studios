import { test, expect } from "@playwright/test"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"

test.use({
  viewport: { width: 375, height: 812 },
  hasTouch: true,
  isMobile: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
})

test.describe("23-04 Mobile nav single-tap (audit §B.1, §B.2, §A.12)", () => {
  test("overlay Beats link navigates on first tap (Studios)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
    await page
      .getByRole("button", { name: /open navigation menu/i })
      .first()
      .tap()
    await page.waitForTimeout(400)
    await page
      .getByRole("link", { name: /^beats$/i })
      .first()
      .tap()
    await expect(page).toHaveURL(/\/beats/, { timeout: 3_000 })
  })

  test("overlay Services link navigates on first tap (Studios)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
    await page
      .getByRole("button", { name: /open navigation menu/i })
      .first()
      .tap()
    await page.waitForTimeout(400)
    await page
      .getByRole("link", { name: /^services$/i })
      .first()
      .tap()
    await expect(page).toHaveURL(/\/services/, { timeout: 3_000 })
  })

  test("overlay Portfolio link navigates on first tap (control — audit §B.2 generalized)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
    await page
      .getByRole("button", { name: /open navigation menu/i })
      .first()
      .tap()
    await page.waitForTimeout(400)
    await page
      .getByRole("link", { name: /^portfolio$/i })
      .first()
      .tap()
    await expect(page).toHaveURL(/\/portfolio/, { timeout: 3_000 })
  })

  test("bottom-tab Beats icon navigates on first tap (audit §A.12)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
    // Bottom tab bar has a direct <Link aria-label="Beats">; no overlay opening.
    await page.getByRole("link", { name: /^beats$/i }).first().tap()
    await expect(page).toHaveURL(/\/beats/, { timeout: 5_000 })
  })

  test("swipe-down-from-handle still dismisses overlay", async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
    await page
      .getByRole("button", { name: /open navigation menu/i })
      .first()
      .tap()
    await page.waitForTimeout(400)

    const handle = page.getByTestId("mobile-nav-drag-handle")
    const box = await handle.boundingBox()
    if (!box) throw new Error("drag handle not found")

    // Drag from handle down 250px to trigger dismiss (threshold is 120px).
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + 260, { steps: 15 })
    await page.mouse.up()

    // Overlay should be gone: Services link (inside overlay) no longer visible.
    await expect(
      page.getByRole("link", { name: /^services$/i }),
    ).toHaveCount(0, { timeout: 2_000 })
  })
})
