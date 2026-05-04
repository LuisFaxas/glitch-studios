"use client"

import { motion, useReducedMotion } from "motion/react"

export function ScrollArrow() {
  const shouldReduceMotion = useReducedMotion()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const section = e.currentTarget.closest("section")
    if (!section) return
    window.scrollTo({
      top: section.offsetTop + section.offsetHeight,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to next section"
      className="flex flex-col items-center gap-3 cursor-pointer bg-transparent border-0 p-0 text-[#f5f5f0] hover:text-white transition-colors"
    >
      {/* Single bold arrow */}
      <motion.div
        animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <svg width="40" height="24" viewBox="0 0 40 20" className="text-current">
          <path d="M4 4 L20 16 L36 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="square" />
        </svg>
      </motion.div>
    </button>
  )
}
