/**
 * Rubric v1.1 seed. Idempotent via natural-key UNIQUE (template_id, discipline, mode, name).
 *
 * Run:
 *   pnpm tsx src/db/seeds/rubric-v1.1.ts
 *
 * Append-only (D-14). Never uses onConflictDoUpdate — a mistake here means rubric v1.2.
 *
 * Drizzle 0.45.x note: `onConflictDoNothing()` takes NO parameters. Only `onConflictDoUpdate`
 * accepts `{ target: [...] }`. The natural-key UNIQUE index on
 *   (template_id, discipline, mode, name)
 * is the only constraint this INSERT can violate, so Postgres selects it automatically.
 */
// Load env vars from .env.local (Next.js convention) — dotenv is a transitive dep but
// not declared in package.json; use the ambient require path that tsx resolves.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv")
dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { eq } from "drizzle-orm"
import * as schema from "../schema"
import { RUBRIC_V1_1 } from "../../lib/tech/rubric-map"

async function main() {
  const client = postgres(process.env.DATABASE_URL!)
  const db = drizzle(client, { schema })

  try {
    // 1. Locate or create the Laptops category.
    //    Normally seeded by Phase 07.5; if absent (fresh DB) we create it here so the
    //    rubric seed is self-contained and idempotent from scratch. (Rule 3 auto-fix)
    let [laptops] = await db
      .select({ id: schema.techCategories.id })
      .from(schema.techCategories)
      .where(eq(schema.techCategories.slug, "laptops"))
      .limit(1)

    if (!laptops) {
      const [inserted] = await db
        .insert(schema.techCategories)
        .values({ level: 1, name: "Laptops", slug: "laptops", sortOrder: 1 })
        .returning({ id: schema.techCategories.id })
      laptops = inserted
      console.log(`Created Laptops category: ${laptops.id}`)
    }

    // 2. Locate (or create) the benchmark template for Laptops.
    let [template] = await db
      .select({ id: schema.techBenchmarkTemplates.id })
      .from(schema.techBenchmarkTemplates)
      .where(eq(schema.techBenchmarkTemplates.categoryId, laptops.id))
      .limit(1)

    if (!template) {
      const [inserted] = await db
        .insert(schema.techBenchmarkTemplates)
        .values({ categoryId: laptops.id })
        .returning({ id: schema.techBenchmarkTemplates.id })
      template = inserted
      console.log(`Created benchmark template for Laptops category: ${template.id}`)
    }

    // 3. Build row list from RUBRIC_V1_1.
    const rows = Object.values(RUBRIC_V1_1).map((r) => ({
      templateId: template.id,
      name: r.name,
      unit: r.unit,
      direction: r.direction,
      sortOrder: r.sortOrder,
      discipline: r.discipline,
      mode: r.mode,
      bprEligible: r.bprEligible,
    }))

    // 4. Insert with plain onConflictDoNothing() — Drizzle 0.45.x signature.
    //    Postgres auto-picks the only relevant UNIQUE: the natural-key index
    //    on (template_id, discipline, mode, name) created in plan 01.
    //    APPEND-ONLY: no onConflictDoUpdate. A mistake requires rubric v1.2 (D-14).
    const result = await db
      .insert(schema.techBenchmarkTests)
      .values(rows)
      .onConflictDoNothing()
      .returning({ id: schema.techBenchmarkTests.id })

    const inserted = result.length
    const skipped = rows.length - inserted
    console.log(
      `Rubric v1.1 seed: inserted ${inserted}, skipped ${skipped}, total ${rows.length}`
    )
  } finally {
    await client.end()
  }

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
