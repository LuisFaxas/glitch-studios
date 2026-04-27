import { GlitchHeading } from "@/components/ui/glitch-heading"

interface MethodologyFormulaProps {
  formula: string
}

export function MethodologyFormula({ formula }: MethodologyFormulaProps) {
  return (
    <section id="bpr" className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="font-mono text-[28px] font-bold uppercase text-[#f5f5f0]">
        <GlitchHeading text="The BPR Formula">The BPR Formula</GlitchHeading>
      </h2>
      <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
        BPR — Battery Performance Ratio — is a single 0–100 score that
        summarizes how much of a laptop&apos;s plugged-in performance it keeps
        on battery. We compute it as the geometric mean of per-discipline
        battery/AC ratios across the seven BPR-eligible disciplines.
      </p>
      {/* Terminal chrome formula block — 29.2-02 */}
      <div className="group mt-6 border border-[#222] bg-[#0a0a0a]">
        <div className="flex items-center gap-2 border-b border-[#222] bg-[#111] px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-[#444]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[#444]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[#444]" aria-hidden="true" />
        </div>
        <div className="p-6 font-mono text-sm text-[#f5f5f0]">
          <code>
            <span className="select-none text-[#888]">$ </span>
            {formula}
            <span
              className="text-[#f5f5f0] opacity-0 group-hover:animate-pulse group-hover:opacity-100 motion-reduce:hidden"
              aria-hidden="true"
            >
              ▋
            </span>
          </code>
        </div>
      </div>
      <p className="mt-6 font-sans text-[15px] leading-relaxed text-[#888]">
        Why geomean, not arithmetic mean? A geometric mean treats a 50% drop in
        one discipline the same weight as a 200% gain in another — a single
        catastrophic regression can&apos;t be hidden by a strong average.
        It&apos;s the right tool when you&apos;re combining ratios.
      </p>
    </section>
  )
}
