"use client"

import Link from "next/link"
import styles from "./logo-tile.module.css"

export function LogoTile() {
  return (
    <Link
      href="/"
      className="group w-full flex items-center justify-center py-8 rounded-none bg-transparent mb-1"
      aria-label="Glitch Studios — Home"
    >
      <div className={styles.glitchWrapper} aria-hidden="true">
        <span className={styles.glitchText} data-text="GLITCH">
          GLITCH
        </span>
      </div>
    </Link>
  )
}
