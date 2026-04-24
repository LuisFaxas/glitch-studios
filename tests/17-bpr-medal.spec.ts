import { test, expect } from "@playwright/test"

const BASE_URL = "http://localhost:3004"

test("BPR medal tier: platinum — full variant visual baseline", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  const chip = page.locator("#thresholds table tbody tr").nth(0).locator("span").first()
  await expect(chip).toBeVisible()
  await expect(chip).toHaveScreenshot("medal-platinum.png", { maxDiffPixelRatio: 0.01 })
})

test("BPR medal tier: gold — full variant visual baseline", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  const chip = page.locator("#thresholds table tbody tr").nth(1).locator("span").first()
  await expect(chip).toBeVisible()
  await expect(chip).toHaveScreenshot("medal-gold.png", { maxDiffPixelRatio: 0.01 })
})

test("BPR medal tier: silver — full variant visual baseline", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  const chip = page.locator("#thresholds table tbody tr").nth(2).locator("span").first()
  await expect(chip).toBeVisible()
  await expect(chip).toHaveScreenshot("medal-silver.png", { maxDiffPixelRatio: 0.01 })
})

test("BPR medal tier: bronze — full variant visual baseline", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  const chip = page.locator("#thresholds table tbody tr").nth(3).locator("span").first()
  await expect(chip).toBeVisible()
  await expect(chip).toHaveScreenshot("medal-bronze.png", { maxDiffPixelRatio: 0.01 })
})

test("BPR medal placeholder: no-medal row visual baseline", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  const chip = page.locator("#thresholds table tbody tr").nth(4).locator("span").first()
  await expect(chip).toBeVisible()
  await expect(chip).toHaveScreenshot("medal-none.png", { maxDiffPixelRatio: 0.01 })
})
