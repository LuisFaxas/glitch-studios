import { test, expect, type Page } from "@playwright/test"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"

async function loginAsAdmin(page: Page): Promise<boolean> {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return false
  try {
    const res = await page.request.post(`${BASE_URL}/api/auth/sign-in/email`, {
      data: { email, password },
    })
    return res.ok()
  } catch {
    return false
  }
}

test.describe("07.5 Product form", () => {
  test("new product page renders all required fields", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/products/new`, { waitUntil: "domcontentloaded" })

    await expect(page.getByRole("heading", { name: /^New Product$/i })).toBeVisible()
    await expect(page.getByLabel(/^Name/i)).toBeVisible()
    await expect(page.getByLabel(/^Slug$/i)).toBeVisible()
    await expect(page.getByText(/^Category/i).first()).toBeVisible()
    await expect(page.getByLabel(/Summary/i)).toBeVisible()
  })

  test("selecting a category triggers a spec template fetch", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/products/new`, { waitUntil: "domcontentloaded" })

    const picker = page.getByRole("button", { name: /Select category/i }).first()
    await picker.click()

    const input = page.getByPlaceholder(/Search categories/i)
    await expect(input).toBeVisible()

    const firstOption = page.getByRole("option").first()
    const count = await page.getByRole("option").count()
    test.skip(count === 0, "No categories exist in test DB")

    await firstOption.click()

    await expect(page.getByText(/^Specifications$/i)).toBeVisible()
  })

  test("changing category with filled specs shows confirmation dialog", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/products/new`, { waitUntil: "domcontentloaded" })

    const picker = page.getByRole("button", { name: /Select category/i }).first()
    await picker.click()
    const options = page.getByRole("option")
    const optionCount = await options.count()
    test.skip(optionCount < 2, "Need at least 2 categories to test change")

    await options.nth(0).click()

    const specInputs = page.locator("section:has-text('Specifications') input")
    if ((await specInputs.count()) > 0) {
      await specInputs.first().fill("test-value")
    } else {
      test.skip(true, "First category has no spec template; can't trigger warning")
      return
    }

    await picker.click()
    await page.getByRole("option").nth(1).click()

    await expect(page.getByText(/Change category\?/i)).toBeVisible()
    await expect(
      page.getByRole("button", { name: /Change and clear specs/i }),
    ).toBeVisible()
  })

  test("products list page renders headings even with no data", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/products`, { waitUntil: "domcontentloaded" })

    await expect(page.getByRole("heading", { name: /^Products$/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /New product/i }).first()).toBeVisible()
  })
})
