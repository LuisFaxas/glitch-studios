import { test, expect } from "@playwright/test"
import { RUBRIC_V1_1 } from "../src/lib/tech/rubric-map"
import {
  slugFromRubricKey,
  rubricKeyFromSlug,
  getAllBenchmarkSlugs,
} from "../src/lib/tech/benchmark-slug"

test.describe("Phase 30-01: benchmark slug helpers", () => {
  test("RUBRIC_V1_1 has exactly 43 entries", () => {
    expect(Object.keys(RUBRIC_V1_1)).toHaveLength(43)
  })

  test("getAllBenchmarkSlugs returns 43 unique URL-safe slugs", () => {
    const slugs = getAllBenchmarkSlugs()
    expect(slugs).toHaveLength(43)
    expect(new Set(slugs).size).toBe(43)
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  test("all 43 RUBRIC_V1_1 keys produce reversible slugs", () => {
    for (const key of Object.keys(RUBRIC_V1_1)) {
      const slug = slugFromRubricKey(key)
      expect(rubricKeyFromSlug(slug)).toBe(key)
    }
  })

  test("known sample slugs reverse to expected keys", () => {
    expect(rubricKeyFromSlug("cpu-geekbench6-multi")).toBe("cpu:geekbench6:multi")
    expect(rubricKeyFromSlug("battery-life-video-loop-hours")).toBe(
      "battery_life:video_loop:hours",
    )
    expect(rubricKeyFromSlug("dev-cargo-build-release")).toBe("dev:cargo:build_release")
  })

  test("unknown slug returns null", () => {
    expect(rubricKeyFromSlug("not-a-real-test")).toBeNull()
    expect(rubricKeyFromSlug("")).toBeNull()
  })
})
