import { Music } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Beats",
  description: "Beat catalog coming soon to Glitch Studios.",
}

export default function BeatsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 flex items-center justify-center border border-[#222222] bg-[#111111] rounded-none mb-8">
        <Music className="w-10 h-10 text-[#555555]" />
      </div>
      <h1 className="font-mono font-bold text-4xl md:text-5xl uppercase tracking-tight text-[#f5f5f0] mb-4">
        Beat Store
      </h1>
      <p className="font-mono text-lg uppercase tracking-[0.05em] text-[#888888] mb-2">
        Coming Soon
      </p>
      <p className="font-sans text-[15px] text-[#888888] max-w-md mb-8">
        Browse beats, preview audio, select licenses, and purchase — all in one place. The beat store is currently under construction.
      </p>
      <Link
        href="/services"
        className="border border-[#f5f5f0] bg-[#f5f5f0] text-[#000000] font-mono font-bold text-sm uppercase tracking-[0.05em] px-8 py-3 rounded-none hover:bg-[#000000] hover:text-[#f5f5f0] transition-colors duration-200"
      >
        View Services
      </Link>
    </div>
  )
}
