import { test, expect } from "@playwright/test"
import * as fs from "node:fs"
import * as path from "node:path"

const SCHEMA = fs.readFileSync(
  path.resolve("src/db/schema.ts"),
  "utf8",
)

const MIGRATION = fs.readFileSync(
  path.resolve("src/db/migrations/0005_phase25_indexes.sql"),
  "utf8",
)

test.describe("25-02 Schema index coverage + migration", () => {
  const required = [
    "idx_account_user",
    "idx_session_user",
    "idx_blog_posts_category",
    "idx_orders_user",
    "idx_order_items_order",
    "idx_bundle_beats_bundle",
    "idx_bookings_user",
    "idx_bookings_service",
    "idx_tech_reviews_product",
    "idx_tech_benchmark_runs_product",
  ]

  for (const name of required) {
    test(`schema declares ${name}`, () => {
      expect(SCHEMA).toContain(name)
    })

    test(`migration creates ${name}`, () => {
      expect(MIGRATION).toContain(name)
    })
  }

  test("schema imports index from drizzle-orm/pg-core", () => {
    expect(SCHEMA).toMatch(/import[\s\S]*\bindex\b[\s\S]*from\s+"drizzle-orm\/pg-core"/)
  })

  test("migration only contains CREATE INDEX statements (non-destructive)", () => {
    const lines = MIGRATION.split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("--"))
    for (const line of lines) {
      expect(line.toUpperCase()).toMatch(/^(CREATE INDEX|;$)/)
    }
  })
})
