"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, useReducedMotion } from "motion/react"
import logoStyles from "@/components/tiles/logo-tile.module.css"
import splashStyles from "./splash-overlay.module.css"

export function SplashOverlay({ children }: { children: React.ReactNode }) {
  // Start with splash pending — decide in useEffect (avoids SSR mismatch)
  const [splashState, setSplashState] = useState<"pending" | "playing" | "exiting" | "done">("pending")
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) {
      setSplashState("done")
      return
    }

    setSplashState("playing")
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [shouldReduceMotion])

  const handleLogoAnimationComplete = useCallback(() => {
    setTimeout(() => {
      setSplashState("exiting")
    }, 500)
  }, [])

  const handleExitComplete = useCallback(() => {
    document.body.style.overflow = ""
    setSplashState("done")
  }, [])

  // Children always render first (same tree position) so they never
  // remount when splash state changes. Overlay renders on top via z-50.
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
