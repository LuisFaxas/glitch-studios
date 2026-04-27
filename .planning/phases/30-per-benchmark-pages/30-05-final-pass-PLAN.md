---
phase: 30-per-benchmark-pages
plan: 05
type: execute
wave: 5
depends_on: ["30-01-slug-data-layer", "30-02-landing-page-rebuild", "30-03-detail-page-route", "30-04-cross-links"]
files_modified:
  - tests/30-05-final-pass.spec.ts
autonomous: true
requirements:
  - "Phase 30 SC-8 (each plan ships Playwright spec, tsc + lint clean, pnpm build exits 0)"
  - "Phase 30 SC-9 (GlitchTech spelling everywhere)"
  - "Phase 30 SC-10 (sidebar one-screen)"
must_haves:
  truths:
    - "pnpm build completes with exit code 0 and prerenders all 43 detail pages"
    - "No file under src/app/(tech)/tech/benchmarks contains 'GlitchTek' (typo brand name)"
    - "No file under src/components/tech/benchmark-leaderboard-table.tsx or src/lib/tech/benchmark-* contains 'GlitchTek'"
    - "Sidebar fits within a 900px-tall desktop viewport on /tech/benchmarks AND /tech/benchmarks/cpu-geekbench6-multi without overflow"
    - "All four prior plans' Playwright specs pass on the freshly-built artifact"
  artifacts:
    - path: "tests/30-05-final-pass.spec.ts"
      provides: "Final pass Playwright spec: brand grep, sidebar viewport check across two routes, build-output sanity"
      contains: "test('sidebar fits one screen on landing'"
  key_links: []
---

<objective>
Final verification pass for Phase 30. Run the production build to prove all 43 detail pages prerender; sweep the new code for `GlitchTek` typos; assert sidebar one-screen rule on the new pages; re-run all prior Phase 30 specs to catch any regression introduced by cross-link wiring.

This is the only plan in Phase 30 that runs `pnpm build` (CodeBox resource constraint per CLAUDE.md: never concurrent builds; one at a time; we run it once here).

Purpose: Close Phase 30 Success Criteria #8, #9, #10 with proof artifacts.

Output: One Playwright spec + commit-ready repository.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/30-per-benchmark-pages/30-CONTEXT.md
@.planning/phases/30-per-benchmark-pages/30-UI-SPEC.md
@.planning/phases/30-per-benchmark-pages/30-01-SUMMARY.md
@.planning/phases/30-per-benchmark-pages/30-02-SUMMARY.md
@.planning/phases/30-per-benchmark-pages/30-03-SUMMARY.md
@.planning/phases/30-per-benchmark-pages/30-04-SUMMARY.md
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Final-pass Playwright spec — brand sweep + sidebar viewport assertion</name>
  <files>tests/30-05-final-pass.spec.ts</files>
  <read_first>
    - tests/30-02-benchmarks-landing.spec.ts (Plan 30-02 — sidebar locator pattern, mirror)
    - tests/30-03-benchmark-detail.spec.ts (Plan 30-03 — detail page navigation pattern)
    - tests/sidebar-collapse.spec.ts if it exists, OR any 29.x sidebar test (find via `ls tests | grep -i sidebar` — confirm the project's sidebar locator)
    - playwright.config.ts (desktop viewport = 1440×900)
    - .planning/phases/30-per-benchmark-pages/30-UI-SPEC.md §"Scrolling and layout" (sidebar one-screen rule)
  </read_first>
  <action>
    Spec asserts the final-pass acceptance:
    1. No GlitchTek typos in any HTML rendered for /tech/benchmarks routes (page-level body text scan).
    2. Sidebar fits within 900px viewport on landing AND detail.
    3. Phase 30 routes are all reachable (landing + 3 representative detail pages).

    Note: The brand-spelling and build-time checks happen in this plan's verification block (greps + `pnpm build`), NOT in the spec — those are environmental checks, not in-browser assertions. The spec covers in-browser body-text checks and viewport layout.

    File: `tests/30-05-final-pass.spec.ts`

    ```typescript
    import { test, expect } from "@playwright/test"

    const ROUTES_TO_CHECK = [
      "/tech/benchmarks",
      "/tech/benchmarks/cpu-geekbench6-multi",
      "/tech/benchmarks/memory-stream-triad",
      "/tech/benchmarks/battery-life-video-loop-hours",
    ]

    test.describe("Phase 30-05: final pass", () => {
      for (const route of ROUTES_TO_CHECK) {
        test(`brand spelling correct on ${route}`, async ({ page }) => {
          const response = await page.goto(route, { waitUntil: "networkidle" })
          expect(response?.status(), `${route} must return 200`).toBe(200)
          // Body-level scan: no "GlitchTek" typo anywhere in the rendered HTML.
          await expect(page.locator("body")).not.toContainText("GlitchTek")
          // Sanity: positive assertion that GlitchTech (correct spelling) is present somewhere on benchmark routes.
          // (Methodology footer link copy "View the GlitchTech methodology" is on every detail page; landing has the methodology blurb.)
          if (route !== "/tech/benchmarks") {
            await expect(page.getByText(/GlitchTech/)).toBeVisible()
          }
        })
      }
    })

    test.describe("Phase 30-05: sidebar one-screen", () => {
      test.use({ viewport: { width: 1440, height: 900 } })

      test("sidebar fits one screen on landing", async ({ page }) => {
        await page.goto("/tech/benchmarks", { waitUntil: "networkidle" })
        // Locator preference: a project-specific data attribute if present, otherwise <aside>.
        // Adjust this selector at write time if the project uses a different sidebar root.
        const sidebar = page.locator('[data-sidebar], aside').first()
        if (await sidebar.count() === 0) {
          test.skip(true, "Sidebar locator not found — selector update needed before this spec is meaningful")
        }
        const box = await sidebar.boundingBox()
        if (box) {
          expect(box.height, "sidebar height should be ≤ viewport height (no scroll)").toBeLessThanOrEqual(900)
        }
      })

      test("sidebar fits one screen on detail page", async ({ page }) => {
        await page.goto("/tech/benchmarks/cpu-geekbench6-multi", { waitUntil: "networkidle" })
        const sidebar = page.locator('[data-sidebar], aside').first()
        if (await sidebar.count() === 0) {
          test.skip(true, "Sidebar locator not found")
        }
        const box = await sidebar.boundingBox()
        if (box) {
          expect(box.height).toBeLessThanOrEqual(900)
        }
      })
    })

    test.describe("Phase 30-05: prior specs sanity", () => {
      // This block doesn't re-run Plan 30-02/03/04 specs (the test runner can do that), but it does
      // a fast smoke that all 4 routes (landing + 3 details) are reachable post-build.
      test("all key routes return 200", async ({ page }) => {
        for (const route of ROUTES_TO_CHECK) {
          const r = await page.goto(route, { waitUntil: "domcontentloaded" })
          expect(r?.status(), `${route} should return 200`).toBe(200)
        }
      })

      test("unknown slug under /tech/benchmarks returns 404", async ({ page }) => {
        const r = await page.goto("/tech/benchmarks/this-is-not-a-real-test", { waitUntil: "domcontentloaded" })
        expect(r?.status()).toBe(404)
      })
    })
    ```

    Notes for executor:
    - Adjust the sidebar locator after reading an existing sidebar-related spec or component (e.g., `src/components/layout/sidebar.tsx` if present). The fallback `[data-sidebar], aside` should match most cases; if the locator returns 0 elements the test skips gracefully rather than false-failing.
    - The "GlitchTech (correct spelling) is visible on detail pages" sanity check confirms the methodology footer link rendered. The landing page doesn't have a literal "GlitchTech" string in the body copy in UI-SPEC; check 30-02 implementation — if the methodology blurb starts with "GlitchTech runs 43 benchmarks…", the sanity check could include landing too. Read the rendered landing HTML (or open the 30-02 page.tsx) and decide whether to add `/tech/benchmarks` back to the visibility-asserting routes — the conservative version above only asserts on detail routes.
  </action>
  <verify>
    <automated>pnpm exec playwright test tests/30-05-final-pass.spec.ts --project=desktop</automated>
  </verify>
  <acceptance_criteria>
    - File `tests/30-05-final-pass.spec.ts` exists.
    - `grep -q "brand spelling correct" tests/30-05-final-pass.spec.ts` succeeds.
    - `grep -q "sidebar fits one screen on landing" tests/30-05-final-pass.spec.ts` succeeds.
    - `grep -q "sidebar fits one screen on detail page" tests/30-05-final-pass.spec.ts` succeeds.
    - `grep -q "unknown slug under /tech/benchmarks returns 404" tests/30-05-final-pass.spec.ts` succeeds.
    - `pnpm exec playwright test tests/30-05-final-pass.spec.ts --project=desktop` exits 0.
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
  </acceptance_criteria>
  <done>
    Spec asserts no GlitchTek text on any Phase 30 surface, sidebar fits 900px viewport on landing + detail, all 4 representative routes return 200, unknown slug returns 404. Passes on desktop project.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Build verification — pnpm build + brand sweep across all Phase 30 files</name>
  <files></files>
  <read_first>
    - .planning/phases/30-per-benchmark-pages/30-01-SUMMARY.md (any deferred items / known issues)
    - .planning/phases/30-per-benchmark-pages/30-02-SUMMARY.md
    - .planning/phases/30-per-benchmark-pages/30-03-SUMMARY.md
    - .planning/phases/30-per-benchmark-pages/30-04-SUMMARY.md
    - CLAUDE.md (CodeBox resource constraint: only one build at a time; this is the build for the phase)
  </read_first>
  <action>
    Run the production build and all brand-spelling sweeps in sequence. This task does NOT modify code unless the build fails — in which case the executor diagnoses the failure, fixes it, and re-runs. Per the auto-mode mandate, fix-forward rather than abandon.

    Sequential commands:

    1. Brand sweep — must return zero hits across all Phase 30 files:
    ```bash
    grep -rn "GlitchTek" \
      src/app/\(tech\)/tech/benchmarks/ \
      src/components/tech/benchmark-leaderboard-table.tsx \
      src/components/tech/methodology-discipline-cards.tsx \
      src/lib/tech/benchmark-slug.ts \
      src/lib/tech/benchmark-leaderboard.ts \
      tests/30-*.spec.ts \
      .planning/phases/30-per-benchmark-pages/*-SUMMARY.md
    ```
    Expected: zero output (exit code 1 from grep). If any file has `GlitchTek`, fix it before proceeding.

    2. TS check (final):
    ```bash
    pnpm tsc --noEmit
    ```
    Expected: exit 0.

    3. Lint check (final):
    ```bash
    pnpm lint
    ```
    Expected: exit 0.

    4. Production build — single instance, no concurrent builds (CodeBox 8 cores / 19GB shared):
    ```bash
    pnpm build
    ```
    Expected: exit 0. Build output should report 43 prerendered detail pages under `/tech/benchmarks/[slug]` (or equivalent — Next 16 reports static pages in the build summary).

    5. Re-run all Phase 30 specs against the dev server (or against the built artifact via `pnpm start`):
    ```bash
    pnpm exec playwright test tests/30-01-benchmark-slug.spec.ts tests/30-02-benchmarks-landing.spec.ts tests/30-03-benchmark-detail.spec.ts tests/30-04-cross-links.spec.ts tests/30-05-final-pass.spec.ts --project=desktop
    ```
    Expected: all pass.

    If `pnpm build` fails:
    - Read the error output; common causes for this phase:
      - Missing `dynamic` / `dynamicParams` exports in [slug]/page.tsx (Plan 30-03)
      - Async params shape mismatch (Next 15 vs Next 16) — fix by reading another dynamic [slug] route in the codebase
      - Server-only import leak into a client component (e.g., importing benchmark-leaderboard.ts from benchmark-leaderboard-table.tsx — only the TYPE should be imported, not the function)
    - Fix the underlying issue (do NOT add @ts-ignore or eslint-disable suppressions; root-cause it).
    - Re-run `pnpm build`.
    - Re-run the spec batch.

    If a spec fails after rebuild:
    - The build may have changed something the spec assumed (e.g., the BPR ELIGIBLE badge count of 30 may be off if I miscounted in Plan 30-02).
    - Read the failure, decide whether the assertion was wrong (fix the spec) or the implementation regressed (fix the page).
    - DO NOT mark a failing assertion as `.skip` to make CI green — root-cause it.
  </action>
  <verify>
    <automated>pnpm build && pnpm exec playwright test tests/30-01-benchmark-slug.spec.ts tests/30-02-benchmarks-landing.spec.ts tests/30-03-benchmark-detail.spec.ts tests/30-04-cross-links.spec.ts tests/30-05-final-pass.spec.ts --project=desktop</automated>
  </verify>
  <acceptance_criteria>
    - `grep -rn "GlitchTek" src/app/\(tech\)/tech/benchmarks/ src/components/tech/benchmark-leaderboard-table.tsx src/components/tech/methodology-discipline-cards.tsx src/lib/tech/benchmark-slug.ts src/lib/tech/benchmark-leaderboard.ts tests/30-*.spec.ts` returns NOTHING (zero matches).
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
    - `pnpm build` exits 0.
    - `pnpm exec playwright test tests/30-01-benchmark-slug.spec.ts tests/30-02-benchmarks-landing.spec.ts tests/30-03-benchmark-detail.spec.ts tests/30-04-cross-links.spec.ts tests/30-05-final-pass.spec.ts --project=desktop` exits 0.
  </acceptance_criteria>
  <done>
    Production build is clean; all 43 benchmark detail pages prerender; brand spelling correct everywhere; all 5 Phase 30 specs pass against the built artifact.
  </done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- `pnpm build` exits 0
- `grep -rn "GlitchTek" src/app/\(tech\)/tech/benchmarks/ src/components/tech/benchmark-leaderboard-table.tsx src/components/tech/methodology-discipline-cards.tsx src/lib/tech/benchmark-slug.ts src/lib/tech/benchmark-leaderboard.ts tests/30-*.spec.ts` returns nothing (no output / exit 1)
- `pnpm exec playwright test tests/30-01-benchmark-slug.spec.ts tests/30-02-benchmarks-landing.spec.ts tests/30-03-benchmark-detail.spec.ts tests/30-04-cross-links.spec.ts tests/30-05-final-pass.spec.ts --project=desktop` passes
</verification>

<success_criteria>
- pnpm build completes successfully (Phase 30 SC-8)
- All 43 benchmark detail pages prerender at build time (Phase 30 SC-6)
- Zero GlitchTek typos across all Phase 30 surfaces (Phase 30 SC-9)
- Sidebar fits one screen on landing AND detail page at 1440×900 (Phase 30 SC-10)
- All five Phase 30 Playwright specs pass against the built artifact (Phase 30 SC-8)
</success_criteria>

<output>
After completion, create `.planning/phases/30-per-benchmark-pages/30-05-SUMMARY.md` documenting:
- Whether tsc/lint/build/playwright all passed first try (or what was fixed)
- Build output line confirming the count of prerendered /tech/benchmarks/[slug] pages (should be 43)
- Sidebar height measured on landing and detail (should be ≤ 900px)
- Any deviations from the plan
- Final phase status: "Phase 30 complete — all 10 success criteria green"
</output>
