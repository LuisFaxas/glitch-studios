import type { ReactNode } from "react"
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
 */
export function GlitchHeading({ children, text, className }: GlitchHeadingProps) {
  return (
    <span className={`${styles.wrapper} ${className ?? ""}`.trim()} aria-label={text}>
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
