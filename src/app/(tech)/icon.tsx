import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

// A glitchy "G" — matches the GLITCH wordmark treatment. Base glyph in
// near-white on black, flanked by cyan (shifted left) and magenta
// (shifted right) clones to simulate RGB channel split. Offsets are kept
// small (2px) so the mark still reads cleanly when the browser scales
// this 32x32 PNG down to 16x16.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        <span
          style={{
            position: "absolute",
            color: "#00ffff",
            transform: "translate(-2px, 0)",
            mixBlendMode: "screen",
          }}
        >
          G
        </span>
        <span
          style={{
            position: "absolute",
            color: "#ff00ff",
            transform: "translate(2px, 0)",
            mixBlendMode: "screen",
          }}
        >
          G
        </span>
        <span
          style={{
            position: "absolute",
            color: "#f5f5f0",
          }}
        >
          G
        </span>
      </div>
    ),
    { ...size }
  )
}
