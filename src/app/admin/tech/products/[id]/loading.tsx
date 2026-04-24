// Phase 25-01 PERF mitigation: product edit skeleton (covers edit -> ingest nav).
export default function AdminProductEditLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 w-80 animate-pulse border border-[#222] bg-[#111]" />
      <div className="h-96 animate-pulse border border-[#222] bg-[#0a0a0a]" />
    </div>
  )
}
