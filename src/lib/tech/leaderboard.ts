import "server-only"
import { db } from "@/lib/db"
import { unstable_cache } from "next/cache"
import {
  techReviews,
  techProducts,
  techCategories,
  mediaAssets,
  techBenchmarkRuns,
  techBenchmarkTests,
  techProductSpecs,
  techSpecFields,
  techReviewDisciplineExclusions,
} from "@/db/schema"
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm"
import { getCategoryDescendantIds } from "./queries"
import type { BprTier } from "./bpr"
import { RUBRIC_V1_1 } from "./rubric-map"

export interface LeaderboardRow {
  reviewId: string
  reviewSlug: string
  productId: string
  productName: string
  productSlug: string
  manufacturer: string | null
  heroImageUrl: string | null
  heroImageAlt: string | null
  subCategorySlug: string | null
  subCategoryName: string | null
  bprScore: number | null
  bprTier: BprTier | null
  bprDisciplineCount: number
  glitchmarkScore: number | null
  glitchmarkIsPartial: boolean | null
  glitchmarkTestCount: number | null
  releaseYear: number | null
  priceUsd: number | null
  cpuKind: string | null
  ramGb: number | null
  storageGb: number | null
  benchmarkScores: Record<string, { score: number; mode: "ac" | "battery" } | null>
  exclusionReasons: Record<string, string>
}

export interface LeaderboardBenchmarkColumn {
  rubricKey: string
  displayName: string
  unit: string
  direction: "higher_is_better" | "lower_is_better"
  methodologyAnchor: string
}

// Build name -> rubric-key map once (tech_benchmark_tests has no `key` column;
// rubric keys live in RUBRIC_V1_1 keyed off `name` indirectly through the spec).
const NAME_TO_RUBRIC_KEY: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  for (const [key, spec] of Object.entries(RUBRIC_V1_1)) {
    m[spec.name] = key
  }
  return m
})()

const SPEC_FIELD_NAMES = ["cpu_kind", "ram_gb", "storage_gb", "sub_category_slug"]

// Phase 29: this module is the ONLY query in the codebase that reads
// status='placeholder' rows. DO NOT replicate the OR(status='placeholder')
// filter into src/lib/tech/queries.ts — it would leak placeholders into
// sitemap, /tech/reviews list, homepage carousels, and review detail.
export const getLeaderboardRows = unstable_cache(
  async (categorySlug: string): Promise<LeaderboardRow[]> => {
    const descendantIds = await getCategoryDescendantIds(categorySlug)
    if (descendantIds.length === 0) return []

    // 1. Reviews + product + sub-category + hero image. Status is published OR placeholder.
    const reviewRows = await db
      .select({
        review: techReviews,
        product: techProducts,
        subCategory: techCategories,
        heroImage: mediaAssets,
      })
      .from(techReviews)
      .innerJoin(techProducts, eq(techReviews.productId, techProducts.id))
      .leftJoin(techCategories, eq(techProducts.categoryId, techCategories.id))
      .leftJoin(mediaAssets, eq(techReviews.heroImageId, mediaAssets.id))
      .where(
        and(
          inArray(techProducts.categoryId, descendantIds),
          or(
            eq(techReviews.status, "published"),
            eq(techReviews.status, "placeholder"),
          ),
        ),
      )
      .orderBy(
        sql`${techReviews.glitchmarkScore} DESC NULLS LAST`,
        asc(techReviews.id),
      )

    if (reviewRows.length === 0) return []
    const reviewIds = reviewRows.map((r) => r.review.id)
    const productIds = reviewRows.map((r) => r.product.id)

    // 2. Canonical benchmark runs — DISTINCT ON (productId, testId, mode).
    //    Phase 15 D-16 pattern; ORDER BY MUST lead with the DISTINCT ON columns.
    const runRows = await db
      .selectDistinctOn(
        [
          techBenchmarkRuns.productId,
          techBenchmarkRuns.testId,
          techBenchmarkRuns.mode,
        ],
        {
          productId: techBenchmarkRuns.productId,
          testId: techBenchmarkTests.id,
          testName: techBenchmarkTests.name,
          unit: techBenchmarkTests.unit,
          direction: techBenchmarkTests.direction,
          mode: techBenchmarkRuns.mode,
          score: techBenchmarkRuns.score,
          recordedAt: techBenchmarkRuns.recordedAt,
        },
      )
      .from(techBenchmarkRuns)
      .innerJoin(
        techBenchmarkTests,
        eq(techBenchmarkRuns.testId, techBenchmarkTests.id),
      )
      .where(
        and(
          inArray(techBenchmarkRuns.productId, productIds),
          eq(techBenchmarkRuns.superseded, false),
        ),
      )
      .orderBy(
        asc(techBenchmarkRuns.productId),
        asc(techBenchmarkRuns.testId),
        asc(techBenchmarkRuns.mode),
        desc(techBenchmarkRuns.recordedAt),
      )

    // 3. Product specs — pivot tech_product_specs JOIN tech_spec_fields by spec name.
    //    Required keys: cpu_kind, ram_gb, storage_gb, sub_category_slug.
    const specRows = await db
      .select({
        productId: techProductSpecs.productId,
        fieldName: techSpecFields.name,
        valueText: techProductSpecs.valueText,
        valueNumber: techProductSpecs.valueNumber,
      })
      .from(techProductSpecs)
      .innerJoin(
        techSpecFields,
        eq(techProductSpecs.fieldId, techSpecFields.id),
      )
      .where(
        and(
          inArray(techProductSpecs.productId, productIds),
          inArray(techSpecFields.name, SPEC_FIELD_NAMES),
        ),
      )

    // 4. Discipline exclusions for RANK-04 tooltips.
    const exclusionRows = await db
      .select({
        reviewId: techReviewDisciplineExclusions.reviewId,
        discipline: techReviewDisciplineExclusions.discipline,
        reason: techReviewDisciplineExclusions.reason,
        notes: techReviewDisciplineExclusions.notes,
      })
      .from(techReviewDisciplineExclusions)
      .where(inArray(techReviewDisciplineExclusions.reviewId, reviewIds))

    return assembleRows(reviewRows, runRows, specRows, exclusionRows)
  },
  ["leaderboard-rows-v1"],
  { tags: ["leaderboard"], revalidate: 300 },
)

export const getLeaderboardBenchmarkColumns = unstable_cache(
  async (_categorySlug: string): Promise<LeaderboardBenchmarkColumn[]> => {
    // Phase 29 D-02: locked default 4-column set (per RESEARCH "Recommended Default Benchmark Columns").
    return [
      {
        rubricKey: "cpu:geekbench6:multi",
        displayName: "Geekbench 6 Multi",
        unit: "score",
        direction: "higher_is_better",
        methodologyAnchor: "#disciplines",
      },
      {
        rubricKey: "gpu:3dmark:steel_nomad_light",
        displayName: "3DMark Steel Nomad",
        unit: "score",
        direction: "higher_is_better",
        methodologyAnchor: "#disciplines",
      },
      {
        rubricKey: "llm:llama_bench:tg128",
        displayName: "LLM tg128",
        unit: "tok/s",
        direction: "higher_is_better",
        methodologyAnchor: "#disciplines",
      },
      {
        rubricKey: "battery_life:video_loop:hours",
        displayName: "Battery (video, h)",
        unit: "hours",
        direction: "higher_is_better",
        methodologyAnchor: "#disciplines",
      },
    ]
  },
  ["leaderboard-cols-v1"],
  { tags: ["leaderboard"], revalidate: 3600 },
)

// ---- helpers ----

type ReviewRow = {
  review: typeof techReviews.$inferSelect
  product: typeof techProducts.$inferSelect
  subCategory: typeof techCategories.$inferSelect | null
  heroImage: typeof mediaAssets.$inferSelect | null
}

type RunRow = {
  productId: string
  testId: string
  testName: string
  unit: string
  direction: "higher_is_better" | "lower_is_better"
  mode: "ac" | "battery" | "both"
  score: string
  recordedAt: Date
}

type SpecRow = {
  productId: string
  fieldName: string
  valueText: string | null
  valueNumber: string | null
}

type ExclusionRow = {
  reviewId: string
  discipline: string
  reason: string
  notes: string | null
}

function assembleRows(
  reviewRows: ReviewRow[],
  runRows: RunRow[],
  specRows: SpecRow[],
  exclusionRows: ExclusionRow[],
): LeaderboardRow[] {
  const specByProduct = new Map<string, Record<string, string | null>>()
  for (const s of specRows) {
    const existing = specByProduct.get(s.productId) ?? {}
    existing[s.fieldName] = s.valueText ?? s.valueNumber ?? null
    specByProduct.set(s.productId, existing)
  }

  // Per-product runs map keyed by rubric key. Prefer AC mode when both AC + battery exist.
  const runsByProduct = new Map<
    string,
    Record<string, { score: number; mode: "ac" | "battery" }>
  >()
  for (const r of runRows) {
    const rubricKey = NAME_TO_RUBRIC_KEY[r.testName]
    if (!rubricKey) continue
    if (r.mode === "both") continue // canonical runs are written as ac or battery
    const map = runsByProduct.get(r.productId) ?? {}
    const existing = map[rubricKey]
    if (!existing || (r.mode === "ac" && existing.mode !== "ac")) {
      map[rubricKey] = { score: Number(r.score), mode: r.mode }
    }
    runsByProduct.set(r.productId, map)
  }

  const exclusionByReview = new Map<string, Record<string, string>>()
  for (const e of exclusionRows) {
    const map = exclusionByReview.get(e.reviewId) ?? {}
    map[e.discipline] = e.notes ?? humanizeReason(e.reason)
    exclusionByReview.set(e.reviewId, map)
  }

  return reviewRows.map((row) => {
    const specs = specByProduct.get(row.product.id) ?? {}
    const runs = runsByProduct.get(row.product.id) ?? {}
    const exclusions = exclusionByReview.get(row.review.id) ?? {}
    return {
      reviewId: row.review.id,
      reviewSlug: row.review.slug,
      productId: row.product.id,
      productName: row.product.name,
      productSlug: row.product.slug,
      manufacturer: row.product.manufacturer ?? null,
      heroImageUrl: row.heroImage?.url ?? null,
      heroImageAlt: row.heroImage?.alt ?? null,
      subCategorySlug:
        row.subCategory?.slug ?? specs.sub_category_slug ?? null,
      subCategoryName: row.subCategory?.name ?? null,
      bprScore: row.review.bprScore !== null && row.review.bprScore !== undefined
        ? Number(row.review.bprScore)
        : null,
      bprTier: (row.review.bprTier as BprTier | null) ?? null,
      bprDisciplineCount: row.review.bprDisciplineCount ?? 0,
      glitchmarkScore:
        row.review.glitchmarkScore !== null &&
        row.review.glitchmarkScore !== undefined
          ? Number(row.review.glitchmarkScore)
          : null,
      glitchmarkIsPartial: row.review.glitchmarkIsPartial ?? null,
      glitchmarkTestCount: row.review.glitchmarkTestCount ?? null,
      releaseYear: parseReleaseYear(row.product.releaseDate),
      priceUsd: row.product.priceUsd ? Number(row.product.priceUsd) : null,
      cpuKind: specs.cpu_kind ?? null,
      ramGb: specs.ram_gb ? Number(specs.ram_gb) : null,
      storageGb: specs.storage_gb ? Number(specs.storage_gb) : null,
      benchmarkScores: runs as Record<
        string,
        { score: number; mode: "ac" | "battery" } | null
      >,
      exclusionReasons: exclusions,
    }
  })
}

function parseReleaseYear(releaseDate: string | null): number | null {
  if (!releaseDate) return null
  const m = releaseDate.match(/^(\d{4})/)
  return m ? Number(m[1]) : null
}

function humanizeReason(reason: string): string {
  switch (reason) {
    case "no_hardware":
      return "Not tested — required hardware absent"
    case "requires_license":
      return "Not tested — requires paid license"
    case "device_class_exempt":
      return "Not tested — out of scope for this device class"
    case "test_failed":
      return "Not tested — benchmark crashed during run"
    default:
      return "Not included in this review"
  }
}
