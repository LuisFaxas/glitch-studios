import { describe, it, expect } from "vitest"
import {
  computeGlitchmarkFromRatios,
  isPartialCount,
  GLITCHMARK_FLOOR,
  GLITCHMARK_FULL,
  GLITCHMARK_VERSION,
} from "./glitchmark"

describe("computeGlitchmarkFromRatios", () => {
  it("returns null below floor (length < 8)", () => {
    expect(computeGlitchmarkFromRatios([])).toBe(null)
    expect(computeGlitchmarkFromRatios([1, 1, 1, 1, 1, 1, 1])).toBe(null) // length 7
  })

  it("computes at floor (length === 8) — all ratios 1.0 → 100", () => {
    const result = computeGlitchmarkFromRatios([1, 1, 1, 1, 1, 1, 1, 1])
    expect(result).not.toBeNull()
    expect(result!).toBeCloseTo(100, 4)
  })

  it("computes at full threshold (length === 12) — all ratios 1.0 → 100", () => {
    const result = computeGlitchmarkFromRatios(
      Array.from({ length: 12 }, () => 1),
    )
    expect(result).toBeCloseTo(100, 4)
  })

  it("matches geometric-mean math for known input [2,8,1,1,1,1,1,1]", () => {
    // (2 * 8 * 1^6) = 16; 16^(1/8) = 1.4142...; * 100 = 141.42...
    const ratios = [2, 8, 1, 1, 1, 1, 1, 1]
    const expected =
      Math.exp(ratios.reduce((acc, v) => acc + Math.log(v), 0) / ratios.length) *
      100
    expect(computeGlitchmarkFromRatios(ratios)!).toBeCloseTo(expected, 6)
    expect(computeGlitchmarkFromRatios(ratios)!).toBeCloseTo(141.42, 1)
  })

  it("returns 100 for reference device (all ratios = 1.0) at full count", () => {
    const ratios = Array.from({ length: 14 }, () => 1)
    expect(computeGlitchmarkFromRatios(ratios)!).toBeCloseTo(100, 6)
  })

  it("scales above 100 when all ratios > 1.0 (above-baseline device)", () => {
    const ratios = Array.from({ length: 10 }, () => 1.5)
    // 1.5^10 ^ (1/10) = 1.5; * 100 = 150
    expect(computeGlitchmarkFromRatios(ratios)!).toBeCloseTo(150, 6)
  })

  it("scales below 100 when all ratios < 1.0 (below-baseline device)", () => {
    const ratios = Array.from({ length: 10 }, () => 0.8)
    expect(computeGlitchmarkFromRatios(ratios)!).toBeCloseTo(80, 6)
  })
})

describe("isPartialCount", () => {
  it("is false below floor", () => {
    expect(isPartialCount(0)).toBe(false)
    expect(isPartialCount(7)).toBe(false)
  })

  it("is true in [floor, full)", () => {
    expect(isPartialCount(8)).toBe(true)
    expect(isPartialCount(11)).toBe(true)
  })

  it("is false at and above full", () => {
    expect(isPartialCount(12)).toBe(false)
    expect(isPartialCount(18)).toBe(false)
  })
})

describe("exported constants", () => {
  it("GLITCHMARK_FLOOR is 8", () => {
    expect(GLITCHMARK_FLOOR).toBe(8)
  })
  it("GLITCHMARK_FULL is 12", () => {
    expect(GLITCHMARK_FULL).toBe(12)
  })
  it("GLITCHMARK_VERSION is 'v1'", () => {
    expect(GLITCHMARK_VERSION).toBe("v1")
  })
})
