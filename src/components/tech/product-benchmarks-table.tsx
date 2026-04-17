import { ArrowDown, ArrowUp } from "lucide-react"
import type { PublicBenchmarkRun } from "@/lib/tech/queries"

interface ProductBenchmarksTableProps {
  runs: PublicBenchmarkRun[]
}

export function ProductBenchmarksTable({ runs }: ProductBenchmarksTableProps) {
  if (runs.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <h2 className="mb-6 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
        Benchmarks
      </h2>
      <div className="border border-[#222] bg-[#111]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#222]">
              <th scope="col" className="px-6 py-3 text-left font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888]">Test</th>
              <th scope="col" className="px-6 py-3 text-right font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888]">Score</th>
              <th scope="col" className="px-6 py-3 text-right font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888]">Direction</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={`${run.testId}-${run.recordedAt.getTime()}`} className="border-b border-[#222] last:border-0">
                <th scope="row" className="px-6 py-4 text-left font-mono text-[13px] text-[#f5f5f0]">
                  {run.testName}
                </th>
                <td className="px-6 py-4 text-right font-mono text-lg font-bold text-[#f5f5f0]">
                  {run.score.toLocaleString()} <span className="font-mono text-[11px] uppercase text-[#888]">{run.unit}</span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-[11px] uppercase tracking-[0.05em] text-[#888]">
                  {run.direction === "higher_is_better" ? (
                    <span className="inline-flex items-center gap-1" title="Higher is better">
                      <ArrowUp className="h-3 w-3" aria-hidden="true" /> Higher
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1" title="Lower is better">
                      <ArrowDown className="h-3 w-3" aria-hidden="true" /> Lower
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
