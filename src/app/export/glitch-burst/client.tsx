"use client"

import { useEffect, useState } from "react"
import styles from "@/components/tiles/logo-tile.module.css"
import { EXPORT_SHELL_CSS } from "../_export-shell"

declare global {
  interface Window {
    __armCapture?: () => void
  }
}

// 500ms RGB-split burst on the GlitchTech wordmark, suitable as a jump-cut
// transition stinger. The underlying beam-glitch CSS animation in
// src/components/tiles/logo-tile.module.css runs `2s linear infinite` with
// the burst window between 44% and 56% of the cycle (880-1120ms).
//
// We override animationDelay = -770ms on the beam layers so that, relative to
// the capture (which starts at component mount = t=0), the burst lands at
// ~110ms-350ms — centered in our 500ms capture window with idle padding on
// both sides for clean cut points.
const BEAM_DELAY = "-0.77s"

export function ExportGlitchBurstClient({ logoSize }: { logoSize: number }) {
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
          <div
            className={styles.glitchWrapper}
            style={{ width: `${logoSize}px` }}
          >
            <div className={styles.glitchImg} />
            <div className={styles.glitchLayer1} aria-hidden="true" />
            <div className={styles.glitchLayer2} aria-hidden="true" />
            <div
              className={styles.beamLayer1}
              aria-hidden="true"
              style={{ animationDelay: BEAM_DELAY }}
            />
            <div
              className={styles.beamLayer2}
              aria-hidden="true"
              style={{ animationDelay: BEAM_DELAY }}
            />
          </div>
        )}
      </div>
    </>
  )
}
