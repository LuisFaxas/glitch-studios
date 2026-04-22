import { test, expect, type Page } from "@playwright/test"
import path from "path"

/**
 * Phase 16 Plan 04 — JSONL Ingest Wizard E2E Tests (D-16)
 *
 * These tests exercise the full pipeline: edit page link → ingest wizard upload
 * → dry-run preview → commit (+ BPR recompute) → DB verification.
 *
 * REQUIREMENTS TO RUN:
 * 1. Dev server running at PLAYWRIGHT_BASE_URL (default http://localhost:3004).
 *    Start with: pnpm dev
 * 2. ADMIN_EMAIL + ADMIN_PASSWORD env vars for a user with `manage_content`.
 *    Tests skip when auth is unavailable (same pattern as tests/07.5-*.spec.ts).
 * 3. TEST_REVIEW_ID env var pointing at an existing review row (id column value).
 *    The review must have a productId set; any seeded Laptops review works.
 *    Get one: `psql $DATABASE_URL -c "select id from tech_reviews limit 1;"`
 *    Tests skip when TEST_REVIEW_ID is not provided.
 *
 * TEST ORDERING: fullyParallel=false + workers=1 in playwright.config.ts ensures
 * tests run sequentially in declaration order. Test 1 seeds the "matched" state,
 * Test 2 reuses it for the supersede flow, Test 3 tests ambient override with
 * whatever DB state exists at that point.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"
const TEST_REVIEW_ID = process.env.TEST_REVIEW_ID

const FIXTURES_DIR = path.join(__dirname, "fixtures/phase16-ingest")
const HAPPY_FIXTURE = path.join(FIXTURES_DIR, "cpu-31-happy.jsonl")
const DUPLICATE_FIXTURE = path.join(FIXTURES_DIR, "cpu-31-with-duplicate.jsonl")
const HOT_FIXTURE = path.join(FIXTURES_DIR, "cpu-31-hot.jsonl")
const MALFORMED_FIXTURE = path.join(FIXTURES_DIR, "cpu-31-malformed.jsonl")

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

async function setup(page: Page): Promise<boolean> {
  if (!TEST_REVIEW_ID) return false
  const authed = await loginAsAdmin(page)
  if (!authed) return false
  return true
}

test.describe("Phase 16: JSONL Ingest Wizard (D-16)", () => {
  test("Test 1 — Happy path: upload cpu-31-happy.jsonl, preview, commit, assert BPR update path", async ({
    page,
  }) => {
    const ok = await setup(page)
    test.skip(!ok, "ADMIN_EMAIL/ADMIN_PASSWORD and TEST_REVIEW_ID required")

    // Navigate to edit page and confirm Import Benchmark Data link is present
    await page.goto(`${BASE_URL}/admin/tech/reviews/${TEST_REVIEW_ID}/edit`, {
      waitUntil: "domcontentloaded",
    })
    const ingestLink = page.getByRole("link", { name: /Import Benchmark Data/i })
    await expect(ingestLink).toBeVisible()
    await expect(ingestLink).toHaveAttribute(
      "href",
      `/admin/tech/reviews/${TEST_REVIEW_ID}/ingest`,
    )

    // Go to ingest wizard
    await page.goto(`${BASE_URL}/admin/tech/reviews/${TEST_REVIEW_ID}/ingest`, {
      waitUntil: "domcontentloaded",
    })

    // Step 1: Upload happy fixture
    await page.setInputFiles('input[type="file"]#jsonl-file', HAPPY_FIXTURE)
    await page.getByRole("button", { name: /Preview Import/i }).click()

    // Step 2: Dry-run preview should render "Session Metadata" card
    await expect(page.getByText(/Session Metadata/i)).toBeVisible({
      timeout: 15000,
    })

    // No ambient block banner (ambient 22.4°C)
    await expect(
      page.getByText(/exceeds 26°C threshold/i),
    ).not.toBeVisible()

    // Commit button has "Commit N Runs" label when enabled
    const commitBtn = page.getByRole("button", { name: /Commit.*Run/i })
    await expect(commitBtn).toBeVisible()

    // If Test 1 runs first on a fresh DB, no supersede banner either
    const supersedeBanner = page.getByText(
      /will mark previous benchmarks as superseded/i,
    )
    const hasSupersede = await supersedeBanner.isVisible().catch(() => false)
    if (hasSupersede) {
      // Prior run exists — confirm supersede before committing
      await page
        .getByText(/I confirm superseding/i)
        .first()
        .click()
    }

    await expect(commitBtn).toBeEnabled()
    await commitBtn.click()

    // Step 3: Import Complete with counts and BPR status
    await expect(page.getByText(/Import Complete/i)).toBeVisible({
      timeout: 20000,
    })
    await expect(page.getByText(/inserted/i).first()).toBeVisible()

    // BPR may be null (only CPU + memory — memory is NOT BPR-eligible;
    // CPU alone = 1 BPR-eligible discipline, far below the 5-of-7 gate).
    // Either a tier badge or the "needs at least 5 eligible disciplines" copy is visible.
    const hasBpr = await page
      .getByText(/PLATINUM|GOLD|SILVER|BRONZE/i)
      .isVisible()
      .catch(() => false)
    const hasPendingBpr = await page
      .getByText(/needs at least 5 eligible disciplines|BPR not yet computed/i)
      .isVisible()
      .catch(() => false)
    expect(hasBpr || hasPendingBpr).toBe(true)
  })

  test("Test 2 — Duplicate fixture: supersede banner + checkbox flow", async ({
    page,
  }) => {
    const ok = await setup(page)
    test.skip(!ok, "ADMIN_EMAIL/ADMIN_PASSWORD and TEST_REVIEW_ID required")

    await page.goto(`${BASE_URL}/admin/tech/reviews/${TEST_REVIEW_ID}/ingest`, {
      waitUntil: "domcontentloaded",
    })

    await page.setInputFiles('input[type="file"]#jsonl-file', DUPLICATE_FIXTURE)
    await page.getByRole("button", { name: /Preview Import/i }).click()

    await expect(page.getByText(/Session Metadata/i)).toBeVisible({
      timeout: 15000,
    })

    const supersedeBanner = page.getByText(
      /will mark previous benchmarks as superseded/i,
    )
    const bannerVisible = await supersedeBanner
      .isVisible()
      .catch(() => false)

    if (bannerVisible) {
      const commitBtn = page.getByRole("button", { name: /Commit.*Run/i })
      // Button disabled until confirmation
      await expect(commitBtn).toBeDisabled()

      await page
        .getByText(/I confirm superseding/i)
        .first()
        .click()
      await expect(commitBtn).toBeEnabled()

      await commitBtn.click()
      await expect(page.getByText(/Import Complete/i)).toBeVisible({
        timeout: 20000,
      })
      // Step 3 copy: "✓ N runs inserted · M superseded."
      await expect(page.getByText(/superseded/i)).toBeVisible()
    } else {
      // No prior run in DB — log and still assert matched rows rendered
      // (Test 2 is order-dependent on Test 1 when run on a clean DB)
      console.log(
        "Test 2: no duplicates found — Test 1 must run first on a clean DB to exercise supersede flow.",
      )
      await expect(page.getByText(/Preview by Discipline/i)).toBeVisible()
    }
  })

  test("Test 3 — Hot fixture: ambient block banner + override flow", async ({
    page,
  }) => {
    const ok = await setup(page)
    test.skip(!ok, "ADMIN_EMAIL/ADMIN_PASSWORD and TEST_REVIEW_ID required")

    await page.goto(`${BASE_URL}/admin/tech/reviews/${TEST_REVIEW_ID}/ingest`, {
      waitUntil: "domcontentloaded",
    })

    await page.setInputFiles('input[type="file"]#jsonl-file', HOT_FIXTURE)
    await page.getByRole("button", { name: /Preview Import/i }).click()

    await expect(page.getByText(/Session Metadata/i)).toBeVisible({
      timeout: 15000,
    })

    // D-09: amber ambient block banner visible
    await expect(
      page.getByText(/exceeds 26°C threshold/i),
    ).toBeVisible()
    await expect(
      page.getByText(/results may be thermally throttled/i),
    ).toBeVisible()

    // Commit button disabled without override
    const commitBtn = page.getByRole("button", { name: /Commit.*Run/i })
    await expect(commitBtn).toBeDisabled()

    // Check "Override and ingest anyway"
    await page
      .getByText(/Override and ingest anyway/i)
      .first()
      .click()

    // Still disabled — reason must be ≥10 chars
    await expect(commitBtn).toBeDisabled()

    // Fill override reason
    const reason = page.getByPlaceholder(/Override reason/i)
    await reason.fill(
      "AC unit failed mid-session, rerun impractical before deadline",
    )

    // If prior runs exist from Test 1/2, supersede confirmation also required
    const supersedeBanner = page.getByText(
      /will mark previous benchmarks as superseded/i,
    )
    if (await supersedeBanner.isVisible().catch(() => false)) {
      await page
        .getByText(/I confirm superseding/i)
        .first()
        .click()
    }

    await expect(commitBtn).toBeEnabled()

    await commitBtn.click()
    await expect(page.getByText(/Import Complete/i)).toBeVisible({
      timeout: 20000,
    })
    await expect(page.getByText(/inserted/i).first()).toBeVisible()
  })

  test("Test 4 — Malformed fixture: red rows with inline errors", async ({
    page,
  }) => {
    const ok = await setup(page)
    test.skip(!ok, "ADMIN_EMAIL/ADMIN_PASSWORD and TEST_REVIEW_ID required")

    await page.goto(`${BASE_URL}/admin/tech/reviews/${TEST_REVIEW_ID}/ingest`, {
      waitUntil: "domcontentloaded",
    })

    await page.setInputFiles('input[type="file"]#jsonl-file', MALFORMED_FIXTURE)
    await page.getByRole("button", { name: /Preview Import/i }).click()

    await expect(page.getByText(/Session Metadata/i)).toBeVisible({
      timeout: 15000,
    })

    // Session Metadata card reports "N unknown" in the totals line.
    // Malformed fixture has 2 unknown rows (neuralengine + Infinity).
    await expect(page.getByText(/\d+ unknown/i).first()).toBeVisible()

    // Expand CPU accordion to reveal inline error messages (D-06)
    const cpuTrigger = page
      .getByRole("button")
      .filter({ hasText: /^CPU/i })
      .first()
    await cpuTrigger.click().catch(() => {})

    // D-06 inline error formats:
    // "discipline \"neuralengine\" not a valid enum value" — surfaces via Zod
    //   .issues() — text is "Invalid enum value" or similar per zod v4
    // "Score must be finite, got \"Infinity\"" — zod .number().finite()
    // "Unknown rubric key: \"cpu:..\" — not in RUBRIC_V1_1" — unknown rubric
    // At least one form of error should be visible in the preview.
    const hasNeuralError = await page
      .getByText(/neuralengine/i)
      .first()
      .isVisible()
      .catch(() => false)
    const hasZodInvalid = await page
      .getByText(/Invalid option|invalid enum|finite|Infinity/i)
      .first()
      .isVisible()
      .catch(() => false)
    const hasUnknownKey = await page
      .getByText(/Unknown rubric key/i)
      .first()
      .isVisible()
      .catch(() => false)
    expect(hasNeuralError || hasZodInvalid || hasUnknownKey).toBe(true)
  })
})
