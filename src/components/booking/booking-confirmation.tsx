"use client"

import { motion } from "motion/react"
import { Calendar, ExternalLink } from "lucide-react"

interface BookingConfirmationProps {
  serviceName: string
  date: string
  startTime: string
  endTime: string
  roomName: string
  bookingId: string
  status: "confirmed" | "pending"
  isLoggedIn?: boolean
}

export function BookingConfirmation({
  serviceName,
  date,
  startTime,
  endTime,
  roomName,
  bookingId,
  status,
  isLoggedIn,
}: BookingConfirmationProps) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <motion.div
      initial={
        prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }
      }
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.4, ease: "easeOut" }}
      className="max-w-xl mx-auto space-y-8"
    >
      {/* Heading */}
      <div className="text-center space-y-3">
        <h1 className="font-mono text-[28px] font-bold uppercase tracking-[0.02em] text-[#f5f5f0]">
          SESSION BOOKED
        </h1>

        {status === "confirmed" ? (
          <p className="font-mono text-[14px] text-[#888888]">
            Your {serviceName} session is confirmed for {date} at {startTime}.
            Check your email for details.
          </p>
        ) : (
          <p className="font-mono text-[14px] text-[#888888]">
            Your booking is pending admin confirmation. We&apos;ll email you once
            confirmed.
          </p>
        )}
      </div>

      {/* Booking details tile */}
      <div className="border border-[#222222] bg-[#111111] p-6 space-y-4">
        <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888]">
          Booking Details
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-mono text-[13px] text-[#888888]">Service</span>
            <span className="font-mono text-[14px] text-[#f5f5f0] font-bold">
              {serviceName}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-mono text-[13px] text-[#888888]">Date</span>
            <span className="font-mono text-[14px] text-[#f5f5f0]">{date}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-mono text-[13px] text-[#888888]">Time</span>
            <span className="font-mono text-[14px] text-[#f5f5f0]">
              {startTime} - {endTime}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-mono text-[13px] text-[#888888]">Room</span>
            <span className="font-mono text-[14px] text-[#f5f5f0]">
              {roomName}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-mono text-[13px] text-[#888888]">Status</span>
            <span
              className={`font-mono text-[14px] font-bold uppercase ${
                status === "confirmed" ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <a
          href={`/api/bookings/ics?bookingId=${bookingId}`}
          className="flex items-center justify-center gap-2 bg-[#f5f5f0] text-[#000000] font-mono font-bold uppercase px-6 py-3 tracking-[0.05em] hover:bg-[#ffffff] transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Add to Calendar
        </a>

        {isLoggedIn && (
          <a
            href="/dashboard/bookings"
            className="flex items-center justify-center gap-2 border border-[#333333] text-[#f5f5f0] font-mono font-bold uppercase px-6 py-3 tracking-[0.05em] hover:border-[#f5f5f0] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View My Bookings
          </a>
        )}
      </div>
    </motion.div>
  )
}
