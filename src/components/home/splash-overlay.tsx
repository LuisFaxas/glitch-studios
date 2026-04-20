"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "motion/react"
import logoStyles from "@/components/tiles/logo-tile.module.css"
import splashStyles from "./splash-overlay.module.css"
import type { SplashMode } from "@/lib/get-splash-mode"

// localStorage key used by first_visit mode to remember a visitor has
// already seen the intro across browser sessions.
const SEEN_KEY = "glitch-splash-seen"

interface SplashOverlayProps {
  children: React.ReactNode
  mode?: SplashMode
}

export function SplashOverlay({
  children,
  mode = "first_visit",
}: SplashOverlayProps) {
  // Start with splash pending — decide in useEffect (avoids SSR mismatch
  // and lets us safely read localStorage).
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
      let seen = false
      try {
        seen = localStorage.getItem(SEEN_KEY) === "1"
      } catch {
        // Private mode / localStorage unavailable — treat as first visit.
      }
      if (seen) {
        setSplashState("done")
        return
      }
      try {
        localStorage.setItem(SEEN_KEY, "1")
      } catch {
        // ignore
      }
    }

    setSplashState("playing")
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [mode])

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
