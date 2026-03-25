"use client"

import { type ReactNode, useState, useCallback } from "react"
import Link from "next/link"
import clsx from "clsx"

export type TileSize = "small" | "medium" | "wide" | "large"

export interface TileProps {
  size?: TileSize
  label?: string
  sublabel?: string
  icon?: ReactNode
  isActive?: boolean
  href?: string
  onClick?: () => void
  children?: ReactNode
  className?: string
}

const sizeClasses: Record<TileSize, string> = {
  small: "col-span-1 row-span-1 aspect-square",
  medium: "col-span-2 row-span-1",
  wide: "col-span-2 row-span-1",
  large: "col-span-2 row-span-2",
}

export function Tile({
  size = "medium",
  label,
  sublabel,
  icon,
  isActive = false,
  href,
  onClick,
  children,
  className,
}: TileProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => {
    if (!isActive) setIsHovered(true)
  }, [isActive])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const baseClasses = clsx(
    // Grid sizing
    sizeClasses[size],
    // Layout
    "relative flex flex-col items-start justify-start gap-2 overflow-hidden",
    // Padding & border
    "p-4 border border-solid",
    // Sharp corners (0px border-radius)
    "rounded-none",
    // Transition
    "transition-colors duration-200",
    // Focus
    "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2",
    // Active state: inverted white bg, black text, glow
    isActive && [
      "bg-[#f5f5f0] border-[#f5f5f0] text-[#000000]",
      "shadow-[0_0_20px_rgba(255,255,255,0.08)]",
    ],
    // Default state: dark bg, subtle border
    !isActive && [
      "bg-[#111111] border-[#222222] text-[#f5f5f0]",
      "cursor-pointer",
    ],
    // Hover state (when not active)
    !isActive && isHovered && [
      "bg-[#1a1a1a] border-[#444444]",
    ],
    // Pressed state
    !isActive && "active:bg-[#0a0a0a] active:scale-[0.97] active:duration-100",
    className,
  )

  const content = (
    <>
      {/* Glitch hover animation overlay */}
      {isHovered && !isActive && (
        <span
          className="pointer-events-none absolute inset-0 animate-glitch-hover"
          aria-hidden="true"
        />
      )}

      {/* Scan line pseudo-element */}
      {isHovered && !isActive && (
        <span
          className="pointer-events-none absolute left-0 h-px w-full animate-scan-line bg-[rgba(255,255,255,0.1)]"
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      {icon && (
        <span className="flex-shrink-0 [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Label */}
      {label && (
        <span
          className={clsx(
            "font-mono text-lg font-bold uppercase tracking-[0.05em]",
            size === "large" && "text-center w-full",
          )}
        >
          {label}
        </span>
      )}

      {/* Sublabel */}
      {sublabel && (
        <span className="font-sans text-[13px] font-normal text-[#888888]">
          {sublabel}
        </span>
      )}

      {/* Custom children (for widget content) */}
      {children}
    </>
  )

  const sharedProps = {
    className: baseClasses,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    ...(isActive && { "aria-current": "page" as const }),
  }

  // Render as Link if href provided
  if (href) {
    return (
      <Link href={href} {...sharedProps}>
        {content}
      </Link>
    )
  }

  // Render as button if onClick provided
  if (onClick) {
    return (
      <button type="button" onClick={onClick} {...sharedProps}>
        {content}
      </button>
    )
  }

  // Render as div (for widget containers)
  return (
    <div {...sharedProps} tabIndex={0}>
      {content}
    </div>
  )
}

export type { TileProps as TileComponentProps }
