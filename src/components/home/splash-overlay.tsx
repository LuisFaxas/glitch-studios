"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "motion/react"
import logoStyles from "@/components/tiles/logo-tile.module.css"
import splashStyles from "./splash-overlay.module.css"
import type { SplashMode } from "@/lib/get-splash-mode"

// D-05 (Phase 16.1): Fixed render gate.
// Root cause was: splash used `localStorage` with a single global key
// `"glitch-splash-seen"`. Any visitor who saw it ONCE EVER never saw it
// again on return visits — that's why the splash appeared "intermittent"
// (actually: deterministic non-render for returning visitors).
// Fix: use `sessionStorage` so the key clears on tab close; "first_visit"
// mode now means "first visit within this browser session", matching the
// Phase 16.1 CONTEXT.md D-03/D-04 decision. Task 2 further specialises
// the key per-brand.
// Do not revert to localStorage — doing so reintroduces the bug.

interface SplashOverlayProps {
  children: React.ReactNode
  mode?: SplashMode
  /** D-03/D-04 (Phase 16.1): per-brand sessionStorage key. Tech routes
   *  pass `"tech"`, Studios routes pass `"studios"` (default). */
  brand?: "studios" | "tech"
}

export function SplashOverlay({
  children,
  mode = "first_visit",
  brand = "studios",
}: SplashOverlayProps) {
  // Start with splash pending — decide in useEffect (avoids SSR mismatch
  // and lets us safely read sessionStorage).
  const [splashState, setSplashState] = useState<
    "pending" | "playing" | "exiting" | "done"
  >("pending")

  useEffect(() => {
    // Admin-controlled — no OS reduce-motion bypass here. The individual
    // motion.div animations inside still honor prefers-reduced-motion
    // because motion/react does that automatically.
    if (mode === "never") {
      setSplashState("done")
      return
    }

    if (mode === "first_visit") {
      // D-03/D-04 (Phase 16.1): per-brand sessionStorage keys so each
      // brand fires once per session. Keys clear when the tab closes.
      const storageKey =
        brand === "tech"
          ? "glitch_tech_splash_seen"
          : "glitch_studios_splash_seen"
      let seen = false
      try {
        seen = sessionStorage.getItem(storageKey) === "1"
      } catch {
        // Private mode / sessionStorage unavailable — treat as first visit.
      }
      if (seen) {
        setSplashState("done")
        return
      }
      try {
        sessionStorage.setItem(storageKey, "1")
      } catch {
        // ignore
      }
    }

    setSplashState("playing")
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [mode, brand])

  const handleLogoAnimationComplete = useCallback(() => {
    setTimeout(() => {
      setSplashState("exiting")
    }, 500)
  }, [])

  const handleExitComplete = useCallback(() => {
    document.body.style.overflow = ""
    setSplashState("done")
  }, [])

  return (
    <>
      {children}
      {splashState === "pending" && (
        <div className="fixed inset-0 z-50 bg-black" />
      )}
      {(splashState === "playing" || splashState === "exiting") && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          animate={{ opacity: splashState === "exiting" ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={() => {
            if (splashState === "exiting") handleExitComplete()
          }}
        >
          <motion.div
            className="w-[80vw] max-w-[600px]"
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.2,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            onAnimationComplete={handleLogoAnimationComplete}
          >
            <div className={logoStyles.glitchWrapper}>
              <div className={logoStyles.glitchImg} />
              <div
                className={`${logoStyles.glitchLayer1} ${splashStyles.splashGlitchLayer1}`}
                aria-hidden="true"
              />
              <div
                className={`${logoStyles.glitchLayer2} ${splashStyles.splashGlitchLayer2}`}
                aria-hidden="true"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
