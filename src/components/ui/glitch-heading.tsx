import { type ReactNode } from "react"
import styles from "./glitch-heading.module.css"

interface GlitchHeadingProps {
  children: ReactNode
  text: string
  className?: string
}

/**
 * RGB-split glitch easter egg on heading hover.
 *
 * 2026-05-03 (debug/rankings-categories-filter-crash): converted to CSS-only.
 * Previously this was a client component that mounted the two layer spans
 * conditionally on a useState `hovered` flag, plus used `mix-blend-mode:
 * screen` and a `filter: hue-rotate` chain. That promoted GPU compositor
 * layers per heading, and the conditional mount on every hover added
 * synchronous DOM work in the same task as a pointer event. On real-mac
 * Safari/Firefox this compounded with route-transition cost and contributed
 * to the filter-state nav freeze. Now: layers always rendered (opacity 0
 * when not hovered), no mix-blend-mode, no filter — pure CSS hover with
 * flat color and clip-path keyframes.
 */
export function GlitchHeading({ children, text, className }: GlitchHeadingProps) {
  return (
    <span
      className={`${styles.wrapper} ${className ?? ""}`.trim()}
      aria-label={text}
    >
      {children}
      <span className={`${styles.layer} ${styles.layer1}`} aria-hidden="true">
        {text}
      </span>
      <span className={`${styles.layer} ${styles.layer2}`} aria-hidden="true">
        {text}
      </span>
    </span>
  )
}
