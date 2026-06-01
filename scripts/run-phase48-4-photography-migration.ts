// Standalone runner — Phase 48.4 services mono-stack redesign.
// 1) Applies src/db/migrations/0011_phase48-4_photography.sql (enum ADD VALUE, standalone).
// 2) After the enum commits, upserts the Photography service row and reorders
//    sortOrder so the live order is audio -> visual -> custom.
// Mirrors the Phase 26-29 runner pattern (postgres-js, no drizzle-kit migrate).
//
// Idempotent: ALTER TYPE ... ADD VALUE IF NOT EXISTS + INSERT ... ON CONFLICT (slug) DO UPDATE.
// Safe to run multiple times. The enum ALTER commits before any statement uses
// 'photography', satisfying Postgres' "cannot use new enum value in same txn" rule.

import postgres from "postgres"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const DATABASE_URL = (process.env.DATABASE_URL ?? "").trim()
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required (set in .env.local)")
  process.exit(1)
}

const SQL_FILE = resolve(
  process.cwd(),
  "src/db/migrations/0011_phase48-4_photography.sql"
)

const PHOTOGRAPHY = {
  name: "Photography",
  slug: "photography",
  type: "photography",
  description:
    "Press shots, cover art, and behind-the-scenes photography. Shot in-studio or on location, lit and retouched to release standard, and delivered in print- and web-ready formats.",
  shortDescription:
    "Press shots, cover art, and behind-the-scenes photography.",
  priceLabel: "From $250/project",
  features: [
    "Studio or on-location shoot",
    "Professional lighting setup",
    "Retouching included",
    "Press- and cover-ready exports",
    "Print- and web-optimized files",
  ],
  ctaText: "Get a Quote",
  sortOrder: 4,
}

// Locked audio -> visual -> custom order (B2.9). Recording(0)/Mixing(1) unchanged.
const SORT_ORDER: Record<string, number> = {
  "sfx-design": 2,
  "video-production": 3,
  "graphic-design": 5,
}

async function main() {
  const sql = await readFile(SQL_FILE, "utf8")
  const client = postgres(DATABASE_URL, { max: 1, ssl: "require" })
  try {
    console.log("Applying 0011 enum migration (service_type += photography)...")
    await client.unsafe(sql)

    const enumValues = (await client`
      SELECT unnest(enum_range(NULL::service_type))::text AS value
    `) as Array<{ value: string }>
    if (!enumValues.map((r) => r.value).includes("photography")) {
      throw new Error("'photography' enum value missing after migration")
    }
    console.log("  service_type enum now includes 'photography'.")

    console.log("Upserting Photography service row...")
    await client`
      INSERT INTO services
        (name, slug, type, description, short_description, price_label, features, cta_text, sort_order, is_active)
      VALUES
        (${PHOTOGRAPHY.name}, ${PHOTOGRAPHY.slug}, ${PHOTOGRAPHY.type}, ${PHOTOGRAPHY.description},
         ${PHOTOGRAPHY.shortDescription}, ${PHOTOGRAPHY.priceLabel}, ${PHOTOGRAPHY.features},
         ${PHOTOGRAPHY.ctaText}, ${PHOTOGRAPHY.sortOrder}, true)
      ON CONFLICT (slug) DO UPDATE SET
        type = EXCLUDED.type,
        description = EXCLUDED.description,
        short_description = EXCLUDED.short_description,
        price_label = EXCLUDED.price_label,
        features = EXCLUDED.features,
        cta_text = EXCLUDED.cta_text,
        sort_order = EXCLUDED.sort_order,
        is_active = EXCLUDED.is_active,
        updated_at = now()
    `
    console.log("  Photography row upserted.")

    console.log("Reordering existing services to audio -> visual -> custom...")
    for (const [slug, order] of Object.entries(SORT_ORDER)) {
      await client`
        UPDATE services SET sort_order = ${order}, updated_at = now()
        WHERE slug = ${slug}
      `
    }

    const rows = (await client`
      SELECT slug, sort_order FROM services WHERE is_active = true ORDER BY sort_order ASC
    `) as Array<{ slug: string; sort_order: number }>
    console.log("  Active services order:")
    for (const r of rows) console.log(`    ${r.sort_order}  ${r.slug}`)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
