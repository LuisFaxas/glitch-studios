import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollSection } from "@/components/home/scroll-section"

export function TechCompareCta() {
  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="border border-[#222] bg-[#111] p-8 text-center md:p-16">
          <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-4xl">
            Advanced Comparison Tool
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-sans text-[15px] leading-relaxed text-[#888]">
            Compare specs, benchmarks, and value across products. Find the
            right machine for your workflow.
          </p>
          <Link
            href="/tech/compare"
            className="group mt-8 inline-flex items-center gap-2 border border-[#f5f5f0] bg-transparent px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors duration-200 hover:bg-[#f5f5f0] hover:text-[#000000]"
          >
            <span>Start Comparing</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </ScrollSection>
  )
}
