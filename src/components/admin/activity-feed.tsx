"use client"

import { motion } from "motion/react"
import { DollarSign, CalendarDays, Inbox } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export type ActivityItem = {
  type: "order" | "booking" | "message"
  description: string
  date: string // ISO string for serialization from server component
}

const iconMap = {
  order: DollarSign,
  booking: CalendarDays,
  message: Inbox,
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-[15px] text-[#555555]">No recent activity</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const Icon = iconMap[item.type]
        return (
          <motion.div
            key={`${item.type}-${i}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.4 + i * 0.05 }}
            className="flex items-center gap-3 border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3"
          >
            <Icon size={16} className="shrink-0 text-[#555555]" />
            <span className="flex-1 text-[15px] text-[#f5f5f0]">
              {item.description}
            </span>
            <span className="shrink-0 text-[13px] text-[#555555]">
              {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
