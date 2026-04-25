interface WizardProgressProps {
  current: 1 | 2 | 3
  total: 3
}

const STEP_LABELS = ["Identity", "Preferences", "Confirm"]

export function WizardProgress({ current, total }: WizardProgressProps) {
  return (
    <div
      className="sticky top-0 z-10 bg-black pb-4 pt-2"
      aria-label={`Step ${current} of ${total}`}
    >
      <p className="font-mono uppercase tracking-[0.08em] text-[12px] font-semibold text-[var(--muted-foreground)] mb-2">
        Step {current} of {total}: {STEP_LABELS[current - 1]}
      </p>
      <div className="flex gap-2">
        {[1, 2, 3].map((step) => {
          const filled = step <= current
          return (
            <div
              key={step}
              className="flex-1 h-1 rounded-sm"
              style={{ backgroundColor: filled ? "var(--foreground)" : "#555555" }}
              aria-current={step === current ? "step" : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
