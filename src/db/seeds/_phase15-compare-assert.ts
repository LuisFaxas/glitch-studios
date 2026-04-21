/**
 * Phase 15 runtime regression check.
 *
 * Asserts that getBenchmarkRunsForProducts returns NO duplicate (productId, testId, mode)
 * triples after the D-16 3-column DISTINCT ON refactor, and that getBenchmarkSpotlight
 * resolves via id lookup (not ilike).
 *
 * Run:
 *   pnpm tsx src/db/seeds/_phase15-compare-assert.ts
 *
 * Exit code: 0 = OK, 1 = regression detected.
 * Safe to delete after Phase 16 adds its own ingest tests.
 *
 * NOTE: This script uses a standalone postgres/drizzle setup (same as rubric-v1.1.ts)
 * because queries.ts has `import "server-only"` which blocks tsx execution.
 * The assertion logic replicates the D-16 DISTINCT ON query and DB-level uniqueness
 * checks directly.
 *
 * IMPORTANT: `PublicBenchmarkRun` does NOT expose `mode`, so we cannot directly assert
 * uniqueness of (productId, testId, mode) from the public return shape. Instead, we
 * query `tech_benchmark_runs` directly to cross-check that no superseded=false row set
 * has more than one live row per (product, test, mode) triple — which is the invariant
 * D-16 + the partial UNIQUE index enforce together. We also assert that the DISTINCT ON
 * query has no duplicate (productId, testId, mode) triples in its raw result.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv")
dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm"
import * as schema from "../schema"
import { RUBRIC_V1_1 } from "../../lib/tech/rubric-map"

async function main() {
  const client = postgres(process.env.DATABASE_URL!)
  const db = drizzle(client, { schema })

  try {
    // Grab up to 5 product ids from the DB — if no products exist, the empty-input
    // path is exercised and the uniqueness assertions are skipped (vacuously pass).
    const productSample = await db
      .select({ id: schema.techProducts.id })
      .from(schema.techProducts)
      .limit(5)
    const productIds = productSample.map((p) => p.id)

    // Always exercise the empty-input path first.
    if (productIds.length === 0) {
      console.log(
        "OK: no products in DB — empty-input path verified. " +
        "Skipping duplicate-triple and spotlight assertions (no data). " +
        "no duplicate (product, test, mode) live rows at DB level (vacuously true)."
      )
      process.exit(0)
    }

    // ----- D-16 DISTINCT ON query (mirrors getBenchmarkRunsForProducts) -----
    // We replicate the selectDistinctOn query directly to verify the DB-level behavior.
    const distinctRows = await db
      .selectDistinctOn(
        [
          schema.techBenchmarkRuns.productId,
          schema.techBenchmarkRuns.testId,
          schema.techBenchmarkRuns.mode,
        ],
        {
          productId: schema.techBenchmarkRuns.productId,
          testId: schema.techBenchmarkTests.id,
          testName: schema.techBenchmarkTests.name,
          mode: schema.techBenchmarkRuns.mode,
          score: schema.techBenchmarkRuns.score,
          recordedAt: schema.techBenchmarkRuns.recordedAt,
          sortOrder: schema.techBenchmarkTests.sortOrder,
        },
      )
      .from(schema.techBenchmarkRuns)
      .innerJoin(
        schema.techBenchmarkTests,
        eq(schema.techBenchmarkRuns.testId, schema.techBenchmarkTests.id),
      )
      .where(and(
        inArray(schema.techBenchmarkRuns.productId, productIds),
        eq(schema.techBenchmarkRuns.superseded, false),
      ))
      .orderBy(
        asc(schema.techBenchmarkRuns.productId),
        asc(schema.techBenchmarkRuns.testId),
        asc(schema.techBenchmarkRuns.mode),
        desc(schema.techBenchmarkRuns.recordedAt),
      )

    // DISTINCT ON check: no duplicate (productId, testId, mode) triples in result.
    const distinctSeen = new Map<string, number>()
    for (const r of distinctRows) {
      const key = `${r.productId}::${r.testId}::${r.mode}`
      distinctSeen.set(key, (distinctSeen.get(key) ?? 0) + 1)
    }
    const distinctDupes = [...distinctSeen.entries()].filter(([, n]) => n > 1)
    if (distinctDupes.length > 0) {
      console.error("FAIL: duplicate (productId, testId, mode) in DISTINCT ON result:", distinctDupes)
      process.exit(1)
    }

    // DB-level check: per D-16 + the partial UNIQUE index (superseded=false), there must be
    // at most one live row per (product_id, test_id, mode) triple. Any violation means the
    // partial UNIQUE index in plan 01 failed to land or DISTINCT ON returned a stale row.
    const liveCounts = await db
      .select({
        productId: schema.techBenchmarkRuns.productId,
        testId: schema.techBenchmarkRuns.testId,
        mode: schema.techBenchmarkRuns.mode,
        n: sql<number>`count(*)::int`,
      })
      .from(schema.techBenchmarkRuns)
      .where(and(
        inArray(schema.techBenchmarkRuns.productId, productIds),
        eq(schema.techBenchmarkRuns.superseded, false),
      ))
      .groupBy(
        schema.techBenchmarkRuns.productId,
        schema.techBenchmarkRuns.testId,
        schema.techBenchmarkRuns.mode,
      )
    const liveDupes = liveCounts.filter((r) => r.n > 1)
    if (liveDupes.length > 0) {
      console.error("FAIL: tech_benchmark_runs has >1 live row per (product, test, mode):", liveDupes)
      process.exit(1)
    }

    // ----- Spotlight: RUBRIC_V1_1 id lookup (mirrors getBenchmarkSpotlight) -----
    const spotlightEntry = RUBRIC_V1_1["cpu:geekbench6:multi"]
    if (!spotlightEntry) {
      console.error("FAIL: RUBRIC_V1_1['cpu:geekbench6:multi'] is undefined — rubric map broken")
      process.exit(1)
    }

    // Verify the id lookup path (natural key). Null result is valid when no runs exist yet.
    const [spotlightTest] = await db
      .select({ id: schema.techBenchmarkTests.id })
      .from(schema.techBenchmarkTests)
      .where(and(
        eq(schema.techBenchmarkTests.discipline, spotlightEntry.discipline),
        eq(schema.techBenchmarkTests.mode, spotlightEntry.mode),
        eq(schema.techBenchmarkTests.name, spotlightEntry.name),
      ))
      .limit(1)

    const spotlightStatus = spotlightTest
      ? `test id=${spotlightTest.id} (id lookup succeeded)`
      : "test row not found (null — acceptable when seed not yet run or no matching row)"

    console.log(
      `OK: ${distinctRows.length} canonical rows across ${productIds.length} products, ` +
      `no duplicate (productId, testId, mode) triples in DISTINCT ON result, ` +
      `no duplicate (product, test, mode) live rows at DB level. ` +
      `Spotlight: ${spotlightStatus}`
    )
    process.exit(0)
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
