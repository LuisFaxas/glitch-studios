import "server-only"
import { db } from "@/lib/db"
import {
  techReviews,
  techReviewPros,
  techReviewCons,
  techReviewGallery,
  techProducts,
  techProductSpecs,
  techCategories,
  techSpecFields,
  techBenchmarkRuns,
  techBenchmarkTests,
  mediaAssets,
  user,
} from "@/db/schema"
import { and, asc, count, desc, eq, ilike, inArray, lt, ne, notInArray, or, sql } from "drizzle-orm"
import { RUBRIC_V1_1 } from "./rubric-map"

// ========== Types ==========

export interface PublicReviewCard {
  id: string
  slug: string
  title: string
  overallRating: number
  heroImageUrl: string
  heroImageAlt: string | null
  productName: string
  productSlug: string
  categoryName: string | null
  categorySlug: string | null
  publishedAt: Date
  excerpt: string
}

export interface PublicReviewDetail {
  id: string
  slug: string
  title: string
  verdict: string
  bodyHtml: string
  overallRating: number
  ratings: {
    performance: number
    build: number
    value: number
    design: number
  }
  heroImage: { url: string; alt: string | null; width: number | null; height: number | null }
  videoUrl: string | null
  audienceFor: string | null
  audienceNotFor: string | null
  publishedAt: Date
  reviewerName: string
  product: {
    id: string
    name: string
    slug: string
    manufacturer: string | null
    summary: string | null
    priceUsd: number | null
    affiliateUrl: string | null
    releaseDate: string | null
    // Category fields are nullable when the optional leftJoin doesn't match
    // (Phase 16.1 Plan 04 — partial seed resilience).
    categoryId: string | null
    categoryName: string | null
    categorySlug: string | null
    parentCategoryId: string | null
  }
  pros: string[]
  cons: string[]
  gallery: Array<{ url: string; alt: string | null; width: number | null; height: number | null }>
}

export interface PublicProductSpec {
  fieldId: string
  fieldName: string
  fieldType: "text" | "number" | "enum" | "boolean"
  unit: string | null
  valueText: string | null
  valueNumber: number | null
  valueBoolean: boolean | null
  sortOrder: number
}

export interface PublicBenchmarkRun {
  productId: string
  testId: string
  testName: string
  unit: string
  direction: "higher_is_better" | "lower_is_better"
  score: number
  recordedAt: Date
}

export interface TopCategoryTile {
  id: string
  name: string
  slug: string
  productCount: number
  reviewCount: number
}

export interface BreadcrumbNode {
  id: string
  name: string
  slug: string
  level: number
}

// ========== Helpers ==========

function computeOverall(
  perf: number, build: number, val: number, design: number,
  override: string | null,
): number {
  if (override !== null) return Number(override)
  return (perf + build + val + design) / 4
}

// ========== Review detail ==========

export async function getAllPublishedReviewSlugs(): Promise<{ slug: string }[]> {
  const rows = await db
    .select({ slug: techReviews.slug })
    .from(techReviews)
    .where(eq(techReviews.status, "published"))
  return rows
}

export async function getPublishedReviewBySlug(slug: string): Promise<PublicReviewDetail | null> {
  // D-13/Plan 04 (Phase 16.1): use leftJoin for category + reviewer so a
  // published review with a missing optional relation (partially seeded
  // fixture, soft-deleted reviewer) still renders instead of 404-ing. The
  // listing query (fetchCardRows) already uses leftJoin on category; this
  // keeps the two queries consistent. heroImage + product remain innerJoin
  // because the detail page hero/title cannot render without them.
  const rows = await db
    .select({
      review: techReviews,
      product: techProducts,
      category: techCategories,
      heroImage: mediaAssets,
      reviewerName: user.name,
    })
    .from(techReviews)
    .innerJoin(techProducts, eq(techReviews.productId, techProducts.id))
    .leftJoin(techCategories, eq(techProducts.categoryId, techCategories.id))
    .innerJoin(mediaAssets, eq(techReviews.heroImageId, mediaAssets.id))
    .leftJoin(user, eq(techReviews.reviewerId, user.id))
    .where(and(eq(techReviews.slug, slug), eq(techReviews.status, "published")))
    .limit(1)

  if (rows.length === 0) return null
  const r = rows[0]

  const [prosRows, consRows, galleryRows] = await Promise.all([
    db
      .select({ text: techReviewPros.text })
      .from(techReviewPros)
      .where(eq(techReviewPros.reviewId, r.review.id))
      .orderBy(asc(techReviewPros.sortOrder)),
    db
      .select({ text: techReviewCons.text })
      .from(techReviewCons)
      .where(eq(techReviewCons.reviewId, r.review.id))
      .orderBy(asc(techReviewCons.sortOrder)),
    db
      .select({
        url: mediaAssets.url,
        alt: mediaAssets.alt,
        width: mediaAssets.width,
        height: mediaAssets.height,
      })
      .from(techReviewGallery)
      .innerJoin(mediaAssets, eq(techReviewGallery.mediaId, mediaAssets.id))
      .where(eq(techReviewGallery.reviewId, r.review.id))
      .orderBy(asc(techReviewGallery.sortOrder)),
  ])

  return {
    id: r.review.id,
    slug: r.review.slug,
    title: r.review.title,
    verdict: r.review.verdict,
    bodyHtml: r.review.bodyHtml,
    overallRating: computeOverall(
      r.review.ratingPerformance,
      r.review.ratingBuild,
      r.review.ratingValue,
      r.review.ratingDesign,
      r.review.overallOverride,
    ),
    ratings: {
      performance: r.review.ratingPerformance,
      build: r.review.ratingBuild,
      value: r.review.ratingValue,
      design: r.review.ratingDesign,
    },
    heroImage: {
      url: r.heroImage.url,
      alt: r.heroImage.alt,
      width: r.heroImage.width,
      height: r.heroImage.height,
    },
    videoUrl: r.review.videoUrl,
    audienceFor: r.review.audienceFor,
    audienceNotFor: r.review.audienceNotFor,
    publishedAt: r.review.publishedAt!,
    reviewerName: r.reviewerName ?? "Unknown",
    product: {
      id: r.product.id,
      name: r.product.name,
      slug: r.product.slug,
      manufacturer: r.product.manufacturer,
      summary: r.product.summary,
      priceUsd: r.product.priceUsd !== null ? Number(r.product.priceUsd) : null,
      affiliateUrl: r.product.affiliateUrl,
      releaseDate: r.product.releaseDate,
      categoryId: r.category?.id ?? null,
      categoryName: r.category?.name ?? null,
      categorySlug: r.category?.slug ?? null,
      parentCategoryId: r.category?.parentId ?? null,
    },
    pros: prosRows.map((p) => p.text),
    cons: consRows.map((c) => c.text),
    gallery: galleryRows,
  }
}

// ========== Related reviews (D-01, D-02) ==========

export async function getRelatedReviews(
  excludeReviewId: string,
  categoryId: string,
  parentCategoryId: string | null,
  limit = 3,
): Promise<PublicReviewCard[]> {
  const primary = await queryCardsByCategoryIds([categoryId], excludeReviewId, [], limit)
  if (primary.length >= limit || !parentCategoryId) return primary

  const siblingIds = await db
    .select({ id: techCategories.id })
    .from(techCategories)
    .where(and(eq(techCategories.parentId, parentCategoryId), ne(techCategories.id, categoryId)))
    .then((rows) => rows.map((r) => r.id))

  if (siblingIds.length === 0) return primary
  const widened = await queryCardsByCategoryIds(
    siblingIds,
    excludeReviewId,
    primary.map((p) => p.id),
    limit - primary.length,
  )
  return [...primary, ...widened]
}

async function queryCardsByCategoryIds(
  categoryIds: string[],
  excludeReviewId: string,
  alreadyShownIds: string[],
  limit: number,
): Promise<PublicReviewCard[]> {
  if (categoryIds.length === 0 || limit <= 0) return []
  const conditions = [
    eq(techReviews.status, "published"),
    inArray(techProducts.categoryId, categoryIds),
    ne(techReviews.id, excludeReviewId),
  ]
  if (alreadyShownIds.length > 0) {
    conditions.push(notInArray(techReviews.id, alreadyShownIds))
  }
  return fetchCardRows(and(...conditions)!, [desc(techReviews.publishedAt), desc(techReviews.id)], limit)
}

// ========== Reviews list (cursor pagination) ==========

export interface ListReviewsFilter {
  categorySlug?: string
  sort: "latest" | "rating" | "name"
  q?: string
  cursor?: { publishedAt: Date; id: string }
  limit: number
}

export async function listPublishedReviews(
  filter: ListReviewsFilter,
): Promise<{ reviews: PublicReviewCard[]; nextCursor: { publishedAt: Date; id: string } | null }> {
  const conditions = [eq(techReviews.status, "published")]

  if (filter.categorySlug) {
    const ids = await getCategoryDescendantIds(filter.categorySlug)
    if (ids.length === 0) {
      return { reviews: [], nextCursor: null }
    }
    conditions.push(inArray(techProducts.categoryId, ids))
  }

  if (filter.q) {
    const like = `%${filter.q}%`
    conditions.push(or(ilike(techReviews.title, like), ilike(techProducts.name, like))!)
  }

  if (filter.cursor && filter.sort === "latest") {
    conditions.push(
      or(
        lt(techReviews.publishedAt, filter.cursor.publishedAt),
        and(
          eq(techReviews.publishedAt, filter.cursor.publishedAt),
          lt(techReviews.id, filter.cursor.id),
        ),
      )!,
    )
  }

  const orderBy =
    filter.sort === "latest"
      ? [desc(techReviews.publishedAt), desc(techReviews.id)]
      : filter.sort === "rating"
        ? [
            desc(
              sql`COALESCE(${techReviews.overallOverride}, (${techReviews.ratingPerformance} + ${techReviews.ratingBuild} + ${techReviews.ratingValue} + ${techReviews.ratingDesign}) / 4.0)`,
            ),
            desc(techReviews.id),
          ]
        : [asc(techProducts.name), asc(techReviews.id)]

  const rows = await fetchCardRows(and(...conditions)!, orderBy, filter.limit + 1)

  const hasMore = rows.length > filter.limit
  const trimmed = rows.slice(0, filter.limit)
  const nextCursor =
    hasMore && filter.sort === "latest"
      ? { publishedAt: trimmed[trimmed.length - 1].publishedAt, id: trimmed[trimmed.length - 1].id }
      : null

  return { reviews: trimmed, nextCursor }
}

async function fetchCardRows(
  whereClause: ReturnType<typeof and>,
  orderBy: ReturnType<typeof desc>[],
  limit: number,
): Promise<PublicReviewCard[]> {
  const rows = await db
    .select({
      id: techReviews.id,
      slug: techReviews.slug,
      title: techReviews.title,
      verdict: techReviews.verdict,
      ratingPerformance: techReviews.ratingPerformance,
      ratingBuild: techReviews.ratingBuild,
      ratingValue: techReviews.ratingValue,
      ratingDesign: techReviews.ratingDesign,
      overallOverride: techReviews.overallOverride,
      publishedAt: techReviews.publishedAt,
      heroImageUrl: mediaAssets.url,
      heroImageAlt: mediaAssets.alt,
      productName: techProducts.name,
      productSlug: techProducts.slug,
      categoryName: techCategories.name,
      categorySlug: techCategories.slug,
    })
    .from(techReviews)
    .innerJoin(techProducts, eq(techReviews.productId, techProducts.id))
    .leftJoin(techCategories, eq(techProducts.categoryId, techCategories.id))
    .innerJoin(mediaAssets, eq(techReviews.heroImageId, mediaAssets.id))
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(limit)

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    overallRating: computeOverall(
      r.ratingPerformance,
      r.ratingBuild,
      r.ratingValue,
      r.ratingDesign,
      r.overallOverride,
    ),
    heroImageUrl: r.heroImageUrl,
    heroImageAlt: r.heroImageAlt,
    productName: r.productName,
    productSlug: r.productSlug,
    categoryName: r.categoryName,
    categorySlug: r.categorySlug,
    publishedAt: r.publishedAt!,
    excerpt: r.verdict.slice(0, 140),
  }))
}

export async function getLatestPublishedReviews(limit: number): Promise<PublicReviewCard[]> {
  return fetchCardRows(
    eq(techReviews.status, "published"),
    [desc(techReviews.publishedAt), desc(techReviews.id)],
    limit,
  )
}

// ========== Categories ==========

export async function listTopLevelCategoriesWithCounts(): Promise<TopCategoryTile[]> {
  const cats = await db
    .select({
      id: techCategories.id,
      name: techCategories.name,
      slug: techCategories.slug,
      sortOrder: techCategories.sortOrder,
    })
    .from(techCategories)
    .where(eq(techCategories.level, 1))
    .orderBy(asc(techCategories.sortOrder), asc(techCategories.name))

  if (cats.length === 0) return []

  const allCats = await db
    .select({ id: techCategories.id, parentId: techCategories.parentId })
    .from(techCategories)

  const childrenByParent = new Map<string, string[]>()
  for (const c of allCats) {
    if (!c.parentId) continue
    const list = childrenByParent.get(c.parentId) ?? []
    list.push(c.id)
    childrenByParent.set(c.parentId, list)
  }

  function descendants(rootId: string): string[] {
    const out: string[] = [rootId]
    const stack = [rootId]
    while (stack.length > 0) {
      const id = stack.pop()!
      const kids = childrenByParent.get(id) ?? []
      for (const k of kids) {
        out.push(k)
        stack.push(k)
      }
    }
    return out
  }

  const productRows = await db
    .select({ categoryId: techProducts.categoryId, total: count(techProducts.id) })
    .from(techProducts)
    .groupBy(techProducts.categoryId)
  const productCountMap = new Map(productRows.map((r) => [r.categoryId, Number(r.total)]))

  const reviewRows = await db
    .select({
      categoryId: techProducts.categoryId,
      total: count(techReviews.id),
    })
    .from(techReviews)
    .innerJoin(techProducts, eq(techReviews.productId, techProducts.id))
    .where(eq(techReviews.status, "published"))
    .groupBy(techProducts.categoryId)
  const reviewCountMap = new Map(reviewRows.map((r) => [r.categoryId, Number(r.total)]))

  return cats.map((c) => {
    const descIds = descendants(c.id)
    const productCount = descIds.reduce((acc, id) => acc + (productCountMap.get(id) ?? 0), 0)
    const reviewCount = descIds.reduce((acc, id) => acc + (reviewCountMap.get(id) ?? 0), 0)
    return { id: c.id, name: c.name, slug: c.slug, productCount, reviewCount }
  })
}

export async function getCategoryBySlug(slug: string) {
  const row = await db.query.techCategories.findFirst({ where: eq(techCategories.slug, slug) })
  return row ?? null
}

export async function getCategoryDescendantIds(slug: string): Promise<string[]> {
  const root = await getCategoryBySlug(slug)
  if (!root) return []
  const all = await db
    .select({ id: techCategories.id, parentId: techCategories.parentId })
    .from(techCategories)
  const childrenByParent = new Map<string, string[]>()
  for (const c of all) {
    if (!c.parentId) continue
    const list = childrenByParent.get(c.parentId) ?? []
    list.push(c.id)
    childrenByParent.set(c.parentId, list)
  }
  const out: string[] = [root.id]
  const stack = [root.id]
  while (stack.length > 0) {
    const id = stack.pop()!
    const kids = childrenByParent.get(id) ?? []
    for (const k of kids) {
      out.push(k)
      stack.push(k)
    }
  }
  return out
}

export async function getCategoryBreadcrumb(categoryId: string): Promise<BreadcrumbNode[]> {
  const all = await db
    .select({
      id: techCategories.id,
      name: techCategories.name,
      slug: techCategories.slug,
      parentId: techCategories.parentId,
      level: techCategories.level,
    })
    .from(techCategories)
  const byId = new Map(all.map((c) => [c.id, c]))
  const chain: BreadcrumbNode[] = []
  let cursor = byId.get(categoryId)
  while (cursor) {
    chain.unshift({ id: cursor.id, name: cursor.name, slug: cursor.slug, level: cursor.level })
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined
  }
  return chain
}

export async function listChildCategories(parentId: string) {
  return db
    .select({
      id: techCategories.id,
      name: techCategories.name,
      slug: techCategories.slug,
      sortOrder: techCategories.sortOrder,
    })
    .from(techCategories)
    .where(eq(techCategories.parentId, parentId))
    .orderBy(asc(techCategories.sortOrder), asc(techCategories.name))
}

export interface CategoryProductEntry {
  id: string
  name: string
  slug: string
  manufacturer: string | null
  heroImageUrl: string | null
  heroImageAlt: string | null
  reviewSlug: string | null
  reviewOverallRating: number | null
}

export async function listProductsForCategory(categoryIds: string[]): Promise<CategoryProductEntry[]> {
  if (categoryIds.length === 0) return []
  const rows = await db
    .select({
      product: techProducts,
      heroImageUrl: mediaAssets.url,
      heroImageAlt: mediaAssets.alt,
      reviewSlug: techReviews.slug,
      review: techReviews,
    })
    .from(techProducts)
    .leftJoin(mediaAssets, eq(techProducts.heroImageId, mediaAssets.id))
    .leftJoin(
      techReviews,
      and(eq(techReviews.productId, techProducts.id), eq(techReviews.status, "published")),
    )
    .where(inArray(techProducts.categoryId, categoryIds))
    .orderBy(asc(techProducts.name))

  return rows.map((r) => ({
    id: r.product.id,
    name: r.product.name,
    slug: r.product.slug,
    manufacturer: r.product.manufacturer,
    heroImageUrl: r.heroImageUrl,
    heroImageAlt: r.heroImageAlt,
    reviewSlug: r.reviewSlug,
    reviewOverallRating: r.review
      ? computeOverall(
          r.review.ratingPerformance,
          r.review.ratingBuild,
          r.review.ratingValue,
          r.review.ratingDesign,
          r.review.overallOverride,
        )
      : null,
  }))
}

// ========== Compare tool ==========

export interface PublicProductForCompare {
  id: string
  slug: string
  name: string
  manufacturer: string | null
  categoryId: string
  priceUsd: number | null
  releaseDate: string | null
  heroImageUrl: string | null
  heroImageAlt: string | null
  specs: PublicProductSpec[]
}

export async function getProductsBySlugs(slugs: string[]): Promise<PublicProductForCompare[]> {
  if (slugs.length === 0) return []
  const baseRows = await db
    .select({
      product: techProducts,
      heroImageUrl: mediaAssets.url,
      heroImageAlt: mediaAssets.alt,
    })
    .from(techProducts)
    .leftJoin(mediaAssets, eq(techProducts.heroImageId, mediaAssets.id))
    .where(inArray(techProducts.slug, slugs))

  if (baseRows.length === 0) return []
  const productIds = baseRows.map((b) => b.product.id)
  const specRows = await db
    .select({
      productId: techProductSpecs.productId,
      fieldId: techSpecFields.id,
      fieldName: techSpecFields.name,
      fieldType: techSpecFields.type,
      unit: techSpecFields.unit,
      sortOrder: techSpecFields.sortOrder,
      valueText: techProductSpecs.valueText,
      valueNumber: techProductSpecs.valueNumber,
      valueBoolean: techProductSpecs.valueBoolean,
    })
    .from(techProductSpecs)
    .innerJoin(techSpecFields, eq(techProductSpecs.fieldId, techSpecFields.id))
    .where(inArray(techProductSpecs.productId, productIds))
    .orderBy(asc(techSpecFields.sortOrder), asc(techSpecFields.name))

  const specsByProduct = new Map<string, PublicProductSpec[]>()
  for (const r of specRows) {
    const list = specsByProduct.get(r.productId) ?? []
    list.push({
      fieldId: r.fieldId,
      fieldName: r.fieldName,
      fieldType: r.fieldType,
      unit: r.unit,
      sortOrder: r.sortOrder,
      valueText: r.valueText,
      valueNumber: r.valueNumber !== null ? Number(r.valueNumber) : null,
      valueBoolean: r.valueBoolean,
    })
    specsByProduct.set(r.productId, list)
  }

  return slugs
    .map((s) => baseRows.find((b) => b.product.slug === s))
    .filter((b): b is (typeof baseRows)[number] => !!b)
    .map((b) => ({
      id: b.product.id,
      slug: b.product.slug,
      name: b.product.name,
      manufacturer: b.product.manufacturer,
      categoryId: b.product.categoryId,
      priceUsd: b.product.priceUsd !== null ? Number(b.product.priceUsd) : null,
      releaseDate: b.product.releaseDate,
      heroImageUrl: b.heroImageUrl,
      heroImageAlt: b.heroImageAlt,
      specs: specsByProduct.get(b.product.id) ?? [],
    }))
}

export async function getProductBySlugWithSpecs(slug: string): Promise<PublicProductForCompare | null> {
  const results = await getProductsBySlugs([slug])
  return results[0] ?? null
}

export async function getBenchmarkRunsForProducts(
  productIds: string[],
): Promise<PublicBenchmarkRun[]> {
  if (productIds.length === 0) return []

  // D-16 canonical form: DISTINCT ON (product_id, test_id, mode) filtered to superseded=false,
  // ordered by recorded_at DESC (newest canonical run wins per (product, test, mode) triple).
  //
  // The 3-column key means a (product, test) pair MAY appear twice in the result: once for
  // mode='ac' and once for mode='battery'. Callers that need only one mode filter the flat
  // list in-memory (e.g. /tech/compare is AC-only by editorial convention — it filters r.mode
  // === 'ac' in the caller). Phase 18 leaderboard needs both distinguishable.
  //
  // Postgres constraint: DISTINCT ON cols MUST lead ORDER BY in same order; the tie-breaker
  // (recordedAt DESC) is appended after. Re-ordering breaks with:
  //   "SELECT DISTINCT ON expressions must match initial ORDER BY expressions"
  const rows = await db
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
        sortOrder: techBenchmarkTests.sortOrder,
      },
    )
    .from(techBenchmarkRuns)
    .innerJoin(
      techBenchmarkTests,
      eq(techBenchmarkRuns.testId, techBenchmarkTests.id),
    )
    .where(and(
      inArray(techBenchmarkRuns.productId, productIds),
      eq(techBenchmarkRuns.superseded, false),
    ))
    .orderBy(
      asc(techBenchmarkRuns.productId),
      asc(techBenchmarkRuns.testId),
      asc(techBenchmarkRuns.mode),
      desc(techBenchmarkRuns.recordedAt),
    )

  // Post-sort by display order. DISTINCT ON requires the specific ORDER BY above,
  // so re-sort in memory for presentation.
  const sorted = rows.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.testName.localeCompare(b.testName)
  })

  // Public interface unchanged — mode is selected internally (for correct DISTINCT ON
  // semantics) but NOT exposed on PublicBenchmarkRun. Compare consumers that need one
  // mode must filter on the raw result OR this function can be wrapped in a mode-filtering
  // helper in a later phase. For /tech/compare today: the sitewide convention is AC-only
  // editorial runs (ARCHITECTURE.md §compare); once Phase 16 ingest ships battery runs,
  // compare UI will filter `r.mode === 'ac'` in the page server component (not here).
  return sorted.map((r) => ({
    productId: r.productId,
    testId: r.testId,
    testName: r.testName,
    unit: r.unit,
    direction: r.direction,
    score: Number(r.score),
    recordedAt: r.recordedAt,
  }))
}

export interface PublicProductPickerEntry {
  id: string
  slug: string
  name: string
  manufacturer: string | null
  categoryId: string
  categoryName: string
  heroImageUrl: string | null
}

export async function listAllPublishedProductsForPicker(): Promise<PublicProductPickerEntry[]> {
  const rows = await db
    .select({
      id: techProducts.id,
      slug: techProducts.slug,
      name: techProducts.name,
      manufacturer: techProducts.manufacturer,
      categoryId: techProducts.categoryId,
      categoryName: techCategories.name,
      heroImageUrl: mediaAssets.url,
    })
    .from(techProducts)
    .innerJoin(techCategories, eq(techProducts.categoryId, techCategories.id))
    .leftJoin(mediaAssets, eq(techProducts.heroImageId, mediaAssets.id))
    .orderBy(asc(techCategories.name), asc(techProducts.name))
  return rows
}

// ========== Homepage ==========

export interface BenchmarkSpotlight {
  productName: string
  productSlug: string
  manufacturer: string | null
  summary: string | null
  heroImageUrl: string | null
  topScores: Array<{ testName: string; unit: string; score: number }>
}

export async function getBenchmarkSpotlight(): Promise<BenchmarkSpotlight | null> {
  // Resolve the spotlight test via the rubric-map canonical key (D-17).
  // Renaming the test row in tech_benchmark_tests no longer breaks the spotlight —
  // the rubric-map constant is the source of truth.
  const spotlightEntry = RUBRIC_V1_1["cpu:geekbench6:multi"]
  if (!spotlightEntry) return null

  // Look up the test id by natural key (discipline, mode, name) — unique per v1.1 seed.
  const [spotlightTest] = await db
    .select({ id: techBenchmarkTests.id })
    .from(techBenchmarkTests)
    .where(and(
      eq(techBenchmarkTests.discipline, spotlightEntry.discipline),
      eq(techBenchmarkTests.mode, spotlightEntry.mode),
      eq(techBenchmarkTests.name, spotlightEntry.name),
    ))
    .limit(1)

  if (!spotlightTest) return null

  // Top AC run for this test, scoped to products with published reviews.
  // Spotlight is explicitly AC-only (editorial: homepage hero must be a single canonical score).
  const [candidate] = await db
    .select({
      productId: techBenchmarkRuns.productId,
      score: techBenchmarkRuns.score,
    })
    .from(techBenchmarkRuns)
    .innerJoin(techReviews, and(
      eq(techReviews.productId, techBenchmarkRuns.productId),
      eq(techReviews.status, "published"),
    ))
    .where(and(
      eq(techBenchmarkRuns.testId, spotlightTest.id),
      eq(techBenchmarkRuns.mode, "ac"),
      eq(techBenchmarkRuns.superseded, false),
    ))
    .orderBy(desc(techBenchmarkRuns.score))
    .limit(1)

  if (!candidate) return null
  const { productId } = candidate

  const productRow = await db
    .select({
      product: techProducts,
      heroImageUrl: mediaAssets.url,
    })
    .from(techProducts)
    .leftJoin(mediaAssets, eq(techProducts.heroImageId, mediaAssets.id))
    .where(eq(techProducts.id, productId))
    .limit(1)

  if (productRow.length === 0) return null
  const p = productRow[0]

  // Top 2 other AC runs for this product (keeps existing behavior).
  const topRuns = await db
    .select({
      testName: techBenchmarkTests.name,
      unit: techBenchmarkTests.unit,
      score: techBenchmarkRuns.score,
    })
    .from(techBenchmarkRuns)
    .innerJoin(
      techBenchmarkTests,
      eq(techBenchmarkRuns.testId, techBenchmarkTests.id),
    )
    .where(and(
      eq(techBenchmarkRuns.productId, productId),
      eq(techBenchmarkRuns.mode, "ac"),
      eq(techBenchmarkRuns.superseded, false),
    ))
    .orderBy(desc(techBenchmarkRuns.score))
    .limit(2)

  return {
    productName: p.product.name,
    productSlug: p.product.slug,
    manufacturer: p.product.manufacturer,
    summary: p.product.summary,
    heroImageUrl: p.heroImageUrl,
    topScores: topRuns.map((r) => ({
      testName: r.testName,
      unit: r.unit,
      score: Number(r.score),
    })),
  }
}
