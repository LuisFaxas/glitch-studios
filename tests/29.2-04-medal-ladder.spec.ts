import { test, expect } from "@playwright/test"

test.describe("29.2-04 — /tech/about medal threshold ladder", () => {
  test.setTimeout(30_000)

  test("thresholds section renders as ladder (not table)", async ({ page }) => {
    await page.goto("/tech/about")
    const section = page.locator("#thresholds")
    await expect(section).toBeVisible({ timeout: 5_000 })

    await expect(section.locator("table")).not.toBeVisible()

    for (const label of ["PLATINUM", "GOLD", "SILVER", "BRONZE"]) {
      await expect(section.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test("tiers appear in correct visual order (Platinum first, Bronze last)", async ({ page }) => {
    await page.goto("/tech/about")
    const section = page.locator("#thresholds")
    await expect(section).toBeVisible()

    const tierTexts = await section.locator("span").allTextContents()
    const tiers = tierTexts.filter((t) =>
      ["PLATINUM", "GOLD", "SILVER", "BRONZE", "No medal"].includes(t),
    )

    const platIdx = tiers.indexOf("PLATINUM")
    const goldIdx = tiers.indexOf("GOLD")
    const silverIdx = tiers.indexOf("SILVER")
    const bronzeIdx = tiers.indexOf("BRONZE")
    expect(platIdx).toBeLessThan(goldIdx)
    expect(goldIdx).toBeLessThan(silverIdx)
    expect(silverIdx).toBeLessThan(bronzeIdx)
  })

  test("score ranges are visible: 90-100, 80-89, 70-79, 60-69", async ({ page }) => {
    await page.goto("/tech/about")
    const section = page.locator("#thresholds")
    await expect(section).toBeVisible()

    for (const range of ["90–100", "80–89", "70–79", "60–69"]) {
      await expect(section.getByText(range)).toBeVisible()
    }
  })

  test("No medal entry is visible", async ({ page }) => {
    await page.goto("/tech/about")
    const section = page.locator("#thresholds")
    await expect(section).toBeVisible()
    await expect(section.getByText("No medal")).toBeVisible()
  })

  test("#thresholds anchor works from jump nav", async ({ page }) => {
    await page.goto("/tech/about")
    await page.getByRole("link", { name: "Thresholds" }).click()
    const section = page.locator("#thresholds")
    await expect(section).toBeInViewport({ timeout: 3_000 })
  })
})
