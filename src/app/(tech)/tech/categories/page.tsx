import type { Metadata } from "next"
import { listTopLevelCategoriesWithCounts } from "@/lib/tech/queries"
import { CategoryTile } from "@/components/tech/category-tile"
import { GlitchHeading } from "@/components/ui/glitch-heading"
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
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 md:px-6 md:pt-24">
        <h1 className="font-mono text-4xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-5xl">
          <GlitchHeading text="Categories">Categories</GlitchHeading>
        </h1>
        <p className="mt-3 font-sans text-[15px] text-[#888]">
          Browse reviews by product type
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
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
