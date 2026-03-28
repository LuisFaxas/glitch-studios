"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

export function StatTile({
  label,
  value,
  icon,
  index = 0,
}: {
  label: string
  value: string | number
  icon: ReactNode
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.075 }}
      className="border border-[#222222] bg-[#111111] p-4"
    >
      <div className="mb-3 flex items-center gap-2 text-[#888888]">
        {icon}
        <span className="font-mono text-[13px] font-bold uppercase">
          {label}
        </span>
      </div>
      <div className="font-mono text-[28px] font-bold leading-none text-[#f5f5f0]">
        {value}
      </div>
    </motion.div>
  )
}
