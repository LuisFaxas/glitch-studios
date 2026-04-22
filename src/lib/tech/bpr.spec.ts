import { describe, it, expect } from "vitest"
import { bprMedal, computeBprFromPairs } from "./bpr"

// --- bprMedal boundary tests (pure function, no mocks needed) ---
describe("bprMedal", () => {
  it("returns platinum for score >= 90", () => expect(bprMedal(90)).toBe("platinum"))
  it("returns platinum for score 100", () => expect(bprMedal(100)).toBe("platinum"))
  it("returns gold for score 89.99", () => expect(bprMedal(89.99)).toBe("gold"))
  it("returns gold for score 80", () => expect(bprMedal(80)).toBe("gold"))
  it("returns silver for score 79.99", () => expect(bprMedal(79.99)).toBe("silver"))
  it("returns silver for score 70", () => expect(bprMedal(70)).toBe("silver"))
  it("returns bronze for score 69.99", () => expect(bprMedal(69.99)).toBe("bronze"))
  it("returns bronze for score 60", () => expect(bprMedal(60)).toBe("bronze"))
  it("returns null for score 59.99", () => expect(bprMedal(59.99)).toBeNull())
  it("returns null for score 0", () => expect(bprMedal(0)).toBeNull())
  it("returns null for null input", () => expect(bprMedal(null)).toBeNull())
})

describe("computeBprFromPairs (BPR formula unit)", () => {
  it("returns 100 when all ratios are 1.0", () => {
    const pairs = [1.0, 1.0, 1.0, 1.0, 1.0] // 5 disciplines all at full retention
    expect(computeBprFromPairs(pairs)).toBeCloseTo(100, 4)
  })

  it("returns correct geometric mean * 100 for known values", () => {
    // Example: 5 disciplines at ratios [0.9, 0.95, 0.85, 0.92, 0.88]
    const pairs = [0.9, 0.95, 0.85, 0.92, 0.88]
    const expected =
      Math.exp(pairs.reduce((acc, v) => acc + Math.log(v), 0) / pairs.length) * 100
    expect(computeBprFromPairs(pairs)).toBeCloseTo(expected, 4)
  })

  it("returns null for empty pairs array (no data)", () => {
    expect(computeBprFromPairs([])).toBeNull()
  })

  it("returns null when fewer than 5 pairs provided (< min eligible disciplines)", () => {
    expect(computeBprFromPairs([0.9, 0.8, 0.7, 0.85])).toBeNull() // 4 < 5 minimum
  })

  it("handles exactly 5 pairs (minimum for medal)", () => {
    const pairs = [0.9, 0.85, 0.88, 0.92, 0.87]
    const result = computeBprFromPairs(pairs)
    expect(result).not.toBeNull()
    expect(result!).toBeGreaterThan(80)
    expect(result!).toBeLessThan(100)
  })

  it("handles 7 pairs (all eligible disciplines)", () => {
    // All at 0.9 retention → geometric mean * 100 = 90
    const pairs = [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9]
    expect(computeBprFromPairs(pairs)).toBeCloseTo(90, 4)
  })

  it("handles mixed high/low ratios", () => {
    // Geometric mean of [1.0, 1.0, 0.5, 1.0, 1.0] = ~0.871
    const pairs = [1.0, 1.0, 0.5, 1.0, 1.0]
    const expected =
      Math.exp(pairs.reduce((acc, v) => acc + Math.log(v), 0) / pairs.length) * 100
    expect(computeBprFromPairs(pairs)).toBeCloseTo(expected, 4)
    expect(computeBprFromPairs(pairs)!).toBeLessThan(90)
  })
})
