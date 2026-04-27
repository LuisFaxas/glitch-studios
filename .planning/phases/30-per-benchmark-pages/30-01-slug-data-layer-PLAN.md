---
phase: 30-per-benchmark-pages
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/tech/benchmark-slug.ts
  - src/lib/tech/benchmark-leaderboard.ts
  - src/lib/tech/benchmark-slug.spec.ts
  - tests/30-01-benchmark-slug.spec.ts
autonomous: true
requirements:
  - "Phase 30 SC-2 (slug derivation)"
  - "Phase 30 SC-3 (cross-category leaderboard data)"
  - "Phase 30 SC-4 (baseline-relative score)"
  - "Phase 30 SC-5 (honest empty-state for unknown rubric keys)"
  - "Phase 30 SC-6 (SSG via RUBRIC_V1_1 keys)"
must_haves:
  truths:
    - "Every key in RUBRIC_V1_1 maps to a unique kebab-case slug and reverse-maps back to that exact key"
    - "Unknown slugs (not derivable from any RUBRIC_V1_1 key) reverse-map to null"
    - "getLeaderboardForBenchmark returns one row per product+review with at least one canonical run for the requested rubric key"
    - "AC and Battery scores are returned distinctly for mode='both' tests; missing modes are null (not omitted from row)"
    - "BPR ratio (battery / ac) is returned per row, null when either side is missing"
    - "Baseline-relative percent is returned per row when reference_score is present, null otherwise; sign honors direction"
  artifacts:
    - path: "src/lib/tech/benchmark-slug.ts"
      provides: "slugFromRubricKey + rubricKeyFromSlug pure functions, getAllBenchmarkSlugs helper"
      exports: ["slugFromRubricKey", "rubricKeyFromSlug", "getAllBenchmarkSlugs"]
    - path: "src/lib/tech/benchmark-leaderboard.ts"
      provides: "getLeaderboardForBenchmark server query + BenchmarkLeaderboardRow type"
      exports: ["getLeaderboardForBenchmark", "BenchmarkLeaderboardRow"]
    - path: "src/lib/tech/benchmark-slug.spec.ts"
      provides: "Unit tests via vitest for slug round-trip + edge cases"
      contains: "describe('slugFromRubricKey'"
    - path: "tests/30-01-benchmark-slug.spec.ts"
      provides: "Playwright spec asserting build-time slug enumeration is correct (uses page route reachability for one known slug + one unknown 404 placeholder until 30-03 ships — assertion only verifies slug helper output via test fixture import)"
      contains: "test('all 43 RUBRIC_V1_1 keys produce reversible slugs'"
  key_links:
    - from: "src/lib/tech/benchmark-slug.ts"
      to: "src/lib/tech/rubric-map.ts"
      via: "imports RUBRIC_V1_1 to enumerate keys"
      pattern: "from \"./rubric-map\""
    - from: "src/lib/tech/benchmark-leaderboard.ts"
      to: "src/lib/tech/queries.ts"
      via: "reuses getBenchmarkRunsForProducts shape (DISTINCT ON pattern)"
      pattern: "techBenchmarkRuns|techBenchmarkTests"
---

<objective>
Build the pure slug utility module + the server-side leaderboard query for a single rubric key. No UI changes in this plan. This is the data foundation that plans 30-02 and 30-03 consume.

Purpose: Lock D-01 (slug = kebab-cased rubric key, reversible) and D-03/D-04 (mode-aware AC/Battery + BPR ratio + baseline-delta) into testable code BEFORE any page renders this data, per the phase's interface-first ordering.

Output: One slug module, one query module, one vitest spec, one Playwright spec.
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

@src/lib/tech/rubric-map.ts
@src/lib/tech/leaderboard.ts
@src/lib/tech/queries.ts

<interfaces>
<!-- Key types and constants the executor MUST use directly. Do NOT explore the codebase for these. -->

From src/lib/tech/rubric-map.ts (READ-ONLY in this phase):
```typescript
export type BenchmarkDiscipline =
  | "cpu" | "gpu" | "llm" | "video" | "dev" | "python" | "games"
  | "memory" | "storage" | "thermal" | "wireless" | "display" | "battery_life"
export type BenchmarkMode = "ac" | "battery" | "both"
export type BenchmarkDirection = "higher_is_better" | "lower_is_better"
export interface RubricTestSpec {
  discipline: BenchmarkDiscipline
  tool: string
  field: string
  name: string
  unit: string
  direction: BenchmarkDirection
  mode: BenchmarkMode
  bprEligible: boolean
  sortOrder: number
}
export const RUBRIC_V1_1: Record<string, RubricTestSpec> = { /* 43 entries, keys like "cpu:geekbench6:multi" */ }
export const BPR_ELIGIBLE_DISCIPLINES: ReadonlyArray<BenchmarkDiscipline> = ["cpu","gpu","llm","video","dev","python","games"]
```

Sample RUBRIC keys (to anchor tests):
- `"cpu:geekbench6:multi"` (mode="both", direction="higher_is_better", bprEligible=true)
- `"memory:stream:triad"` (mode="ac", direction="higher_is_better", bprEligible=false)
- `"battery_life:video_loop:hours"` (mode="battery", direction="higher_is_better", bprEligible=false)
- `"dev:cargo:build_release"` (mode="both", direction="lower_is_better", bprEligible=true)
- `"cpu:hyperfine:ripgrep_cargo"` (mode="both", direction="lower_is_better", bprEligible=true)

From src/lib/tech/queries.ts (PATTERN to mirror):
```typescript
// DISTINCT ON (productId, testId, mode) with ORDER BY recordedAt DESC; superseded=false filter.
// 3-column DISTINCT ON means a (product, test) pair MAY appear twice (once ac, once battery).
```

From src/db/schema (the only columns this plan reads):
- techBenchmarkTests: id, name, unit, direction, referenceScore (numeric, nullable)
- techBenchmarkRuns: productId, testId, mode ('ac'|'battery'|'both'), score, superseded, recordedAt
- techReviews: id, slug, productId, status ('published'|'placeholder'|'draft'), publishedAt
- techProducts: id, name, slug, manufacturer, categoryId
- techCategories: id, slug, name
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Slug utility module + vitest spec</name>
  <files>src/lib/tech/benchmark-slug.ts, src/lib/tech/benchmark-slug.spec.ts</files>
  <read_first>
    - src/lib/tech/rubric-map.ts (the full file — confirm 43 keys exist; test cases use real keys)
    - src/lib/tech/bpr.spec.ts (existing vitest spec convention — same matchers, same import paths, same describe/it style)
    - src/lib/tech/glitchmark.spec.ts (existing vitest spec convention — confirm vitest is the runner, not playwright)
    - .planning/phases/30-per-benchmark-pages/30-CONTEXT.md (D-01 slug formula; D-06 generateStaticParams enumeration)
  </read_first>
  <behavior>
    - slugFromRubricKey("cpu:geekbench6:multi") returns "cpu-geekbench6-multi"
    - slugFromRubricKey("battery_life:video_loop:hours") returns "battery-life-video-loop-hours" (underscore in discipline becomes hyphen)
    - slugFromRubricKey("cpu:hyperfine:ripgrep_cargo") returns "cpu-hyperfine-ripgrep-cargo" (underscore in field becomes hyphen)
    - rubricKeyFromSlug("cpu-geekbench6-multi") returns "cpu:geekbench6:multi"
    - rubricKeyFromSlug("battery-life-video-loop-hours") returns "battery_life:video_loop:hours"
    - rubricKeyFromSlug("cpu-hyperfine-ripgrep-cargo") returns "cpu:hyperfine:ripgrep_cargo"
    - rubricKeyFromSlug("not-a-real-test") returns null
    - rubricKeyFromSlug("") returns null
    - rubricKeyFromSlug("CPU-GEEKBENCH6-MULTI") returns null (case-sensitive: kebab is lowercase contract)
    - getAllBenchmarkSlugs() returns array of 43 slugs, all unique, all reverse-mapping to a RUBRIC_V1_1 key
    - Round-trip property: for every key in Object.keys(RUBRIC_V1_1), rubricKeyFromSlug(slugFromRubricKey(key)) === key (43/43)
  </behavior>
  <action>
    Per CONTEXT D-01: "Slug = full rubric key kebab-cased. `cpu:geekbench6:multi` → `/tech/benchmarks/cpu-geekbench6-multi`. 1:1 reversible mapping with RUBRIC_V1_1. No schema column needed; both directions derive in code."

    Implementation strategy (forward-direction is simple replace; reverse-direction needs a lookup table because `_` in discipline/field collapses ambiguity if you try to reverse a hyphen back to colon vs underscore):

    1. Create `src/lib/tech/benchmark-slug.ts`:

    ```typescript
    import { RUBRIC_V1_1 } from "./rubric-map"

    /**
     * Forward: rubric key → URL slug.
     * "cpu:geekbench6:multi" → "cpu-geekbench6-multi"
     * "battery_life:video_loop:hours" → "battery-life-video-loop-hours"
     *
     * All colons and underscores collapse to hyphens. The reverse lookup uses
     * a precomputed map (because hyphen → colon-or-underscore is ambiguous).
     */
    export function slugFromRubricKey(key: string): string {
      return key.replace(/[:_]/g, "-")
    }

    // Precomputed reverse lookup — built once at module load.
    // 43 entries; the only legal slugs are the ones derivable from RUBRIC_V1_1 keys.
    const SLUG_TO_KEY: Record<string, string> = (() => {
      const m: Record<string, string> = {}
      for (const key of Object.keys(RUBRIC_V1_1)) {
        m[slugFromRubricKey(key)] = key
      }
      return m
    })()

    /**
     * Reverse: URL slug → rubric key, or null if the slug doesn't map to a known key.
     * Case-sensitive (slugs are always lowercase per kebab convention).
     */
    export function rubricKeyFromSlug(slug: string): string | null {
      return SLUG_TO_KEY[slug] ?? null
    }

    /**
     * Enumerate every slug for generateStaticParams (43 known slugs in v1.1).
     */
    export function getAllBenchmarkSlugs(): string[] {
      return Object.keys(SLUG_TO_KEY)
    }
    ```

    2. Create `src/lib/tech/benchmark-slug.spec.ts` (vitest, mirroring bpr.spec.ts conventions):

    ```typescript
    import { describe, it, expect } from "vitest"
    import { RUBRIC_V1_1 } from "./rubric-map"
    import { slugFromRubricKey, rubricKeyFromSlug, getAllBenchmarkSlugs } from "./benchmark-slug"

    describe("slugFromRubricKey", () => {
      it("converts colons to hyphens", () => {
        expect(slugFromRubricKey("cpu:geekbench6:multi")).toBe("cpu-geekbench6-multi")
      })
      it("converts underscores to hyphens (battery_life discipline)", () => {
        expect(slugFromRubricKey("battery_life:video_loop:hours")).toBe("battery-life-video-loop-hours")
      })
      it("converts underscores in field segment (ripgrep_cargo)", () => {
        expect(slugFromRubricKey("cpu:hyperfine:ripgrep_cargo")).toBe("cpu-hyperfine-ripgrep-cargo")
      })
    })

    describe("rubricKeyFromSlug", () => {
      it("reverses a known slug to its rubric key", () => {
        expect(rubricKeyFromSlug("cpu-geekbench6-multi")).toBe("cpu:geekbench6:multi")
      })
      it("reverses battery_life slug correctly", () => {
        expect(rubricKeyFromSlug("battery-life-video-loop-hours")).toBe("battery_life:video_loop:hours")
      })
      it("reverses ripgrep_cargo slug correctly", () => {
        expect(rubricKeyFromSlug("cpu-hyperfine-ripgrep-cargo")).toBe("cpu:hyperfine:ripgrep_cargo")
      })
      it("returns null for unknown slug", () => {
        expect(rubricKeyFromSlug("not-a-real-test")).toBeNull()
      })
      it("returns null for empty string", () => {
        expect(rubricKeyFromSlug("")).toBeNull()
      })
      it("is case-sensitive (uppercase rejected)", () => {
        expect(rubricKeyFromSlug("CPU-GEEKBENCH6-MULTI")).toBeNull()
      })
    })

    describe("getAllBenchmarkSlugs", () => {
      it("returns 43 slugs", () => {
        expect(getAllBenchmarkSlugs()).toHaveLength(43)
      })
      it("every slug is unique", () => {
        const slugs = getAllBenchmarkSlugs()
        expect(new Set(slugs).size).toBe(slugs.length)
      })
      it("round-trips: every RUBRIC_V1_1 key → slug → key matches original", () => {
        for (const key of Object.keys(RUBRIC_V1_1)) {
          expect(rubricKeyFromSlug(slugFromRubricKey(key))).toBe(key)
        }
      })
    })
    ```

    3. Run `pnpm vitest run src/lib/tech/benchmark-slug.spec.ts` — all tests pass.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/tech/benchmark-slug.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/tech/benchmark-slug.ts` exists.
    - `grep -q "export function slugFromRubricKey" src/lib/tech/benchmark-slug.ts` succeeds.
    - `grep -q "export function rubricKeyFromSlug" src/lib/tech/benchmark-slug.ts` succeeds.
    - `grep -q "export function getAllBenchmarkSlugs" src/lib/tech/benchmark-slug.ts` succeeds.
    - File `src/lib/tech/benchmark-slug.spec.ts` exists.
    - `pnpm vitest run src/lib/tech/benchmark-slug.spec.ts` exits 0.
    - The spec file contains at least these literal test names: `'converts colons to hyphens'`, `'reverses a known slug to its rubric key'`, `'returns null for unknown slug'`, `'returns 43 slugs'`, `'round-trips: every RUBRIC_V1_1 key → slug → key matches original'`.
  </acceptance_criteria>
  <done>
    Slug utility ships with full vitest coverage; round-trip property proven for all 43 RUBRIC_V1_1 keys; unknown slugs return null.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Per-benchmark cross-product leaderboard query</name>
  <files>src/lib/tech/benchmark-leaderboard.ts</files>
  <read_first>
    - src/lib/tech/benchmark-slug.ts (just created — confirm exports)
    - src/lib/tech/leaderboard.ts (full file — pattern for unstable_cache + DISTINCT ON + assemble helper)
    - src/lib/tech/queries.ts (full file — getBenchmarkRunsForProducts shape, line 706 onwards)
    - src/lib/tech/rubric-map.ts (RUBRIC_V1_1 metadata + RubricTestSpec type)
    - src/db/schema.ts only the techBenchmarkRuns / techBenchmarkTests / techReviews / techProducts / techCategories table definitions (search: "techBenchmarkRuns", "techBenchmarkTests", "referenceScore")
    - .planning/phases/30-per-benchmark-pages/30-CONTEXT.md (D-03 AC+Battery side-by-side; D-04 default sort = AC; D-05 honest-omit-row policy)
    - .planning/phases/30-per-benchmark-pages/30-UI-SPEC.md sections "Honest-omit-row policy" and "Baseline-relative pill"
  </read_first>
  <action>
    Build a server-only query module that returns the leaderboard rows for ONE rubric key. The detail page (Plan 30-03) will consume this. Returns a flat array of rows, sorting is delegated to the client component.

    Implementation:

    Create `src/lib/tech/benchmark-leaderboard.ts`:

    ```typescript
    import "server-only"
    import { db } from "@/lib/db"
    import { unstable_cache } from "next/cache"
    import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm"
    import {
      techReviews,
      techProducts,
      techCategories,
      techBenchmarkRuns,
      techBenchmarkTests,
    } from "@/db/schema"
    import { RUBRIC_V1_1, type RubricTestSpec } from "./rubric-map"

    export interface BenchmarkLeaderboardRow {
      reviewId: string
      reviewSlug: string
      productId: string
      productName: string
      productSlug: string
      categoryName: string | null
      categorySlug: string | null
      acScore: number | null
      batteryScore: number | null
      bprRatio: number | null               // battery / ac, only when both present
      baselinePercent: number | null         // signed % vs reference; null if reference is null OR no score
      // Direction-aware: for higher_is_better, baselinePercent = (score/reference - 1) * 100;
      // for lower_is_better, faster (lower) is better, so baselinePercent = (reference/score - 1) * 100
      // (so a positive sign always means "better than baseline").
    }

    export interface BenchmarkLeaderboardResult {
      rubricKey: string
      spec: RubricTestSpec
      referenceScore: number | null   // from tech_benchmark_tests.reference_score (nullable)
      rows: BenchmarkLeaderboardRow[]
    }

    /**
     * Get the cross-product leaderboard for a single benchmark, by rubric key.
     *
     * Returns null when the rubric key is not in RUBRIC_V1_1 (caller should 404).
     * Returns { spec, rows: [] } when the rubric key is valid but no
     * tech_benchmark_tests row exists or no published/placeholder reviews have
     * any canonical run for it (caller renders empty-state panel per UI-SPEC).
     *
     * Honest-omit-row policy (UI-SPEC "Honest-omit-row policy"):
     *   A product is included ONLY if it has at least one canonical (superseded=false)
     *   run for this test. mode='both' tests with both AC and Battery missing → omitted.
     *   mode='both' with one mode present → included with the other side as null.
     *
     * Default sort delegated to client (Plan 30-03 sorts by AC desc / asc per direction).
     * This function returns rows in a stable but non-leaderboard order — actual SQL ORDER BY
     * is (productId asc, mode asc, recordedAt desc) per the DISTINCT ON pattern below — so the
     * client owns sort semantics.
     */
    export const getLeaderboardForBenchmark = unstable_cache(
      async (rubricKey: string): Promise<BenchmarkLeaderboardResult | null> => {
        const spec = RUBRIC_V1_1[rubricKey]
        if (!spec) return null

        // 1. Find the tech_benchmark_tests row for this rubric (matched by name+discipline+mode,
        //    same convention as getBenchmarkSpotlight in queries.ts line 832).
        const [testRow] = await db
          .select({
            id: techBenchmarkTests.id,
            referenceScore: techBenchmarkTests.referenceScore,
          })
          .from(techBenchmarkTests)
          .where(
            and(
              eq(techBenchmarkTests.discipline, spec.discipline),
              eq(techBenchmarkTests.mode, spec.mode),
              eq(techBenchmarkTests.name, spec.name),
            ),
          )
          .limit(1)

        if (!testRow) {
          // Rubric ahead of seeded tests — caller renders empty-state per UI-SPEC §404 handling.
          return { rubricKey, spec, referenceScore: null, rows: [] }
        }

        const referenceScore =
          testRow.referenceScore !== null && testRow.referenceScore !== undefined
            ? Number(testRow.referenceScore)
            : null

        // 2. All canonical runs for this test, joined to published or placeholder reviews + product + category.
        //    Mirror leaderboard.ts review status filter (published OR placeholder).
        const runRows = await db
          .selectDistinctOn(
            [
              techBenchmarkRuns.productId,
              techBenchmarkRuns.mode,
            ],
            {
              productId: techBenchmarkRuns.productId,
              mode: techBenchmarkRuns.mode,
              score: techBenchmarkRuns.score,
              recordedAt: techBenchmarkRuns.recordedAt,
              reviewId: techReviews.id,
              reviewSlug: techReviews.slug,
              productName: techProducts.name,
              productSlug: techProducts.slug,
              categoryName: techCategories.name,
              categorySlug: techCategories.slug,
            },
          )
          .from(techBenchmarkRuns)
          .innerJoin(
            techReviews,
            and(
              eq(techReviews.productId, techBenchmarkRuns.productId),
              or(
                eq(techReviews.status, "published"),
                eq(techReviews.status, "placeholder"),
              ),
            ),
          )
          .innerJoin(techProducts, eq(techProducts.id, techBenchmarkRuns.productId))
          .leftJoin(techCategories, eq(techCategories.id, techProducts.categoryId))
          .where(
            and(
              eq(techBenchmarkRuns.testId, testRow.id),
              eq(techBenchmarkRuns.superseded, false),
            ),
          )
          .orderBy(
            asc(techBenchmarkRuns.productId),
            asc(techBenchmarkRuns.mode),
            desc(techBenchmarkRuns.recordedAt),
          )

        // 3. Group into one row per (productId, reviewId), splitting AC vs Battery.
        type Acc = {
          reviewId: string
          reviewSlug: string
          productId: string
          productName: string
          productSlug: string
          categoryName: string | null
          categorySlug: string | null
          acScore: number | null
          batteryScore: number | null
        }
        const byProduct = new Map<string, Acc>()
        for (const r of runRows) {
          if (r.mode === "both") continue // canonical runs are written as ac or battery
          let acc = byProduct.get(r.productId)
          if (!acc) {
            acc = {
              reviewId: r.reviewId,
              reviewSlug: r.reviewSlug,
              productId: r.productId,
              productName: r.productName,
              productSlug: r.productSlug,
              categoryName: r.categoryName,
              categorySlug: r.categorySlug,
              acScore: null,
              batteryScore: null,
            }
            byProduct.set(r.productId, acc)
          }
          if (r.mode === "ac") acc.acScore = Number(r.score)
          if (r.mode === "battery") acc.batteryScore = Number(r.score)
        }

        // 4. Honest-omit policy: row must have at least one of acScore / batteryScore.
        const rows: BenchmarkLeaderboardRow[] = []
        for (const acc of byProduct.values()) {
          if (acc.acScore === null && acc.batteryScore === null) continue

          const bprRatio =
            acc.acScore !== null && acc.batteryScore !== null && acc.acScore !== 0
              ? acc.batteryScore / acc.acScore
              : null

          let baselinePercent: number | null = null
          if (referenceScore !== null && referenceScore !== 0) {
            // Use AC score as the "primary" for baseline if available, else Battery.
            // (This mirrors UI-SPEC: vs-baseline pill is per-row; AC is the canonical score.)
            const primary = acc.acScore ?? acc.batteryScore
            if (primary !== null) {
              if (spec.direction === "higher_is_better") {
                baselinePercent = (primary / referenceScore - 1) * 100
              } else {
                // lower_is_better: faster (lower) is better → invert so positive = better
                baselinePercent = (referenceScore / primary - 1) * 100
              }
            }
          }

          rows.push({
            reviewId: acc.reviewId,
            reviewSlug: acc.reviewSlug,
            productId: acc.productId,
            productName: acc.productName,
            productSlug: acc.productSlug,
            categoryName: acc.categoryName,
            categorySlug: acc.categorySlug,
            acScore: acc.acScore,
            batteryScore: acc.batteryScore,
            bprRatio,
            baselinePercent,
          })
        }

        return { rubricKey, spec, referenceScore, rows }
      },
      ["benchmark-leaderboard-v1"],
      { tags: ["benchmark-leaderboard", "leaderboard"], revalidate: 300 },
    )
    ```

    Notes for executor:
    - The unstable_cache key includes the rubricKey arg automatically (next/cache hashes the args).
    - DO NOT add a status='draft' case — only published+placeholder per Phase 29 leaderboard.ts pattern.
    - DO NOT replicate this query into the legacy leaderboard.ts module. Per leaderboard.ts comment line 67-69, leaderboard.ts is the ONLY module reading placeholder rows; this new module also reads placeholders — keep the comment in mind but don't replicate the warning.
    - referenceScore column is `numeric` in Drizzle (returned as string); cast to Number after null check.
    - The 2-column DISTINCT ON (productId, mode) is intentional: we already filtered by testId in WHERE, so we don't need testId in the DISTINCT key.
  </action>
  <verify>
    <automated>pnpm tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/tech/benchmark-leaderboard.ts` exists.
    - `grep -q "export const getLeaderboardForBenchmark" src/lib/tech/benchmark-leaderboard.ts` succeeds.
    - `grep -q "export interface BenchmarkLeaderboardRow" src/lib/tech/benchmark-leaderboard.ts` succeeds.
    - `grep -q "export interface BenchmarkLeaderboardResult" src/lib/tech/benchmark-leaderboard.ts` succeeds.
    - `grep -q "import \"server-only\"" src/lib/tech/benchmark-leaderboard.ts` succeeds (must be server-only).
    - `grep -q "unstable_cache" src/lib/tech/benchmark-leaderboard.ts` succeeds.
    - `grep -q "selectDistinctOn" src/lib/tech/benchmark-leaderboard.ts` succeeds (DISTINCT ON pattern preserved).
    - `grep -q "superseded.*false\\|eq.*superseded.*false" src/lib/tech/benchmark-leaderboard.ts` succeeds (canonical-runs filter).
    - `grep -q "placeholder" src/lib/tech/benchmark-leaderboard.ts` succeeds (review status filter mirrors Phase 29).
    - `grep -q "higher_is_better" src/lib/tech/benchmark-leaderboard.ts && grep -q "lower_is_better" src/lib/tech/benchmark-leaderboard.ts` succeeds (direction-aware baseline math).
    - `pnpm tsc --noEmit` exits 0.
  </acceptance_criteria>
  <done>
    Server-only query module exports getLeaderboardForBenchmark + BenchmarkLeaderboardRow type; unknown rubric keys return null; valid keys with no test row return empty rows array; known keys with measurements return one row per product with AC/Battery/BPR-ratio/baseline-percent computed honestly.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Playwright spec for slug helpers + plan-level verification gate</name>
  <files>tests/30-01-benchmark-slug.spec.ts</files>
  <read_first>
    - tests/29.2-09-benchmarks-hero.spec.ts (existing benchmarks-area Playwright spec — same setup pattern, same baseURL, no auth)
    - tests/29.1-03-rankings-routes.spec.ts (existing routes-enumeration spec — pattern for asserting many routes)
    - playwright.config.ts (test runner config: testDir './tests', baseURL = http://localhost:3004 unless PLAYWRIGHT_BASE_URL set, projects: desktop/mobile/webkit/firefox)
    - src/lib/tech/benchmark-slug.ts (just created)
    - src/lib/tech/rubric-map.ts (RUBRIC_V1_1 import)
  </read_first>
  <action>
    The vitest spec from Task 1 covers the slug helper logic. This Playwright spec is the plan-level verification gate per the phase's "Playwright spec per plan" mandate. Since Plan 30-01 ships no UI, this spec asserts:
    1. The slug helper module is importable from a Playwright/Node context (smoke).
    2. RUBRIC_V1_1 has exactly 43 entries (rubric integrity check — protects this phase from upstream changes).
    3. All 43 generated slugs are URL-safe (only [a-z0-9-]).

    Create `tests/30-01-benchmark-slug.spec.ts`:

    ```typescript
    import { test, expect } from "@playwright/test"
    import { RUBRIC_V1_1 } from "@/lib/tech/rubric-map"
    import {
      slugFromRubricKey,
      rubricKeyFromSlug,
      getAllBenchmarkSlugs,
    } from "@/lib/tech/benchmark-slug"

    test.describe("Phase 30-01: benchmark slug helpers", () => {
      test("RUBRIC_V1_1 has exactly 43 entries", () => {
        expect(Object.keys(RUBRIC_V1_1)).toHaveLength(43)
      })

      test("getAllBenchmarkSlugs returns 43 unique URL-safe slugs", () => {
        const slugs = getAllBenchmarkSlugs()
        expect(slugs).toHaveLength(43)
        expect(new Set(slugs).size).toBe(43)
        for (const slug of slugs) {
          expect(slug).toMatch(/^[a-z0-9-]+$/)
        }
      })

      test("all 43 RUBRIC_V1_1 keys produce reversible slugs", () => {
        for (const key of Object.keys(RUBRIC_V1_1)) {
          const slug = slugFromRubricKey(key)
          expect(rubricKeyFromSlug(slug)).toBe(key)
        }
      })

      test("known sample slugs reverse to expected keys", () => {
        expect(rubricKeyFromSlug("cpu-geekbench6-multi")).toBe("cpu:geekbench6:multi")
        expect(rubricKeyFromSlug("battery-life-video-loop-hours")).toBe("battery_life:video_loop:hours")
        expect(rubricKeyFromSlug("dev-cargo-build-release")).toBe("dev:cargo:build_release")
      })

      test("unknown slug returns null", () => {
        expect(rubricKeyFromSlug("not-a-real-test")).toBeNull()
        expect(rubricKeyFromSlug("")).toBeNull()
      })
    })
    ```

    Confirm `@/` path alias works in playwright tests by checking another existing test that imports from `@/lib/tech/*` (e.g., 29.1-03-rankings-routes.spec.ts). If the alias isn't configured for tests, the spec must use a relative import: `import { RUBRIC_V1_1 } from "../src/lib/tech/rubric-map"` etc. — adjust at write time after reading playwright.config.ts and tsconfig.json paths config.
  </action>
  <verify>
    <automated>pnpm exec playwright test tests/30-01-benchmark-slug.spec.ts --project=desktop</automated>
  </verify>
  <acceptance_criteria>
    - File `tests/30-01-benchmark-slug.spec.ts` exists.
    - `grep -q "test.describe(\"Phase 30-01: benchmark slug helpers\"" tests/30-01-benchmark-slug.spec.ts` succeeds.
    - `grep -q "RUBRIC_V1_1 has exactly 43 entries" tests/30-01-benchmark-slug.spec.ts` succeeds.
    - `grep -q "all 43 RUBRIC_V1_1 keys produce reversible slugs" tests/30-01-benchmark-slug.spec.ts` succeeds.
    - `pnpm exec playwright test tests/30-01-benchmark-slug.spec.ts --project=desktop` exits 0.
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
  </acceptance_criteria>
  <done>
    Playwright spec exists and passes; rubric integrity (43 entries) is now guarded by CI-runnable assertion; slug round-trip property is enforced both in vitest and playwright layers.
  </done>
</task>

</tasks>

<verification>
- `pnpm tsc --noEmit` exits 0
- `pnpm lint` exits 0
- `pnpm vitest run src/lib/tech/benchmark-slug.spec.ts` all tests pass
- `pnpm exec playwright test tests/30-01-benchmark-slug.spec.ts --project=desktop` all tests pass
- `grep -q "GlitchTek" src/lib/tech/benchmark-slug.ts src/lib/tech/benchmark-leaderboard.ts tests/30-01-benchmark-slug.spec.ts` returns NOTHING (brand spelling guard)
</verification>

<success_criteria>
- Slug helper module exports slugFromRubricKey, rubricKeyFromSlug, getAllBenchmarkSlugs
- All 43 RUBRIC_V1_1 keys round-trip slug→key→slug identically
- Unknown slugs return null (caller will use this signal to call notFound())
- Per-benchmark leaderboard query returns one row per product with AC/Battery/BPR ratio/baseline-percent computed per UI-SPEC formulas
- Honest-omit policy enforced: products without any canonical run for the test are not included in rows
- Direction-aware baseline math: positive percentage always means "better than baseline" regardless of direction field
- All four verification commands exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/30-per-benchmark-pages/30-01-SUMMARY.md` documenting:
- Files created
- Whether tsc/lint/vitest/playwright all passed first try (or what was fixed)
- Any deviations from the plan (e.g., import alias `@/` had to be replaced with relative path)
- Any RUBRIC_V1_1 entry that produced a surprising slug (so 30-02 author knows to spot-check)
</output>
