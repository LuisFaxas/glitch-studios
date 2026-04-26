"use client"
import { useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

export interface FilterState {
  minPrice: number | null
  maxPrice: number | null
  year: number[]
  cpu: string[]
  ram: string[]
  storage: string[]
  medal: string[]
  subcat: string[]
}

export interface FilterCorpusBounds {
  priceMin: number
  priceMax: number
  years: number[]
  cpuKinds: string[]
  subCategories: { slug: string; name: string }[]
}

// CONTEXT D-05 AMENDMENT (2026-04-25): the `<512 GB` bucket was dropped.
// Final 3 buckets reflect modern reviewable laptop reality. If a budget product
// entering the catalog later requires a `<512` bucket, restore it here.
export const STORAGE_BUCKETS = [
  { value: "512", label: "512 GB" },
  { value: "1024", label: "1 TB" },
  { value: "2048", label: "2 TB+" },
] as const

export const RAM_BUCKETS = [
  { value: "8", label: "8 GB" },
  { value: "16", label: "16 GB" },
  { value: "32", label: "32 GB" },
  { value: "64", label: "64 GB+" },
] as const

export const MEDAL_TIERS = [
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
] as const

export interface LeaderboardFiltersProps {
  state: FilterState
  onChange: (next: Partial<FilterState>) => void
  onReset: () => void
  bounds: FilterCorpusBounds
  layout?: "bar" | "vertical"
}

function countActiveFilters(state: FilterState): number {
  let n = 0
  if (state.minPrice != null || state.maxPrice != null) n += 1
  if (state.year.length) n += 1
  if (state.cpu.length) n += 1
  if (state.ram.length) n += 1
  if (state.storage.length) n += 1
  if (state.medal.length) n += 1
  if (state.subcat.length) n += 1
  return n
}

function toggleArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]
}

interface FilterChipGroupProps<T extends string | number> {
  label: string
  selected: T[]
  chips: Array<{ value: T; label: string }>
  onToggle: (value: T) => void
  layout: "bar" | "vertical"
}
function FilterChipGroup<T extends string | number>({
  label,
  selected,
  chips,
  onToggle,
  layout,
}: FilterChipGroupProps<T>) {
  const activeCount = chips.filter((c) => selected.includes(c.value)).length
  const labelText = activeCount > 0 ? `${label} (${activeCount})` : label
  return (
    <div
      data-chip-group={label}
      className={
        layout === "bar"
          ? "flex flex-wrap items-center gap-1.5"
          : "flex flex-col gap-2"
      }
    >
      <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-[#888]">
        {labelText}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => {
          const isOn = selected.includes(c.value)
          return (
            <button
              key={String(c.value)}
              type="button"
              onClick={() => onToggle(c.value)}
              aria-pressed={isOn}
              className={
                "border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors " +
                (isOn
                  ? "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0]"
                  : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-[#ccc]")
              }
            >
              {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface PriceFilterPopoverProps {
  state: FilterState
  bounds: FilterCorpusBounds
  onChange: (next: Partial<FilterState>) => void
}
function PriceFilterPopover({ state, bounds, onChange }: PriceFilterPopoverProps) {
  const min = state.minPrice ?? bounds.priceMin
  const max = state.maxPrice ?? bounds.priceMax
  const isActive = state.minPrice != null || state.maxPrice != null
  const labelText = isActive
    ? `Price: $${min.toLocaleString()}–$${max.toLocaleString()}`
    : "Price"
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        data-price-popover-trigger
        className={
          "border px-3 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors " +
          (isActive
            ? "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0]"
            : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444]")
        }
      >
        {labelText}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={8} className="isolate z-50">
          <PopoverPrimitive.Popup className="border border-[#222] bg-[#0a0a0a] p-4 w-[320px]">
            <Slider
              value={[min, max]}
              min={bounds.priceMin}
              max={bounds.priceMax}
              step={50}
              onValueChange={(v) => {
                const arr = Array.isArray(v) ? Array.from(v) : [v]
                onChange({ minPrice: arr[0] ?? null, maxPrice: arr[1] ?? null })
              }}
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-[#888]">
              <span>${min.toLocaleString()}</span>
              <span>${max.toLocaleString()}</span>
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export function LeaderboardFilters({
  state,
  onChange,
  onReset,
  bounds,
  layout = "bar",
}: LeaderboardFiltersProps) {
  const activeCount = useMemo(() => countActiveFilters(state), [state])

  const containerClass =
    layout === "bar"
      ? "mb-6 border border-[#222] bg-[#0a0a0a] px-4 py-3"
      : "space-y-6"
  const innerClass =
    layout === "bar"
      ? "flex flex-wrap items-center gap-x-4 gap-y-3"
      : "flex flex-col gap-6"

  return (
    <div data-leaderboard-filters data-layout={layout} className={containerClass}>
      <div className={innerClass}>
        <PriceFilterPopover state={state} bounds={bounds} onChange={onChange} />

        <FilterChipGroup
          label="Year"
          selected={state.year}
          chips={bounds.years.map((y) => ({ value: y, label: String(y) }))}
          onToggle={(v) => onChange({ year: toggleArray(state.year, v) })}
          layout={layout}
        />
        <FilterChipGroup
          label="CPU"
          selected={state.cpu}
          chips={bounds.cpuKinds.map((c) => ({ value: c, label: c }))}
          onToggle={(v) => onChange({ cpu: toggleArray(state.cpu, v) })}
          layout={layout}
        />
        <FilterChipGroup
          label="RAM"
          selected={state.ram}
          chips={RAM_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
          onToggle={(v) => onChange({ ram: toggleArray(state.ram, v) })}
          layout={layout}
        />
        <FilterChipGroup
          label="Storage"
          selected={state.storage}
          chips={STORAGE_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
          onToggle={(v) => onChange({ storage: toggleArray(state.storage, v) })}
          layout={layout}
        />
        <FilterChipGroup
          label="Medal"
          selected={state.medal}
          chips={MEDAL_TIERS.map((t) => ({ value: t.value, label: t.label }))}
          onToggle={(v) => onChange({ medal: toggleArray(state.medal, v) })}
          layout={layout}
        />
        {bounds.subCategories.length > 0 && (
          <FilterChipGroup
            label="Sub-cat"
            selected={state.subcat}
            chips={bounds.subCategories.map((sc) => ({ value: sc.slug, label: sc.name }))}
            onToggle={(v) => onChange({ subcat: toggleArray(state.subcat, v) })}
            layout={layout}
          />
        )}

        <button
          type="button"
          data-reset-filters
          onClick={onReset}
          className={
            (layout === "bar" ? "ml-auto " : "") +
            "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#888] hover:text-[#f5f5f0]"
          }
        >
          <X className="h-3 w-3" aria-hidden />
          Reset filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>
    </div>
  )
}
