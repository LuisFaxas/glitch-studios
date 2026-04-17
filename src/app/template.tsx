"use client"

import { useRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const prevRef = useRef<string>(pathname)
  const prevPath = prevRef.current
  prevRef.current = pathname

  const prevIsTech = prevPath.startsWith("/tech")
  const currIsTech = pathname.startsWith("/tech")
  const isCrossBrand = prevIsTech !== currIsTech

  const flickerDuration = isCrossBrand ? 0.35 : 0.2
  const flickerOpacity = isCrossBrand ? 0.85 : 0.6
  const pageInitialOpacity = isCrossBrand ? 0 : 1

  if (shouldReduceMotion) {
    return <div key={pathname} className="relative w-full">{children}</div>
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: pageInitialOpacity }}
      animate={{ opacity: 1 }}
      transition={{
        duration: flickerDuration,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      className="relative w-full"
      data-cross-brand={isCrossBrand ? "true" : "false"}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-50 animate-glitch-hover"
        initial={{ opacity: flickerOpacity }}
        animate={{ opacity: 0 }}
        transition={{
          duration: flickerDuration,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        aria-hidden="true"
      />
      {children}
    </motion.div>
  )
}
