"use client"

import { useEffect, useState } from "react"

/**
 * `true` when user has `prefers-reduced-motion: reduce` set.
 * Mirrors what motion/Framer's useReducedMotion returns, but works for plain
 * DOM/iframe-swap logic that isn't going through Framer.
 *
 * Used by <MediaEmbed> per CONTEXT D-05: reduced-motion users skip the
 * hover-autoplay iframe swap entirely (static thumbnail + click-to-play only).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return reduced
}
