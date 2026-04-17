import { Trophy } from "lucide-react"
import type { PublicProductForCompare, PublicProductSpec } from "@/lib/tech/queries"
import { computeSpecWinner, type SpecRow } from "@/lib/tech/winners"

interface ComparisonTableProps {
  products: PublicProductForCompare[]
  priceView?: boolean
}

function formatSpecCell(spec: PublicProductSpec | undefined): string {
  if (!spec) return "—"
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

function formatPrice(price: number | null): string {
  if (price === null) return "—"
  return `$${price.toLocaleString()}`
}

export function ComparisonTable({ products, priceView = false }: ComparisonTableProps) {
  const allFieldsMap = new Map<string, PublicProductSpec>()
  for (const p of products) {
    for (const s of p.specs) {
      if (!allFieldsMap.has(s.fieldId)) allFieldsMap.set(s.fieldId, s)
    }
  }
  const allFields = Array.from(allFieldsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder)

  const winnerByFieldId = new Map<string, string | null>()
  for (const field of allFields) {
    const row: SpecRow = {
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      unit: field.unit,
      cells: products.map((p) => {
        const s = p.specs.find((x) => x.fieldId === field.fieldId)
        return {
          productId: p.id,
          valueText: s?.valueText ?? null,
          valueNumber: s?.valueNumber ?? null,
          valueBoolean: s?.valueBoolean ?? null,
        }
      }),
    }
    winnerByFieldId.set(field.fieldId, computeSpecWinner(row))
  }

  const winsByProduct = new Map<string, number>()
  for (const winnerId of winnerByFieldId.values()) {
    if (winnerId) {
      winsByProduct.set(winnerId, (winsByProduct.get(winnerId) ?? 0) + 1)
    }
  }

  const priceWinner = (() => {
    const priced = products.filter((p) => p.priceUsd !== null) as Array<PublicProductForCompare & { priceUsd: number }>
    if (priced.length < 2) return null
    const sorted = [...priced].sort((a, b) => a.priceUsd - b.priceUsd)
    return sorted[0].priceUsd < sorted[1].priceUsd ? sorted[0].id : null
  })()

  const threshold = Math.ceil(allFields.length * 0.5)
  const columnWinnerSet = new Set(
    Array.from(winsByProduct.entries())
      .filter(([, wins]) => wins >= threshold && threshold >= 2)
      .map(([id]) => id),
  )

  const visibleFields = priceView
    ? allFields.filter((f) => /price|cost|msrp/i.test(f.fieldName))
    : allFields

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-10 w-[200px] border-b border-[#222] bg-black p-4 text-left">
              <span className="sr-only">Spec</span>
            </th>
            {products.map((p) => (
              <th
                key={p.id}
                scope="col"
                className={`border-b-2 ${columnWinnerSet.has(p.id) ? "border-b-[#f5f5f0]" : "border-b-[#222]"} bg-black p-4 text-left`}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[13px] font-bold uppercase tracking-[0.02em] text-[#f5f5f0]">
                    {p.name}
                  </span>
                  {p.manufacturer && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555]">
                      {p.manufacturer}
                    </span>
                  )}
                  {columnWinnerSet.has(p.id) && (
                    <span className="mt-1 inline-flex items-center gap-1 self-start border border-[#f5f5f0] bg-[#f5f5f0] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-black">
                      <Trophy className="h-3 w-3" aria-hidden="true" /> Winner
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="even:bg-[#0a0a0a]">
            <th scope="row" className="sticky left-0 z-10 border-b border-[#222] bg-inherit p-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888]">
              Price
            </th>
            {products.map((p) => {
              const isWinner = priceWinner === p.id
              return (
                <td key={p.id} className={`border-b border-[#222] p-4 font-mono text-[13px] text-[#f5f5f0] ${columnWinnerSet.has(p.id) ? "border-x-2 border-x-[#f5f5f0]" : ""}`}>
                  <span className="inline-flex items-center gap-2">
                    {formatPrice(p.priceUsd)}
                    {isWinner && (
                      <span className="border border-[#f5f5f0] bg-[#f5f5f0] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-black">
                        Winner
                      </span>
                    )}
                  </span>
                </td>
              )
            })}
          </tr>

          {visibleFields.map((field) => {
            const winnerId = winnerByFieldId.get(field.fieldId)
            return (
              <tr key={field.fieldId} className="even:bg-[#0a0a0a]">
                <th scope="row" className="sticky left-0 z-10 border-b border-[#222] bg-inherit p-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888]">
                  {field.fieldName}
                </th>
                {products.map((p) => {
                  const specForProduct = p.specs.find((x) => x.fieldId === field.fieldId)
                  const isWinner = winnerId === p.id
                  return (
                    <td
                      key={p.id}
                      className={`border-b border-[#222] p-4 font-mono text-[13px] text-[#f5f5f0] ${columnWinnerSet.has(p.id) ? "border-x-2 border-x-[#f5f5f0]" : ""}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {formatSpecCell(specForProduct)}
                        {isWinner && (
                          <span className="border border-[#f5f5f0] bg-[#f5f5f0] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-black">
                            <span className="sr-only">Winner in this category</span>
                            Win
                          </span>
                        )}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
