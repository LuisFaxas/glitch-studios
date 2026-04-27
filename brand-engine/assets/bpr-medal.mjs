// bpr-medal: Parameterized score-reveal of the BPR medal component. The
// underlying BPRMedal at src/components/tech/bpr-medal.tsx is static — the
// /export/bpr-medal client wraps it in a framer-motion entry sequence:
//   0–300ms   scale 0.85→1 + opacity 0→1 (ease-out)
//   300–600ms RGB-split flicker burst (one beam-glitch cycle)
//   600–1000ms hold
//
// Params:
//   tier              "platinum"|"gold"|"silver"|"bronze"  (default "platinum")
//   score             1–100  (default 87)
//   disciplineCount   1–7    (default 7)
const VALID_TIERS = new Set(["platinum", "gold", "silver", "bronze"])

export default {
  id: "bpr-medal",
  route: "/export/bpr-medal",
  description: "BPR medal reveal — parameterized score callout (1s loop)",
  viewport: { width: 480, height: 120 },
  loopMs: 1000,
  defaultParams: { tier: "platinum", score: 87, disciplineCount: 7 },
  validateParams(params) {
    if (!VALID_TIERS.has(params.tier)) {
      throw new Error(`bpr-medal: invalid tier "${params.tier}". Must be one of: ${[...VALID_TIERS].join(", ")}`)
    }
    if (!Number.isFinite(params.score) || params.score < 1 || params.score > 100) {
      throw new Error(`bpr-medal: invalid score ${params.score}. Must be 1–100.`)
    }
    if (!Number.isFinite(params.disciplineCount) || params.disciplineCount < 1 || params.disciplineCount > 7) {
      throw new Error(`bpr-medal: invalid disciplineCount ${params.disciplineCount}. Must be 1–7.`)
    }
  },
  buildQuery({ tier, score, disciplineCount }) {
    const p = new URLSearchParams()
    p.set("tier", tier)
    p.set("score", String(score))
    p.set("disciplineCount", String(disciplineCount))
    return p.toString()
  },
  paramHash({ tier, score, disciplineCount }) {
    return `${tier}-${score}-${disciplineCount}d`
  },
}
