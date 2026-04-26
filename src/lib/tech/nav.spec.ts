import { describe, it, expect } from "vitest"
import { isTechPathActive, stripTechPrefix } from "./nav"

describe("stripTechPrefix", () => {
  it("strips bare /tech to /", () => {
    expect(stripTechPrefix("/tech")).toBe("/")
  })

  it("strips /tech/foo to /foo", () => {
    expect(stripTechPrefix("/tech/reviews")).toBe("/reviews")
  })

  it("is idempotent for paths without /tech prefix", () => {
    expect(stripTechPrefix("/reviews")).toBe("/reviews")
  })

  it("returns / unchanged", () => {
    expect(stripTechPrefix("/")).toBe("/")
  })
})

describe("isTechPathActive", () => {
  it("Home (/tech) is active at root /", () => {
    expect(isTechPathActive("/tech", "/")).toBe(true)
  })

  it("Home (/tech) is NOT active on a leaf", () => {
    expect(isTechPathActive("/tech", "/reviews")).toBe(false)
    expect(isTechPathActive("/tech", "/tech/reviews")).toBe(false)
  })

  it("matches brand-host case (itemHref /tech/reviews vs pathname /reviews)", () => {
    expect(isTechPathActive("/tech/reviews", "/reviews")).toBe(true)
  })

  it("matches preview-host case (itemHref /tech/reviews vs pathname /tech/reviews)", () => {
    expect(isTechPathActive("/tech/reviews", "/tech/reviews")).toBe(true)
  })

  it("prefix-matches nested path (preview-host)", () => {
    expect(isTechPathActive("/tech/reviews", "/tech/reviews/abc")).toBe(true)
  })

  it("prefix-matches nested path (brand-host)", () => {
    expect(isTechPathActive("/tech/reviews", "/reviews/abc")).toBe(true)
  })

  it("non-matching item returns false", () => {
    expect(isTechPathActive("/tech/categories", "/compare")).toBe(false)
  })

  it("matches itself for similarly-named routes", () => {
    expect(isTechPathActive("/tech/reviewsx", "/reviewsx")).toBe(true)
  })

  it("does NOT prefix-match without trailing /", () => {
    expect(isTechPathActive("/tech/reviews", "/reviewsx")).toBe(false)
  })
})
