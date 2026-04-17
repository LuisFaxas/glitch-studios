import { ScrollSection } from "@/components/home/scroll-section"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { CategoryTile } from "@/components/tech/category-tile"
import type { TopCategoryTile } from "@/lib/tech/queries"

interface TechCategoryTilesProps {
  categories: TopCategoryTile[]
}

export function TechCategoryTiles({ categories }: TechCategoryTilesProps) {
  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-4xl">
          <GlitchHeading text="Categories">Categories</GlitchHeading>
        </h2>
        <p className="mt-1 font-sans text-sm text-[#888]">
          Browse reviews by product type
        </p>

        {categories.length === 0 ? (
          <div className="mt-8 border border-[#222] bg-[#111] p-10 text-center">
            <p className="font-sans text-[13px] text-[#888]">No categories yet.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
            {categories.map((c) => (
              <CategoryTile key={c.id} category={c} />
            ))}
          </div>
        )}
      </div>
    </ScrollSection>
  )
}
