"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Music, FileText, Inbox, CalendarDays } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const actions: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "New Beat", href: "/admin/beats", icon: Music },
  { label: "New Post", href: "/admin/blog", icon: FileText },
  { label: "Messages", href: "/admin/inbox", icon: Inbox },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action, i) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.075 }}
        >
          <Link
            href={action.href}
            className="group relative flex items-center gap-3 border border-[#222] bg-[#0a0a0a] px-4 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-[#000]"
          >
            <action.icon size={16} className="shrink-0" />
            <span>{action.label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
