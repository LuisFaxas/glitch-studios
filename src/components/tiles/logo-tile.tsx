"use client"

import { useState } from "react"
import Link from "next/link"
import clsx from "clsx"
import styles from "./logo-tile.module.css"

interface LogoTileProps {
  className?: string
  logoClassName?: string
  onClick?: () => void
  href?: string
  ariaLabel?: string
}

// Glitch layers only mount into the DOM while hovered. Same fix pattern as
// GlitchHeading (commit earlier in session): the .glitchLayer1/.glitchLayer2
// divs use mix-blend-mode: screen + filter: hue-rotate/saturate/brightness,
// which on macOS Safari + Firefox forces the renderer to allocate a GPU
// compositing layer for the wrapper EVEN WHEN the layers are opacity:0.
// The TileNav (sidebar) renders this on every page, so the always-allocated
// GPU layers contributed to the cold-load runaway. Lazy-mount eliminates the
// idle GPU cost while preserving the hover easter egg.
export function LogoTile({
  className,
  logoClassName,
  onClick,
  href = "/",
  ariaLabel = "Glitch Studios — Home",
}: LogoTileProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "group flex w-full items-center justify-center rounded-none bg-transparent",
        className ?? "mb-2 px-3 py-4",
      )}
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={clsx(styles.glitchWrapper, logoClassName)}>
        <div className={styles.glitchImg} />
        {hovered && (
          <>
            <div className={styles.glitchLayer1} aria-hidden="true" />
            <div className={styles.glitchLayer2} aria-hidden="true" />
          </>
        )}
      </div>
    </Link>
  )
}
