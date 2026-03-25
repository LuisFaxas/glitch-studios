"use client"

import { useState, useCallback } from "react"
import { motion } from "motion/react"
import clsx from "clsx"

interface LogoTileProps {
  /** When true, render as a small square (no col-span-2/row-span-2). */
  compact?: boolean
}

export function LogoTile({ compact = false }: LogoTileProps) {
  const [entranceDone, setEntranceDone] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleEntranceComplete = useCallback(() => {
    setEntranceDone(true)
    // Trigger single post-entrance glitch ("power-on" lock-in effect)
    setGlitchActive(true)
    const timer = setTimeout(() => setGlitchActive(false), 200)
    return () => clearTimeout(timer)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (entranceDone) setIsHovered(true)
  }, [entranceDone])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const showGlitch = glitchActive || isHovered

  return (
    <motion.div
      role="img"
      aria-label="Glitch Studios"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      onAnimationComplete={handleEntranceComplete}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        // Grid sizing: 2x2 large tile unless compact
        compact ? "aspect-square" : "col-span-2 row-span-2 aspect-square",
        // Layout
        "relative overflow-hidden",
        // Padding & border
        "p-4 border border-solid rounded-none",
        // Background
        "bg-[#111111]",
        // Explicit minimum height fallback
        !compact && "min-h-[120px]",
        // Border states
        isHovered ? "border-[#444444]" : "border-[#222222]",
        // Two-layer warm white glow
        "shadow-[0_0_25px_rgba(255,250,240,0.25),0_0_50px_rgba(255,250,240,0.08)]",
      )}
    >
      {/* Glitch hover animation overlay — duplicates logo content */}
      {showGlitch && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden animate-glitch-hover motion-reduce:hidden"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-center bg-contain bg-no-repeat"
            style={{
              backgroundImage: "url(/Untitled-2.png)",
              filter: "invert(1)",
            }}
          />
        </div>
      )}

      {/* Scan line on hover */}
      {isHovered && (
        <span
          className="pointer-events-none absolute left-0 h-px w-full animate-scan-line bg-[rgba(255,255,255,0.1)] motion-reduce:hidden"
          aria-hidden="true"
        />
      )}

      {/* Logo image — inverted for white-on-dark visibility */}
      <div
        className="absolute inset-0 bg-center bg-contain bg-no-repeat"
        style={{
          backgroundImage: "url(/Untitled-2.png)",
          filter: "invert(1)",
        }}
        aria-hidden="true"
      />
    </motion.div>
  )
}
