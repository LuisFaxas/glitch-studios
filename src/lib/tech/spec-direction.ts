export type SpecDirection = "higher_is_better" | "lower_is_better" | null

const HIGHER_IS_BETTER = new Set([
  "ram", "memory", "ram_gb", "ssd", "storage", "storage_gb", "storage_tb",
  "battery", "battery_hours", "battery_life", "brightness", "nits",
  "refresh_rate", "refresh", "cores", "threads", "score",
  "clock_speed", "ghz", "ports", "resolution", "megapixels", "mp",
  "aperture_max", "fps", "bitrate", "bitrate_kbps", "decibels_max",
])

const LOWER_IS_BETTER = new Set([
  "weight", "weight_kg", "weight_lb", "weight_g", "weight_grams",
  "price", "price_usd", "msrp", "latency", "latency_ms",
  "response_time", "response_ms", "thickness", "thickness_mm", "depth_mm",
  "noise", "noise_db", "idle_noise", "power_draw", "watts_idle",
])

const LOWER_BY_UNIT = new Set(["kg", "g", "grams", "lb", "lbs", "mm", "ms", "db", "w", "watts"])
const HIGHER_BY_UNIT = new Set([
  "gb", "tb", "mhz", "ghz", "hz", "nits", "mp", "mpx", "fps", "pts", "points", "score",
])

function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[\s\-]/g, "_").replace(/[()]/g, "")
}

export function getSpecDirection(fieldName: string, unit: string | null): SpecDirection {
  const key = normalize(fieldName)
  if (HIGHER_IS_BETTER.has(key)) return "higher_is_better"
  if (LOWER_IS_BETTER.has(key)) return "lower_is_better"

  const tokens = key.split("_")
  for (const t of tokens) {
    if (HIGHER_IS_BETTER.has(t)) return "higher_is_better"
    if (LOWER_IS_BETTER.has(t)) return "lower_is_better"
  }

  if (unit) {
    const u = unit.toLowerCase().trim()
    if (LOWER_BY_UNIT.has(u)) return "lower_is_better"
    if (HIGHER_BY_UNIT.has(u)) return "higher_is_better"
  }
  return null
}
