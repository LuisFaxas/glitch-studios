// Minimal CLI arg parser. Supports: --flag (boolean true), --key value, --key=value.
export function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith("--")) continue
    const eqIdx = a.indexOf("=")
    if (eqIdx > -1) {
      out[a.slice(2, eqIdx)] = a.slice(eqIdx + 1)
      continue
    }
    const k = a.slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith("--")) {
      out[k] = "true"
    } else {
      out[k] = next
      i++
    }
  }
  return out
}

export function num(v, d) {
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n : d
}

export function bool(v, d) {
  if (v === undefined) return d
  if (v === "true" || v === true || v === "1") return true
  if (v === "false" || v === false || v === "0") return false
  return d
}
