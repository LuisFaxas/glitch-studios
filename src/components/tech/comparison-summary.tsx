import type { PublicProductForCompare, PublicBenchmarkRun } from "@/lib/tech/queries"
import { computeBenchmarkWinner, type BenchmarkRow } from "@/lib/tech/winners"

interface ComparisonSummaryProps {
  products: PublicProductForCompare[]
  benchmarkRuns: PublicBenchmarkRun[]
}

function pctDelta(winnerScore: number, runnerScore: number, direction: "higher_is_better" | "lower_is_better"): string {
  if (runnerScore === 0) return ""
  const delta = direction === "higher_is_better"
    ? ((winnerScore - runnerScore) / runnerScore) * 100
    : ((runnerScore - winnerScore) / runnerScore) * 100
  const sign = delta >= 0 ? "+" : ""
  return ` (${sign}${delta.toFixed(0)}%)`
}

export function ComparisonSummary({ products, benchmarkRuns }: ComparisonSummaryProps) {
  if (products.length < 2) return null

  const productMap = new Map(products.map((p) => [p.id, p]))
  const sentences: string[] = []

  const withPrice = products.filter((p) => p.priceUsd !== null) as Array<PublicProductForCompare & { priceUsd: number }>
  if (withPrice.length >= 2) {
    const sorted = [...withPrice].sort((a, b) => a.priceUsd - b.priceUsd)
    if (sorted[0].priceUsd < sorted[1].priceUsd) {
      sentences.push(
        `${sorted[0].name} wins on Value ($${sorted[0].priceUsd.toLocaleString()} vs $${sorted[1].priceUsd.toLocaleString()})`,
      )
    }
  }

  const runsByTest = new Map<string, PublicBenchmarkRun[]>()
  for (const r of benchmarkRuns) {
    const list = runsByTest.get(r.testId) ?? []
    list.push(r)
    runsByTest.set(r.testId, list)
  }

  const qualifyingTests = Array.from(runsByTest.entries())
    .filter(([, runs]) => runs.length >= 2)
    .slice(0, 3)

  for (const [, runs] of qualifyingTests) {
    const sample = runs[0]
    const row: BenchmarkRow = {
      testName: sample.testName,
      unit: sample.unit,
      direction: sample.direction,
      cells: runs.map((r) => ({ productId: r.productId, score: r.score })),
    }
    const winnerId = computeBenchmarkWinner(row)
    if (!winnerId) continue
    const winner = productMap.get(winnerId)
    if (!winner) continue
    const winnerRun = runs.find((r) => r.productId === winnerId)!
    const runners = runs.filter((r) => r.productId !== winnerId).sort((a, b) =>
      row.direction === "higher_is_better" ? b.score - a.score : a.score - b.score,
    )
    const nearest = runners[0]
    const deltaStr = nearest ? pctDelta(winnerRun.score, nearest.score, row.direction) : ""
    sentences.push(`${winner.name} wins on ${sample.testName}${deltaStr}`)
  }

  if (sentences.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <h2 className="mb-4 font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-[#888]">
        Summary
      </h2>
      <ul className="flex flex-col gap-2 border border-[#222] bg-[#111] p-6">
        {sentences.map((s, i) => (
          <li key={i} className="font-mono text-[15px] text-[#f5f5f0]">
            {s}
          </li>
        ))}
      </ul>
    </section>
  )
}
