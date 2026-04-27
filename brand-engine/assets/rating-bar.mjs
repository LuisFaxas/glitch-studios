// rating-bar: Parameterized review-rating bar fill. Re-uses ReviewRatingBar
// at src/components/tech/review-rating-bar.tsx unchanged. Animation is
// 0–300ms width fills 0→target, 300–2000ms hold (a 2-second loop length
// gives a natural pause for video composition).
//
// Params:
//   label  string   the metric name (default "GAMING"); rendered uppercase
//   value  number   1–10 rating (default 9)
export default {
  id: "rating-bar",
  route: "/export/rating-bar",
  description: "Review rating bar fill — parameterized score callout (2s loop)",
  viewport: { width: 480, height: 80 },
  loopMs: 2000,
  defaultParams: { label: "GAMING", value: 9 },
  validateParams(params) {
    if (typeof params.label !== "string" || params.label.length === 0) {
      throw new Error(`rating-bar: invalid label "${params.label}". Must be a non-empty string.`)
    }
    if (!Number.isFinite(params.value) || params.value < 1 || params.value > 10) {
      throw new Error(`rating-bar: invalid value ${params.value}. Must be 1–10.`)
    }
  },
  buildQuery({ label, value }) {
    const p = new URLSearchParams()
    p.set("label", label)
    p.set("value", String(value))
    return p.toString()
  },
  paramHash({ label, value }) {
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    return `${slug}-${value}`
  },
}
