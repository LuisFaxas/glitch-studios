import { test, expect, type Page } from "@playwright/test"
import * as path from "node:path"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"
const FIXTURE = path.resolve("tests/fixtures/tiny.png")

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

test.describe("23-07 Admin media upload", () => {
  // D-17 non-regression: file-picker upload. Requires R2 env + CORS to succeed
  // end-to-end. Blocked on user Vercel+Cloudflare inventory per 23-07-DIAGNOSIS.md.
  // When R2 is configured, remove .fixme to enable.
  test.fixme(
    "file-picker upload happy path (D-17 non-regression guard) — blocked on R2 config",
    async ({ page }) => {
      const authed = await loginAsAdmin(page)
      test.skip(!authed, "Admin credentials not available")
      await page.goto(`${BASE_URL}/admin/media`, {
        waitUntil: "domcontentloaded",
      })
      const fileInput = page.locator('input[type="file"]').first()
      await fileInput.setInputFiles(FIXTURE)
      await expect(
        page.getByText(/uploaded|upload complete/i).first(),
      ).toBeVisible({ timeout: 20_000 })
    },
  )

  test("drop zone is visible with testid + initial data-dragging=false", async ({
    page,
  }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/media`, {
      waitUntil: "domcontentloaded",
    })
    const dropZone = page.getByTestId("media-drop-zone").first()
    await expect(dropZone).toBeVisible()
    await expect(dropZone).toHaveAttribute("data-dragging", "false")
  })

  test("drop zone shows active state on dragenter", async ({ page }) => {
    const authed = await loginAsAdmin(page)
    test.skip(!authed, "Admin credentials not available")
    await page.goto(`${BASE_URL}/admin/media`, {
      waitUntil: "domcontentloaded",
    })
    const dropZone = page.getByTestId("media-drop-zone").first()
    await expect(dropZone).toHaveAttribute("data-dragging", "false")
    await dropZone.dispatchEvent("dragenter")
    await expect(dropZone).toHaveAttribute("data-dragging", "true", {
      timeout: 2_000,
    })
    await dropZone.dispatchEvent("dragleave")
    await expect(dropZone).toHaveAttribute("data-dragging", "false", {
      timeout: 2_000,
    })
  })
})
