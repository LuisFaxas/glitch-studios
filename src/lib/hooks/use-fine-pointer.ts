"use client"

import { useEffect, useState } from "react"

/**
 * `true` when the primary input is mouse/trackpad (`pointer: fine`).
 * Returns `false` until the first paint to avoid SSR/hydration mismatch
 * — falsey for the first frame is the safer default (no hover preview).
 *
 * Used by <MediaEmbed> per CONTEXT D-03: mobile (pointer: coarse) skips
 * the hover-preview swap entirely.
 */
export function useFinePointer(): boolean {
  const [isFine, setIsFine] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia("(pointer: fine)")
    const onChange = () => setIsFine(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return isFine
}
