"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import type { ServiceBookingInfo, TimeSlot } from "@/types/booking"
import { calculateDeposit } from "@/lib/booking/deposit"
import { BookingFlowStepper } from "./booking-flow-stepper"
import { ServiceSelector } from "./service-selector"
import { BookingSummary } from "./booking-summary"
import { BookingCalendar } from "./booking-calendar"
import { TimeSlotList } from "./time-slot-list"

interface BookingFlowProps {
  services: ServiceBookingInfo[]
  initialServiceSlug?: string
}

export function BookingFlow({ services, initialServiceSlug }: BookingFlowProps) {
  const [step, setStep] = useState(1)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableDates, setAvailableDates] = useState<Map<string, boolean>>(
    new Map()
  )
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [datesLoading, setDatesLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [slideDirection, setSlideDirection] = useState(1) // 1 = forward, -1 = back

  const selectedService = useMemo(
    () => services.find((s) => s.serviceId === selectedServiceId) ?? null,
    [services, selectedServiceId]
  )

  // Pre-select service from slug
  useEffect(() => {
    if (initialServiceSlug) {
      const match = services.find((s) => s.serviceSlug === initialServiceSlug)
      if (match) {
        setSelectedServiceId(match.serviceId)
        setStep(2)
        fetchAvailableDates(match.serviceId, new Date())
      }
    }
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const depositAmount = useMemo(() => {
    if (!selectedService || !selectedService.priceLabel) return null
    // Parse price from label like "$100/hr" or "$500"
    const priceMatch = selectedService.priceLabel.match(/\$?([\d,]+(?:\.\d{2})?)/)
    if (!priceMatch) return null
    const totalPrice = parseFloat(priceMatch[1].replace(",", ""))
    if (isNaN(totalPrice)) return null
    const result = calculateDeposit(
      selectedService.depositType,
      selectedService.depositValue,
      totalPrice
    )
    return result.depositAmountCents
  }, [selectedService])

  const completedSteps = useMemo(() => {
    const completed: number[] = []
    if (selectedServiceId) completed.push(1)
    if (selectedDate) completed.push(2)
    if (selectedSlot) completed.push(3)
    return completed
  }, [selectedServiceId, selectedDate, selectedSlot])

  const fetchAvailableDates = useCallback(
    async (serviceId: string, month: Date) => {
      setDatesLoading(true)
      try {
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`
        const res = await fetch(
          `/api/bookings/availability?serviceId=${serviceId}&month=${monthStr}`
        )
        if (res.ok) {
          const data = await res.json()
          // API returns { dates: Record<string, boolean> }
          setAvailableDates(new Map(Object.entries(data.dates ?? {})))
        }
      } catch {
        // Silently fail — dates remain empty
      } finally {
        setDatesLoading(false)
      }
    },
    []
  )

  const fetchSlots = useCallback(
    async (serviceId: string, date: string) => {
      setSlotsLoading(true)
      try {
        const res = await fetch(
          `/api/bookings/slots?serviceId=${serviceId}&date=${date}`
        )
        if (res.ok) {
          const data = await res.json()
          setAvailableSlots(data.slots ?? [])
        }
      } catch {
        setAvailableSlots([])
      } finally {
        setSlotsLoading(false)
      }
    },
    []
  )

  const handleServiceSelect = useCallback(
    (id: string) => {
      setSelectedServiceId(id)
      setSelectedDate(null)
      setSelectedSlot(null)
      setAvailableSlots([])
      setSlideDirection(1)
      setStep(2)
      fetchAvailableDates(id, currentMonth)
    },
    [currentMonth, fetchAvailableDates]
  )

  const handleDateSelect = useCallback(
    (date: string) => {
      setSelectedDate(date)
      setSelectedSlot(null)
      setSlideDirection(1)
      setStep(3)
      if (selectedServiceId) {
        fetchSlots(selectedServiceId, date)
      }
    },
    [selectedServiceId, fetchSlots]
  )

  const handleSlotSelect = useCallback((slot: TimeSlot) => {
    setSelectedSlot(slot)
    setSlideDirection(1)
    setStep(4)
  }, [])

  const handleMonthChange = useCallback(
    (month: Date) => {
      setCurrentMonth(month)
      if (selectedServiceId) {
        fetchAvailableDates(selectedServiceId, month)
      }
    },
    [selectedServiceId, fetchAvailableDates]
  )

  const handleStepBack = useCallback(() => {
    setSlideDirection(-1)
    setStep((prev) => Math.max(1, prev - 1))
  }, [])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -40 : 40,
      opacity: 0,
    }),
  }

  const reducedMotionVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  }

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const variants = prefersReducedMotion ? reducedMotionVariants : slideVariants

  return (
    <div className="flex flex-col gap-8">
      <BookingFlowStepper currentStep={step} completedSteps={completedSteps} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile summary accordion */}
        <div className="lg:hidden">
          <BookingSummary
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedSlot}
            depositAmount={depositAmount}
          />
        </div>

        {/* Main content area (60%) */}
        <div className="flex-1 lg:w-[60%] min-h-[400px] relative">
          {step > 1 && (
            <button
              type="button"
              onClick={handleStepBack}
              className="mb-4 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888] hover:text-[#f5f5f0] transition-colors"
            >
              &larr; BACK
            </button>
          )}

          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={step}
              custom={slideDirection}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.3,
                ease: "easeInOut",
              }}
            >
              {step === 1 && (
                <ServiceSelector
                  services={services}
                  selectedId={selectedServiceId}
                  onSelect={handleServiceSelect}
                />
              )}

              {step === 2 && (
                <BookingCalendar
                  currentMonth={currentMonth}
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                  onMonthChange={handleMonthChange}
                />
              )}

              {step === 3 && (
                <TimeSlotList
                  slots={availableSlots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSlotSelect}
                  isLoading={slotsLoading}
                />
              )}

              {step === 4 && (
                <div className="bg-[#111111] border border-[#222222] p-6">
                  <p className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888]">
                    Step 4 coming in Plan 04
                  </p>
                </div>
              )}

              {step === 5 && (
                <div className="bg-[#111111] border border-[#222222] p-6">
                  <p className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888]">
                    Step 5 coming in Plan 04
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop summary sidebar (40%) */}
        <div className="hidden lg:block lg:w-[40%]">
          <BookingSummary
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedSlot}
            depositAmount={depositAmount}
          />
        </div>
      </div>
    </div>
  )
}
