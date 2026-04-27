// glitch-burst: 500ms RGB-split flicker on the GlitchTech wordmark, suitable
// as a jump-cut transition stinger. Re-uses the beam-glitch keyframes from
// src/components/tiles/logo-tile.module.css but starts the CSS animation at
// the 46% keyframe (start of the burst window) via animation-delay = -0.92s.
// Captures 500ms covering the burst peak + recovery padding.
//
// Params:
//   size  number   wordmark width in px (default 600)
export default {
  id: "glitch-burst",
  route: "/export/glitch-burst",
  description: "500ms GlitchTech RGB-split transition stinger",
  viewport: { width: 1920, height: 1080 },
  loopMs: 500,
  defaultParams: { size: 600 },
  buildQuery({ size }) {
    const p = new URLSearchParams()
    if (size != null) p.set("size", String(size))
    return p.toString()
  },
  paramHash({ size }) {
    return `size${size}`
  },
}
