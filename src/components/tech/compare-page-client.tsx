"use client"

import Link from "next/link"
import { useCallback } from "react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useQueryState, parseAsString, parseAsStringEnum } from "nuqs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComparisonProductPicker } from "./comparison-product-picker"
import { ComparisonSummary } from "./comparison-summary"
import { ComparisonTable } from "./comparison-table"
import { ComparisonBenchmarkList } from "./comparison-benchmark-list"
import type {
  PublicProductForCompare,
  PublicProductPickerEntry,
  PublicBenchmarkRun,
} from "@/lib/tech/queries"

interface CompareClientProps {
  initialProducts: PublicProductForCompare[]
  pickerOptions: PublicProductPickerEntry[]
  benchmarkRuns: PublicBenchmarkRun[]
  maxSlots: number
}

function ComparePageInner({ initialProducts, pickerOptions, benchmarkRuns, maxSlots }: CompareClientProps) {
  const [productsParam, setProductsParam] = useQueryState(
    "products",
    parseAsString.withOptions({ shallow: false }),
  )
  const [view, setView] = useQueryState(
    "view",
    parseAsStringEnum(["specs", "benchmarks", "price"])
      .withDefault("specs")
      .withOptions({ shallow: true }),
  )

  const handleAdd = useCallback(
    (slug: string) => {
      const current = (productsParam ?? "").split(",").filter(Boolean)
      if (current.length >= maxSlots) return
      if (current.includes(slug)) return
      setProductsParam([...current, slug].join(","))
    },
    [productsParam, setProductsParam, maxSlots],
  )

  const handleRemove = useCallback(
    (slug: string) => {
      const current = (productsParam ?? "").split(",").filter(Boolean)
      const next = current.filter((s) => s !== slug)
      setProductsParam(next.length > 0 ? next.join(",") : null)
    },
    [productsParam, setProductsParam],
  )

  const hasMultiple = initialProducts.length >= 2

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <ComparisonProductPicker
          selectedProducts={initialProducts}
          availableProducts={pickerOptions}
          maxSlots={maxSlots}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </section>

      {initialProducts.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 text-center md:px-6 md:py-20">
          <h2 className="font-mono text-xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-2xl">
            Select products to start comparing
          </h2>
          <p className="mt-3 font-sans text-[15px] leading-relaxed text-[#888]">
            Pick 2&ndash;4 products from the same category to see specs, benchmarks, and value side by side.
          </p>
          <Link
            href="/tech/reviews"
            className="mt-6 inline-flex items-center gap-2 border border-[#f5f5f0] bg-transparent px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-black"
          >
            Browse products →
          </Link>
        </section>
      )}

      {initialProducts.length === 1 && (
        <section className="mx-auto max-w-7xl px-4 py-8 text-center md:px-6">
          <p className="font-sans text-[15px] text-[#888]">
            Add another product to compare.
          </p>
        </section>
      )}

      {hasMultiple && (
        <>
          <ComparisonSummary products={initialProducts} benchmarkRuns={benchmarkRuns} />
          <section className="mx-auto max-w-7xl px-4 md:px-6">
            <Tabs value={view} onValueChange={(v) => setView(v as "specs" | "benchmarks" | "price")}>
              <TabsList className="mb-4 border border-[#222] bg-[#111]">
                <TabsTrigger
                  value="specs"
                  className="font-mono text-[13px] uppercase tracking-[0.05em] data-[state=active]:bg-[#f5f5f0] data-[state=active]:text-black"
                >
                  Specs
                </TabsTrigger>
                <TabsTrigger
                  value="benchmarks"
                  className="font-mono text-[13px] uppercase tracking-[0.05em] data-[state=active]:bg-[#f5f5f0] data-[state=active]:text-black"
                >
                  Benchmarks
                </TabsTrigger>
                <TabsTrigger
                  value="price"
                  className="font-mono text-[13px] uppercase tracking-[0.05em] data-[state=active]:bg-[#f5f5f0] data-[state=active]:text-black"
                >
                  Price
                </TabsTrigger>
              </TabsList>
              <TabsContent value="specs">
                <ComparisonTable products={initialProducts} />
              </TabsContent>
              <TabsContent value="benchmarks">
                <ComparisonBenchmarkList products={initialProducts} runs={benchmarkRuns} />
              </TabsContent>
              <TabsContent value="price">
                <ComparisonTable products={initialProducts} priceView />
              </TabsContent>
            </Tabs>
          </section>
        </>
      )}
    </>
  )
}

export function ComparePageClient(props: CompareClientProps) {
  return (
    <NuqsAdapter>
      <ComparePageInner {...props} />
    </NuqsAdapter>
  )
}
