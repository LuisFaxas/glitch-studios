// Applies the Phase 48 order_items price_cents compatibility migration.
// Mirrors the existing direct postgres-js migration runners.

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
  "src/db/migrations/0010_order_items_price_cents.sql"
)

async function main() {
  console.log(`Reading Phase 48 order item migration: ${SQL_FILE}`)
  const migrationSql = await readFile(SQL_FILE, "utf8")
  const sql = postgres(DATABASE_URL, { max: 1, ssl: "require" })

  try {
    console.log("Applying Phase 48 order item migration...")
    await sql.unsafe(migrationSql)

    const [priceCentsColumn] = await sql`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'order_items'
        AND column_name = 'price_cents'
    `

    if (!priceCentsColumn || priceCentsColumn.is_nullable !== "NO") {
      throw new Error("order_items.price_cents is missing or nullable")
    }

    console.log("order_items.price_cents confirmed NOT NULL.")
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
