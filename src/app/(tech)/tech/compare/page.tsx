import type { Metadata } from "next"
import {
  getProductsBySlugs,
  listAllPublishedProductsForPicker,
  getBenchmarkRunsForProducts,
} from "@/lib/tech/queries"
import { ComparePageClient } from "@/components/tech/compare-page-client"
import { GlitchHeading } from "@/components/ui/glitch-heading"
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
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-4 md:px-6 md:pt-24">
        <h1 className="font-mono text-4xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-5xl">
          <GlitchHeading text="COMPARE">COMPARE</GlitchHeading>
        </h1>
        <p className="mt-3 font-sans text-[15px] text-[#888]">
          Select 2&ndash;4 products to compare specs, benchmarks, and value.
        </p>
      </section>

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
