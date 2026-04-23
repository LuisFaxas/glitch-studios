import Link from "next/link"
import { Star } from "lucide-react"

// Phase 16.1 Plan 04: placeholder widget (per project_placeholder_first_build)
// points at the reviews index instead of a specific fake review detail URL,
// so the click target always resolves even before the "MacBook Pro M4 Max"
// stub review is seeded. Swap to a dynamic `href={latestReview.url}` once
// the widget takes a real data prop.
export function WidgetLatestReview() {
  return (
    <Link
      href="/tech/reviews"
      aria-label="Latest Review: MacBook Pro 14 (M4 Max)"
      className="group col-span-2 flex flex-col gap-2 border border-[#222222] bg-[#111111] p-3 transition-colors duration-200 hover:border-[#444444] hover:bg-[#1a1a1a]"
    >
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#888888]">
        Latest Review
      </span>
      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0a0a]">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#333333]">
            Product
          </span>
        </div>
      </div>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.02em] text-[#f5f5f0]">
        MacBook Pro 14&quot; (M4 Max)
      </span>
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-[#f5f5f0] text-[#f5f5f0]" aria-hidden="true" />
        <span className="font-mono text-[10px] text-[#888888]">4.8 / 5</span>
      </div>
      <span className="mt-auto font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#f5f5f0] underline-offset-2 group-hover:underline">
        Read review →
      </span>
    </Link>
  )
}
