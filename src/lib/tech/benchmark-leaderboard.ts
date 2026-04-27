import "server-only"
import { db } from "@/lib/db"
import { unstable_cache } from "next/cache"
import { and, asc, desc, eq, or } from "drizzle-orm"
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
  bprRatio: number | null
  baselinePercent: number | null
}

export interface BenchmarkLeaderboardResult {
  rubricKey: string
  spec: RubricTestSpec
  referenceScore: number | null
  rows: BenchmarkLeaderboardRow[]
}

export const getLeaderboardForBenchmark = unstable_cache(
  async (rubricKey: string): Promise<BenchmarkLeaderboardResult | null> => {
    const spec = RUBRIC_V1_1[rubricKey]
    if (!spec) return null

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
      return { rubricKey, spec, referenceScore: null, rows: [] }
    }

    const referenceScore =
      testRow.referenceScore !== null && testRow.referenceScore !== undefined
        ? Number(testRow.referenceScore)
        : null

    const runRows = await db
      .selectDistinctOn(
        [techBenchmarkRuns.productId, techBenchmarkRuns.mode],
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
      if (r.mode === "both") continue
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

    const rows: BenchmarkLeaderboardRow[] = []
    for (const acc of byProduct.values()) {
      if (acc.acScore === null && acc.batteryScore === null) continue

      const bprRatio =
        acc.acScore !== null && acc.batteryScore !== null && acc.acScore !== 0
          ? acc.batteryScore / acc.acScore
          : null

      let baselinePercent: number | null = null
      if (referenceScore !== null && referenceScore !== 0) {
        const primary = acc.acScore ?? acc.batteryScore
        if (primary !== null) {
          if (spec.direction === "higher_is_better") {
            baselinePercent = (primary / referenceScore - 1) * 100
          } else if (spec.direction === "lower_is_better") {
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
