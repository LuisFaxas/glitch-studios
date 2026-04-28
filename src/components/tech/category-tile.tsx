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

function renderCategoryIcon(slug: string, className: string) {
  switch (slug.toLowerCase()) {
    case "computers":
    case "laptops":
    case "desktops":
      return <Monitor className={className} aria-hidden="true" />
    case "audio":
    case "headphones":
      return <Headphones className={className} aria-hidden="true" />
    case "peripherals":
    case "mice":
      return <Mouse className={className} aria-hidden="true" />
    case "keyboards":
      return <Keyboard className={className} aria-hidden="true" />
    case "cameras":
      return <Camera className={className} aria-hidden="true" />
    case "phones":
    case "smartphones":
      return <Smartphone className={className} aria-hidden="true" />
    case "gaming":
    case "consoles":
      return <Gamepad className={className} aria-hidden="true" />
    default:
      return <Package className={className} aria-hidden="true" />
  }
}

interface CategoryTileProps {
  category: CategoryData
}

export function CategoryTile({ category }: CategoryTileProps) {
  const hasContent = category.reviewCount > 0 || category.productCount > 0
  const caption = !hasContent
    ? "COMING SOON"
    : category.reviewCount > 0 && category.productCount > 0
      ? `${category.reviewCount} reviewed · ${category.productCount} ranked`
      : category.reviewCount > 0
        ? `${category.reviewCount} review${category.reviewCount === 1 ? "" : "s"}`
        : `${category.productCount} product${category.productCount === 1 ? "" : "s"}`

  if (!hasContent) {
    return (
      <div
        aria-disabled="true"
        className="flex aspect-square min-w-[160px] flex-col items-center justify-center gap-4 border border-[#222] bg-[#0a0a0a] p-4 text-[#444] opacity-60"
      >
        {renderCategoryIcon(category.slug, "h-20 w-20")}
        <span className="font-mono text-[15px] font-bold uppercase tracking-[0.05em]">{category.name}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em]">{caption}</span>
      </div>
    )
  }

  return (
    <Link
      href={`/tech/categories/${category.slug}`}
      className="group relative flex aspect-square min-w-[160px] flex-col items-center justify-center gap-4 border border-[#222] bg-[#111] p-4 transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
        aria-hidden="true"
      />
      {renderCategoryIcon(category.slug, "h-20 w-20 text-[#f5f5f0]")}
      <span className="font-mono text-[15px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
        {category.name}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
        {caption}
      </span>
    </Link>
  )
}

export { ICON_MAP as CATEGORY_ICON_MAP, iconFor as getCategoryIcon }
