"use client"

import { motion, useReducedMotion } from "motion/react"

interface TechPulseLineProps {
  direction: "left" | "right"
}

// Classic ECG waveform in a 80x20 viewBox, baseline at y=10.
// Structure: flat lead-in → P wave bump → flat → Q dip → tall R peak → S dip → T hump → flat trail.
const ECG_PATH =
  "M0 10 L18 10 L20 9 L22 10.5 L24 10 L26 10 L28 11 L30 3 L32 17 L34 10 L37 7 L42 10 L80 10"

export function TechPulseLine({ direction }: TechPulseLineProps) {
  const prefersReduced = useReducedMotion()
  const isLeft = direction === "left"

  if (prefersReduced) {
    return (
      <span className="relative flex h-5 flex-1 items-center" aria-hidden="true">
        <span className="block h-px w-full bg-[#f5f5f0]/40" />
      </span>
    )
  }

  // Pulse SVG is 5rem (80px) wide. Travel range:
  // - emerge from behind TECH (just off the TECH-side edge, opacity 0)
  // - full-width travel across the baseline
  // - exit past the logo-side edge (opacity 0)
  const xFrom = isLeft ? "100%" : "-100%"
  const xTo = isLeft ? "-100%" : "100%"

  return (
    <span
      className="relative flex h-5 flex-1 items-center overflow-hidden"
      aria-hidden="true"
    >
      {/* Static dim baseline */}
      <span className="block h-px w-full bg-[#f5f5f0]/30" />

      {/* Traveling ECG pulse */}
      <motion.svg
        viewBox="0 0 80 20"
        className={`pointer-events-none absolute top-1/2 h-5 w-20 -translate-y-1/2 ${
          isLeft ? "right-0" : "left-0"
        }`}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ x: xFrom, opacity: 0 }}
        animate={{
          x: [xFrom, xFrom, xTo, xTo],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          repeatDelay: 0.6,
          ease: [0.22, 0.61, 0.36, 1],
          times: [0, 0.05, 0.9, 1],
        }}
      >
        <defs>
          <filter id={`pulse-glow-${direction}`} x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>

        {/* Soft glow underlay */}
        <path
          d={ECG_PATH}
          stroke="#f5f5f0"
          strokeWidth="3"
          strokeOpacity="0.22"
          filter={`url(#pulse-glow-${direction})`}
        />

        {/* Crisp foreground trace */}
        <path d={ECG_PATH} stroke="#f5f5f0" strokeWidth="1.3" />
      </motion.svg>
    </span>
  )
}
