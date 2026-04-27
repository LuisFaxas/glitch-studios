import type { Metadata } from "next"
import { listTopLevelCategoriesWithCounts } from "@/lib/tech/queries"
import { CategoryTile } from "@/components/tech/category-tile"
import { TechHero } from "@/components/tech/tech-hero"
import { TechNewsletter } from "@/components/home/tech-newsletter"

export const metadata: Metadata = {
  title: "Categories — Glitch Tech",
  description: "Browse Glitch Tech reviews by product category.",
}

export const revalidate = 60

export default async function TechCategoriesPage() {
  const categories = await listTopLevelCategoriesWithCounts()

  return (
    <main className="min-h-screen bg-black">
      <TechHero
        eyebrow="CATEGORIES"
        title="Categories"
        subhead="All the hardware categories we cover. Drill in to see rankings, specs, and scores."
        ctaLabel="View rankings"
        ctaHref="/tech/rankings"
        tone="amber"
      />

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h2 className="font-mono text-xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
              No categories yet
            </h2>
            <p className="font-sans text-[15px] leading-relaxed text-[#888]">
              Admin has not configured any categories. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryTile key={c.id} category={c} />
            ))}
          </div>
        )}
      </section>

      <TechNewsletter />
    </main>
  )
}
