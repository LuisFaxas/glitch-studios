// Standalone runner — applies src/db/migrations/0006_phase26_auth.sql.
// Mirrors the Phase 15 / Phase 25 pattern (postgres-js, no drizzle-kit migrate).
// Idempotent: the migration uses IF NOT EXISTS + meta-table guard.

import postgres from "postgres"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const DATABASE_URL = (process.env.DATABASE_URL ?? "").trim()
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required (set in .env.local)")
  process.exit(1)
}

const SQL_FILE = resolve(process.cwd(), "src/db/migrations/0006_phase26_auth.sql")

async function main() {
  console.log(`Reading migration: ${SQL_FILE}`)
  const sql = await readFile(SQL_FILE, "utf8")

  const client = postgres(DATABASE_URL, { max: 1, ssl: "require" })
  try {
    console.log("Applying migration...")
    await client.unsafe(sql)
    console.log("Migration applied successfully.")

    const [tableCheck] = await client`
      SELECT to_regclass('public.artist_applications') AS exists
    `
    console.log(`artist_applications table: ${tableCheck.exists ? "EXISTS" : "MISSING"}`)

    const metaRows = await client`
      SELECT key, value FROM phase26_migration_meta WHERE key = 'grandfather_email_verified'
    `
    console.log(
      `grandfather meta row: ${metaRows.length > 0 ? `applied at ${metaRows[0].value}` : "MISSING"}`,
    )
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
