"use client"

import { motion, useReducedMotion } from "motion/react"

interface TechPulseLineProps {
  /** Seconds to delay the first pulse iteration. Used to stagger left+right
   *  so a single pulse appears to travel continuously across the full width. */
  delay?: number
}

// ECG path. viewBox 100x20, baseline y=10.
// Flat → P wave → Q dip → tall R spike → S dip → T hump → flat.
// Both sides draw the path left-to-right — no scaleX flip — so the pulse
// visually continues in the same direction as it crosses the TECH gap.
const ECG_PATH =
  "M0 10 H42 L44 9.3 L46 10.5 L48 10 H53 L55 10.6 L57 11.4 L59 3 L61 17 L63 9 L66 7 L71 10 H100"

export function TechPulseLine({ delay = 0 }: TechPulseLineProps) {
  const prefersReduced = useReducedMotion()

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
        className="h-full w-full"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: "visible" }}
      >
        {/* Flat baseline — the heart-monitor resting line. */}
        <line
          x1="0"
          y1="10"
          x2="100"
          y2="10"
          stroke="#f5f5f0"
          strokeOpacity="0.35"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Single bright pulse — CSS drop-shadow provides the glow halo.
         *  Active for 1s per 2s cycle; right-side instance delays by 1s so its
         *  appearance coincides with the left-side pulse finishing behind TECH. */}
        <motion.path
          d={ECG_PATH}
          stroke="#f5f5f0"
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
          style={{
            filter:
              "drop-shadow(0 0 2px rgba(245,245,240,0.8)) drop-shadow(0 0 6px rgba(245,245,240,0.35))",
          }}
          initial={{ pathLength: 0.28, pathOffset: 0, opacity: 0 }}
          animate={{
            pathOffset: [0, 0, 1, 1],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay,
            times: [0, 0.02, 0.5, 0.52],
          }}
        />
      </svg>
    </span>
  )
}
