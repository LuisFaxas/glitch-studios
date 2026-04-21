import clsx from "clsx"

interface ReadingTimeBadgeProps {
  minutes: number
  className?: string
}

export function ReadingTimeBadge({ minutes, className }: ReadingTimeBadgeProps) {
  return (
    <span
      className={clsx(
        "font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]",
        className,
      )}
    >
      {minutes} MIN READ
    </span>
  )
}
