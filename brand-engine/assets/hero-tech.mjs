// hero-tech: GlitchTech wordmark + dual heartbeat ECG pulse lines.
// The proven baseline asset. 2-second cycle, native 1920x1080.
//
// Params:
//   size  number   wordmark width in px (default 600 — matches the live
//                  /tech route's max-w-[600px] at the 2xl breakpoint)
//   bg    string   body background color (default "transparent")
export default {
  id: "hero-tech",
  route: "/export/hero-tech",
  description: "GlitchTech wordmark + dual heartbeat ECG pulse lines (2s loop)",
  viewport: { width: 1920, height: 1080 },
  loopMs: 2000,
  defaultParams: { size: 600, bg: "transparent" },
  buildQuery({ size, bg }) {
    const p = new URLSearchParams()
    if (size != null) p.set("size", String(size))
    if (bg != null) p.set("bg", bg)
    return p.toString()
  },
  paramHash({ size, bg }) {
    return `size${size}-bg${bg.replace(/[^a-z0-9]/gi, "")}`
  },
}
