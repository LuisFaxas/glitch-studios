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
  /** Opt-in horizontal layout for nav tiles. Default is vertical (flex-col). */
  layout?: "horizontal" | "vertical"
  /** When true, hide label/sublabel and reduce padding (icon-only mode). */
  compact?: boolean
}

const sizeClasses: Record<TileSize, string> = {
  small: "col-span-1 row-span-1",
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
  layout = "vertical",
  compact = false,
}: TileProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => {
    if (!isActive) setIsHovered(true)
  }, [isActive])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  // Large tiles always use vertical layout regardless of prop
  const effectiveLayout = size === "large" ? "vertical" : layout

  const contentLayoutClasses =
    effectiveLayout === "horizontal"
      ? "flex flex-row items-center gap-3"
      : "flex flex-col items-start justify-start gap-2"

  const baseClasses = clsx(
    // Grid sizing
    sizeClasses[size],
    // Layout
    "relative overflow-hidden",
    contentLayoutClasses,
    // Padding — wide tiles get extra vertical padding for thickness
    compact ? "p-2" : size === "wide" ? "px-4 py-5" : "p-4",
    "border border-solid",
    // Sharp corners (0px border-radius)
    "rounded-none",
    // Transition
    "transition-colors duration-200",
    // Focus
    "outline-none focus-visible:outline-1 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2",
    // Active state: inverted white bg, black text, stronger glow
    isActive && [
      "bg-[#f5f5f0] border-[#f5f5f0] text-[#000000]",
      "shadow-[0_0_20px_rgba(255,255,255,0.12)]",
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
      {/* Icon */}
      {icon && (
        <span className="flex-shrink-0 [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Label */}
      {label && !compact && (
        <span
          className={clsx(
            "font-mono font-bold uppercase tracking-[0.05em]",
            size === "wide" ? "text-2xl" : size === "small" ? "text-sm" : "text-xl",
            size === "large" && "text-center w-full",
          )}
        >
          {label}
        </span>
      )}

      {/* Sublabel */}
      {sublabel && !compact && (
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
