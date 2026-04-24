import { GlitchHeading } from "@/components/ui/glitch-heading"

export function MethodologyExclusionPolicy() {
  return (
    <section id="exclusion-policy" className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="font-mono text-[28px] font-bold uppercase text-[#f5f5f0]">
        <GlitchHeading text="Exclusion Policy">Exclusion Policy</GlitchHeading>
      </h2>
      <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
        A discipline may be excluded from a specific review when the hardware
        lacks the relevant component (no discrete GPU, no neural engine), the
        test harness isn&apos;t supported on that platform, or the reviewer
        documents a specific opt-out reason. Every exclusion is recorded
        per-review and shown on the review page.
      </p>
      <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
        When fewer than five of the seven BPR-eligible disciplines have complete
        AC + battery data after exclusions, we render no medal at all. A
        &quot;Not enough data&quot; placeholder appears in its place. Showing a
        misleading low-data score would do more harm than showing none.
      </p>
    </section>
  )
}
