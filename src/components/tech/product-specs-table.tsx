import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { PublicProductSpec } from "@/lib/tech/queries"

interface ProductSpecsTableProps {
  specs: PublicProductSpec[]
}

function formatSpecValue(spec: PublicProductSpec): string {
  if (spec.fieldType === "boolean") {
    if (spec.valueBoolean === true) return "Yes"
    if (spec.valueBoolean === false) return "No"
    return "—"
  }
  if (spec.fieldType === "number") {
    if (spec.valueNumber === null) return "—"
    const n = Number(spec.valueNumber)
    const formatted = Number.isInteger(n) ? n.toString() : n.toFixed(2)
    return spec.unit ? `${formatted} ${spec.unit}` : formatted
  }
  return spec.valueText ?? "—"
}

export function ProductSpecsTable({ specs }: ProductSpecsTableProps) {
  if (specs.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <Accordion className="border border-[#222] bg-[#111]">
        <AccordionItem value="specs" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] hover:no-underline md:text-3xl">
            Specifications
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <dl className="flex flex-col">
              {specs.map((spec) => (
                <div key={spec.fieldId} className="grid grid-cols-[1fr_2fr] gap-4 border-b border-[#222] py-3 last:border-0 md:grid-cols-[240px_1fr]">
                  <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888]">
                    {spec.fieldName}
                  </dt>
                  <dd className="font-mono text-[13px] text-[#f5f5f0]">
                    {formatSpecValue(spec)}
                  </dd>
                </div>
              ))}
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
