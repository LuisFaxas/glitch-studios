"use client"
import { useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import { ChevronDown, X } from "lucide-react"
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

// ============================================================================
// FilterFacetDropdown — bar-layout dropdown trigger.
// One button per facet; opens a popover with chips. Industry-standard pattern
// (Notion / Linear / Airtable) — keeps the bar to a single row at most widths.
// ============================================================================
interface FilterFacetDropdownProps<T extends string | number> {
  label: string
  selected: T[]
  options: Array<{ value: T; label: string }>
  onToggle: (value: T) => void
  onClear: () => void
}
function FilterFacetDropdown<T extends string | number>({
  label,
  selected,
  options,
  onToggle,
  onClear,
}: FilterFacetDropdownProps<T>) {
  const activeCount = options.filter((o) => selected.includes(o.value)).length
  const isActive = activeCount > 0
  const triggerLabel = isActive ? `${label} (${activeCount})` : label
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        data-facet-dropdown={label}
        className={
          "inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors " +
          (isActive
            ? "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0]"
            : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-[#ccc]")
        }
      >
        <span>{triggerLabel}</span>
        <ChevronDown className="h-3 w-3" aria-hidden />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={8} className="isolate z-50">
          <PopoverPrimitive.Popup className="border border-[#222] bg-[#0a0a0a] p-3 min-w-[200px] max-w-[320px]">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">
                {label}
              </span>
              {isActive && (
                <button
                  type="button"
                  onClick={onClear}
                  className="font-mono text-[10px] uppercase tracking-wider text-[#888] hover:text-[#f5f5f0]"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {options.map((o) => {
                const isOn = selected.includes(o.value)
                return (
                  <button
                    key={String(o.value)}
                    type="button"
                    onClick={() => onToggle(o.value)}
                    aria-pressed={isOn}
                    className={
                      "border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors " +
                      (isOn
                        ? "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0]"
                        : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-[#ccc]")
                    }
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

// ============================================================================
// FilterChipGroupVertical — vertical-layout (mobile sheet) inline chip group.
// Vertical sheets have plenty of space; dropdowns add unnecessary clicks.
// ============================================================================
interface FilterChipGroupVerticalProps<T extends string | number> {
  label: string
  selected: T[]
  options: Array<{ value: T; label: string }>
  onToggle: (value: T) => void
}
function FilterChipGroupVertical<T extends string | number>({
  label,
  selected,
  options,
  onToggle,
}: FilterChipGroupVerticalProps<T>) {
  const activeCount = options.filter((o) => selected.includes(o.value)).length
  const labelText = activeCount > 0 ? `${label} (${activeCount})` : label
  return (
    <div data-chip-group={label} className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-wider text-[#f5f5f0]">
        {labelText}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const isOn = selected.includes(o.value)
          return (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onToggle(o.value)}
              aria-pressed={isOn}
              className={
                "border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors " +
                (isOn
                  ? "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0]"
                  : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-[#ccc]")
              }
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// PriceFilterPopover — same shape as the FilterFacetDropdown but houses a
// Slider rather than chips. Used in both bar and vertical layouts.
// ============================================================================
interface PriceFilterPopoverProps {
  state: FilterState
  bounds: FilterCorpusBounds
  onChange: (next: Partial<FilterState>) => void
}
function PriceFilterPopover({ state, bounds, onChange }: PriceFilterPopoverProps) {
  const min = state.minPrice ?? bounds.priceMin
  const max = state.maxPrice ?? bounds.priceMax
  const isActive = state.minPrice != null || state.maxPrice != null
  const triggerLabel = isActive
    ? `Price: $${min.toLocaleString()}–$${max.toLocaleString()}`
    : "Price"
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        data-price-popover-trigger
        className={
          "inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors " +
          (isActive
            ? "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0]"
            : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-[#ccc]")
        }
      >
        <span>{triggerLabel}</span>
        <ChevronDown className="h-3 w-3" aria-hidden />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={8} className="isolate z-50">
          <PopoverPrimitive.Popup className="border border-[#222] bg-[#0a0a0a] p-4 w-[320px]">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">
                Price
              </span>
              {isActive && (
                <button
                  type="button"
                  onClick={() => onChange({ minPrice: null, maxPrice: null })}
                  className="font-mono text-[10px] uppercase tracking-wider text-[#888] hover:text-[#f5f5f0]"
                >
                  Clear
                </button>
              )}
            </div>
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

// ============================================================================
// LeaderboardFilters — main exported component.
// Bar layout: row of dropdown triggers, single-line on most desktop widths.
// Vertical layout: stacked inline chip groups for the mobile Sheet.
// ============================================================================
export function LeaderboardFilters({
  state,
  onChange,
  onReset,
  bounds,
  layout = "bar",
}: LeaderboardFiltersProps) {
  const activeCount = useMemo(() => countActiveFilters(state), [state])

  if (layout === "bar") {
    return (
      <div
        data-leaderboard-filters
        data-layout="bar"
        className="mb-6 border border-[#222] bg-[#0a0a0a] px-4 py-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <PriceFilterPopover state={state} bounds={bounds} onChange={onChange} />
          <FilterFacetDropdown
            label="Year"
            selected={state.year}
            options={bounds.years.map((y) => ({ value: y, label: String(y) }))}
            onToggle={(v) => onChange({ year: toggleArray(state.year, v) })}
            onClear={() => onChange({ year: [] })}
          />
          <FilterFacetDropdown
            label="CPU"
            selected={state.cpu}
            options={bounds.cpuKinds.map((c) => ({ value: c, label: c }))}
            onToggle={(v) => onChange({ cpu: toggleArray(state.cpu, v) })}
            onClear={() => onChange({ cpu: [] })}
          />
          <FilterFacetDropdown
            label="RAM"
            selected={state.ram}
            options={RAM_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
            onToggle={(v) => onChange({ ram: toggleArray(state.ram, v) })}
            onClear={() => onChange({ ram: [] })}
          />
          <FilterFacetDropdown
            label="Storage"
            selected={state.storage}
            options={STORAGE_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
            onToggle={(v) => onChange({ storage: toggleArray(state.storage, v) })}
            onClear={() => onChange({ storage: [] })}
          />
          <FilterFacetDropdown
            label="Medal"
            selected={state.medal}
            options={MEDAL_TIERS.map((t) => ({ value: t.value, label: t.label }))}
            onToggle={(v) => onChange({ medal: toggleArray(state.medal, v) })}
            onClear={() => onChange({ medal: [] })}
          />
          {bounds.subCategories.length > 0 && (
            <FilterFacetDropdown
              label="Sub-cat"
              selected={state.subcat}
              options={bounds.subCategories.map((sc) => ({ value: sc.slug, label: sc.name }))}
              onToggle={(v) => onChange({ subcat: toggleArray(state.subcat, v) })}
              onClear={() => onChange({ subcat: [] })}
            />
          )}

          <button
            type="button"
            data-reset-filters
            onClick={onReset}
            disabled={activeCount === 0}
            className={
              "ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider transition-colors " +
              (activeCount === 0
                ? "text-[#444] cursor-not-allowed"
                : "text-[#888] hover:text-[#f5f5f0]")
            }
          >
            <X className="h-3 w-3" aria-hidden />
            Reset{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>
    )
  }

  // Vertical layout — mobile sheet. Inline chip groups are fine; sheet has space.
  return (
    <div
      data-leaderboard-filters
      data-layout="vertical"
      className="space-y-6"
    >
      <PriceFilterPopover state={state} bounds={bounds} onChange={onChange} />
      <FilterChipGroupVertical
        label="Year"
        selected={state.year}
        options={bounds.years.map((y) => ({ value: y, label: String(y) }))}
        onToggle={(v) => onChange({ year: toggleArray(state.year, v) })}
      />
      <FilterChipGroupVertical
        label="CPU"
        selected={state.cpu}
        options={bounds.cpuKinds.map((c) => ({ value: c, label: c }))}
        onToggle={(v) => onChange({ cpu: toggleArray(state.cpu, v) })}
      />
      <FilterChipGroupVertical
        label="RAM"
        selected={state.ram}
        options={RAM_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
        onToggle={(v) => onChange({ ram: toggleArray(state.ram, v) })}
      />
      <FilterChipGroupVertical
        label="Storage"
        selected={state.storage}
        options={STORAGE_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
        onToggle={(v) => onChange({ storage: toggleArray(state.storage, v) })}
      />
      <FilterChipGroupVertical
        label="Medal"
        selected={state.medal}
        options={MEDAL_TIERS.map((t) => ({ value: t.value, label: t.label }))}
        onToggle={(v) => onChange({ medal: toggleArray(state.medal, v) })}
      />
      {bounds.subCategories.length > 0 && (
        <FilterChipGroupVertical
          label="Sub-cat"
          selected={state.subcat}
          options={bounds.subCategories.map((sc) => ({ value: sc.slug, label: sc.name }))}
          onToggle={(v) => onChange({ subcat: toggleArray(state.subcat, v) })}
        />
      )}

      <button
        type="button"
        data-reset-filters
        onClick={onReset}
        disabled={activeCount === 0}
        className={
          "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider transition-colors " +
          (activeCount === 0
            ? "text-[#444] cursor-not-allowed"
            : "text-[#888] hover:text-[#f5f5f0]")
        }
      >
        <X className="h-3 w-3" aria-hidden />
        Reset filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
    </div>
  )
}
