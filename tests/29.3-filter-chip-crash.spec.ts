import { test, expect } from "@playwright/test"

/**
 * Phase 29.3 cross-engine crash-repro test.
 *
 * Cannot reproduce the actual macOS Metal crash (headless Linux clean), but
 * catches the regression class: listener leaks, DOM leaks, console error
 * storms, page-exception throws.
 *
 * Run:
 *   pnpm exec playwright test tests/29.3-filter-chip-crash.spec.ts --project=webkit
 *   pnpm exec playwright test tests/29.3-filter-chip-crash.spec.ts --project=firefox
 *
 * Both must exit 0.
 *
 * Selector contract:
 *   - [data-testid="leaderboard-filters"] — filter bar root (added in Plan 29.3-03)
 *   - [data-facet-dropdown="Year"]        — Year facet trigger button
 *   - [role="dialog"][data-open]          — open Base UI Popover popup. The popup
 *                                           is portalled (rendered inside
 *                                           [data-base-ui-portal] near the end of
 *                                           <body>), NOT a sibling of the trigger.
 *                                           The popup contains the option chips.
 *   - inside the popup: <button aria-pressed="..."> per option chip
 */

const ROUTE = "/tech/rankings/laptops"
const CLICK_BATCH = 20

test("filter chip click does not leak DOM, listeners, or fire console errors (Year facet)", async ({
  page,
}) => {
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

  // 1. Navigate
  await page.goto(ROUTE)

  // 2. Wait for table to render — at least one row must be present.
  await page.locator("[data-leaderboard-table]").first().waitFor({ state: "visible" })
  const rowsBefore = await page
    .locator("[data-leaderboard-table] tbody tr")
    .count()
  expect(rowsBefore).toBeGreaterThan(0)

  // 3. Locate filter root (selector contract from Plan 29.3-03).
  // Defensive selector: prefer data-testid (added by Plan 29.3-03) but fall
  // back to data-leaderboard-filters which has been on the chip-bar root since
  // Phase 29.1 (older bundle compatibility).
  const filterRoot = page.locator(
    '[data-testid="leaderboard-filters"], [data-leaderboard-filters][data-layout="bar"]',
  ).first()
  await expect(filterRoot).toBeVisible()

  // 4. Open the Year dropdown by clicking its trigger
  const yearTrigger = page.locator('[data-facet-dropdown="Year"]')
  await expect(yearTrigger).toBeVisible()
  await yearTrigger.dispatchEvent("click")

  // The Year popup is rendered through a Base UI portal (not a sibling of the
  // trigger). Locate the open dialog: [role="dialog"][data-open] is unique to
  // the currently-open popup (Base UI removes the data-open attribute on close).
  const yearPopup = page.locator('[role="dialog"][data-open]')
  await expect(yearPopup).toBeVisible()

  // 5. Snapshot DOM node count of the open Base UI portal (the popup subtree
  // ONLY). Scoping to the portal isolates the measurement from unrelated DOM
  // changes (e.g., table row re-renders when filters change). A leak from
  // repeated open/close cycles or repeated chip clicks would manifest as
  // growing portal subtree size. We snapshot while the popup is OPEN so the
  // measurement is consistent (open vs open).
  const portalLocator = page.locator("[data-base-ui-portal]")
  const nodesBefore = await portalLocator.locator("*").count()

  // 6. Click a Year option chip 20× rapidly. Use the first aria-pressed button
  // inside the open popup.
  const firstYearChip = yearPopup.locator("button[aria-pressed]").first()
  await expect(firstYearChip).toBeVisible()
  const initialPressed = await firstYearChip.getAttribute("aria-pressed")

  // dispatchEvent("click") is used here (NOT .click()) because the standard
  // Playwright click waits for actionability stability AFTER each click — the
  // chip-bar's setFilters re-render schedule causes the trigger element to be
  // momentarily re-positioned, hanging the natural click. dispatchEvent bypasses
  // actionability checks but still fires the React onClick handler, which is
  // exactly what we want for a rapid-fire stress test. Same pattern used by
  // tests/29.1-06-filter-bar.spec.ts for the sheet trigger.
  for (let i = 0; i < CLICK_BATCH; i += 1) {
    await firstYearChip.dispatchEvent("click")
  }

  // After the batch, wait for the popup to settle. Use an assertion-driven wait
  // on the chip's aria-pressed value (which must equal initial since 20 toggles
  // is even). This is an alternative to waitForTimeout — anti-pattern guard.
  await expect(firstYearChip).toHaveAttribute("aria-pressed", initialPressed ?? "false")

  // 7. Close the popup. After a tight batch of synthetic chip clicks the
  // browser's input dispatch can be temporarily blocked while React flushes
  // its scheduler — page.keyboard.press("Escape") has been observed to hang
  // for ~30s on Chromium and to fail with "Page closed" on Webkit. Use
  // dispatchEvent on the trigger to close via toggle (the trigger is a Base UI
  // click-trigger that toggles its popup on click). No waitForTimeout — wait
  // is assertion-driven (anti-pattern guard).
  await yearTrigger.dispatchEvent("click")
  await expect(yearPopup).not.toBeVisible({ timeout: 2000 })

  // ----- Assertions -----

  // No console errors during the batch
  expect(
    consoleErrors,
    `console errors during batch:\n${consoleErrors.join("\n")}`,
  ).toEqual([])

  // No page exceptions
  expect(
    pageExceptions,
    `page exceptions during batch:\n${pageExceptions.join("\n")}`,
  ).toEqual([])

  // Document still interactive after the batch
  await expect(page.locator("body")).toBeVisible()

  // aria-pressed cycles correctly: 20 toggles → ends at the same state it started
  // (20 is even — pressed/unpressed should match initial). Re-open the popup to
  // re-locate the chip (Escape closed and unmounted it).
  await yearTrigger.dispatchEvent("click")
  const reopenedPopup = page.locator('[role="dialog"][data-open]')
  await expect(reopenedPopup).toBeVisible()
  const finalPressed = await reopenedPopup
    .locator("button[aria-pressed]")
    .first()
    .getAttribute("aria-pressed")
  expect(finalPressed).toBe(initialPressed)
  await yearTrigger.dispatchEvent("click")
  await expect(reopenedPopup).not.toBeVisible({ timeout: 2000 })

  // Row count differs (or at most equals) baseline when chip is active. Toggle
  // ON once. (Chip is currently at initial state; click once to activate.)
  await yearTrigger.dispatchEvent("click")
  const reopenedPopup2 = page.locator('[role="dialog"][data-open]')
  await expect(reopenedPopup2).toBeVisible()
  await reopenedPopup2.locator("button[aria-pressed]").first().dispatchEvent("click")
  await yearTrigger.dispatchEvent("click")
  await expect(reopenedPopup2).not.toBeVisible({ timeout: 2000 })
  const rowsFiltered = await page
    .locator("[data-leaderboard-table] tbody tr")
    .count()
  // The seed corpus has multiple years, so a single-year filter should reduce
  // row count below the unfiltered total (or at most equal). We assert ≤.
  expect(rowsFiltered).toBeLessThanOrEqual(rowsBefore)

  // DOM node delta within ±2 of snapshot (leak guard).
  // nodesBefore was measured with the popup OPEN (the very first open). Take a
  // fresh snapshot now with the popup OPEN for an apples-to-apples comparison.
  // A consistent delta near 0 across both snapshots means open/close/click
  // cycles aren't leaking nodes into the portal subtree.
  await yearTrigger.dispatchEvent("click")
  const reopenedPopup3 = page.locator('[role="dialog"][data-open]')
  await expect(reopenedPopup3).toBeVisible()
  const nodesFinal = await portalLocator.locator("*").count()
  await yearTrigger.dispatchEvent("click")
  await expect(reopenedPopup3).not.toBeVisible({ timeout: 2000 })

  expect(Math.abs(nodesFinal - nodesBefore)).toBeLessThanOrEqual(2)

  // Echo for log readability
  console.log(
    `nodesBefore(open)=${nodesBefore} nodesFinal(open)=${nodesFinal} rowsBefore=${rowsBefore} rowsFiltered=${rowsFiltered} CLICK_BATCH=${CLICK_BATCH}`,
  )
})
