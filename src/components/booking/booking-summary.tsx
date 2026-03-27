"use client"

import { useState } from "react"
import clsx from "clsx"
import { ChevronDown } from "lucide-react"
import type { ServiceBookingInfo, TimeSlot } from "@/types/booking"

interface BookingSummaryProps {
  selectedService: ServiceBookingInfo | null
  selectedDate: string | null
  selectedTime: TimeSlot | null
  depositAmount: number | null
}

export function BookingSummary({
  selectedService,
  selectedDate,
  selectedTime,
  depositAmount,
}: BookingSummaryProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasSelections = selectedService || selectedDate || selectedTime

  const formatDate = (date: string) => {
    const d = new Date(date + "T12:00:00")
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    const period = h >= 12 ? "PM" : "AM"
    const hour12 = h % 12 || 12
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`
  }

  const content = (
    <div className="flex flex-col gap-4">
      {!hasSelections && (
        <p className="font-sans text-[15px] text-[#888888]">
          Select a service to begin
        </p>
      )}

      {selectedService && (
        <SummaryRow label="Service" value={selectedService.serviceName} />
      )}

      {selectedDate && (
        <SummaryRow label="Date" value={formatDate(selectedDate)} />
      )}

      {selectedTime && (
        <>
          <SummaryRow
            label="Time"
            value={`${formatTime(selectedTime.startTime)} - ${formatTime(selectedTime.endTime)}`}
          />
          <SummaryRow label="Room" value={selectedTime.roomName} />
        </>
      )}

      {selectedService && (
        <div className="pt-2 border-t border-[#222222]">
          <SummaryRow label="Price" value="" />
          <span className="font-mono text-[28px] font-bold text-[#f5f5f0]">
            {selectedService.priceLabel}
          </span>
        </div>
      )}

      {depositAmount !== null && (
        <SummaryRow
          label="Deposit"
          value={`$${(depositAmount / 100).toFixed(2)}`}
        />
      )}
    </div>
  )

  return (
    <>
      {/* Mobile: collapsible accordion */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-[#111111] border border-[#222222] p-4 flex items-center justify-between"
        >
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888]">
            Booking Summary
          </span>
          <ChevronDown
            className={clsx(
              "h-4 w-4 text-[#888888] transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className="bg-[#111111] border border-t-0 border-[#222222] p-4">
            {content}
          </div>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block sticky top-6">
        <div className="bg-[#111111] border border-[#222222] p-6">
          <h3 className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-4">
            Booking Summary
          </h3>
          {content}
        </div>
      </div>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888]">
        {label}
      </span>
      {value && (
        <span className="font-sans text-[15px] text-[#f5f5f0]">{value}</span>
      )}
    </div>
  )
}
