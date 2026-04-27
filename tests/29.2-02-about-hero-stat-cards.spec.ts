import { test, expect } from "@playwright/test"

test.describe("29.2-02 — /tech/about hero + stat cards + terminal formula", () => {
  test.setTimeout(30_000)

  test("TechHero renders with tall size, amber tone, and correct copy", async ({ page }) => {
    await page.goto("/tech/about")
    const hero = page.locator("[data-tech-hero]").first()
    await expect(hero).toBeVisible({ timeout: 5_000 })
    await expect(hero).toHaveAttribute("data-tone", "amber")

    await expect(
      page.getByRole("heading", { level: 1, name: /About GlitchTech/i }),
    ).toBeVisible()

    await expect(hero).toContainText("METHODOLOGY HUB")

    const cta = hero.locator('a[href="#methodology"]')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText(/Read methodology/i)

    const innerDiv = hero.locator("div").first()
    const height = await innerDiv.evaluate((el) => (el as HTMLElement).offsetHeight)
    expect(height).toBeGreaterThanOrEqual(400)
  })

  test("Stat cards row shows 43, 13, and 7 with correct labels", async ({ page }) => {
    await page.goto("/tech/about")

    const statSection = page.locator('section[aria-label="Methodology statistics"]')
    await expect(statSection).toBeVisible({ timeout: 5_000 })
    await expect(statSection.getByText("TESTS IN RUBRIC V1.1", { exact: true })).toBeVisible()
    await expect(statSection.getByText("DISCIPLINES", { exact: true })).toBeVisible()
    await expect(statSection.getByText("BPR-ELIGIBLE DISCIPLINES", { exact: true })).toBeVisible()
    await expect(statSection.getByText("43", { exact: true })).toBeVisible()
    await expect(statSection.getByText("13", { exact: true })).toBeVisible()
    await expect(statSection.getByText("7", { exact: true })).toBeVisible()
  })

  test("Terminal formula block has $ prompt prefix visible", async ({ page }) => {
    await page.goto("/tech/about")
    const formulaSection = page.locator("#bpr")
    await expect(formulaSection).toBeVisible()
    await expect(formulaSection.getByText("$", { exact: false })).toBeVisible()
  })

  test("No bare 'ABOUT' h1 on /tech/about (old heading removed)", async ({ page }) => {
    await page.goto("/tech/about")
    const bareH1 = page.getByRole("heading", { level: 1, name: /^ABOUT$/i })
    await expect(bareH1).not.toBeVisible()
    await expect(
      page.getByRole("heading", { level: 1, name: /About GlitchTech/i }),
    ).toBeVisible()
  })

  test("Discipline table row hover fires translate-x on discipline name cell", async ({ page }) => {
    await page.goto("/tech/about")
    const disciplinesSection = page.locator("#disciplines")
    await expect(disciplinesSection).toBeVisible({ timeout: 5_000 })

    const firstRow = disciplinesSection.locator("table tbody tr").first()
    await expect(firstRow).toBeVisible()

    const nameCell = firstRow.locator("td").first()
    await expect(nameCell).toBeVisible()

    await firstRow.hover()
    const cellText = await nameCell.textContent()
    expect(cellText).toBeTruthy()
    expect(cellText!.trim().length).toBeGreaterThan(0)
  })
})
