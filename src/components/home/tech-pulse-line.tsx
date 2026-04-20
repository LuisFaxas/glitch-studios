"use client"

import { useId } from "react"
import { motion, useReducedMotion } from "motion/react"

interface TechPulseLineProps {
  delay?: number
}

// ECG path. viewBox 100x20, baseline y=10.
const ECG_PATH =
  "M0 10 H42 L44 9.3 L46 10.5 L48 10 H53 L55 10.6 L57 11.4 L59 3 L61 17 L63 9 L66 7 L71 10 H100"

export function TechPulseLine({ delay = 0 }: TechPulseLineProps) {
  const id = useId()
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
        {/* Baseline — full ECG path at low opacity */}
        <path
          d={ECG_PATH}
          stroke="#f5f5f0"
          strokeOpacity="0.35"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Bright pulse — entire path is drawn, but colored by a moving
         *  linear gradient whose bright band slides from left to right. */}
        <path
          d={ECG_PATH}
          stroke={`url(#${id})`}
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
          style={{
            filter:
              "drop-shadow(0 0 2px rgba(245,245,240,0.8)) drop-shadow(0 0 6px rgba(245,245,240,0.35))",
          }}
        />

        <defs>
          <motion.linearGradient
            id={id}
            gradientUnits="userSpaceOnUse"
            initial={{ x1: "-20%", x2: "0%", y1: "0%", y2: "0%" }}
            animate={{
              x1: ["-20%", "100%"],
              x2: ["0%", "120%"],
              y1: ["0%", "0%"],
              y2: ["0%", "0%"],
            }}
            transition={{
              delay,
              duration: 1,
              ease: "linear",
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <stop offset="0%" stopColor="#f5f5f0" stopOpacity="0" />
            <stop offset="50%" stopColor="#f5f5f0" stopOpacity="1" />
            <stop offset="100%" stopColor="#f5f5f0" stopOpacity="0" />
          </motion.linearGradient>
        </defs>
      </svg>
    </span>
  )
}
