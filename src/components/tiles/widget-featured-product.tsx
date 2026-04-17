import Link from "next/link"
import { Star } from "lucide-react"

export function WidgetFeaturedProduct() {
  return (
    <Link
      href="/tech/compare?product=macbook-pro-m4"
      aria-label="Featured Product: MacBook Pro 14 (M4 Max)"
      className="group col-span-2 flex flex-col gap-1 border border-[#222222] bg-[#111111] p-3 transition-colors duration-200 hover:border-[#444444] hover:bg-[#1a1a1a]"
    >
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#888888]">
        Featured
      </span>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.02em] text-[#f5f5f0]">
        MacBook Pro 14&quot; M4 Max
      </span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-3 w-3 fill-[#f5f5f0] text-[#f5f5f0]"
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#f5f5f0] underline-offset-2 group-hover:underline">
        Compare →
      </span>
    </Link>
  )
}
