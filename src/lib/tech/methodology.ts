// getMethodologyData is a pure function of static constants — no DB read.
// getGlitchmarkBaselines (Phase 28) DOES read the DB and is server-only.
import {
  RUBRIC_V1_1,
  BPR_ELIGIBLE_DISCIPLINES,
  type BenchmarkDiscipline,
} from "./rubric-map"
import type { BprTier } from "./bpr"

const DISCIPLINE_COPY: Record<
  BenchmarkDiscipline,
  { name: string; description: string }
> = {
  cpu: {
    name: "CPU",
    description:
      "Core compute performance across Geekbench 6, Cinebench 2024, and standard multi-thread tests.",
  },
  gpu: {
    name: "GPU",
    description:
      "Graphics compute across 3DMark, Blender GPU, and real-world render workloads.",
  },
  llm: {
    name: "LLM",
    description:
      "Local large-language-model inference throughput (tokens/sec) on standardized models.",
  },
  video: {
    name: "Video",
    description:
      "Video encoding and decoding throughput — H.264, H.265, AV1.",
  },
  dev: {
    name: "Dev",
    description:
      "Developer workload benchmarks — compile, link, test suite runtime.",
  },
  python: {
    name: "Python",
    description: "Python-specific numeric and scripting workloads.",
  },
  games: {
    name: "Games",
    description:
      "Real-world game performance — frame rates at standardized settings across a fixed title list.",
  },
  memory: {
    name: "Memory",
    description: "Memory bandwidth via STREAM (AC only, not BPR-eligible).",
  },
  storage: {
    name: "Storage",
    description:
      "Sequential + random I/O via AmorphousDiskMark (AC only, not BPR-eligible).",
  },
  thermal: {
    name: "Thermal",
    description:
      "Sustained-load retention + peak temperature (AC only, not BPR-eligible).",
  },
  wireless: {
    name: "Wireless",
    description:
      "Wi-Fi + Thunderbolt throughput (AC only, not BPR-eligible).",
  },
  display: {
    name: "Display",
    description:
      "Color accuracy + gamut coverage via DisplayCAL (AC only, not BPR-eligible).",
  },
  battery_life: {
    name: "Battery Life",
    description:
      "Standardized battery drain scenarios (battery only, not BPR-eligible).",
  },
}

const MEDAL_THRESHOLDS: Array<{
  tier: BprTier
  minScore: number
  maxScore: number | null
  description: string
}> = [
  {
    tier: "platinum",
    minScore: 90,
    maxScore: null,
    description: "Near-zero battery penalty.",
  },
  {
    tier: "gold",
    minScore: 80,
    maxScore: 89,
    description: "Minor battery impact — holds most performance unplugged.",
  },
  {
    tier: "silver",
    minScore: 70,
    maxScore: 79,
    description: "Noticeable dropoff on battery — workable but visible.",
  },
  {
    tier: "bronze",
    minScore: 60,
    maxScore: 69,
    description:
      "Significant battery drop — plan on plugging in for heavy work.",
  },
]

const RUBRIC_CHANGELOG: Array<{
  version: string
  publishedAt: Date
  highlights: string[]
}> = [
  {
    version: "1.1",
    publishedAt: new Date("2026-04-23"),
    highlights: [
      "43 tests across 13 disciplines",
      "7 disciplines BPR-eligible: CPU, GPU, LLM, Video, Dev, Python, Games",
      "Battery + AC modes captured for every BPR-eligible test",
      "Medal thresholds: Platinum ≥90, Gold ≥80, Silver ≥70, Bronze ≥60",
    ],
  },
]

const BPR_FORMULA = "BPR = exp( (1/n) × Σ ln(battery_i / ac_i) ) × 100"

export interface MethodologyData {
  disciplines: Array<{
    slug: BenchmarkDiscipline
    name: string
    description: string
    bprEligible: boolean
  }>
  bprFormula: string
  currentRubric: {
    version: string
    publishedAt: Date
    testCount: number
    disciplineCount: number
    bprEligibleCount: number
  }
  rubricChangelog: Array<{
    version: string
    publishedAt: Date
    highlights: string[]
  }>
  medalThresholds: Array<{
    tier: BprTier
    minScore: number
    maxScore: number | null
    description: string
  }>
}

export function getMethodologyData(): MethodologyData {
  const allDisciplines = Object.keys(DISCIPLINE_COPY) as BenchmarkDiscipline[]
  const disciplines = allDisciplines.map((slug) => ({
    slug,
    name: DISCIPLINE_COPY[slug].name,
    description: DISCIPLINE_COPY[slug].description,
    bprEligible: BPR_ELIGIBLE_DISCIPLINES.includes(slug),
  }))
  return {
    disciplines,
    bprFormula: BPR_FORMULA,
    currentRubric: {
      version: "1.1",
      publishedAt: RUBRIC_CHANGELOG[0].publishedAt,
      testCount: Object.keys(RUBRIC_V1_1).length,
      disciplineCount: allDisciplines.length,
      bprEligibleCount: BPR_ELIGIBLE_DISCIPLINES.length,
    },
    rubricChangelog: RUBRIC_CHANGELOG,
    medalThresholds: MEDAL_THRESHOLDS,
  }
}

// === GlitchMark baselines (Phase 28) ===
// Server-only because it does a DB read. Imported by the methodology page
// (force-static, revalidate=3600) so baselines are fetched at build/revalidate
// time only.

import "server-only"
import { db } from "@/lib/db"
import { techBenchmarkTests } from "@/db/schema"
import { isNotNull, asc } from "drizzle-orm"

export interface GlitchmarkBaselineRow {
  id: string
  name: string
  discipline: string | null
  direction: "higher_is_better" | "lower_is_better"
  unit: string | null
  referenceScore: string // numeric arrives as string from postgres-js
}

/**
 * Fetch every benchmark test that contributes to GlitchMark — i.e. has a
 * non-null reference_score. Used by the methodology page baseline table
 * (Phase 28 — GLITCHMARK-06).
 */
export async function getGlitchmarkBaselines(): Promise<GlitchmarkBaselineRow[]> {
  const rows = await db
    .select({
      id: techBenchmarkTests.id,
      name: techBenchmarkTests.name,
      discipline: techBenchmarkTests.discipline,
      direction: techBenchmarkTests.direction,
      unit: techBenchmarkTests.unit,
      referenceScore: techBenchmarkTests.referenceScore,
    })
    .from(techBenchmarkTests)
    .where(isNotNull(techBenchmarkTests.referenceScore))
    .orderBy(asc(techBenchmarkTests.discipline), asc(techBenchmarkTests.name))

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    discipline: r.discipline,
    direction: r.direction as "higher_is_better" | "lower_is_better",
    unit: r.unit,
    referenceScore: String(r.referenceScore ?? ""),
  }))
}
