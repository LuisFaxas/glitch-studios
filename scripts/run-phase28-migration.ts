// Standalone runner — applies src/db/migrations/0008_phase28_glitchmark.sql.
// Mirrors the Phase 15 / Phase 25 / Phase 26 / Phase 27 pattern (postgres-js, no drizzle-kit migrate).
// Idempotent: the migration uses ALTER TABLE ... ADD COLUMN IF NOT EXISTS + CREATE TABLE IF NOT EXISTS.

import postgres from "postgres"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const DATABASE_URL = (process.env.DATABASE_URL ?? "").trim()
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required (set in .env.local)")
  process.exit(1)
}

const SQL_FILE = resolve(process.cwd(), "src/db/migrations/0008_phase28_glitchmark.sql")

async function main() {
  console.log(`Reading migration: ${SQL_FILE}`)
  const sql = await readFile(SQL_FILE, "utf8")

  const client = postgres(DATABASE_URL, { max: 1, ssl: "require" })
  try {
    console.log("Applying migration...")
    await client.unsafe(sql)
    console.log("Migration applied successfully.")

    const [historyCheck] = await client`
      SELECT to_regclass('public.tech_glitchmark_history') AS exists
    `
    console.log(`tech_glitchmark_history table: ${historyCheck.exists ? "EXISTS" : "MISSING"}`)

    const [columnCheck] = (await client`
      SELECT count(*)::int AS present
      FROM information_schema.columns
      WHERE table_name = 'tech_reviews'
        AND column_name IN (
          'glitchmark_score', 'glitchmark_test_count',
          'glitchmark_is_partial', 'glitchmark_version'
        )
    `) as Array<{ present: number }>
    console.log(`tech_reviews glitchmark columns: ${columnCheck.present}/4 present`)

    const [refCheck] = (await client`
      SELECT count(*)::int AS present
      FROM information_schema.columns
      WHERE table_name = 'tech_benchmark_tests'
        AND column_name = 'reference_score'
    `) as Array<{ present: number }>
    console.log(`tech_benchmark_tests reference_score: ${refCheck.present === 1 ? "PRESENT" : "MISSING"}`)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
