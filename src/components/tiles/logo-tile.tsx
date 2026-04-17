"use client"

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

export function LogoTile({
  className,
  logoClassName,
  onClick,
  href = "/",
  ariaLabel = "Glitch Studios — Home",
}: LogoTileProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "group flex w-full items-center justify-center rounded-none bg-transparent",
        className ?? "mb-2 px-3 py-4",
      )}
      aria-label={ariaLabel}
    >
      <div className={clsx(styles.glitchWrapper, logoClassName)}>
        <div className={styles.glitchImg} />
        <div className={styles.glitchLayer1} aria-hidden="true" />
        <div className={styles.glitchLayer2} aria-hidden="true" />
      </div>
    </Link>
  )
}
