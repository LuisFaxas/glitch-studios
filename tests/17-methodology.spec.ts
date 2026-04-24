import { test, expect } from "@playwright/test"

const BASE_URL = "http://localhost:3004"

test("/tech/methodology — loads under 2 seconds and returns 200", async ({ page }) => {
  const start = Date.now()
  const response = await page.goto(`${BASE_URL}/tech/methodology`, {
    waitUntil: "domcontentloaded",
  })
  const elapsed = Date.now() - start
  expect(response?.status()).toBe(200)
  expect(elapsed).toBeLessThan(2000)
})

test("/tech/methodology — all 5 anchor sections render", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  for (const anchor of [
    "bpr",
    "disciplines",
    "thresholds",
    "exclusion-policy",
    "rubric-changelog",
  ]) {
    await expect(page.locator(`#${anchor}`)).toBeVisible()
  }
})

test("/tech/methodology — hero title uses GlitchHeading METHODOLOGY wordmark", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  await expect(page.locator("h1")).toContainText("METHODOLOGY")
})

test("/tech/methodology — BPR formula code block is present", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  await expect(page.locator("#bpr code")).toContainText("BPR = exp")
})

test("/tech/methodology — 7 BPR-eligible disciplines render in the discipline table", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  const rows = page.locator("#disciplines table tbody tr")
  await expect(rows).toHaveCount(7)
  for (const name of ["CPU", "GPU", "LLM", "Video", "Dev", "Python", "Games"]) {
    await expect(page.locator("#disciplines table")).toContainText(name)
  }
})

test("/tech/methodology — 4 medal tiers + no-medal row render in threshold table", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  const rows = page.locator("#thresholds table tbody tr")
  await expect(rows).toHaveCount(5)
  for (const label of ["PLATINUM", "GOLD", "SILVER", "BRONZE"]) {
    await expect(page.locator("#thresholds table")).toContainText(label)
  }
})

test("/tech/methodology — rubric changelog accordion contains v1.1 entry", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  await expect(page.locator("#rubric-changelog")).toContainText("Rubric v1.1")
  await expect(page.locator("#rubric-changelog")).toContainText("2026-04-23")
})

test("/tech/methodology — Back to Reviews CTA present and links to /tech/reviews", async ({ page }) => {
  await page.goto(`${BASE_URL}/tech/methodology`)
  const cta = page
    .locator('a[href="/tech/reviews"]')
    .filter({ hasText: /Back to Reviews/i })
  await expect(cta).toBeVisible()
})
