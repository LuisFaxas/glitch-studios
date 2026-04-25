// Standalone runner — applies src/db/migrations/0009_phase29_placeholder_status.sql.
// Mirrors the Phase 26/27/28 pattern (postgres-js, no drizzle-kit migrate).
// Idempotent: the migration uses ALTER TYPE ... ADD VALUE IF NOT EXISTS + ON CONFLICT DO NOTHING.
//
// IMPORTANT: ALTER TYPE ... ADD VALUE cannot share a transaction with statements that USE
// the new enum value. client.unsafe(sql) runs each top-level statement on its own implicit
// transaction, so seeding the placeholder rows in scripts/seed-phase29-placeholders.ts
// (a separate command) is safe.

import postgres from "postgres"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const DATABASE_URL = (process.env.DATABASE_URL ?? "").trim()
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required (set in .env.local)")
  process.exit(1)
}

const SQL_FILE = resolve(process.cwd(), "src/db/migrations/0009_phase29_placeholder_status.sql")

async function main() {
  console.log(`Reading Phase 29 placeholder status migration: ${SQL_FILE}`)
  const sql = await readFile(SQL_FILE, "utf8")

  const client = postgres(DATABASE_URL, { max: 1, ssl: "require" })
  try {
    console.log("Applying Phase 29 placeholder status migration...")
    await client.unsafe(sql)
    console.log("Phase 29 placeholder status migration applied successfully.")

    const enumValues = (await client`
      SELECT unnest(enum_range(NULL::tech_review_status))::text AS value
    `) as Array<{ value: string }>
    const values = enumValues.map((r) => r.value)
    console.log(`tech_review_status enum values: ${values.join(", ")}`)
    if (!values.includes("placeholder")) {
      throw new Error("'placeholder' enum value missing after migration")
    }
    console.log("'placeholder' enum value confirmed.")

    const [metaCheck] = await client`
      SELECT to_regclass('public.phase29_migration_meta') AS exists
    `
    console.log(`phase29_migration_meta table: ${metaCheck.exists ? "EXISTS" : "MISSING"}`)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
