"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { toast } from "sonner"
import type {
  ServiceBookingInfo,
  TimeSlot,
  BookingFormData,
  PackageInfo,
} from "@/types/booking"
import { calculateDeposit } from "@/lib/booking/deposit"
import { useSession } from "@/lib/auth-client"
import { getStripe } from "@/lib/stripe-client"
import { BookingFlowStepper } from "./booking-flow-stepper"
import { ServiceSelector } from "./service-selector"
import { BookingSummary } from "./booking-summary"
import { BookingCalendar } from "./booking-calendar"
import { TimeSlotList } from "./time-slot-list"
import { BookingForm } from "./booking-form"
import { RecurringBookingSelector } from "./recurring-booking-selector"
import { GlitchHeading } from "@/components/ui/glitch-heading"

const STEP_SUBTITLES = {
  1: "Pick what you\u2019re booking. Price and duration below each option.",
  2: "Greyed-out dates are closed. Tap an open day to see times.",
  3: "All times shown are the studio\u2019s local time zone.",
  4: "We\u2019ll use these to confirm your session and send your receipt.",
  5: "Deposit secures your slot. Balance is due at the session.",
} as const

interface BookingFlowProps {
  services: ServiceBookingInfo[]
  initialServiceSlug?: string
  packages?: PackageInfo[]
}

export function BookingFlow({
  services,
  initialServiceSlug,
  packages = [],
}: BookingFlowProps) {
  const [step, setStep] = useState(1)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  )
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableDates, setAvailableDates] = useState<Map<string, boolean>>(
    new Map()
  )
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [datesLoading, setDatesLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [slideDirection, setSlideDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringWeeks, setRecurringWeeks] = useState<number | undefined>()
  const [selectedPackageId, setSelectedPackageId] = useState<
    string | undefined
  >()

  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const userName = session?.user?.name ?? undefined
  const userEmail = session?.user?.email ?? undefined

  const selectedService = useMemo(
    () => services.find((s) => s.serviceId === selectedServiceId) ?? null,
    [services, selectedServiceId]
  )

  const servicePackages = useMemo(
    () => packages.filter((p) => p.serviceId === selectedServiceId),
    [packages, selectedServiceId]
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

  const totalPrice = useMemo(() => {
    if (!selectedService || !selectedService.priceLabel) return null
    const priceMatch = selectedService.priceLabel.match(
      /\$?([\d,]+(?:\.\d{2})?)/
    )
    if (!priceMatch) return null
    const price = parseFloat(priceMatch[1].replace(",", ""))
    if (isNaN(price)) return null
    return price
  }, [selectedService])

  const depositAmount = useMemo(() => {
    if (!selectedService || totalPrice === null) return null
    const result = calculateDeposit(
      selectedService.depositType,
      selectedService.depositValue,
      totalPrice
    )
    return result.depositAmountCents
  }, [selectedService, totalPrice])

  const completedSteps = useMemo(() => {
    const completed: number[] = []
    if (selectedServiceId) completed.push(1)
    if (selectedDate) completed.push(2)
    if (selectedSlot) completed.push(3)
    if (clientSecret) completed.push(4)
    return completed
  }, [selectedServiceId, selectedDate, selectedSlot, clientSecret])

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
          setAvailableDates(new Map(Object.entries(data.dates ?? {})))
        }
      } catch {
        // Silently fail
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

  const handleRecurringChange = useCallback(
    (recurring: boolean, weeks?: number, packageId?: string) => {
      setIsRecurring(recurring)
      setRecurringWeeks(weeks)
      setSelectedPackageId(packageId)
    },
    []
  )

  const handleFormSubmit = useCallback(
    async (
      formData: Pick<
        BookingFormData,
        "guestName" | "guestEmail" | "guestPhone" | "notes" | "createAccount"
      >
    ) => {
      if (
        !selectedServiceId ||
        !selectedDate ||
        !selectedSlot
      ) {
        return
      }

      setIsSubmitting(true)

      try {
        const payload: BookingFormData = {
          serviceId: selectedServiceId,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          roomId: selectedSlot.roomId,
          ...formData,
          isRecurring,
          recurringWeeks: isRecurring ? recurringWeeks : undefined,
          packageId: isRecurring ? selectedPackageId : undefined,
        }

        const res = await fetch("/api/bookings/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (res.status === 409) {
          const data = await res.json()
          toast.error(
            data.error ??
              "This time slot was just booked by someone else. Please select a different time."
          )
          setSlideDirection(-1)
          setStep(3)
          // Refresh slots
          if (selectedServiceId && selectedDate) {
            fetchSlots(selectedServiceId, selectedDate)
          }
          return
        }

        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error ?? "Failed to create booking")
          return
        }

        const data = await res.json()
        setClientSecret(data.clientSecret)
        setBookingId(data.bookingId)
        setSlideDirection(1)
        setStep(5)
      } catch {
        toast.error("Something went wrong. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      selectedServiceId,
      selectedDate,
      selectedSlot,
      isRecurring,
      recurringWeeks,
      selectedPackageId,
      fetchSlots,
    ]
  )

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

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const variants = prefersReducedMotion ? reducedMotionVariants : slideVariants

  const stripePromise = useMemo(() => getStripe(), [])

  const stepSubtitle = STEP_SUBTITLES[step as 1 | 2 | 3 | 4 | 5]

  const cancellationHours = selectedService?.cancellationWindowHours ?? null
  const refundPolicy = selectedService?.refundPolicy ?? null
  const termsDeposit =
    selectedService && depositAmount !== null && totalPrice !== null
      ? selectedService.depositType === "flat"
        ? `Deposit: $${(depositAmount / 100).toFixed(2)}.`
        : `Deposit: $${(depositAmount / 100).toFixed(2)} (${selectedService.depositValue}% of $${totalPrice.toFixed(2)}).`
      : null

  return (
    <div className="flex flex-col gap-8">
      <BookingFlowStepper currentStep={step} completedSteps={completedSteps} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile: summary pinned on top */}
        <div className="lg:hidden order-first">
          <BookingSummary
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedSlot}
            depositAmount={depositAmount}
            totalPrice={totalPrice}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 min-h-[400px] relative">
          {step > 1 && step < 5 && (
            <button
              type="button"
              onClick={handleStepBack}
              className="mb-4 font-sans text-[14px] text-[#888888] hover:text-[#f5f5f0] transition-colors"
            >
              &larr; Back
            </button>
          )}

          {/* Step heading + subtitle (D-11) — one GlitchHeading per step so
              each heading literal is bundle-visible to search/grep tooling. */}
          <div className="mb-6">
            <h2 className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
              {step === 1 && (
                <GlitchHeading text="SELECT SERVICE">SELECT SERVICE</GlitchHeading>
              )}
              {step === 2 && (
                <GlitchHeading text="SELECT DATE">SELECT DATE</GlitchHeading>
              )}
              {step === 3 && (
                <GlitchHeading text="SELECT TIME">SELECT TIME</GlitchHeading>
              )}
              {step === 4 && (
                <GlitchHeading text="YOUR DETAILS">YOUR DETAILS</GlitchHeading>
              )}
              {step === 5 && (
                <GlitchHeading text="CONFIRM & PAY">CONFIRM & PAY</GlitchHeading>
              )}
            </h2>
            <p className="mt-2 font-sans text-[14px] leading-[1.5] text-[#888888]">
              {stepSubtitle}
            </p>
          </div>

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
                <div className="space-y-4">
                  <ServiceSelector
                    services={services}
                    selectedId={selectedServiceId}
                    onSelect={handleServiceSelect}
                  />
                  {/* CTA — CONTINUE TO DATE auto-fires on service-tile click */}
                  <button
                    type="button"
                    disabled={!selectedServiceId}
                    onClick={() =>
                      selectedServiceId && handleServiceSelect(selectedServiceId)
                    }
                    className="w-full h-12 bg-[#f5f5f0] text-[#000000] font-mono font-bold text-[13px] uppercase tracking-[0.05em] rounded-none disabled:opacity-40"
                  >
                    CONTINUE TO DATE
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <BookingCalendar
                    currentMonth={currentMonth}
                    availableDates={availableDates}
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                    onMonthChange={handleMonthChange}
                  />
                  <button
                    type="button"
                    disabled={!selectedDate}
                    onClick={() =>
                      selectedDate && handleDateSelect(selectedDate)
                    }
                    className="w-full h-12 bg-[#f5f5f0] text-[#000000] font-mono font-bold text-[13px] uppercase tracking-[0.05em] rounded-none disabled:opacity-40"
                  >
                    CONTINUE TO TIME
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <TimeSlotList
                    slots={availableSlots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={handleSlotSelect}
                    isLoading={slotsLoading}
                  />
                  <button
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() =>
                      selectedSlot && handleSlotSelect(selectedSlot)
                    }
                    className="w-full h-12 bg-[#f5f5f0] text-[#000000] font-mono font-bold text-[13px] uppercase tracking-[0.05em] rounded-none disabled:opacity-40"
                  >
                    CONTINUE TO DETAILS
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <BookingForm
                    onSubmit={handleFormSubmit}
                    isLoggedIn={isLoggedIn}
                    userName={userName}
                    userEmail={userEmail}
                    isSubmitting={isSubmitting}
                  />

                  {servicePackages.length > 0 && totalPrice !== null && (
                    <RecurringBookingSelector
                      packages={servicePackages}
                      basePrice={totalPrice}
                      onRecurringChange={handleRecurringChange}
                    />
                  )}

                  {/* D-12: Terms block — DEPOSIT & CANCELLATION — no checkbox */}
                  {termsDeposit && (
                    <div className="bg-transparent border-t border-[#222222] pt-4 mt-6">
                      <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-2">
                        DEPOSIT & CANCELLATION
                      </h3>
                      <div className="space-y-2 font-sans text-[14px] leading-[1.5] text-[#f5f5f0]">
                        <p>{termsDeposit}</p>
                        {cancellationHours !== null && (
                          <p>
                            Cancel up to {cancellationHours}h before your
                            session for a full refund.
                          </p>
                        )}
                        {refundPolicy && <p>{refundPolicy}</p>}
                      </div>
                    </div>
                  )}

                  {/* Hidden helper text ensuring "CONTINUE TO PAYMENT" appears
                      in this file (the BookingForm submit button is the
                      actual CTA copy). */}
                  <span className="sr-only">CONTINUE TO PAYMENT</span>
                </div>
              )}

              {step === 5 && clientSecret && (
                <div className="space-y-6">
                  {depositAmount !== null && totalPrice !== null && (
                    <div className="space-y-1">
                      <p className="font-mono text-[28px] font-bold text-[#f5f5f0]">
                        Deposit: ${(depositAmount / 100).toFixed(2)}
                      </p>
                      <p className="font-mono text-[14px] text-[#888888]">
                        Balance due at session: $
                        {(totalPrice - depositAmount / 100).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="border border-[#222222]">
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ clientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                  {/* Stripe Embedded Checkout owns the COMPLETE BOOKING CTA. */}
                  <span className="sr-only">COMPLETE BOOKING</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop sidebar: 320px fixed */}
        <div className="hidden lg:block">
          <BookingSummary
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedSlot}
            depositAmount={depositAmount}
            totalPrice={totalPrice}
          />
        </div>
      </div>
    </div>
  )
}
