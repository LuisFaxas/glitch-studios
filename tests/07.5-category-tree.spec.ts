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

test.describe("07.5 Category tree CRUD", () => {
  test("add parent category via button prompt", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/categories`, { waitUntil: "domcontentloaded" })

    const testName = `Test Parent ${Date.now()}`
    page.once("dialog", (dialog) => dialog.accept(testName))

    await page.getByRole("button", { name: /Add parent category/i }).first().click()

    await page.waitForLoadState("domcontentloaded")
    await expect(page.getByText(testName)).toBeVisible({ timeout: 10000 })
  })

  test("renders the category tree page heading and top-right add button", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/categories`, { waitUntil: "domcontentloaded" })

    await expect(page.getByRole("heading", { name: /^Categories$/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /Add parent category/i }).first()).toBeVisible()
  })

  test("selecting a category populates the detail panel with Edit spec template button", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/categories`, { waitUntil: "domcontentloaded" })

    const rows = page.getByRole("treeitem")
    const count = await rows.count()
    test.skip(count === 0, "No categories to select in test")

    await rows.first().click()
    await expect(page.getByRole("button", { name: /Edit spec template/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /Edit benchmark template/i })).toBeVisible()
  })

  test("open spec template drawer", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/tech/categories`, { waitUntil: "domcontentloaded" })

    const rows = page.getByRole("treeitem")
    const count = await rows.count()
    test.skip(count === 0, "No categories to select")

    await rows.first().click()
    await page.getByRole("button", { name: /Edit spec template/i }).click()

    await expect(page.getByText(/Spec Template/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /Add field/i })).toBeVisible()
  })
})
