import Link from "next/link"
import { Monitor, Headphones, Mouse, Package, Camera, Smartphone, Gamepad, Keyboard } from "lucide-react"
import type { TopCategoryTile as CategoryData } from "@/lib/tech/queries"

const ICON_MAP: Record<string, typeof Monitor> = {
  computers: Monitor,
  laptops: Monitor,
  desktops: Monitor,
  audio: Headphones,
  headphones: Headphones,
  peripherals: Mouse,
  mice: Mouse,
  keyboards: Keyboard,
  cameras: Camera,
  phones: Smartphone,
  smartphones: Smartphone,
  gaming: Gamepad,
  consoles: Gamepad,
}

function iconFor(slug: string): typeof Monitor {
  return ICON_MAP[slug.toLowerCase()] ?? Package
}

interface CategoryTileProps {
  category: CategoryData
}

export function CategoryTile({ category }: CategoryTileProps) {
  const Icon = iconFor(category.slug)
  const hasContent = category.reviewCount > 0 || category.productCount > 0
  const countLabel =
    category.reviewCount > 0
      ? `${category.reviewCount} review${category.reviewCount === 1 ? "" : "s"}`
      : category.productCount > 0
        ? `${category.productCount} product${category.productCount === 1 ? "" : "s"}`
        : "Coming soon"

  if (!hasContent) {
    return (
      <div
        aria-disabled="true"
        className="flex aspect-square flex-col items-center justify-center gap-3 border border-[#222] bg-[#0a0a0a] p-4 text-[#444] opacity-60"
      >
        <Icon className="h-10 w-10" aria-hidden="true" />
        <span className="font-mono text-lg font-bold uppercase tracking-[0.05em]">{category.name}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em]">{countLabel}</span>
      </div>
    )
  }

  return (
    <Link
      href={`/tech/categories/${category.slug}`}
      className="group relative flex aspect-square flex-col items-center justify-center gap-3 border border-[#222] bg-[#111] p-4 transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
        aria-hidden="true"
      />
      <Icon className="h-10 w-10 text-[#f5f5f0]" aria-hidden="true" />
      <span className="font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
        {category.name}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#888]">
        {countLabel}
      </span>
    </Link>
  )
}

export { ICON_MAP as CATEGORY_ICON_MAP, iconFor as getCategoryIcon }
