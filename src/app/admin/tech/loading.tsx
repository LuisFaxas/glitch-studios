// Phase 25-01 PERF mitigation.
export default function AdminTechLoading() {
  return (
    <div className="space-y-4 p-6">
      <div
        className="h-8 w-64 animate-pulse border border-[#222] bg-[#111]"
        aria-label="Loading admin tech page"
      />
      <div className="h-64 animate-pulse border border-[#222] bg-[#0a0a0a]" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="h-32 animate-pulse border border-[#222] bg-[#0a0a0a]" />
        <div className="h-32 animate-pulse border border-[#222] bg-[#0a0a0a]" />
      </div>
    </div>
  )
}
