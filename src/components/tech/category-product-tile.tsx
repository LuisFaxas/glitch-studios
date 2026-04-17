import Image from "next/image"
import type { CategoryProductEntry } from "@/lib/tech/queries"

interface CategoryProductTileProps {
  product: CategoryProductEntry
}

export function CategoryProductTile({ product }: CategoryProductTileProps) {
  return (
    <div className="flex flex-col overflow-hidden border border-[#222] bg-[#0a0a0a] opacity-70">
      <div className="relative aspect-video bg-[#0a0a0a]">
        {product.heroImageUrl ? (
          <Image
            src={product.heroImageUrl}
            alt={product.heroImageAlt ?? product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover grayscale"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#444]">Product</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-mono text-base font-bold uppercase tracking-[0.02em] text-[#888]">
          {product.name}
        </h3>
        {product.manufacturer && (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555]">
            {product.manufacturer}
          </span>
        )}
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#555]">
          No review yet
        </span>
      </div>
    </div>
  )
}
