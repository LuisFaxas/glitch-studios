"use client"

import { motion } from "motion/react"
import { usePathname } from "next/navigation"

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, delay: 0.05 }}
      className="relative w-full"
    >
      {/* Glitch overlay that plays on page entry then fades */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-50 animate-glitch-hover"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      />
      {children}
    </motion.div>
  )
}
