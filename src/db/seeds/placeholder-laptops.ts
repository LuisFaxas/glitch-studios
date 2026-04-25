/**
 * Phase 29 placeholder reviews.
 *
 * status='placeholder' rows visible ONLY on /tech/categories/[slug]/rankings.
 * They exist so the leaderboard surface has realistic density at v4.0 launch
 * (only one real review — MBP 16 M5 Max from Phase 36 — ships at launch).
 *
 * To remove all placeholders: DELETE FROM tech_reviews WHERE status='placeholder';
 * (cascades to tech_benchmark_runs + tech_review_discipline_exclusions via FK).
 *
 * Authored by admin@faxas.net for easy bulk-management. Hero images use a single
 * shared placeholder asset; the table cell + mobile card render manufacturer-initial
 * fallback when the URL is the placeholder.
 *
 * Idempotent: re-running the seed updates existing rows by slug rather than inserting
 * duplicates. Benchmark runs are deleted-and-reinserted per product to keep the canonical
 * set in sync with this file.
 */

import type { Sql } from "postgres"

type SubCat = "gaming" | "ultrabook" | "workstation" | "budget"

interface PlaceholderRow {
  productSlug: string
  reviewSlug: string
  manufacturer: string
  model: string
  subCategory: SubCat
  cpuKind: "Apple Silicon" | "Intel" | "AMD"
  ramGb: number
  storageGb: number
  year: number
  priceUsd: number
  medal: "platinum" | "gold" | "silver" | "bronze" | null
  glitchmarkScore: string | null
  glitchmarkTestCount: number | null
  glitchmarkIsPartial: boolean
  bprScore: string | null
  scores: Partial<Record<TestKey, number>>
  exclusions?: Array<{ discipline: string; reason: string }>
}

type TestKey =
  | "cpu_gb6_multi"
  | "cpu_gb6_single"
  | "gpu_steel_nomad_light"
  | "llm_llama_tg128"
  | "storage_seq_read"
  | "battery_video_loop"
  | "thermal_retention"
  | "wireless_wifi_down"

const TEST_NAME_BY_KEY: Record<TestKey, string> = {
  cpu_gb6_multi: "Geekbench 6 Multi-Core",
  cpu_gb6_single: "Geekbench 6 Single-Core",
  gpu_steel_nomad_light: "3DMark Steel Nomad Light",
  llm_llama_tg128: "llama.cpp tg128",
  storage_seq_read: "AmorphousDiskMark Seq Read",
  battery_video_loop: "Video loop (local 1080p)",
  thermal_retention: "Cinebench 10-min loop retention",
  wireless_wifi_down: "iperf3 Wi-Fi down",
}

const TEST_MODE_BY_KEY: Record<TestKey, "ac" | "battery"> = {
  cpu_gb6_multi: "ac",
  cpu_gb6_single: "ac",
  gpu_steel_nomad_light: "ac",
  llm_llama_tg128: "ac",
  storage_seq_read: "ac",
  battery_video_loop: "battery",
  thermal_retention: "ac",
  wireless_wifi_down: "ac",
}

// Reference row scores (= reference_score values; reference device = GlitchMark 100).
const REFERENCE_SCORES: Record<TestKey, number> = {
  cpu_gb6_multi: 12000,
  cpu_gb6_single: 3100,
  gpu_steel_nomad_light: 4800,
  llm_llama_tg128: 38,
  storage_seq_read: 5200,
  battery_video_loop: 22,
  thermal_retention: 88,
  wireless_wifi_down: 1450,
}

const PLACEHOLDERS: PlaceholderRow[] = [
  {
    productSlug: "mbp-14-m3-ref",
    reviewSlug: "mbp-14-m3-ref-ph",
    manufacturer: "Apple",
    model: 'MacBook Pro 14" M3 (8-core)',
    subCategory: "ultrabook",
    cpuKind: "Apple Silicon",
    ramGb: 16,
    storageGb: 512,
    year: 2024,
    priceUsd: 1599,
    medal: "gold",
    glitchmarkScore: "100.00",
    glitchmarkTestCount: 18,
    glitchmarkIsPartial: false,
    bprScore: "0.7800",
    scores: {
      cpu_gb6_multi: 12000,
      cpu_gb6_single: 3100,
      gpu_steel_nomad_light: 4800,
      llm_llama_tg128: 38,
      storage_seq_read: 5200,
      battery_video_loop: 22,
      thermal_retention: 88,
      wireless_wifi_down: 1450,
    },
  },
  {
    productSlug: "rog-strix-g16-2026-placeholder",
    reviewSlug: "rog-strix-g16-2026-placeholder",
    manufacturer: "ASUS",
    model: "ROG Strix G16 (i9-14900HX / RTX 5070)",
    subCategory: "gaming",
    cpuKind: "Intel",
    ramGb: 32,
    storageGb: 1024,
    year: 2026,
    priceUsd: 2199,
    medal: "silver",
    glitchmarkScore: "142.50",
    glitchmarkTestCount: 18,
    glitchmarkIsPartial: false,
    bprScore: "0.7150",
    scores: {
      cpu_gb6_multi: 17500,
      cpu_gb6_single: 2950,
      gpu_steel_nomad_light: 9200,
      llm_llama_tg128: 52,
      storage_seq_read: 6400,
      battery_video_loop: 6.5,
      thermal_retention: 72,
      wireless_wifi_down: 1620,
    },
  },
  {
    productSlug: "tp-x1-carbon-g13-placeholder",
    reviewSlug: "tp-x1-carbon-g13-placeholder",
    manufacturer: "Lenovo",
    model: "ThinkPad X1 Carbon Gen 13",
    subCategory: "ultrabook",
    cpuKind: "Intel",
    ramGb: 16,
    storageGb: 512,
    year: 2025,
    priceUsd: 1799,
    medal: "bronze",
    glitchmarkScore: "84.20",
    glitchmarkTestCount: 18,
    glitchmarkIsPartial: false,
    bprScore: "0.6420",
    scores: {
      cpu_gb6_multi: 9800,
      cpu_gb6_single: 2600,
      gpu_steel_nomad_light: 3100,
      llm_llama_tg128: 28,
      storage_seq_read: 4900,
      battery_video_loop: 14,
      thermal_retention: 81,
      wireless_wifi_down: 1380,
    },
  },
  {
    productSlug: "framework-16-r9-placeholder",
    reviewSlug: "framework-16-r9-placeholder",
    manufacturer: "Framework",
    model: "Framework Laptop 16 (Ryzen 9 7940HS / RX 7700S)",
    subCategory: "workstation",
    cpuKind: "AMD",
    ramGb: 64,
    storageGb: 2048,
    year: 2025,
    priceUsd: 2499,
    medal: "silver",
    glitchmarkScore: "118.75",
    glitchmarkTestCount: 18,
    glitchmarkIsPartial: false,
    bprScore: "0.6940",
    scores: {
      cpu_gb6_multi: 14200,
      cpu_gb6_single: 2700,
      gpu_steel_nomad_light: 6800,
      llm_llama_tg128: 41,
      storage_seq_read: 5800,
      battery_video_loop: 9,
      thermal_retention: 78,
      wireless_wifi_down: 1490,
    },
  },
  {
    productSlug: "dell-xps-14-placeholder",
    reviewSlug: "dell-xps-14-placeholder",
    manufacturer: "Dell",
    model: "Dell XPS 14 (Core Ultra 7 / RTX 4050)",
    subCategory: "ultrabook",
    cpuKind: "Intel",
    ramGb: 32,
    storageGb: 1024,
    year: 2025,
    priceUsd: 1899,
    medal: "bronze",
    glitchmarkScore: "92.40",
    glitchmarkTestCount: 18,
    glitchmarkIsPartial: false,
    bprScore: "0.6580",
    scores: {
      cpu_gb6_multi: 11400,
      cpu_gb6_single: 2680,
      gpu_steel_nomad_light: 4200,
      llm_llama_tg128: 33,
      storage_seq_read: 5400,
      battery_video_loop: 11,
      thermal_retention: 76,
      wireless_wifi_down: 1410,
    },
  },
  {
    // Sparse row — deliberately misses GPU + LLM benchmarks (RANK-04 evidence).
    productSlug: "acer-swift-go-14-placeholder",
    reviewSlug: "acer-swift-go-14-placeholder",
    manufacturer: "Acer",
    model: "Acer Swift Go 14 (Ryzen 7 8845HS)",
    subCategory: "budget",
    cpuKind: "AMD",
    ramGb: 8,
    storageGb: 512,
    year: 2025,
    priceUsd: 899,
    medal: null,
    glitchmarkScore: null,
    glitchmarkTestCount: null,
    glitchmarkIsPartial: true,
    bprScore: null,
    scores: {
      cpu_gb6_multi: 8400,
      cpu_gb6_single: 2200,
      storage_seq_read: 4100,
      battery_video_loop: 13,
    },
    exclusions: [
      { discipline: "gpu", reason: "device_class_exempt" },
      { discipline: "llm", reason: "no_hardware" },
    ],
  },
]

const PLACEHOLDER_HERO_URL = "https://placehold.co/1200x800/0a0a0a/f5f5f0?text=Placeholder+Laptop"
const PLACEHOLDER_VERDICT =
  "Placeholder review for v4.0 leaderboard density. Replace with real review when this product is benchmarked."
const PLACEHOLDER_BODY = "<p>Placeholder body — see Phase 29 seed.</p>"

export interface SeedSummary {
  productsUpserted: number
  reviewsUpserted: number
  runsInserted: number
  exclusionsInserted: number
  specRowsInserted: number
}

export async function seedPlaceholderLaptops(sql: Sql): Promise<SeedSummary> {
  const summary: SeedSummary = {
    productsUpserted: 0,
    reviewsUpserted: 0,
    runsInserted: 0,
    exclusionsInserted: 0,
    specRowsInserted: 0,
  }

  // 1. Resolve reviewer.
  const reviewers = await sql<{ id: string }[]>`
    SELECT id FROM "user" WHERE email='admin@faxas.net' LIMIT 1
  `
  if (reviewers.length === 0) {
    throw new Error(
      "No reviewer found (looked for admin@faxas.net). Provision admin user first.",
    )
  }
  const reviewerId = reviewers[0].id

  // 2. Resolve laptops category.
  const cats = await sql<{ id: string }[]>`
    SELECT id FROM tech_categories WHERE slug='laptops' LIMIT 1
  `
  if (cats.length === 0) {
    throw new Error("Laptops category not found. Run base seed first.")
  }
  const laptopsCategoryId = cats[0].id

  // 3. Resolve / create spec template + fields.
  let templateId: string
  const templates = await sql<{ id: string }[]>`
    SELECT id FROM tech_spec_templates WHERE category_id=${laptopsCategoryId} LIMIT 1
  `
  if (templates.length > 0) {
    templateId = templates[0].id
  } else {
    const [created] = await sql<{ id: string }[]>`
      INSERT INTO tech_spec_templates (category_id) VALUES (${laptopsCategoryId})
      RETURNING id
    `
    templateId = created.id
  }

  const SPEC_DEFS = [
    { name: "cpu_kind", type: "text" as const, unit: null as string | null },
    { name: "ram_gb", type: "number" as const, unit: "GB" },
    { name: "storage_gb", type: "number" as const, unit: "GB" },
    { name: "sub_category_slug", type: "text" as const, unit: null as string | null },
  ]
  const specFieldIdByName = new Map<string, string>()
  for (let i = 0; i < SPEC_DEFS.length; i++) {
    const def = SPEC_DEFS[i]
    const existing = await sql<{ id: string }[]>`
      SELECT id FROM tech_spec_fields
      WHERE template_id=${templateId} AND name=${def.name}
      LIMIT 1
    `
    let fieldId: string
    if (existing.length > 0) {
      fieldId = existing[0].id
    } else {
      const [row] = await sql<{ id: string }[]>`
        INSERT INTO tech_spec_fields (template_id, name, type, unit, sort_order)
        VALUES (${templateId}, ${def.name}, ${def.type}, ${def.unit}, ${i})
        RETURNING id
      `
      fieldId = row.id
    }
    specFieldIdByName.set(def.name, fieldId)
  }

  // 4. Resolve / create shared hero image.
  let heroImageId: string
  const existingHero = await sql<{ id: string }[]>`
    SELECT id FROM media_assets WHERE key='phase29/placeholder-laptop' LIMIT 1
  `
  if (existingHero.length > 0) {
    heroImageId = existingHero[0].id
  } else {
    const [hero] = await sql<{ id: string }[]>`
      INSERT INTO media_assets (filename, key, url, mime_type, size, width, height, alt, uploaded_by)
      VALUES (
        'placeholder-laptop.jpg',
        'phase29/placeholder-laptop',
        ${PLACEHOLDER_HERO_URL},
        'image/jpeg',
        1000, 1200, 800,
        'Placeholder laptop hero',
        ${reviewerId}
      )
      RETURNING id
    `
    heroImageId = hero.id
  }

  // 5. Resolve test ids by name.
  const testIdByKey = new Map<TestKey, string>()
  for (const [key, name] of Object.entries(TEST_NAME_BY_KEY) as Array<[TestKey, string]>) {
    const rows = await sql<{ id: string }[]>`
      SELECT id FROM tech_benchmark_tests WHERE name=${name} LIMIT 1
    `
    if (rows.length === 0) {
      throw new Error(
        `Benchmark test not found: ${name} (rubric expected). Run base rubric seed first.`,
      )
    }
    testIdByKey.set(key, rows[0].id)
  }

  // 6. Set reference_score on the leaderboard's default benchmark tests so the
  //    GlitchMark formula has a baseline. Idempotent (UPDATE).
  for (const [key, value] of Object.entries(REFERENCE_SCORES) as Array<[TestKey, number]>) {
    const testId = testIdByKey.get(key)
    if (!testId) continue
    await sql`
      UPDATE tech_benchmark_tests
      SET reference_score = ${value}
      WHERE id=${testId}
    `
  }

  // 7. Upsert each placeholder.
  for (const row of PLACEHOLDERS) {
    // 7a. Product (UPSERT on slug).
    const existingProduct = await sql<{ id: string }[]>`
      SELECT id FROM tech_products WHERE slug=${row.productSlug} LIMIT 1
    `
    let productId: string
    if (existingProduct.length > 0) {
      productId = existingProduct[0].id
      await sql`
        UPDATE tech_products
        SET name=${row.model},
            manufacturer=${row.manufacturer},
            hero_image_id=${heroImageId},
            price_usd=${row.priceUsd.toString()},
            release_date=${`${row.year}-01-01`},
            updated_at=now()
        WHERE id=${productId}
      `
    } else {
      const [created] = await sql<{ id: string }[]>`
        INSERT INTO tech_products (
          category_id, name, slug, manufacturer, hero_image_id,
          price_usd, release_date
        )
        VALUES (
          ${laptopsCategoryId}, ${row.model}, ${row.productSlug}, ${row.manufacturer},
          ${heroImageId}, ${row.priceUsd.toString()}, ${`${row.year}-01-01`}
        )
        RETURNING id
      `
      productId = created.id
    }
    summary.productsUpserted++

    // 7b. Spec rows (delete + reinsert per product for simplicity).
    await sql`DELETE FROM tech_product_specs WHERE product_id=${productId}`
    const specInserts = [
      { name: "cpu_kind", valueText: row.cpuKind, valueNumber: null as number | null },
      { name: "ram_gb", valueText: null as string | null, valueNumber: row.ramGb },
      { name: "storage_gb", valueText: null as string | null, valueNumber: row.storageGb },
      { name: "sub_category_slug", valueText: row.subCategory, valueNumber: null as number | null },
    ]
    for (const s of specInserts) {
      const fieldId = specFieldIdByName.get(s.name)
      if (!fieldId) continue
      await sql`
        INSERT INTO tech_product_specs (product_id, field_id, value_text, value_number)
        VALUES (
          ${productId}, ${fieldId}, ${s.valueText},
          ${s.valueNumber !== null ? s.valueNumber.toString() : null}
        )
      `
      summary.specRowsInserted++
    }

    // 7c. Review (UPSERT on slug).
    const existingReview = await sql<{ id: string }[]>`
      SELECT id FROM tech_reviews WHERE slug=${row.reviewSlug} LIMIT 1
    `
    let reviewId: string
    if (existingReview.length > 0) {
      reviewId = existingReview[0].id
      await sql`
        UPDATE tech_reviews SET
          product_id=${productId},
          reviewer_id=${reviewerId},
          title=${row.model},
          status='placeholder',
          verdict=${PLACEHOLDER_VERDICT},
          body_html=${PLACEHOLDER_BODY},
          rating_performance=4, rating_build=4, rating_value=4, rating_design=4,
          hero_image_id=${heroImageId},
          published_at=NULL,
          bpr_score=${row.bprScore},
          bpr_tier=${row.medal},
          bpr_discipline_count=${row.medal ? 7 : 0},
          glitchmark_score=${row.glitchmarkScore},
          glitchmark_test_count=${row.glitchmarkTestCount},
          glitchmark_is_partial=${row.glitchmarkIsPartial},
          glitchmark_version='v1',
          updated_at=now()
        WHERE id=${reviewId}
      `
    } else {
      const [created] = await sql<{ id: string }[]>`
        INSERT INTO tech_reviews (
          product_id, reviewer_id, title, slug, verdict, body_html,
          rating_performance, rating_build, rating_value, rating_design,
          hero_image_id, status,
          bpr_score, bpr_tier, bpr_discipline_count,
          glitchmark_score, glitchmark_test_count, glitchmark_is_partial, glitchmark_version
        )
        VALUES (
          ${productId}, ${reviewerId}, ${row.model}, ${row.reviewSlug},
          ${PLACEHOLDER_VERDICT}, ${PLACEHOLDER_BODY},
          4, 4, 4, 4,
          ${heroImageId}, 'placeholder',
          ${row.bprScore}, ${row.medal}, ${row.medal ? 7 : 0},
          ${row.glitchmarkScore}, ${row.glitchmarkTestCount}, ${row.glitchmarkIsPartial}, 'v1'
        )
        RETURNING id
      `
      reviewId = created.id
    }
    summary.reviewsUpserted++

    // 7d. Benchmark runs (delete + reinsert canonical for this product).
    await sql`
      DELETE FROM tech_benchmark_runs
      WHERE product_id=${productId}
    `
    for (const [key, score] of Object.entries(row.scores) as Array<[TestKey, number]>) {
      const testId = testIdByKey.get(key)
      if (!testId) continue
      const mode = TEST_MODE_BY_KEY[key]
      await sql`
        INSERT INTO tech_benchmark_runs (
          product_id, test_id, mode, run_uuid, rubric_version, superseded,
          source_file, score, recorded_at, created_by
        )
        VALUES (
          ${productId}, ${testId}, ${mode}, gen_random_uuid(), '1.1', false,
          'phase29-placeholder', ${score.toString()}, now(), ${reviewerId}
        )
      `
      summary.runsInserted++
    }

    // 7e. Discipline exclusions (delete + reinsert).
    await sql`DELETE FROM tech_review_discipline_exclusions WHERE review_id=${reviewId}`
    if (row.exclusions) {
      for (const ex of row.exclusions) {
        await sql`
          INSERT INTO tech_review_discipline_exclusions (review_id, discipline, reason)
          VALUES (${reviewId}, ${ex.discipline}, ${ex.reason})
        `
        summary.exclusionsInserted++
      }
    }
  }

  return summary
}
