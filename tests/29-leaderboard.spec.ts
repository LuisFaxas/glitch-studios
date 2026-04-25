import { test, expect } from "@playwright/test"

/**
 * Phase 29 — Master Leaderboard verification.
 * Covers: RANK-02 (sort URL state), RANK-03 (filter URL state),
 * RANK-04 (null-cell tooltip), RANK-05 (mobile card),
 * RANK-06 (empty state + reset), RANK-07 (methodology link new-tab).
 *
 * Requires: Phase 29 Plan 01 placeholder seed applied + dev server running on port 3004.
 */

const RANKINGS_URL = "/tech/categories/laptops/rankings"
const CATEGORY_URL = "/tech/categories/laptops"

test.describe("Phase 29 — Master Leaderboard", () => {
  test("RANK-01 + CTA: category page surfaces 'View Rankings' that navigates to /rankings", async ({ page }) => {
    await page.goto(CATEGORY_URL)
    const cta = page.getByRole("link", { name: /view rankings/i })
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(new RegExp(`${RANKINGS_URL}$`))
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/rankings/i)
  })

  test("RANK-02: column header click updates URL with sort + dir; refresh preserves state", async ({ page }) => {
    await page.goto(RANKINGS_URL)
    await expect(page).toHaveURL(new RegExp(`${RANKINGS_URL}$`))

    await page.getByRole("button", { name: /^bpr$/i }).first().click()
    await page.waitForURL(/sort=bpr/)
    await expect(page).toHaveURL(/sort=bpr/)
    await expect(page).toHaveURL(/dir=desc/)

    await page.reload()
    await expect(page).toHaveURL(/sort=bpr/)
    await expect(page).toHaveURL(/dir=desc/)
  })

  test("RANK-02b: BPR score (separate from BPR medal) is also a sortable column", async ({ page }) => {
    await page.goto(RANKINGS_URL)
    await page.getByRole("button", { name: /bpr score/i }).first().click()
    await page.waitForURL(/sort=bprScore/)
    await expect(page).toHaveURL(/sort=bprScore/)
  })

  test("RANK-03: filter chip click updates URL", async ({ page }) => {
    await page.goto(RANKINGS_URL)
    const cpuChip = page.getByRole("button", { name: /apple silicon/i }).first()
    if (await cpuChip.isVisible()) {
      await cpuChip.click()
      await page.waitForURL(/cpu=/)
      await expect(page).toHaveURL(/cpu=/)
    }
  })

  test("RANK-04: null benchmark cell shows '—' with tooltip from exclusion data", async ({ page }) => {
    await page.goto(RANKINGS_URL)
    const sparseRow = page.locator("tr", { hasText: /Acer Swift Go/i }).first()
    await expect(sparseRow).toBeVisible()
    const dashCell = sparseRow.locator("text=—").first()
    await expect(dashCell).toBeVisible()
    await dashCell.hover()
    await expect(page.locator('[role="tooltip"]').first()).toBeVisible({ timeout: 2000 })
  })

  test("RANK-05: mobile <768px shows card list, not the table", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    })
    const page = await context.newPage()
    await page.goto(RANKINGS_URL)
    const cards = page.locator('a[href^="/tech/reviews/"]')
    await expect(cards.first()).toBeVisible()
    await expect(page.getByRole("button", { name: /filters/i })).toBeVisible()
    await context.close()
  })

  test("RANK-06: empty filter state shows reset button + clears nuqs", async ({ page }) => {
    // XTEST_NONEXISTENT is impossible — keeps the test deterministic vs future seed changes.
    await page.goto(`${RANKINGS_URL}?cpu=XTEST_NONEXISTENT`)
    const reset = page.getByRole("button", { name: /reset filters/i })
    await expect(reset).toBeVisible()
    await reset.click()
    await expect(page).not.toHaveURL(/cpu=/)
  })

  test("RANK-07: every methodology column-header link has target=_blank and points to /tech/methodology", async ({ page }) => {
    await page.goto(RANKINGS_URL)
    const links = page.locator('a[href*="/tech/methodology"]')
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(3)
    for (let i = 0; i < count; i++) {
      const link = links.nth(i)
      const target = await link.getAttribute("target")
      expect(target, `link #${i} target`).toBe("_blank")
      const rel = await link.getAttribute("rel")
      expect(rel ?? "", `link #${i} rel`).toContain("noopener")
    }
    const hrefs = await links.evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? ""),
    )
    expect(hrefs.some((h) => h.includes("#bpr"))).toBe(true)
    expect(hrefs.some((h) => h.includes("#glitchmark"))).toBe(true)
  })

  test("D-19: Buy button click does not navigate the row", async ({ page }) => {
    await page.goto(RANKINGS_URL)
    const buyBtn = page.getByRole("button", { name: /^buy$/i }).first()
    await expect(buyBtn).toBeVisible()
    const urlBefore = page.url()
    await buyBtn.click()
    expect(page.url()).toBe(urlBefore)
  })

  test("D-04: NULLS LAST holds — sparse-glitchmark row appears last on default sort", async ({ page }) => {
    await page.goto(RANKINGS_URL)
    const firstRowText = await page.locator("tbody tr").first().innerText()
    expect(firstRowText.toLowerCase()).not.toContain("acer swift go")
    const lastRowText = await page.locator("tbody tr").last().innerText()
    expect(lastRowText.toLowerCase()).toContain("acer swift go")
  })
})
