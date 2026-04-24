import postgres from "postgres"
import { readFileSync } from "node:fs"

const url = (process.env.DATABASE_URL ?? "").trim()
if (!url) { console.error("DATABASE_URL not set"); process.exit(1) }

const sql = postgres(url, { max: 1, ssl: "require" })

const migration = readFileSync(
  "src/db/migrations/0005_phase25_indexes.sql",
  "utf8",
)

const statements = migration
  .split(";")
  .map(s => s.trim())
  .filter(s => s && !s.startsWith("--"))

console.log(`Applying ${statements.length} statements...`)

let applied = 0
for (const stmt of statements) {
  try {
    await sql.unsafe(stmt)
    const idxName = stmt.match(/"(idx_[a-z_]+)"/)?.[1] ?? "(unknown)"
    console.log(`  ✓ ${idxName}`)
    applied++
  } catch (err) {
    console.error(`  ✗ ${stmt.slice(0, 80)}... — ${err.message}`)
  }
}

console.log("")
console.log(`Applied ${applied}/${statements.length} indexes.`)

console.log("\n=== Verify: list all idx_* indexes ===")
const rows = await sql`
  SELECT schemaname, indexname, tablename
  FROM pg_indexes
  WHERE indexname LIKE 'idx_%'
  ORDER BY tablename, indexname
`
for (const r of rows) {
  console.log(`  ${r.tablename.padEnd(30)} ${r.indexname}`)
}
console.log(`\nTotal idx_* indexes in DB: ${rows.length}`)

await sql.end()
