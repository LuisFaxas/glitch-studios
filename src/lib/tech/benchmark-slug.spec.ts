import { describe, it, expect } from "vitest"
import { RUBRIC_V1_1 } from "./rubric-map"
import {
  slugFromRubricKey,
  rubricKeyFromSlug,
  getAllBenchmarkSlugs,
} from "./benchmark-slug"

describe("slugFromRubricKey", () => {
  it("converts colons to hyphens", () => {
    expect(slugFromRubricKey("cpu:geekbench6:multi")).toBe("cpu-geekbench6-multi")
  })
  it("converts underscores to hyphens (battery_life discipline)", () => {
    expect(slugFromRubricKey("battery_life:video_loop:hours")).toBe(
      "battery-life-video-loop-hours",
    )
  })
  it("converts underscores in field segment (ripgrep_cargo)", () => {
    expect(slugFromRubricKey("cpu:hyperfine:ripgrep_cargo")).toBe(
      "cpu-hyperfine-ripgrep-cargo",
    )
  })
})

describe("rubricKeyFromSlug", () => {
  it("reverses a known slug to its rubric key", () => {
    expect(rubricKeyFromSlug("cpu-geekbench6-multi")).toBe("cpu:geekbench6:multi")
  })
  it("reverses battery_life slug correctly", () => {
    expect(rubricKeyFromSlug("battery-life-video-loop-hours")).toBe(
      "battery_life:video_loop:hours",
    )
  })
  it("reverses ripgrep_cargo slug correctly", () => {
    expect(rubricKeyFromSlug("cpu-hyperfine-ripgrep-cargo")).toBe(
      "cpu:hyperfine:ripgrep_cargo",
    )
  })
  it("returns null for unknown slug", () => {
    expect(rubricKeyFromSlug("not-a-real-test")).toBeNull()
  })
  it("returns null for empty string", () => {
    expect(rubricKeyFromSlug("")).toBeNull()
  })
  it("is case-sensitive (uppercase rejected)", () => {
    expect(rubricKeyFromSlug("CPU-GEEKBENCH6-MULTI")).toBeNull()
  })
})

describe("getAllBenchmarkSlugs", () => {
  it("returns 43 slugs", () => {
    expect(getAllBenchmarkSlugs()).toHaveLength(43)
  })
  it("every slug is unique", () => {
    const slugs = getAllBenchmarkSlugs()
    expect(new Set(slugs).size).toBe(slugs.length)
  })
  it("round-trips: every RUBRIC_V1_1 key → slug → key matches original", () => {
    for (const key of Object.keys(RUBRIC_V1_1)) {
      expect(rubricKeyFromSlug(slugFromRubricKey(key))).toBe(key)
    }
  })
})
