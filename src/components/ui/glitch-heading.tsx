"use client"
import { useState, type ReactNode } from "react"
import styles from "./glitch-heading.module.css"

interface GlitchHeadingProps {
  children: ReactNode
  text: string
  className?: string
}

/**
 * Wraps heading text with a hover-only RGB-split glitch easter egg.
 * Site-wide rule: all headings use this. `text` must be a plain string —
 * it's duplicated into two absolutely-positioned layers for the effect.
 *
 * The `.layer` spans use `mix-blend-mode: screen`, which forces Firefox's
 * WebRender compositor to allocate a GPU layer for the wrapper EVEN WHEN
 * opacity is 0. On macOS Firefox this contributes to GPU-process exhaustion
 * during rapid DOM mutation (filter chip clicks → table re-renders → layout
 * recompute touches every heading on the page). To eliminate that idle GPU
 * cost without losing the easter egg, the layers only mount into the DOM
 * while the wrapper is actually hovered.
 */
export function GlitchHeading({ children, text, className }: GlitchHeadingProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      className={`${styles.wrapper} ${className ?? ""}`.trim()}
      aria-label={text}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && (
        <>
          <span className={`${styles.layer} ${styles.layer1}`} aria-hidden="true">
            {text}
          </span>
          <span className={`${styles.layer} ${styles.layer2}`} aria-hidden="true">
            {text}
          </span>
        </>
      )}
    </span>
  )
}
