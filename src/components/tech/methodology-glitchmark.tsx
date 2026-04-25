import { GlitchHeading } from "@/components/ui/glitch-heading"
import type { GlitchmarkBaselineRow } from "@/lib/tech/methodology"

interface MethodologyGlitchmarkProps {
  baselines: GlitchmarkBaselineRow[]
}

/**
 * GlitchMark methodology section per CONTEXT D-14.
 * Server component. Mirrors the typography of <MethodologyFormula> and
 * <MethodologyMedalTable> for visual consistency on /tech/methodology.
 */
export function MethodologyGlitchmark({ baselines }: MethodologyGlitchmarkProps) {
  return (
    <section
      id="glitchmark"
      aria-labelledby="glitchmark-heading"
      className="mx-auto max-w-5xl px-6 py-12 md:py-16"
    >
      <h2
        id="glitchmark-heading"
        className="mb-6 font-mono text-[28px] font-bold uppercase tracking-tight text-[#f5f5f0] md:text-[36px]"
      >
        <GlitchHeading text="GlitchMark">GlitchMark</GlitchHeading>
      </h2>

      <div className="space-y-4 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
        <p>
          GlitchMark is a single number that summarizes a device&apos;s
          performance across every benchmark we record. One score per device.
          Higher is better; the reference device sits at 100.
        </p>
        <p className="text-[#888]">
          Where BPR grades the qualitative value of a review (Platinum / Gold
          / Silver / Bronze on a 7-of-13 rubric), GlitchMark is the raw
          aggregate sortable number across the full benchmark set. Both
          surface side-by-side; they answer different questions.
        </p>
      </div>

      <h3 className="mt-10 mb-4 font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
        <GlitchHeading text="Formula">Formula</GlitchHeading>
      </h3>
      <div className="space-y-4 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
        <p>
          For each benchmark a device runs, we compute a normalized ratio
          against a fixed reference value. Higher-is-better tests use{" "}
          <code className="bg-[#111] px-2 py-0.5 font-mono text-sm">
            raw / reference
          </code>
          ; lower-is-better tests use{" "}
          <code className="bg-[#111] px-2 py-0.5 font-mono text-sm">
            reference / raw
          </code>
          . Reference device → ratio 1.0 → score 100.
        </p>
        <p>
          GlitchMark is the geometric mean of all those ratios, multiplied by
          100:
        </p>
        <pre className="overflow-x-auto bg-[#111] border border-[#222] p-4 font-mono text-sm text-[#f5f5f0]">
          GlitchMark = (r₁ · r₂ · ... · rₙ)^(1/n) × 100
        </pre>
        <p className="text-[#888]">
          Worked example: a device with 8 measured tests where two tests are
          2× and 8× the reference and the rest equal the reference (ratios =
          [2, 8, 1, 1, 1, 1, 1, 1]) yields a geometric mean of 16^(1/8) ≈
          1.41 — GlitchMark ≈ 141.
        </p>
      </div>

      <h3 className="mt-10 mb-4 font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
        <GlitchHeading text="Test count policy">Test count policy</GlitchHeading>
      </h3>
      <div className="space-y-4 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>Below 8 measured tests:</strong> no GlitchMark — the
            signal is too thin to publish.
          </li>
          <li>
            <strong>8–11 measured tests:</strong> score published with a{" "}
            <span className="font-mono text-sm">partial</span> flag (e.g.{" "}
            <span className="font-mono text-sm">
              GlitchMark 142 · partial (10/18 tests)
            </span>
            ).
          </li>
          <li>
            <strong>12 or more measured tests:</strong> score published
            without a partial flag.
          </li>
        </ul>
      </div>

      <h3 className="mt-10 mb-4 font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
        <GlitchHeading text="Reference baselines">Reference baselines</GlitchHeading>
      </h3>
      {baselines.length === 0 ? (
        <p className="font-sans text-[15px] text-[#888]">
          Reference baselines are populated as benchmark tests are calibrated.
          None published yet.
        </p>
      ) : (
        <div className="overflow-x-auto border border-[#222]">
          <table className="w-full bg-[#111]">
            <thead className="border-b border-[#222]">
              <tr>
                <th className="p-3 text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
                  Discipline
                </th>
                <th className="p-3 text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
                  Test
                </th>
                <th className="p-3 text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
                  Direction
                </th>
                <th className="p-3 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
                  Reference
                </th>
                <th className="p-3 text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody>
              {baselines.map((b) => (
                <tr key={b.id} className="border-b border-[#222] last:border-b-0">
                  <td className="p-3 font-mono text-[13px] uppercase text-[#888]">
                    {b.discipline ?? "—"}
                  </td>
                  <td className="p-3 font-sans text-[13px] text-[#f5f5f0]">
                    {b.name}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-[#888]">
                    {b.direction === "higher_is_better" ? "↑ higher" : "↓ lower"}
                  </td>
                  <td className="p-3 text-right font-mono text-[13px] text-[#f5f5f0]">
                    {b.referenceScore}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-[#888]">
                    {b.unit ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="mt-10 mb-4 font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
        <GlitchHeading text="Version history">Version history</GlitchHeading>
      </h3>
      <div className="border border-[#222] bg-[#111] p-4 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
        <p>
          <span className="font-mono text-sm font-bold text-[#f5f5f0]">v1</span>
          {" — "}initial release. Geometric mean × 100, per-test reference
          baselines as listed above, ≥8-test floor, partial flag for 8–11.
        </p>
      </div>
    </section>
  )
}
