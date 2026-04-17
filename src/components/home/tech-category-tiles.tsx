import Link from "next/link"
import { Monitor, Headphones, Mouse } from "lucide-react"
import { ScrollSection } from "@/components/home/scroll-section"

const CATEGORIES = [
  {
    id: "computers",
    label: "Computers",
    icon: Monitor,
    href: "/tech/categories/computers",
    enabled: true,
    count: "12 reviews",
  },
  {
    id: "audio",
    label: "Audio",
    icon: Headphones,
    href: "#",
    enabled: false,
    count: "Coming soon",
  },
  {
    id: "peripherals",
    label: "Peripherals",
    icon: Mouse,
    href: "#",
    enabled: false,
    count: "Coming soon",
  },
] as const

export function TechCategoryTiles() {
  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-4xl">
          Categories
        </h2>
        <p className="mt-1 font-sans text-sm text-[#888]">
          Browse reviews by product type
        </p>

        <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            if (category.enabled) {
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="group relative flex aspect-square flex-col items-center justify-center gap-3 border border-[#222] bg-[#111] p-4 transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
                >
                  <div
                    className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
                    aria-hidden="true"
                  />
                  <Icon className="h-10 w-10 text-[#f5f5f0]" aria-hidden="true" />
                  <span className="font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
                    {category.label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#888]">
                    {category.count}
                  </span>
                </Link>
              )
            }
            return (
              <div
                key={category.id}
                aria-disabled="true"
                className="flex aspect-square flex-col items-center justify-center gap-3 border border-[#222] bg-[#0a0a0a] p-4 text-[#444] opacity-60"
              >
                <Icon className="h-10 w-10" aria-hidden="true" />
                <span className="font-mono text-lg font-bold uppercase tracking-[0.05em]">
                  {category.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                  {category.count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </ScrollSection>
  )
}
