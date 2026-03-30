"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import logoStyles from "@/components/tiles/logo-tile.module.css"
import splashStyles from "./splash-overlay.module.css"

export function SplashOverlay({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false)
  const [mounted, setMounted] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)

    // Skip splash entirely for reduced motion users
    if (shouldReduceMotion) {
      sessionStorage.setItem("glitch-splash-seen", "true")
      return
    }

    const seen = sessionStorage.getItem("glitch-splash-seen")
    if (!seen) {
      setShowSplash(true)
      document.body.style.overflow = "hidden"
    }

    // Cleanup: restore scroll if component unmounts during splash
    return () => {
      document.body.style.overflow = ""
    }
  }, [shouldReduceMotion])

  const handleSplashComplete = () => {
    sessionStorage.setItem("glitch-splash-seen", "true")
    document.body.style.overflow = ""
    setShowSplash(false)
  }

  // On server or before hydration, render children only
  if (!mounted) return <>{children}</>

  return (
    <>
      <AnimatePresence onExitComplete={handleSplashComplete}>
        {showSplash && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-[80vw] max-w-[600px]"
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1.2,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              onAnimationComplete={() => {
                // Hold for 0.5s then trigger exit
                setTimeout(() => {
                  setShowSplash(false)
                }, 500)
              }}
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
      </AnimatePresence>
      {children}
    </>
  )
}
