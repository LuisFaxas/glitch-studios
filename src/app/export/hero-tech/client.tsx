"use client"

import { useEffect, useState } from "react"
import { TechPulseLine } from "@/components/home/tech-pulse-line"
import styles from "@/components/tiles/logo-tile.module.css"
import { EXPORT_SHELL_CSS } from "../_export-shell"

declare global {
  interface Window {
    __armCapture?: () => void
  }
}

// The animated subtree only mounts after the capture script calls
// `window.__armCapture()`. This guarantees that animation phase 0 (pulse just
// starting from the left edge, beam-glitch idle) coincides with capture frame
// 0, so the recorded loop begins exactly where the user expects it to.
//
// Until armed we render only the empty #export-root, which lets the capture
// script wait on `document.body.dataset.exportReady === 'true'` to know fonts
// + logo PNG have decoded and the page is ready for the arm signal.
export function ExportHeroTechClient({
  logoSize,
  bg,
}: {
  logoSize: number
  bg: string
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
      {bg !== "transparent" && (
        <style>{`html, body { background: ${bg} !important; } #export-root { background: ${bg}; }`}</style>
      )}
      <div id="export-root">
        {armed && (
          <div
            className="flex flex-col items-center gap-3 md:gap-4"
            style={{ width: `${logoSize}px` }}
          >
            <div className={styles.glitchWrapper}>
              <div className={styles.glitchImg} />
              <div className={styles.glitchLayer1} aria-hidden="true" />
              <div className={styles.glitchLayer2} aria-hidden="true" />
              <div className={styles.beamLayer1} aria-hidden="true" />
              <div className={styles.beamLayer2} aria-hidden="true" />
            </div>
            <div className="flex w-full items-center gap-3 md:gap-4">
              <TechPulseLine delay={0} />
              <span
                className={`${styles.glitchTextWrapper} font-mono text-lg md:text-3xl font-bold uppercase tracking-[0.5em] text-[#f5f5f0]`}
                aria-label="Tech"
              >
                TECH
                <span
                  className={`${styles.glitchTextLayer} ${styles.glitchTextLayer1}`}
                  aria-hidden="true"
                >
                  TECH
                </span>
                <span
                  className={`${styles.glitchTextLayer} ${styles.glitchTextLayer2}`}
                  aria-hidden="true"
                >
                  TECH
                </span>
              </span>
              <TechPulseLine delay={1} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
