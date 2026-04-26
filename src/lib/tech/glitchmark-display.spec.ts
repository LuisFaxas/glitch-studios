import { describe, it, expect } from "vitest"
import { formatGlitchmarkDisplay } from "./glitchmark-display"

describe("formatGlitchmarkDisplay (Phase 29.1 D-19)", () => {
  it("renders null as em dash", () => {
    expect(formatGlitchmarkDisplay(null)).toBe("—")
  })
  it("renders the reference baseline as 1000", () => {
    expect(formatGlitchmarkDisplay(100)).toBe("1000")
  })
  it("renders the ROG Strix placeholder (seed value 142.50) as 1425", () => {
    expect(formatGlitchmarkDisplay(142.5)).toBe("1425")
  })
  it("rounds to nearest integer (helper-only example)", () => {
    expect(formatGlitchmarkDisplay(165.32)).toBe("1653")
    expect(formatGlitchmarkDisplay(165.35)).toBe("1654")
  })
  it("appends partial suffix when requested", () => {
    expect(formatGlitchmarkDisplay(165.32, { partial: true })).toBe("1653 · partial")
  })
  it("handles null with partial flag (suffix dropped)", () => {
    expect(formatGlitchmarkDisplay(null, { partial: true })).toBe("—")
  })
  it("handles zero as '0'", () => {
    expect(formatGlitchmarkDisplay(0)).toBe("0")
  })
})
