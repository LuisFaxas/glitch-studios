import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getCategoryBySlug, getCategoryBreadcrumb } from "@/lib/tech/queries"
import {
  getLeaderboardRows,
  getLeaderboardBenchmarkColumns,
} from "@/lib/tech/leaderboard"
import { LeaderboardTable } from "@/components/tech/leaderboard-table"
import { LeaderboardEmptyState } from "@/components/tech/leaderboard-empty-state"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { ChevronRight } from "lucide-react"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: "Rankings — GlitchTech" }
  return {
    title: `${category.name} Rankings — GlitchTech`,
    description: `Every ${category.name.toLowerCase()} we've reviewed, ranked side-by-side by GlitchMark, BPR, and key benchmarks.`,
  }
}

export default async function RankingsPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const [rows, benchmarkColumns, breadcrumb] = await Promise.all([
    getLeaderboardRows(slug),
    getLeaderboardBenchmarkColumns(slug),
    getCategoryBreadcrumb(category.id),
  ])

  const headingText = `${category.name.toUpperCase()} RANKINGS`

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#666]"
        >
          <Link href="/tech" className="hover:text-[#f5f5f0]">
            Tech
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link href="/tech/rankings" className="hover:text-[#f5f5f0]">
            Rankings
          </Link>
          {breadcrumb.map((crumb) => (
            <span key={crumb.slug} className="contents">
              <ChevronRight className="h-3 w-3" aria-hidden />
              <span className="text-[#f5f5f0]">{crumb.name}</span>
            </span>
          ))}
        </nav>

        <header className="mb-8">
          {/* Phase 29.1 Plan 05 will replace this h1 with <TechHero eyebrow="RANKINGS" title={`${category.name} Rankings`} subhead={`Compare every ${category.name.toLowerCase()} we've reviewed — sortable by GlitchMark, BPR, and key benchmarks.`} ctaLabel="Read methodology" ctaHref="/tech/about#methodology" tone="cyan" /> */}
          <h1 className="font-mono text-[44px] font-bold uppercase leading-none md:text-[64px]">
            <GlitchHeading text={headingText}>{headingText}</GlitchHeading>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[#888]">
            Every {category.name.toLowerCase()} we&apos;ve benchmarked, ranked
            side-by-side. Default sort is GlitchMark — our aggregate performance
            score. Click any column header to sort. Open the methodology link
            beside each header to read how we measure.
          </p>
        </header>

        {rows.length === 0 ? (
          <LeaderboardEmptyState mode="no-reviews-yet" />
        ) : (
          <LeaderboardTable rows={rows} benchmarkColumns={benchmarkColumns} />
        )}
      </div>
    </main>
  )
}
