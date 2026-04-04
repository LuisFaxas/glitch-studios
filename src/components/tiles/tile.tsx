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
  /** Denser presentation for space-constrained mobile layouts. */
  density?: "default" | "compact"
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
  density = "default",
}: TileProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isInteractive = Boolean(href || onClick)

  const handleMouseEnter = useCallback(() => {
    if (!isActive && isInteractive) setIsHovered(true)
  }, [isActive, isInteractive])

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
    compact
      ? "p-2"
      : density === "compact"
        ? size === "wide"
          ? "px-3 py-3"
          : "p-3"
        : size === "wide"
          ? "px-4 py-5"
          : "p-4",
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
      isInteractive && "cursor-pointer",
    ],
    // Hover state (when not active)
    !isActive && isInteractive && isHovered && [
      "bg-[#1a1a1a] border-[#444444]",
    ],
    // Pressed state
    !isActive &&
      isInteractive &&
      "active:bg-[#0a0a0a] active:scale-[0.97] active:duration-100",
    className,
  )

  const content = (
    <>
      {/* Glitch hover overlay */}
      {isHovered && isInteractive && !isActive && (
        <div
          className="pointer-events-none absolute inset-0 bg-[#f5f5f0]/5 animate-glitch-hover motion-reduce:hidden"
          style={{ animationDuration: "100ms" }}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      {icon && (
        <span
          className={clsx(
            "flex-shrink-0",
            density === "compact" ? "[&>svg]:h-4 [&>svg]:w-4" : "[&>svg]:h-5 [&>svg]:w-5",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {/* Label */}
      {label && !compact && (
        <span
          className={clsx(
            "font-mono font-bold uppercase",
            "leading-none whitespace-nowrap",
            density === "compact" ? "tracking-[0.02em]" : "tracking-[0.05em]",
            density === "compact"
              ? size === "wide"
                ? "text-[12px]"
                : size === "small"
                  ? "text-[9px]"
                  : "text-[11px]"
              : size === "wide"
                ? "text-2xl"
                : size === "small"
                  ? "text-sm"
                  : "text-xl",
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
      <Link href={href} onClick={onClick} {...sharedProps}>
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
    <div {...sharedProps}>
      {content}
    </div>
  )
}

export type { TileProps as TileComponentProps }
