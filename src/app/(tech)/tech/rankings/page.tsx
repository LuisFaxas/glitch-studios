import type { Metadata } from "next"
import Link from "next/link"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import {
  Monitor,
  Headphones,
  Mouse,
  Package,
  Camera,
  Smartphone,
  Gamepad,
  Keyboard,
  type LucideIcon,
} from "lucide-react"
import { getRankingsHubCategories } from "@/lib/tech/queries"

export const dynamic = "force-static"
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Rankings — GlitchTech",
  description:
    "Every laptop, phone, and PC we've reviewed — ranked side-by-side by GlitchMark, BPR, and benchmark.",
}

const ICON_MAP: Record<string, LucideIcon> = {
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

function iconFor(slug: string): LucideIcon {
  return ICON_MAP[slug.toLowerCase()] ?? Package
}

export default async function TechRankingsHubPage() {
  const categories = await getRankingsHubCategories()

  return (
    <main className="min-h-screen bg-black text-[#f5f5f0]">
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:py-12">
        {/* Phase 29.1 Plan 05 will replace this h1 with <TechHero eyebrow="RANKINGS" title="Rankings" subhead="Every laptop, phone, and PC we've reviewed — ranked side-by-side by GlitchMark, BPR, and benchmark." ctaLabel="Read methodology" ctaHref="/tech/about#methodology" tone="cyan" /> */}
        <h1 className="font-mono text-[44px] font-bold uppercase leading-none md:text-[64px]">
          <GlitchHeading text="RANKINGS">RANKINGS</GlitchHeading>
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-sm text-[#888] md:text-base">
          Every laptop, phone, and PC we&apos;ve reviewed — ranked side-by-side
          by GlitchMark, BPR, and benchmark.
        </p>

        <section
          className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          aria-label="Ranking categories"
        >
          {categories.map((cat) => {
            const Icon = iconFor(cat.slug)
            const count = cat.reviewCount
            const countLabel =
              count === 1 ? "1 ranked review" : `${count} ranked reviews`
            return (
              <Link
                key={cat.slug}
                href={`/tech/rankings/${cat.slug}`}
                className="group relative flex aspect-square flex-col items-center justify-center gap-3 border border-[#222] bg-[#111] p-4 transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/10 opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden"
                  aria-hidden="true"
                />
                <Icon className="h-10 w-10 text-[#f5f5f0]" aria-hidden="true" />
                <span className="font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
                  {cat.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#888]">
                  {countLabel}
                </span>
              </Link>
            )
          })}
        </section>

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
          More categories coming soon.
        </p>
      </div>
    </main>
  )
}
