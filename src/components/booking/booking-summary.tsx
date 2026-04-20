"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { ServiceBookingInfo, TimeSlot } from "@/types/booking"

interface BookingSummaryProps {
  selectedService: ServiceBookingInfo | null
  selectedDate: string | null
  selectedTime: TimeSlot | null
  depositAmount: number | null
  totalPrice: number | null
}

const DASH = "\u2014"

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatTimeHm(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`
}

function formatTimeShort(time: string): string {
  const [h] = time.split(":").map(Number)
  const period = h >= 12 ? "pm" : "am"
  const hour12 = h % 12 || 12
  return `${hour12}${period}`
}

function formatTimeRange(slot: TimeSlot): string {
  return `${formatTimeHm(slot.startTime)} \u2013 ${formatTimeHm(slot.endTime)}`
}

function formatDurationMinutes(minutes: number): string {
  if (minutes >= 60) {
    const h = minutes / 60
    const rounded = h % 1 === 0 ? h.toString() : h.toFixed(1)
    return `${rounded} hour${h === 1 ? "" : "s"}`
  }
  return `${minutes} minutes`
}

function formatDepositLine(
  depositAmount: number | null,
  totalPrice: number | null
): string {
  if (depositAmount === null) return DASH
  const depositDollars = (depositAmount / 100).toFixed(2)
  if (totalPrice !== null && totalPrice > 0) {
    const percent = Math.round((depositAmount / 100 / totalPrice) * 100)
    return `$${depositDollars} (${percent}% of $${totalPrice.toFixed(2)})`
  }
  return `$${depositDollars}`
}

function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888]">
        {label}
      </span>
      <span
        className={`font-sans text-[14px] leading-[1.5] ${
          muted ? "text-[#555555]" : "text-[#f5f5f0]"
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function SummaryRows({
  selectedService,
  selectedDate,
  selectedTime,
  depositAmount,
  totalPrice,
}: BookingSummaryProps) {
  return (
    <div className="space-y-2">
      <SummaryRow
        label="SERVICE"
        value={selectedService?.serviceName ?? DASH}
        muted={!selectedService}
      />
      <SummaryRow
        label="DATE"
        value={selectedDate ? formatDateLong(selectedDate) : DASH}
        muted={!selectedDate}
      />
      <SummaryRow
        label="TIME"
        value={selectedTime ? formatTimeRange(selectedTime) : DASH}
        muted={!selectedTime}
      />
      <SummaryRow
        label="DURATION"
        value={
          selectedService?.durationMinutes
            ? formatDurationMinutes(selectedService.durationMinutes)
            : DASH
        }
        muted={!selectedService?.durationMinutes}
      />
      <SummaryRow
        label="DEPOSIT"
        value={formatDepositLine(depositAmount, totalPrice)}
        muted={depositAmount === null}
      />
    </div>
  )
}

export function BookingSummary(props: BookingSummaryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedService, selectedDate, selectedTime } = props

  const statusLine =
    [
      selectedService?.serviceName,
      selectedDate && formatDateShort(selectedDate),
      selectedTime && formatTimeShort(selectedTime.startTime),
    ]
      .filter(Boolean)
      .join(" \u00b7 ") || "Nothing selected yet"

  return (
    <div className="w-full lg:w-[320px] flex-shrink-0">
      {/* Desktop: fixed 320px sidebar */}
      <div className="hidden lg:block sticky top-6 bg-[#111111] border border-[#222222] p-6">
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-4">
          BOOKING SUMMARY
        </h3>
        <SummaryRows {...props} />
      </div>

      {/* Mobile: 48px collapsible header */}
      <div className="lg:hidden bg-[#111111] border border-[#222222]">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 flex items-center justify-between px-4"
          aria-expanded={isOpen}
        >
          <span className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            BOOKING SUMMARY
          </span>
          <span className="flex items-center gap-2 text-[#888888] min-w-0">
            <span className="font-sans text-[14px] truncate max-w-[180px]">
              {statusLine}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </span>
        </button>
        {isOpen && (
          <div className="px-4 pb-4 border-t border-[#222222] pt-3">
            <SummaryRows {...props} />
          </div>
        )}
      </div>
    </div>
  )
}
