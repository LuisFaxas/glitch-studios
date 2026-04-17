"use client"

interface TechPulseLineProps {
  direction: "left" | "right"
}

export function TechPulseLine({ direction }: TechPulseLineProps) {
  const isLeft = direction === "left"
  return (
    <span
      className="relative flex h-4 flex-1 items-center overflow-hidden"
      aria-hidden="true"
    >
      <span className="block h-px w-full bg-[#f5f5f0]" />
      <svg
        viewBox="0 0 40 16"
        className={`absolute top-0 h-4 w-10 ${isLeft ? "tech-pulse-left" : "tech-pulse-right"}`}
        fill="none"
        stroke="#f5f5f0"
        strokeWidth="1"
      >
        <path d="M 0 8 L 13 8 L 15 5 L 17 11 L 19 2 L 21 14 L 23 6 L 25 8 L 40 8" />
      </svg>
    </span>
  )
}
