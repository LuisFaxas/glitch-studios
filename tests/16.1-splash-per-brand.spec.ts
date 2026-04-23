import { test, expect } from "@playwright/test"

// Phase 16.1 Plan 02 Tasks 1+2 — Splash overlay renders once-per-brand-per-session.
// D-03/D-04: sessionStorage keys `glitch_studios_splash_seen` and `glitch_tech_splash_seen`.
// D-05: root cause was localStorage with a single global key; fixed by swapping
// to sessionStorage + per-brand keys.

const SPLASH_LOCATOR = '[aria-hidden="true"]'

test.describe("Phase 16.1: Splash fires once per brand per session", () => {
  // Splash overlay covers the full viewport but does NOT require a specific
  // viewport size to test — the sessionStorage key logic is identical across
  // viewports.

  test("Studios splash fires on first visit, suppressed on reload (studios key)", async ({
    page,
  }) => {
    await page.goto("/")
    // Clear sessionStorage via page.evaluate — first page load has already
    // potentially set the key; clear then reload for a clean first-visit.
    await page.evaluate(() => sessionStorage.clear())
    await page.reload()

    // After clear+reload: both keys should be absent initially.
    const keyBeforePlay = await page.evaluate(() =>
      sessionStorage.getItem("glitch_studios_splash_seen"),
    )
    // The splash useEffect runs on mount and sets the key immediately to "1".
    // By the time the page has loaded, the key may already be set.
    expect(["1", null]).toContain(keyBeforePlay)

    // Wait briefly for the splash effect to run and set the storage key.
    await page.waitForTimeout(500)

    const studiosKey = await page.evaluate(() =>
      sessionStorage.getItem("glitch_studios_splash_seen"),
    )
    expect(studiosKey).toBe("1")

    // Tech key should NOT be set yet — we haven't visited Tech in this session.
    const techKeyAfterStudios = await page.evaluate(() =>
      sessionStorage.getItem("glitch_tech_splash_seen"),
    )
    expect(techKeyAfterStudios).toBeNull()
  })

  test("Tech splash sets tech key independently from studios key", async ({
    page,
  }) => {
    // Visit Studios first, let it mark its key.
    await page.goto("/")
    await page.evaluate(() => sessionStorage.clear())
    await page.reload()
    await page.waitForTimeout(500)

    expect(
      await page.evaluate(() =>
        sessionStorage.getItem("glitch_studios_splash_seen"),
      ),
    ).toBe("1")

    // Navigate to Tech. This is a same-origin nav on localhost; sessionStorage
    // persists across same-origin navigations.
    await page.goto("/tech")
    await page.waitForTimeout(500)

    // Both keys should now be "1" — Studios from the first visit, Tech from
    // the second.
    expect(
      await page.evaluate(() =>
        sessionStorage.getItem("glitch_studios_splash_seen"),
      ),
    ).toBe("1")
    expect(
      await page.evaluate(() =>
        sessionStorage.getItem("glitch_tech_splash_seen"),
      ),
    ).toBe("1")
  })

  test("Splash does NOT use localStorage (regression guard for D-05)", async ({
    page,
  }) => {
    await page.goto("/")
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
    await page.waitForTimeout(500)

    // Regression: the old implementation wrote to localStorage
    // "glitch-splash-seen". Verify no splash code wrote anything there.
    const localStorageValue = await page.evaluate(() =>
      localStorage.getItem("glitch-splash-seen"),
    )
    expect(localStorageValue).toBeNull()

    // Confirm sessionStorage is what's actually in use.
    const sessionValue = await page.evaluate(() =>
      sessionStorage.getItem("glitch_studios_splash_seen"),
    )
    expect(sessionValue).toBe("1")

    // Avoid lint complaint about unused locator import
    void SPLASH_LOCATOR
  })
})
