/**
 * Phase 09 Wave 0 audit: measure portfolio<->service match coverage across
 * three candidate conventions to lock the Wave 3 Example Work query shape.
 *
 * Usage: pnpm exec tsx scripts/09-portfolio-service-match-audit.ts
 *
 * Emits JSON on stdout. Falls back to seed file analysis if DB is unreachable.
 */
import dotenv from "dotenv"
import path from "node:path"
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })
import fs from "fs"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { asc, eq } from "drizzle-orm"
import { services, portfolioItems } from "@/db/schema"

type ServiceRow = {
  id: string
  name: string
  slug: string
  type: string
}
type PortfolioRow = {
  id: string
  title: string
  type: string
  category: string | null
  isFeatured: boolean | null
  sortOrder: number | null
}

type PerServiceReport = {
  service: { slug: string; type: string }
  match_by_type_count: number
  match_by_slug_as_category_count: number
  match_by_type_as_category_count: number
  union_count: number
  sample_matches: { id: string; title: string; via: string }[]
}

type Report = {
  mode: "db" | "seed"
  services_total: number
  portfolio_items_total: number
  per_service: PerServiceReport[]
  overall_coverage: {
    services_with_at_least_one_union_match: number
    services_with_zero_matches: number
  }
}

function analyze(
  svcs: ServiceRow[],
  items: PortfolioRow[],
  mode: "db" | "seed"
): Report {
  const perService: PerServiceReport[] = []
  let withMatch = 0
  let withoutMatch = 0

  for (const s of svcs) {
    const byType = items.filter((p) => p.type === s.type)
    const bySlugAsCat = items.filter((p) => p.category === s.slug)
    const byTypeAsCat = items.filter((p) => p.category === s.type)

    const unionIds = new Set<string>()
    const samples: { id: string; title: string; via: string }[] = []
    for (const p of byType) {
      if (!unionIds.has(p.id)) {
        unionIds.add(p.id)
        if (samples.length < 3)
          samples.push({ id: p.id, title: p.title, via: "type" })
      }
    }
    for (const p of bySlugAsCat) {
      if (!unionIds.has(p.id)) {
        unionIds.add(p.id)
        if (samples.length < 3)
          samples.push({ id: p.id, title: p.title, via: "slug-as-category" })
      }
    }
    for (const p of byTypeAsCat) {
      if (!unionIds.has(p.id)) {
        unionIds.add(p.id)
        if (samples.length < 3)
          samples.push({ id: p.id, title: p.title, via: "type-as-category" })
      }
    }

    perService.push({
      service: { slug: s.slug, type: s.type },
      match_by_type_count: byType.length,
      match_by_slug_as_category_count: bySlugAsCat.length,
      match_by_type_as_category_count: byTypeAsCat.length,
      union_count: unionIds.size,
      sample_matches: samples,
    })

    if (unionIds.size > 0) withMatch++
    else withoutMatch++
  }

  return {
    mode,
    services_total: svcs.length,
    portfolio_items_total: items.length,
    per_service: perService,
    overall_coverage: {
      services_with_at_least_one_union_match: withMatch,
      services_with_zero_matches: withoutMatch,
    },
  }
}

async function runDb(): Promise<Report> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL not set")

  const client = postgres(databaseUrl, { max: 1, idle_timeout: 5 })
  try {
    const db = drizzle(client, { schema: { services, portfolioItems } })

    const svcs = (await db
      .select({
        id: services.id,
        name: services.name,
        slug: services.slug,
        type: services.type,
      })
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder))) as ServiceRow[]

    const items = (await db
      .select({
        id: portfolioItems.id,
        title: portfolioItems.title,
        type: portfolioItems.type,
        category: portfolioItems.category,
        isFeatured: portfolioItems.isFeatured,
        sortOrder: portfolioItems.sortOrder,
      })
      .from(portfolioItems)
      .where(eq(portfolioItems.isActive, true))) as PortfolioRow[]

    return analyze(svcs, items, "db")
  } finally {
    await client.end({ timeout: 2 }).catch(() => {})
  }
}

async function runSeedFallback(): Promise<Report> {
  // Dynamically import seed file; extract the services + portfolioItems arrays.
  const seedPath = path.resolve(
    process.cwd(),
    "src/db/seed.ts"
  )
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed fallback also unavailable: ${seedPath} not found`)
  }
  // Best-effort: grep for arrays in the seed file. Seed is not guaranteed to
  // export structured data; treat as empty if we can't parse.
  const src = fs.readFileSync(seedPath, "utf8")
  const svcCount = (src.match(/slug:\s*["'`][^"'`]+["'`]/g) ?? []).length
  // Minimal fallback: report shape-only, no predictive power.
  return {
    mode: "seed",
    services_total: svcCount,
    portfolio_items_total: 0,
    per_service: [],
    overall_coverage: {
      services_with_at_least_one_union_match: 0,
      services_with_zero_matches: svcCount,
    },
  }
}

async function main() {
  let report: Report
  try {
    report = await runDb()
  } catch (err) {
    process.stderr.write(
      `DB unreachable - attempting dry-run read from seed file. Reason: ${
        (err as Error).message
      }\n`
    )
    report = await runSeedFallback()
  }
  process.stdout.write(JSON.stringify(report, null, 2) + "\n")
}

main().then(
  () => process.exit(0),
  (err) => {
    process.stderr.write(
      `Audit failed: ${(err as Error).message}\n${(err as Error).stack}\n`
    )
    process.exit(1)
  }
)
