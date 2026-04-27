import type { Metadata } from "next"
import Link from "next/link"
import { TechHero } from "@/components/tech/tech-hero"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import {
  RUBRIC_V1_1,
  BPR_ELIGIBLE_DISCIPLINES,
  type BenchmarkDiscipline,
  type RubricTestSpec,
} from "@/lib/tech/rubric-map"
import { slugFromRubricKey } from "@/lib/tech/benchmark-slug"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "Every test we run, explained. See what each benchmark measures and why it matters.",
}

const DISCIPLINE_ORDER: BenchmarkDiscipline[] = [
  "cpu", "gpu", "memory", "storage", "llm", "video",
  "dev", "python", "games", "thermal", "battery_life", "wireless", "display",
]

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

function disciplineAnchorId(d: BenchmarkDiscipline): string {
  return `discipline-${d.replace(/_/g, "-")}`
}

function isBprEligibleDiscipline(d: BenchmarkDiscipline): boolean {
  return BPR_ELIGIBLE_DISCIPLINES.includes(d)
}

function groupByDiscipline(): Record<
  BenchmarkDiscipline,
  Array<{ key: string; spec: RubricTestSpec }>
> {
  const out = {} as Record<
    BenchmarkDiscipline,
    Array<{ key: string; spec: RubricTestSpec }>
  >
  for (const d of DISCIPLINE_ORDER) out[d] = []
  for (const [key, spec] of Object.entries(RUBRIC_V1_1)) {
    out[spec.discipline].push({ key, spec })
  }
  for (const d of DISCIPLINE_ORDER) {
    out[d].sort((a, b) => a.spec.sortOrder - b.spec.sortOrder)
  }
  return out
}

function modesSummary(tests: Array<{ spec: RubricTestSpec }>): string {
  const hasBoth = tests.some((t) => t.spec.mode === "both")
  if (hasBoth) return "AC + Battery"
  const allAc = tests.every((t) => t.spec.mode === "ac")
  if (allAc) return "AC only"
  const allBattery = tests.every((t) => t.spec.mode === "battery")
  if (allBattery) return "Battery only"
  return "Mixed"
}

function directionPhrase(
  direction: "higher_is_better" | "lower_is_better",
): string {
  return direction === "higher_is_better" ? "higher is better" : "lower is better"
}

export default function TechBenchmarksPage() {
  const grouped = groupByDiscipline()

  return (
    <main className="min-h-screen bg-black">
      <TechHero
        eyebrow="BENCHMARKS"
        title="Benchmarks"
        subhead="Every test we run, explained. See what each benchmark measures and why it matters."
        ctaLabel="Read methodology"
        ctaHref="/tech/about#methodology"
        tone="cyan"
        size="default"
      />

      <section className="mx-auto max-w-5xl px-6 pt-12">
        <p className="font-sans text-[15px] leading-relaxed text-[#888]">
          GlitchTech runs 43 benchmarks across 13 disciplines on every laptop we review. Seven disciplines feed BPR (battery vs AC). Every test is reproducible — same hardware, same OS build, same numbers. Read the{" "}
          <Link
            href="/tech/about#methodology"
            className="border-b border-[#555] text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
          >
            full methodology
          </Link>{" "}
          for tool versions, run order, and exclusion rules.
        </p>
      </section>

      <nav
        aria-label="Disciplines"
        className="mx-auto max-w-5xl border-b border-[#222] px-6 pb-4 pt-8"
      >
        <ul className="flex flex-wrap gap-2">
          {DISCIPLINE_ORDER.map((d) => (
            <li key={d}>
              <a
                href={`#${disciplineAnchorId(d)}`}
                className="inline-flex min-h-[44px] items-center border border-[#222] px-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888] transition-colors hover:border-[#444] hover:text-[#f5f5f0]"
              >
                {DISCIPLINE_LABEL[d]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {DISCIPLINE_ORDER.map((d) => {
        const tests = grouped[d]
        const eligible = isBprEligibleDiscipline(d)
        const modes = modesSummary(tests)
        return (
          <section
            key={d}
            id={disciplineAnchorId(d)}
            className="mx-auto max-w-5xl px-6 py-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-[28px]">
                <GlitchHeading text={DISCIPLINE_LABEL[d]}>
                  {DISCIPLINE_LABEL[d]}
                </GlitchHeading>
              </h2>
              {eligible && (
                <span className="bg-[#f5f5f0] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#000]">
                  BPR ELIGIBLE
                </span>
              )}
            </div>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
              {tests.length} tests · {modes}
            </p>

            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tests.map(({ key, spec }) => {
                const slug = slugFromRubricKey(key)
                const tileBpr = eligible
                return (
                  <li key={key}>
                    <Link
                      href={`/tech/benchmarks/${slug}`}
                      className="group relative block min-h-[96px] border border-[#222] bg-[#111] p-4 transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
                    >
                      {tileBpr && (
                        <span className="absolute right-3 top-3 bg-[#f5f5f0] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#000]">
                          BPR ELIGIBLE
                        </span>
                      )}
                      <span className="block pr-20 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] after:block after:h-px after:origin-left after:scale-x-0 after:bg-[#f5f5f0] after:transition-transform after:duration-200 group-hover:after:scale-x-100 md:text-[15px]">
                        <GlitchHeading text={spec.name}>{spec.name}</GlitchHeading>
                      </span>
                      <span className="mt-1 block font-sans text-[13px] leading-relaxed text-[#888]">
                        {spec.tool} · {spec.unit} · {directionPhrase(spec.direction)}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </main>
  )
}
