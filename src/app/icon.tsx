import { ImageResponse } from "next/og"
import fs from "node:fs"
import path from "node:path"

// Glitch "G" favicon — fat G on a black circle.
// Uses Archivo Black (Google Fonts, SIL Open Font License — free for
// commercial use). TTF bundled in public/fonts/.

export const runtime = "nodejs"
export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  const fontPath = path.join(
    process.cwd(),
    "public/fonts/archivo-black.ttf"
  )
  let fontData: Buffer | null = null
  try {
    fontData = fs.readFileSync(fontPath)
  } catch {
    // File missing — fall back to system monospace so the build never
    // breaks. Production should always have the font present.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          borderRadius: "50%",
        }}
      >
        <span
          style={{
            fontFamily: fontData ? "ArchivoBlack" : "monospace",
            fontSize: 46,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1,
            display: "block",
            transform: "translate(-1px, 4px)",
          }}
        >
          G
        </span>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "ArchivoBlack",
              data: fontData,
              style: "normal",
              weight: 900,
            },
          ]
        : undefined,
    }
  )
}
