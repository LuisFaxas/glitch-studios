import "server-only"
import { db } from "@/lib/db"
import {
  techBenchmarkRuns,
  techBenchmarkTests,
  techReviews,
  techReviewDisciplineExclusions,
} from "@/db/schema"
import { eq, and } from "drizzle-orm"
import type { PostgresJsTransaction } from "drizzle-orm/postgres-js"
import {
  BPR_ELIGIBLE_DISCIPLINES,
  type BenchmarkDiscipline,
} from "@/lib/tech/rubric-map"

export type BprTier = "platinum" | "gold" | "silver" | "bronze"

// Accept either the top-level db client or a Drizzle transaction client.
// Using a broad type (any generics) avoids needing to surface the exact
// postgres-js generic arguments at every call site.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbClient = typeof db | PostgresJsTransaction<any, any>

/**
 * Pure tier threshold function.
 * D-13 thresholds (METH-04 locked): >=90 platinum, >=80 gold, >=70 silver, >=60 bronze, <60 null.
 */
export function bprMedal(score: number | null): BprTier | null {
  if (score === null || score === undefined) return null
  if (score >= 90) return "platinum"
  if (score >= 80) return "gold"
  if (score >= 70) return "silver"
  if (score >= 60) return "bronze"
  return null
}

/**
 * Internal: geometric mean of battery/ac ratios * 100.
 * Returns null if ratios.length < 5 (D-12: fewer than 5 of 7 eligible disciplines).
 * Exported for unit-testing the formula without DB.
 */
export function computeBprFromPairs(ratios: number[]): number | null {
  if (ratios.length < 5) return null // D-12: min 5 of 7 eligible disciplines
  const sumLn = ratios.reduce((acc, r) => acc + Math.log(r), 0)
  return Math.exp(sumLn / ratios.length) * 100
}

/**
 * Async BPR computation for a product.
 *
 * D-12: queries non-superseded benchmark runs for productId via an innerJoin on
 * techBenchmarkTests (to get discipline + bprEligible), groups by discipline,
 * computes per-discipline battery_avg / ac_avg ratio, then geometric mean
 * across the 7 BPR-eligible disciplines minus exclusions.
 *
 * Returns { score: null, tier: null } if fewer than 5 of 7 eligible disciplines
 * have both AC + Battery data (after exclusions).
 *
 * @param productId  Product whose BPR is being computed.
 * @param options    Optional { rubricVersion } — defaults to "1.1".
 * @param tx         Optional transaction client. MUST be passed when called inside
 *                   a db.transaction() so queries run on the same connection and
 *                   can see uncommitted rows just inserted by the transaction
 *                   (Postgres READ COMMITTED). When called outside a transaction
 *                   (e.g. a standalone recompute), omit tx.
 */
export async function computeBprScore(
  productId: string,
  options?: { rubricVersion?: string },
  tx?: DbClient,
): Promise<{
  score: number | null
  tier: BprTier | null
  perDiscipline: Record<string, number | null>
}> {
  const client: DbClient = tx ?? db
  const rubricVersion = options?.rubricVersion ?? "1.1"

  // 1. Find the review(s) for this product to look up exclusions.
  //    A product may (rarely) have multiple reviews — collect all review ids.
  const reviewRows = await client
    .select({ id: techReviews.id })
    .from(techReviews)
    .where(eq(techReviews.productId, productId))

  // 2. Fetch excluded disciplines for all associated reviews.
  const excludedDisciplines = new Set<BenchmarkDiscipline>()
  for (const review of reviewRows) {
    const exclusions = await client
      .select({ discipline: techReviewDisciplineExclusions.discipline })
      .from(techReviewDisciplineExclusions)
      .where(eq(techReviewDisciplineExclusions.reviewId, review.id))
    for (const e of exclusions) {
      if (e.discipline) {
        excludedDisciplines.add(e.discipline as BenchmarkDiscipline)
      }
    }
  }

  // 3. Fetch all non-superseded runs for this product with discipline info.
  //    Use innerJoin so we get per-run discipline + bprEligible from the test row.
  const runs = await client
    .select({
      testId: techBenchmarkRuns.testId,
      mode: techBenchmarkRuns.mode,
      score: techBenchmarkRuns.score,
      discipline: techBenchmarkTests.discipline,
      bprEligible: techBenchmarkTests.bprEligible,
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
        eq(techBenchmarkRuns.rubricVersion, rubricVersion),
      ),
    )

  // 4. Group scores by discipline × mode (ac/battery).
  const byDisciplineMode: Record<
    string,
    { ac: number[]; battery: number[] }
  > = {}

  for (const run of runs) {
    const discipline = run.discipline as BenchmarkDiscipline | null
    if (!discipline) continue
    if (!run.bprEligible) continue
    if (!BPR_ELIGIBLE_DISCIPLINES.includes(discipline)) continue
    if (excludedDisciplines.has(discipline)) continue
    if (run.mode !== "ac" && run.mode !== "battery") continue

    const score = parseFloat(run.score)
    if (!Number.isFinite(score) || score <= 0) continue // skip zero/invalid (avoids ln(0))

    if (!byDisciplineMode[discipline]) {
      byDisciplineMode[discipline] = { ac: [], battery: [] }
    }
    byDisciplineMode[discipline][run.mode].push(score)
  }

  // 5. Compute per-discipline ratio (battery_avg / ac_avg) for disciplines
  //    with both modes present.
  const perDiscipline: Record<string, number | null> = {}
  const ratios: number[] = []

  for (const discipline of BPR_ELIGIBLE_DISCIPLINES) {
    if (excludedDisciplines.has(discipline)) {
      perDiscipline[discipline] = null
      continue
    }
    const group = byDisciplineMode[discipline]
    if (!group || group.ac.length === 0 || group.battery.length === 0) {
      perDiscipline[discipline] = null
      continue
    }
    const acAvg = group.ac.reduce((a, b) => a + b, 0) / group.ac.length
    const batteryAvg =
      group.battery.reduce((a, b) => a + b, 0) / group.battery.length
    if (acAvg <= 0) {
      perDiscipline[discipline] = null
      continue
    }
    const ratio = batteryAvg / acAvg
    perDiscipline[discipline] = ratio * 100 // store as percent for UI/debug use
    ratios.push(ratio)
  }

  // 6. Compute final score (returns null if < 5 disciplines have both modes).
  const score = computeBprFromPairs(ratios)
  const tier = bprMedal(score)

  return { score, tier, perDiscipline }
}
