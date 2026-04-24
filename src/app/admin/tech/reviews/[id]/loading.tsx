// Phase 25-01 PERF mitigation.
export default function AdminReviewEditLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 w-80 animate-pulse border border-[#222] bg-[#111]" />
      <div className="h-96 animate-pulse border border-[#222] bg-[#0a0a0a]" />
    </div>
  )
}
