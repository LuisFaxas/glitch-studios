import "server-only"
import { db } from "@/lib/db"
import {
  techBenchmarkRuns,
  techBenchmarkTests,
  techReviews,
  techGlitchmarkHistory,
} from "@/db/schema"
import { and, eq, isNotNull, desc } from "drizzle-orm"
import type { PostgresJsTransaction } from "drizzle-orm/postgres-js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbClient = typeof db | PostgresJsTransaction<any, any>

/**
 * Current GlitchMark formula version. Bumped when the formula changes.
 * Per CONTEXT D-13. Mirrors `rubric_version` ('1.1') text column convention.
 */
export const GLITCHMARK_VERSION = "v1"

/**
 * Min tests required to produce ANY score. Below this → null. Per CONTEXT D-06.
 */
export const GLITCHMARK_FLOOR = 8

/**
 * Threshold above which is_partial is false. Between FLOOR and FULL → is_partial true.
 * Per CONTEXT D-06.
 */
export const GLITCHMARK_FULL = 12

/**
 * Pure function: geometric mean of normalized ratios × 100.
 *
 * - Each ratio is `raw / reference` (or its inverse for lower_is_better tests) — see recomputeGlitchmark.
 * - Reference device → ratio 1.0 → score 100.
 * - Returns null when ratios.length < GLITCHMARK_FLOOR (8).
 * - Output is unbounded above (e.g., 165 = 65% above baseline).
 *
 * Mirrors computeBprFromPairs() exactly. Pure for unit testing.
 */
export function computeGlitchmarkFromRatios(ratios: number[]): number | null {
  if (ratios.length < GLITCHMARK_FLOOR) return null
  const sumLn = ratios.reduce((acc, r) => acc + Math.log(r), 0)
  return Math.exp(sumLn / ratios.length) * 100
}

/**
 * `is_partial` is true when count is in [FLOOR, FULL). False when count >= FULL.
 */
export function isPartialCount(count: number): boolean {
  return count >= GLITCHMARK_FLOOR && count < GLITCHMARK_FULL
}

/**
 * Mode-priority pick: prefer 'ac', then 'battery', then 'both'. The latest
 * non-superseded run for that mode wins.
 */
function pickRunByModePriority<T extends { mode: string; recordedAt: Date }>(
  runs: T[],
): T | null {
  if (runs.length === 0) return null
  const acRuns = runs
    .filter((r) => r.mode === "ac")
    .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
  if (acRuns.length > 0) return acRuns[0]
  const batteryRuns = runs
    .filter((r) => r.mode === "battery")
    .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
  if (batteryRuns.length > 0) return batteryRuns[0]
  const bothRuns = runs
    .filter((r) => r.mode === "both")
    .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
  if (bothRuns.length > 0) return bothRuns[0]
  return runs[0]
}

interface RecomputeResult {
  score: number | null
  testCount: number
  isPartial: boolean
  version: string
}

/**
 * Recompute GlitchMark for a product.
 *
 * - Reads non-superseded benchmark runs for the product where the test has
 *   reference_score IS NOT NULL.
 * - For each (product, test) pair, picks one representative run by mode priority
 *   ('ac' > 'battery' > 'both', latest first).
 * - Normalizes per test: `raw / reference` for higher_is_better, `reference / raw`
 *   for lower_is_better.
 * - Floors at 8 tests; below → score=null, testCount=actual count, isPartial=false.
 * - When called inside db.transaction(), pass `tx` so reads see uncommitted ingest
 *   inserts. Mirrors computeBprScore tx-pattern verbatim.
 * - Updates tech_reviews glitchmark_* columns and inserts a tech_glitchmark_history
 *   row (one per review × version) when a review row exists for the product.
 */
export async function recomputeGlitchmark(
  productId: string,
  tx?: DbClient,
): Promise<RecomputeResult> {
  const client: DbClient = tx ?? db

  // 1. Find the review for this product (use the FIRST one if multiple exist).
  const reviewRows = await client
    .select({ id: techReviews.id })
    .from(techReviews)
    .where(eq(techReviews.productId, productId))

  // 2. Fetch all non-superseded runs joined to test metadata for this product.
  //    Only tests with reference_score IS NOT NULL contribute (eligibility).
  const runRows = await client
    .select({
      testId: techBenchmarkRuns.testId,
      score: techBenchmarkRuns.score,
      mode: techBenchmarkRuns.mode,
      recordedAt: techBenchmarkRuns.recordedAt,
      reference: techBenchmarkTests.referenceScore,
      direction: techBenchmarkTests.direction,
    })
    .from(techBenchmarkRuns)
    .innerJoin(
      techBenchmarkTests,
      eq(techBenchmarkRuns.testId, techBenchmarkTests.id),
    )
    .where(
      and(
        eq(techBenchmarkRuns.productId, productId),
        eq(techBenchmarkRuns.superseded, false),
        isNotNull(techBenchmarkTests.referenceScore),
      ),
    )
    .orderBy(desc(techBenchmarkRuns.recordedAt))

  // 3. Group by testId, pick one representative run per test.
  const byTest = new Map<string, typeof runRows>()
  for (const row of runRows) {
    const key = row.testId
    if (!byTest.has(key)) byTest.set(key, [])
    byTest.get(key)!.push(row)
  }

  const ratios: number[] = []
  for (const runs of byTest.values()) {
    const pick = pickRunByModePriority(runs)
    if (!pick) continue
    const raw = Number(pick.score)
    const reference = Number(pick.reference)
    if (!isFinite(raw) || raw <= 0 || !isFinite(reference) || reference <= 0) {
      continue
    }
    const ratio =
      pick.direction === "lower_is_better" ? reference / raw : raw / reference
    ratios.push(ratio)
  }

  const score = computeGlitchmarkFromRatios(ratios)
  const testCount = ratios.length
  const isPartial = isPartialCount(testCount)

  // 4. Persist to tech_reviews (live row) and tech_glitchmark_history (audit).
  //    Skip persistence if no review row exists for this product.
  if (reviewRows.length > 0) {
    const reviewId = reviewRows[0].id

    await client
      .update(techReviews)
      .set({
        glitchmarkScore: score !== null ? String(score) : null,
        glitchmarkTestCount: testCount,
        glitchmarkIsPartial: isPartial,
        glitchmarkVersion: GLITCHMARK_VERSION,
      })
      .where(eq(techReviews.id, reviewId))

    // Upsert into history: ON CONFLICT (review_id, version) DO UPDATE.
    await client
      .insert(techGlitchmarkHistory)
      .values({
        reviewId,
        version: GLITCHMARK_VERSION,
        score: score !== null ? String(score) : null,
        testCount,
        isPartial,
        formulaNotes: null,
      })
      .onConflictDoUpdate({
        target: [
          techGlitchmarkHistory.reviewId,
          techGlitchmarkHistory.version,
        ],
        set: {
          score: score !== null ? String(score) : null,
          testCount,
          isPartial,
          computedAt: new Date(),
        },
      })
  }

  return {
    score,
    testCount,
    isPartial,
    version: GLITCHMARK_VERSION,
  }
}
