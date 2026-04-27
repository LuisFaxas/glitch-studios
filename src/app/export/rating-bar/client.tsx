"use client"

import { useEffect, useState } from "react"
import { ReviewRatingBar } from "@/components/tech/review-rating-bar"
import { EXPORT_SHELL_CSS } from "../_export-shell"

declare global {
  interface Window {
    __armCapture?: () => void
  }
}

// Re-uses ReviewRatingBar (src/components/tech/review-rating-bar.tsx) directly
// without modification. Its built-in framer-motion `width` tween fills from
// 0 → target% over 300ms with ease-out — that's the entire animation.
//
// The 2-second loop (declared in brand-engine/assets/rating-bar.mjs) gives a
// 1700ms hold after the fill completes, which reads as a natural pause for
// video composition (the overlay sits on screen long enough to be readable).
//
// We pass the same `value` and `label` straight through. The `__armCapture()`
// gate ensures the fill animation begins at capture frame 0, not before.
export function ExportRatingBarClient({
  label,
  value,
}: {
  label: string
  value: number
}) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    window.__armCapture = () => setArmed(true)
    document.body.dataset.exportReady = "true"
    return () => {
      delete window.__armCapture
      delete document.body.dataset.exportReady
    }
  }, [])

  return (
    <>
      <style>{EXPORT_SHELL_CSS}</style>
      <style>{`#export-root { padding: 0 24px; }`}</style>
      <div id="export-root">
        {armed && (
          <div style={{ width: "100%", maxWidth: "432px" }}>
            <ReviewRatingBar label={label} value={value} delay={0} />
          </div>
        )}
      </div>
    </>
  )
}
