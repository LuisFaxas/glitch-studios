/**
 * Apply migration 0004_bpr_discipline_count.sql via direct postgres-js script.
 * Same pattern as the Phase 15 0003_methodology_lock apply script.
 *
 * Usage: pnpm tsx scripts/apply-0004-migration.ts
 */
import postgres from "postgres"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL not set")
  }
  const sql = postgres(url, { max: 1 })
  try {
    const migrationPath = resolve(
      process.cwd(),
      "src/db/migrations/0004_bpr_discipline_count.sql",
    )
    const ddl = readFileSync(migrationPath, "utf8")
    console.log("Applying 0004_bpr_discipline_count.sql")
    await sql.unsafe(ddl)
    const [{ count }] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM information_schema.columns
      WHERE table_name = 'tech_reviews' AND column_name = 'bpr_discipline_count'
    `
    if (count !== "1") {
      throw new Error(`expected bpr_discipline_count column, got count=${count}`)
    }
    console.log("✓ bpr_discipline_count column present on tech_reviews")
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
