// Asset registry. Adding a new asset = create assets/<id>.mjs + the matching
// /export/<id>/ Next.js route, then register here.
import heroTech from "./assets/hero-tech.mjs"
import glitchBurst from "./assets/glitch-burst.mjs"
import bprMedal from "./assets/bpr-medal.mjs"
import ratingBar from "./assets/rating-bar.mjs"

export const ASSETS = [heroTech, glitchBurst, bprMedal, ratingBar]

export function getAsset(id) {
  return ASSETS.find((a) => a.id === id)
}

// Coerce raw CLI string args into the asset's expected param types.
// Runs against asset.defaultParams to infer types.
export function resolveParams(asset, rawArgs) {
  const out = { ...asset.defaultParams }
  for (const [key, defaultVal] of Object.entries(asset.defaultParams)) {
    if (!(key in rawArgs)) continue
    const raw = rawArgs[key]
    if (typeof defaultVal === "number") {
      const n = Number.parseFloat(raw)
      if (!Number.isFinite(n)) {
        throw new Error(`${asset.id}: --${key} expected a number, got "${raw}"`)
      }
      out[key] = n
    } else {
      out[key] = String(raw)
    }
  }
  if (asset.validateParams) asset.validateParams(out)
  return out
}
