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
          {step > 1 && step < 5 && (
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
                </div>
              )}

              {step === 5 && clientSecret && (
                <div className="space-y-6">
                  <h2 className="font-mono text-[28px] font-bold uppercase tracking-[0.02em] text-[#f5f5f0]">
                    CONFIRM & PAY
                  </h2>

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
