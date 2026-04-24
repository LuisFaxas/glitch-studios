import { GlitchHeading } from "@/components/ui/glitch-heading"

interface MethodologyDisciplineTableProps {
  disciplines: Array<{
    slug: string
    name: string
    description: string
    bprEligible: boolean
  }>
}

export function MethodologyDisciplineTable({
  disciplines,
}: MethodologyDisciplineTableProps) {
  const eligible = disciplines.filter((d) => d.bprEligible)
  return (
    <section id="disciplines" className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="font-mono text-[28px] font-bold uppercase text-[#f5f5f0]">
        <GlitchHeading text="The 7 Eligible Disciplines">
          The 7 Eligible Disciplines
        </GlitchHeading>
      </h2>
      <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#f5f5f0]">
        Of the 13 disciplines in Rubric v1.1, seven are BPR-eligible. These are
        the workloads where battery mode materially changes performance — the
        ones where &quot;unplugged penalty&quot; matters to a real buyer.
        Disciplines like Storage and Wireless don&apos;t vary meaningfully on
        battery and are excluded to keep the score signal-heavy.
      </p>
      <table className="mt-6 w-full border-collapse border border-[#222]">
        <thead>
          <tr>
            <th className="border-b border-[#222] px-4 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">
              Discipline
            </th>
            <th className="border-b border-[#222] px-4 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {eligible.map((d) => (
            <tr key={d.slug} className="border-b border-[#222]">
              <td className="px-4 py-3 align-top font-mono text-[13px] font-bold uppercase text-[#f5f5f0]">
                {d.name}
              </td>
              <td className="px-4 py-3 font-sans text-[13px] text-[#f5f5f0]">
                {d.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
