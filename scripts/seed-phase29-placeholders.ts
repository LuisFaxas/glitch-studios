// Standalone seed runner — inserts/updates 6 placeholder laptop reviews + benchmark runs
// + spec rows + exclusions for Phase 29 master leaderboard.
// Idempotent: re-running upserts by slug.

import postgres from "postgres"
import { seedPlaceholderLaptops } from "../src/db/seeds/placeholder-laptops"

const DATABASE_URL = (process.env.DATABASE_URL ?? "").trim()
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required (set in .env.local)")
  process.exit(1)
}

async function main() {
  const sql = postgres(DATABASE_URL, { max: 1, ssl: "require" })
  try {
    console.log("Seeding Phase 29 placeholder laptops...")
    const summary = await seedPlaceholderLaptops(sql)
    console.log("Phase 29 placeholder seed complete:")
    console.log(`  products upserted:  ${summary.productsUpserted}`)
    console.log(`  reviews upserted:   ${summary.reviewsUpserted}`)
    console.log(`  spec rows:          ${summary.specRowsInserted}`)
    console.log(`  benchmark runs:     ${summary.runsInserted}`)
    console.log(`  exclusions:         ${summary.exclusionsInserted}`)
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
