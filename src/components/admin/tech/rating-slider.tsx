"use client"

import { Slider } from "@/components/ui/slider"

export function RatingSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-mono text-[13px] text-[#f5f5f0] uppercase tracking-[0.05em]">
          {label}
        </label>
        <span className="font-mono text-[13px] text-[#f5f5f0]">
          {value} / 10
        </span>
      </div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        aria-label={`Rating for ${label}, 1 to 10, current value ${value}`}
      />
    </div>
  )
}
