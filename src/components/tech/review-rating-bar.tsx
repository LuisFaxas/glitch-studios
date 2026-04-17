"use client"

import { motion, useReducedMotion } from "motion/react"

interface ReviewRatingBarProps {
  label: string
  value: number
  delay?: number
}

export function ReviewRatingBar({ label, value, delay = 0 }: ReviewRatingBarProps) {
  const shouldReduceMotion = useReducedMotion()
  const clamped = Math.max(1, Math.min(10, value))
  const pct = (clamped / 10) * 100

  return (
    <div
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={1}
      aria-valuemax={10}
      aria-label={`${label} rating`}
      className="flex flex-col gap-2"
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888]">
          {label}
        </span>
        <span className="font-mono text-[15px] font-bold text-[#f5f5f0]">
          {clamped} / 10
        </span>
      </div>
      <div className="h-2 w-full bg-[#222]">
        <motion.div
          className="h-full bg-[#f5f5f0]"
          initial={{ width: shouldReduceMotion ? `${pct}%` : 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3, delay: shouldReduceMotion ? 0 : delay, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}
