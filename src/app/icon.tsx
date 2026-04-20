import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

// Glitchy "G" — transparent background, the glyph itself is the icon.
// Three stacked layers: cyan shifted left, magenta shifted right, white
// center. Edges of the cyan/magenta layers peek out past the white core
// producing the RGB channel-split look of the wordmark. Glyph is sized
// to near-fill the 32x32 canvas so the mark still reads at 16x16.
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
          position: "relative",
          fontFamily: "monospace",
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 1,
        }}
      >
        <span
          style={{
            position: "absolute",
            color: "#00ffff",
            transform: "translate(-2.5px, 0)",
          }}
        >
          G
        </span>
        <span
          style={{
            position: "absolute",
            color: "#ff00ff",
            transform: "translate(2.5px, 0)",
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
