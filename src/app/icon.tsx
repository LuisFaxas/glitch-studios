import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

// Plain white fat G — matches the hero logo's default (non-hover) state.
// Transparent background, one glyph, subtle white glow. No RGB split.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          color: "#ffffff",
          textShadow: "0 0 6px rgba(255,255,255,0.35)",
        }}
      >
        G
      </div>
    ),
    { ...size }
  )
}
