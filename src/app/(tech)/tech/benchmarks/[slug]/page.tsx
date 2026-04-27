import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { TechHero } from "@/components/tech/tech-hero"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { BenchmarkLeaderboardTable } from "@/components/tech/benchmark-leaderboard-table"
import {
  getAllBenchmarkSlugs,
  rubricKeyFromSlug,
} from "@/lib/tech/benchmark-slug"
import { getLeaderboardForBenchmark } from "@/lib/tech/benchmark-leaderboard"
import { type BenchmarkDiscipline, type RubricTestSpec } from "@/lib/tech/rubric-map"

export const dynamic = "force-static"
export const revalidate = 60
export const dynamicParams = false

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getAllBenchmarkSlugs().map((slug) => ({ slug }))
}

const DISCIPLINE_LABEL: Record<BenchmarkDiscipline, string> = {
  cpu: "CPU",
  gpu: "GPU",
  memory: "MEMORY",
  storage: "STORAGE",
  llm: "LLM",
  video: "VIDEO",
  dev: "DEV",
  python: "PYTHON",
  games: "GAMES",
  thermal: "THERMAL",
  battery_life: "BATTERY LIFE",
  wireless: "WIRELESS",
  display: "DISPLAY",
}

const DISCIPLINE_READABLE: Record<BenchmarkDiscipline, string> = {
  cpu: "CPU",
  gpu: "GPU",
  llm: "LLM inference",
  memory: "memory bandwidth",
  storage: "storage I/O",
  video: "video encode",
  dev: "developer workflow",
  python: "Python compute",
  games: "gaming",
  thermal: "thermal sustain",
  battery_life: "battery life",
  wireless: "wireless throughput",
  display: "display calibration",
}

function modePhrase(mode: RubricTestSpec["mode"]): string {
  if (mode === "both") return "AC and battery"
  if (mode === "ac") return "AC only"
  return "battery only"
}

function modeChip(mode: RubricTestSpec["mode"]): string {
  if (mode === "both") return "AC + BATTERY"
  if (mode === "ac") return "AC ONLY"
  return "BATTERY ONLY"
}

function directionPhraseSentenceCase(
  direction: RubricTestSpec["direction"],
): string {
  return direction === "higher_is_better" ? "Higher is better" : "Lower is better"
}

function directionGlyph(direction: RubricTestSpec["direction"]): string {
  return direction === "higher_is_better" ? "↑" : "↓"
}

function buildSubhead(spec: RubricTestSpec): string {
  const disciplineUpper = DISCIPLINE_LABEL[spec.discipline]
  const directionSentence = directionPhraseSentenceCase(spec.direction)
  const mode = modePhrase(spec.mode)
  return `${disciplineUpper} · ${spec.tool} · ${spec.unit}. ${directionSentence}. Run on ${mode}.`
}

function buildWhatThisMeasures(spec: RubricTestSpec): string {
  const disciplineReadable = DISCIPLINE_READABLE[spec.discipline]

  const directionSentence =
    spec.direction === "higher_is_better"
      ? `Higher scores indicate better ${disciplineReadable} throughput.`
      : `Lower values indicate better ${disciplineReadable} responsiveness — less time to complete the same workload is the win.`

  const modeSentence =
    spec.mode === "both"
      ? "We run this benchmark twice per device: once on AC and once unplugged. The BPR ratio (battery ÷ AC) appears in the rightmost column."
      : spec.mode === "ac"
        ? "We run this benchmark on AC power only — battery state does not change the result for this test."
        : "We run this benchmark on battery only — it measures sustained battery behavior."

  // MAJOR-1 (plan-checker): user-facing copy for non-BPR tests must NOT claim
  // "feeds the GlitchMark composite". GlitchMark exists internally
  // (src/lib/tech/glitchmark.ts) but per memory project_glitchmark.md it is
  // distinct from BPR and not yet a user-facing concept. UI-SPEC line 273
  // should be revised to match this neutral copy post-execution.
  const bprSentence = spec.bprEligible
    ? "This test contributes to the device's BPR score."
    : "This test does not contribute to BPR. It surfaces here as a standalone reference."

  return `${spec.name} measures ${disciplineReadable} performance via ${spec.tool}. ${directionSentence} ${modeSentence} ${bprSentence}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const rubricKey = rubricKeyFromSlug(slug)
  if (!rubricKey) {
    return { title: "Benchmark Not Found" }
  }
  const result = await getLeaderboardForBenchmark(rubricKey)
  if (!result) {
    return { title: "Benchmark Not Found" }
  }
  const { spec } = result
  return {
    title: `${spec.name} — Benchmarks`,
    description: buildSubhead(spec),
  }
}

export default async function BenchmarkDetailPage({ params }: PageProps) {
  const { slug } = await params
  const rubricKey = rubricKeyFromSlug(slug)
  if (!rubricKey) notFound()

  const result = await getLeaderboardForBenchmark(rubricKey)
  if (!result) notFound()

  const { spec, referenceScore, rows } = result

  return (
    <main className="min-h-screen bg-black">
      <TechHero
        eyebrow="BENCHMARK"
        title={spec.name}
        subhead={buildSubhead(spec)}
        ctaLabel="View methodology"
        ctaHref="/tech/about#methodology"
        tone="cyan"
        size="default"
      />

      <section className="mx-auto flex max-w-5xl flex-wrap gap-2 px-6 pt-8">
        <span className="inline-flex items-center border border-[#222] bg-[#111] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
          DISCIPLINE: {DISCIPLINE_LABEL[spec.discipline]}
        </span>
        <span className="inline-flex items-center border border-[#222] bg-[#111] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
          TOOL: {spec.tool}
        </span>
        <span className="inline-flex items-center border border-[#222] bg-[#111] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
          FIELD: {spec.field}
        </span>
        <span className="inline-flex items-center border border-[#222] bg-[#111] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
          UNIT: {spec.unit}
        </span>
        <span className="inline-flex items-center border border-[#222] bg-[#111] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
          DIRECTION:
          <span className="ml-1 text-[#f5f5f0]">{directionGlyph(spec.direction)}</span>
          <span className="ml-1">
            {spec.direction === "higher_is_better" ? "HIGHER IS BETTER" : "LOWER IS BETTER"}
          </span>
        </span>
        <span className="inline-flex items-center border border-[#222] bg-[#111] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
          MODE: {modeChip(spec.mode)}
        </span>
        {spec.bprEligible && (
          <span className="inline-flex items-center border border-[#f5f5f0] bg-[#f5f5f0] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#000]">
            BPR ELIGIBLE
          </span>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6 pt-12">
        <h2 className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-[28px]">
          <GlitchHeading text="What this measures">What this measures</GlitchHeading>
        </h2>
        <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#888]">
          {buildWhatThisMeasures(spec)}
        </p>
        <p className="mt-4 font-sans text-[13px] text-[#888]">
          Read the{" "}
          <Link
            href="/tech/about#methodology"
            className="border-b border-[#555] text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
          >
            full methodology
          </Link>{" "}
          for tool versions, run order, and exclusion rules.
        </p>
      </section>

      {rows.length === 0 ? (
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-12 text-center">
          <p className="font-mono text-[15px] uppercase tracking-[0.05em] text-[#f5f5f0]">
            No measurements yet
          </p>
          <p className="mt-4 font-sans text-[13px] leading-relaxed text-[#888]">
            No products have been scored on {spec.name} yet. This page populates as new reviews are published. Check back after the next review ships, or read the{" "}
            <Link
              href="/tech/about#methodology"
              className="border-b border-[#555] text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
            >
              methodology
            </Link>{" "}
            for what this benchmark captures.
          </p>
        </section>
      ) : (
        <BenchmarkLeaderboardTable
          spec={spec}
          referenceScore={referenceScore}
          rows={rows}
        />
      )}

      <section className="mx-auto max-w-5xl border-t border-[#222] px-6 pb-16 pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
          How we test
        </p>
        <Link
          href="/tech/about#methodology"
          className="mt-2 inline-block border-b border-[#555] font-mono text-[13px] text-[#f5f5f0] hover:border-[#f5f5f0]"
        >
          View the GlitchTech methodology →
        </Link>
      </section>
    </main>
  )
}
