import { test, expect } from "@playwright/test"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"

test.describe("23-06 Forgot / Reset password routes", () => {
  test("/forgot-password renders form", async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`, {
      waitUntil: "domcontentloaded",
    })
    await expect(
      page.getByRole("heading", { name: /reset password/i }),
    ).toBeVisible()
    await expect(page.getByLabel(/^email$/i)).toBeVisible()
    await expect(
      page.getByRole("button", { name: /send reset link|sending/i }),
    ).toBeVisible()
  })

  test("/forgot-password submit shows sent confirmation (stub logs URL)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/forgot-password`, {
      waitUntil: "domcontentloaded",
    })
    await page.getByLabel(/^email$/i).fill("nobody-23-06@example.com")
    await page.getByRole("button", { name: /send reset link/i }).click()
    // After submit, the form is replaced by a confirmation panel.
    await expect(
      page.getByRole("button", { name: /send another link/i }),
    ).toBeVisible({ timeout: 5_000 })
  })

  test("/reset-password without token shows invalid state", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/reset-password`, {
      waitUntil: "domcontentloaded",
    })
    await expect(
      page.getByRole("heading", { name: /invalid or expired/i }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /request a new link/i }),
    ).toBeVisible()
  })

  test("/reset-password with token renders form", async ({ page }) => {
    await page.goto(
      `${BASE_URL}/reset-password?token=fake-token-for-render-test`,
      { waitUntil: "domcontentloaded" },
    )
    await expect(page.getByLabel(/^new password$/i)).toBeVisible()
    await expect(page.getByLabel(/^confirm password$/i)).toBeVisible()
    await expect(
      page.getByRole("button", { name: /update password|updating/i }),
    ).toBeVisible()
  })

  test("/forgot-password route is whitelisted (not redirected)", async ({
    page,
  }) => {
    const res = await page.goto(`${BASE_URL}/forgot-password`, {
      waitUntil: "domcontentloaded",
    })
    expect(res?.status()).toBeLessThan(400)
    expect(page.url()).toContain("/forgot-password")
  })
})
