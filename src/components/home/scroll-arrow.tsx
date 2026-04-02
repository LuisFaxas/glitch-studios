"use client"

import { motion, useReducedMotion } from "motion/react"

export function ScrollArrow() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Single bold arrow */}
      <motion.div
        animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <svg width="40" height="24" viewBox="0 0 40 20" className="text-[#f5f5f0]">
          <path d="M4 4 L20 16 L36 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="square" />
        </svg>
      </motion.div>

    </div>
  )
}
