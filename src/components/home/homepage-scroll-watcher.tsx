"use client"

import { useEffect } from "react"
import { useScroll, useMotionValueEvent } from "motion/react"
import { useSidebar } from "@/components/layout/sidebar-context"

/**
 * Watches scroll position on the homepage and toggles sidebar collapsed state.
 * Expands sidebar when scrolled past ~70vh (hero section threshold).
 * Collapses sidebar when scrolled back near the top (~30vh).
 * Renders nothing visible -- purely a behavior hook.
 */
export function HomepageScrollWatcher() {
  const { scrollY } = useScroll()
  const { setCollapsed, isHomepage } = useSidebar()

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!isHomepage) return

    const threshold = window.innerHeight * 0.7
    const collapseThreshold = window.innerHeight * 0.3

    if (latest > threshold) {
      setCollapsed(false)
    } else if (latest <= collapseThreshold) {
      setCollapsed(true)
    }
  })

  return null
}
