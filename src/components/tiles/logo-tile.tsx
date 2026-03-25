"use client"

import Link from "next/link"
import styles from "./logo-tile.module.css"

export function LogoTile() {
  return (
    <Link
      href="/"
      className="group w-full flex items-center justify-center py-8 px-5 rounded-none bg-transparent mb-4"
      aria-label="Glitch Studios — Home"
    >
      <div className={styles.glitchWrapper}>
        <div className={styles.glitchImg} />
        <div className={styles.glitchLayer1} aria-hidden="true" />
        <div className={styles.glitchLayer2} aria-hidden="true" />
      </div>
    </Link>
  )
}
