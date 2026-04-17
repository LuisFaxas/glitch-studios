export const dynamic = "force-dynamic"

import { listBenchmarkRuns } from "@/actions/admin-tech-benchmarks"

export default async function AdminTechBenchmarksPage() {
  const runs = await listBenchmarkRuns()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0]">
          Benchmarks
        </h1>
      </div>
      {runs.length === 0 ? (
        <div className="border border-[#222222] bg-[#111111] p-12 text-center">
          <h2 className="font-mono text-[15px] uppercase text-[#888888] mb-2">
            No benchmarks recorded
          </h2>
          <p className="font-sans text-[13px] text-[#555555]">
            Benchmark runs are added from the product detail page. Open a product, then scroll to its Benchmarks section.
          </p>
        </div>
      ) : (
        <table className="w-full border border-[#222222]">
          <thead>
            <tr className="bg-[#111111] border-b border-[#222222]">
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Product</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Test</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Score</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Recorded</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="border-b border-[#222222]">
                <td className="p-3 font-mono text-[13px] text-[#f5f5f0]">{r.productName ?? "—"}</td>
                <td className="p-3 font-sans text-[13px] text-[#888888]">{r.testName ?? "—"}</td>
                <td className="p-3 font-mono text-[13px] text-[#f5f5f0]">
                  {r.score} {r.unit ?? ""}
                </td>
                <td className="p-3 font-mono text-[11px] text-[#555555]">
                  {r.recordedAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
