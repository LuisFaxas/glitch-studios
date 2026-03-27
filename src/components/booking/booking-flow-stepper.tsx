"use client"

import clsx from "clsx"

const STEPS = ["SERVICE", "DATE", "TIME", "DETAILS", "PAYMENT"] as const

interface BookingFlowStepperProps {
  currentStep: number
  completedSteps: number[]
}

export function BookingFlowStepper({
  currentStep,
  completedSteps,
}: BookingFlowStepperProps) {
  return (
    <nav aria-label="Booking progress" className="flex flex-row gap-4">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = completedSteps.includes(stepNumber)
        const isCurrent = stepNumber === currentStep
        const isFuture = !isCompleted && !isCurrent

        return (
          <div
            key={step}
            className={clsx(
              "font-mono text-[13px] font-bold uppercase tracking-[0.05em] pb-2",
              isCurrent && "text-[#f5f5f0] border-b-2 border-b-[#f5f5f0]",
              isCompleted && !isCurrent && "text-[#f5f5f0]",
              isFuture && "text-[#555555]"
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            {step}
          </div>
        )
      })}
    </nav>
  )
}
