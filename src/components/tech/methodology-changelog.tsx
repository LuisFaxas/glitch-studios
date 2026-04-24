import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { GlitchHeading } from "@/components/ui/glitch-heading"

interface MethodologyChangelogProps {
  entries: Array<{
    version: string
    publishedAt: Date
    highlights: string[]
  }>
}

export function MethodologyChangelog({ entries }: MethodologyChangelogProps) {
  return (
    <section id="rubric-changelog" className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="font-mono text-[28px] font-bold uppercase text-[#f5f5f0]">
        <GlitchHeading text="Rubric Changelog">Rubric Changelog</GlitchHeading>
      </h2>
      <Accordion multiple className="mt-6 w-full">
        {entries.map((entry, i) => (
          <AccordionItem
            key={entry.version}
            value={`v${entry.version}`}
            className="border-b border-[#222]"
          >
            <AccordionTrigger className="font-mono text-sm font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
              Rubric v{entry.version} · {i === 0 ? "Current · " : ""}Published{" "}
              {entry.publishedAt.toISOString().slice(0, 10)}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-2 pl-6 pt-2 font-sans text-[15px] text-[#f5f5f0]">
                {entry.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
