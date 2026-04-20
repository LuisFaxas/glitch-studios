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
    <>
      {/* Mobile compact: "Step N of 5" */}
      <div className="md:hidden font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888]">
        {`STEP ${currentStep} OF ${STEPS.length} \u00b7 ${STEPS[currentStep - 1]}`}
      </div>

      {/* Desktop: dots + labels row */}
      <nav
        aria-label="Booking progress"
        className="hidden md:flex flex-row items-center gap-4"
      >
        {STEPS.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = completedSteps.includes(stepNumber)
          const isCurrent = stepNumber === currentStep
          const isActive = isCompleted || isCurrent

          return (
            <div key={step} className="flex items-center gap-2">
              <span
                className={clsx(
                  "h-2 w-2 rounded-full border",
                  isActive
                    ? "bg-[#f5f5f0] border-[#f5f5f0]"
                    : "bg-[#111111] border-[#222222]"
                )}
                aria-hidden
              />
              <div
                className={clsx(
                  "font-mono text-[13px] font-bold uppercase tracking-[0.05em] pb-2",
                  isCurrent && "text-[#f5f5f0] border-b-2 border-b-[#f5f5f0]",
                  isCompleted && !isCurrent && "text-[#f5f5f0]",
                  !isActive && "text-[#555555]"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {step}
              </div>
            </div>
          )
        })}
      </nav>
    </>
  )
}
