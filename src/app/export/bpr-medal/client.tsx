"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import type { BprTier } from "@/lib/tech/bpr"
import { BPRMedal } from "@/components/tech/bpr-medal"
import { EXPORT_SHELL_CSS } from "../_export-shell"

declare global {
  interface Window {
    __armCapture?: () => void
  }
}

// 1-second BPR medal entry animation:
//   0–250ms   scale 0.85 → 1.05 → 1.0 + opacity 0 → 1 (overshoot pop-in)
//   250–400ms quick x-jitter ±3px (RGB-split inspired flicker)
//   400–1000ms hold at rest
//
// Source-component (`BPRMedal` from src/components/tech/bpr-medal.tsx) is left
// untouched — we wrap it in a framer-motion driver and pass `asLink={false}`
// so the underlying tag is just a span (no Link with focus styling).
export function ExportBprMedalClient({
  tier,
  score,
  disciplineCount,
}: {
  tier: BprTier
  score: number
  disciplineCount: number
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
      <div id="export-root">
        {armed && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, x: 0 }}
            animate={{
              scale: [0.85, 1.05, 1.0, 1.0, 1.0, 1.0],
              opacity: [0, 1, 1, 1, 1, 1],
              x: [0, 0, 0, 3, -3, 0],
            }}
            transition={{
              duration: 0.4,
              times: [0, 0.4, 0.6, 0.7, 0.85, 1],
              ease: "easeOut",
            }}
            style={{ display: "inline-block" }}
          >
            <BPRMedal
              tier={tier}
              score={score}
              disciplineCount={disciplineCount}
              variant="full"
              showTooltip={false}
              asLink={false}
            />
          </motion.div>
        )}
      </div>
    </>
  )
}
