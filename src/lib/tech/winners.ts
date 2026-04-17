import { getSpecDirection, type SpecDirection } from "./spec-direction"

export interface SpecCell {
  productId: string
  valueText: string | null
  valueNumber: number | null
  valueBoolean: boolean | null
}

export interface SpecRow {
  fieldName: string
  fieldType: "text" | "number" | "enum" | "boolean"
  unit: string | null
  cells: SpecCell[]
}

export interface BenchmarkCell {
  productId: string
  score: number
}

export interface BenchmarkRow {
  testName: string
  unit: string
  direction: "higher_is_better" | "lower_is_better"
  cells: BenchmarkCell[]
}

export function computeSpecWinner(row: SpecRow): string | null {
  if (row.cells.length < 2) return null

  if (row.fieldType === "number") {
    const direction: SpecDirection = getSpecDirection(row.fieldName, row.unit)
    if (direction === null) return null
    const numericCells = row.cells.filter((c) => c.valueNumber !== null) as Array<SpecCell & { valueNumber: number }>
    if (numericCells.length < 2) return null

    const sorted = [...numericCells].sort((a, b) =>
      direction === "higher_is_better" ? b.valueNumber - a.valueNumber : a.valueNumber - b.valueNumber,
    )
    if (sorted[0].valueNumber === sorted[1].valueNumber) return null
    return sorted[0].productId
  }

  if (row.fieldType === "boolean") {
    const trues = row.cells.filter((c) => c.valueBoolean === true)
    const falses = row.cells.filter((c) => c.valueBoolean === false)
    if (trues.length === 1 && falses.length >= 1) return trues[0].productId
    return null
  }

  return null
}

export function computeBenchmarkWinner(row: BenchmarkRow): string | null {
  if (row.cells.length < 2) return null
  const sorted = [...row.cells].sort((a, b) =>
    row.direction === "higher_is_better" ? b.score - a.score : a.score - b.score,
  )
  if (sorted[0].score === sorted[1].score) return null
  return sorted[0].productId
}
