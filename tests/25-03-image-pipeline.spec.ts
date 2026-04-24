import { test, expect } from "@playwright/test"
import { execSync } from "node:child_process"

test.describe("25-03 Image pipeline audit", () => {
  test("no native <img> tags in src/", () => {
    let output = ""
    try {
      output = execSync(
        `grep -rn --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" -E "<img[ >]" src/`,
        { encoding: "utf8" },
      )
    } catch {
      // grep exits 1 when no matches found — that's what we want
      output = ""
    }
    expect(output.trim()).toBe("")
  })
})
