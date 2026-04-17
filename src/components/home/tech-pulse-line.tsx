"use client"

import { motion, useReducedMotion } from "motion/react"

interface TechPulseLineProps {
  direction: "left" | "right"
}

// Full-width ECG path. viewBox 100x20, baseline y=10.
// Left chunk: flat baseline. Center: P-wave → Q dip → tall R peak → S dip → T hump. Right chunk: flat baseline.
// Path is drawn left-to-right; LEFT-side line flips via scaleX(-1) so the pulse travels outward from TECH.
const ECG_PATH =
  "M0 10 H42 L44 9.3 L46 10.5 L48 10 H53 L55 10.6 L57 11.4 L59 3 L61 17 L63 9 L66 7 L71 10 H100"

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

  return (
    <span className="relative flex h-5 flex-1 items-center" aria-hidden="true">
      <svg
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        className={`h-full w-full ${isLeft ? "-scale-x-100" : ""}`}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Dim static baseline trace (always visible) */}
        <path
          d={ECG_PATH}
          stroke="#f5f5f0"
          strokeOpacity="0.2"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Glow underlay — blurred, tracks the same pulse segment */}
        <motion.path
          d={ECG_PATH}
          stroke="#f5f5f0"
          strokeWidth="4"
          strokeOpacity="0.35"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "blur(2px)" }}
          initial={{ pathLength: 0.14, pathOffset: 0, opacity: 0 }}
          animate={{
            pathOffset: [0, 1],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            repeatDelay: 1.1,
            ease: [0.25, 0.1, 0.25, 1],
            times: [0, 0.08, 0.92, 1],
          }}
        />

        {/* Crisp foreground pulse */}
        <motion.path
          d={ECG_PATH}
          stroke="#f5f5f0"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0.14, pathOffset: 0, opacity: 0 }}
          animate={{
            pathOffset: [0, 1],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            repeatDelay: 1.1,
            ease: [0.25, 0.1, 0.25, 1],
            times: [0, 0.08, 0.92, 1],
          }}
        />
      </svg>
    </span>
  )
}
