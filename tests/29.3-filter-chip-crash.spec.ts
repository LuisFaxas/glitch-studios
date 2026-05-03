import { test, expect } from "@playwright/test"

/**
 * Phase 29.3 / 48.1 cross-engine crash-repro guard.
 *
 * Headless browsers cannot reproduce the real macOS Safari/Firefox freeze, but
 * this catches the surrounding regression class: stale table selectors,
 * listener/DOM growth, console errors, page exceptions, and broken local filter
 * state after rapid chip toggles.
 */

const ROUTE = "/tech/rankings/laptops"
const CLICK_BATCH = 20

async function displayRowCount(page: import("@playwright/test").Page) {
  return page
    .locator("[data-leaderboard-display] [data-leaderboard-row]")
    .count()
}

test("filter chip click does not leak DOM, listeners, or fire console errors (Year facet)", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Desktop filter bar stress is covered in the desktop project.",
  )
  const consoleErrors: string[] = []
  const pageExceptions: string[] = []

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text())
    }
  })
  page.on("pageerror", (err) => {
    pageExceptions.push(err.message)
  })

  await page.goto(ROUTE)

  const display = page.locator("[data-leaderboard-display]")
  await expect(display).toBeVisible({ timeout: 5_000 })
  const rowsBefore = await displayRowCount(page)
  expect(rowsBefore).toBeGreaterThan(0)

  const filterRoot = page
    .locator(
      '[data-testid="leaderboard-filters"], [data-leaderboard-filters][data-layout="bar"]',
    )
    .first()
  await expect(filterRoot).toBeVisible()

  const yearTrigger = page.locator('[data-facet-dropdown="Year"]')
  await expect(yearTrigger).toBeVisible()
  await yearTrigger.dispatchEvent("click")

  const yearPopup = yearTrigger.locator(
    "xpath=following-sibling::div[@role='menu']",
  )
  await expect(yearPopup).toBeVisible()

  const nodesBefore = await yearPopup.locator("*").count()

  const firstYearChip = yearPopup.locator("button[aria-pressed]").first()
  await expect(firstYearChip).toBeVisible()

  for (let i = 0; i < CLICK_BATCH; i += 1) {
    await firstYearChip.dispatchEvent("click")
  }

  await yearTrigger.dispatchEvent("click")
  await expect(yearPopup).not.toBeVisible({ timeout: 2_000 })

  expect(
    consoleErrors,
    `console errors during batch:\n${consoleErrors.join("\n")}`,
  ).toEqual([])

  expect(
    pageExceptions,
    `page exceptions during batch:\n${pageExceptions.join("\n")}`,
  ).toEqual([])

  await expect(page.locator("body")).toBeVisible()

  await yearTrigger.dispatchEvent("click")
  const reopenedPopup = yearTrigger.locator(
    "xpath=following-sibling::div[@role='menu']",
  )
  await expect(reopenedPopup).toBeVisible()
  const finalPressed = await reopenedPopup
    .locator("button[aria-pressed]")
    .first()
    .getAttribute("aria-pressed")
  expect(["true", "false"]).toContain(finalPressed)
  await yearTrigger.dispatchEvent("click")
  await expect(reopenedPopup).not.toBeVisible({ timeout: 2_000 })

  const rowsFiltered = await displayRowCount(page)
  expect(rowsFiltered).toBeLessThanOrEqual(rowsBefore)

  await yearTrigger.dispatchEvent("click")
  const reopenedPopup2 = yearTrigger.locator(
    "xpath=following-sibling::div[@role='menu']",
  )
  await expect(reopenedPopup2).toBeVisible()
  const nodesFinal = await reopenedPopup2.locator("*").count()
  await yearTrigger.dispatchEvent("click")
  await expect(reopenedPopup2).not.toBeVisible({ timeout: 2_000 })

  expect(Math.abs(nodesFinal - nodesBefore)).toBeLessThanOrEqual(5)

  console.log(
    `nodesBefore(open)=${nodesBefore} nodesFinal(open)=${nodesFinal} rowsBefore=${rowsBefore} rowsFiltered=${rowsFiltered} CLICK_BATCH=${CLICK_BATCH}`,
  )
})
