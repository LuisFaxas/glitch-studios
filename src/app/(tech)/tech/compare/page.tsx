import type { Metadata } from "next"
import {
  getProductsBySlugs,
  listAllPublishedProductsForPicker,
  getBenchmarkRunsForProducts,
} from "@/lib/tech/queries"
import { ComparePageClient } from "@/components/tech/compare-page-client"
import { TechHero } from "@/components/tech/tech-hero"
import { TechNewsletter } from "@/components/home/tech-newsletter"

export const metadata: Metadata = {
  title: "Compare Products — Glitch Tech",
  description: "Side-by-side specs, benchmarks, and value comparison.",
}

const MAX_SLOTS = 4

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TechComparePage({ searchParams }: Props) {
  const sp = await searchParams
  const productsParam = typeof sp.products === "string" ? sp.products : ""
  const slugs = productsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SLOTS)

  const [resolvedProducts, pickerOptions] = await Promise.all([
    slugs.length > 0 ? getProductsBySlugs(slugs) : Promise.resolve([]),
    listAllPublishedProductsForPicker(),
  ])

  const benchmarkRuns = resolvedProducts.length > 0
    ? await getBenchmarkRunsForProducts(resolvedProducts.map((p) => p.id))
    : []

  return (
    <main className="min-h-screen bg-black">
      <TechHero
        eyebrow="COMPARE"
        title="Compare Devices"
        subhead="Put any two devices side-by-side. Benchmark for benchmark, score for score."
        ctaLabel="Pick devices"
        ctaHref="#compare-picker"
        tone="cyan"
      />

      <span id="compare-picker" />
      <ComparePageClient
        initialProducts={resolvedProducts}
        pickerOptions={pickerOptions}
        benchmarkRuns={benchmarkRuns}
        maxSlots={MAX_SLOTS}
      />

      <TechNewsletter />
    </main>
  )
}
