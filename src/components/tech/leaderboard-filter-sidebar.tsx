"use client"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { ChevronDown, X } from "lucide-react"

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

// ============================================================================
// CustomDropdown — a hand-rolled popover replacing @base-ui/react/popover.
// Why: Base UI 1.3 / 1.4 has a Firefox-specific state-machine race that pegs
// the Firefox content process at 90% CPU after the sequence
//   open → click chip inside → close → click a different trigger.
// Forensics in /tmp/ff_diag*.log identified Base UI's internal `removalRequest`
// staying pending after a chip-click + URL update during the popover's exit
// transition. Controlled mode + 1.4.1 upgrade did not resolve it.
// This implementation: no portal, no Floating UI, no third-party state store,
// no exit transition. Just useState + click-outside listener + absolute pos.
// ============================================================================
interface CustomDropdownProps {
  trigger: (props: {
    onClick: () => void
    "aria-expanded": boolean
    "aria-haspopup": "menu"
    ref: React.Ref<HTMLButtonElement>
  }) => React.ReactNode
  children: React.ReactNode
}
function CustomDropdown({ trigger, children }: CustomDropdownProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  // Real macOS Safari/Firefox can enter a pointer/style feedback loop if this
  // popup updates synchronously inside the native input event.
  const setOpenAfterInput = useCallback(
    (next: boolean | ((current: boolean) => boolean)) => {
      window.setTimeout(() => {
        setOpen(next)
      }, 0)
    },
    [],
  )

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node | null
      if (!t) return
      if (popupRef.current?.contains(t)) return
      if (triggerRef.current?.contains(t)) return
      setOpenAfterInput(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenAfterInput(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, setOpenAfterInput])

  const triggerProps = useMemo(
    () => ({
      onClick: () => setOpenAfterInput((v) => !v),
      "aria-expanded": open,
      "aria-haspopup": "menu" as const,
      ref: triggerRef,
    }),
    [open, setOpenAfterInput],
  )

  return (
    <div className="relative inline-block">
      {trigger(triggerProps)}
      {open && (
        <div
          ref={popupRef}
          role="menu"
          className="absolute left-0 top-[calc(100%+8px)] z-50 border border-[#222] bg-[#0a0a0a] p-3 min-w-[200px] max-w-[320px]"
        >
          {children}
        </div>
      )}
    </div>
  )
}

const RAM_OPTIONS: Array<{ value: string; label: string }> = RAM_BUCKETS.map((b) => ({
  value: b.value,
  label: b.label,
}))
const STORAGE_OPTIONS: Array<{ value: string; label: string }> = STORAGE_BUCKETS.map((b) => ({
  value: b.value,
  label: b.label,
}))
const MEDAL_OPTIONS: Array<{ value: string; label: string }> = MEDAL_TIERS.map((t) => ({
  value: t.value,
  label: t.label,
}))

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
function FilterFacetDropdownInner<T extends string | number>({
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
    <CustomDropdown
      trigger={(p) => (
        <button
          {...p}
          type="button"
          data-facet-dropdown={label}
          className={
            "inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide " +
            (isActive
              ? "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0]"
              : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-[#ccc]")
          }
        >
          <span>{triggerLabel}</span>
          <ChevronDown className="h-3 w-3" aria-hidden />
        </button>
      )}
    >
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
                "border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide " +
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
    </CustomDropdown>
  )
}
const FilterFacetDropdown = memo(FilterFacetDropdownInner) as typeof FilterFacetDropdownInner

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
function FilterChipGroupVerticalInner<T extends string | number>({
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
                "border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide " +
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
const FilterChipGroupVertical = memo(
  FilterChipGroupVerticalInner,
) as typeof FilterChipGroupVerticalInner

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
  const sliderValue = useMemo(() => [min, max], [min, max])
  const onSliderChange = useCallback(
    (v: number | number[] | readonly number[]) => {
      const arr: number[] = Array.isArray(v) ? Array.from(v) : [v as number]
      onChange({ minPrice: arr[0] ?? null, maxPrice: arr[1] ?? null })
    },
    [onChange],
  )
  const onClearPrice = useCallback(
    () => onChange({ minPrice: null, maxPrice: null }),
    [onChange],
  )
  return (
    <CustomDropdown
      trigger={(p) => (
        <button
          {...p}
          type="button"
          data-price-popover-trigger
          className={
            "inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide " +
            (isActive
              ? "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0]"
              : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-[#ccc]")
          }
        >
          <span>{triggerLabel}</span>
          <ChevronDown className="h-3 w-3" aria-hidden />
        </button>
      )}
    >
      <div className="mb-3 flex w-[280px] items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">
          Price
        </span>
        {isActive && (
          <button
            type="button"
            onClick={onClearPrice}
            className="font-mono text-[10px] uppercase tracking-wider text-[#888] hover:text-[#f5f5f0]"
          >
            Clear
          </button>
        )}
      </div>
      <Slider
        value={sliderValue}
        min={bounds.priceMin}
        max={bounds.priceMax}
        step={50}
        onValueCommitted={onSliderChange}
      />
      <div className="mt-2 flex justify-between font-mono text-[10px] text-[#888]">
        <span>${min.toLocaleString()}</span>
        <span>${max.toLocaleString()}</span>
      </div>
    </CustomDropdown>
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

  // Bounds-derived options — recomputed only when bounds change, not on every
  // chip click. Without this, the option arrays were new references on every
  // render which forced all 7 popovers to reconcile and froze the main thread.
  const yearOptions = useMemo(
    () => bounds.years.map((y) => ({ value: y, label: String(y) })),
    [bounds.years],
  )
  const cpuOptions = useMemo(
    () => bounds.cpuKinds.map((c) => ({ value: c, label: c })),
    [bounds.cpuKinds],
  )
  const subcatOptions = useMemo(
    () => bounds.subCategories.map((sc) => ({ value: sc.slug, label: sc.name })),
    [bounds.subCategories],
  )

  // Per-facet toggle/clear callbacks — stable across renders unless that
  // facet's selection actually changed. memo() on the dropdowns then prevents
  // siblings from re-rendering when only one facet is touched.
  const onToggleYear = useCallback(
    (v: number) => onChange({ year: toggleArray(state.year, v) }),
    [onChange, state.year],
  )
  const onClearYear = useCallback(() => onChange({ year: [] }), [onChange])

  const onToggleCpu = useCallback(
    (v: string) => onChange({ cpu: toggleArray(state.cpu, v) }),
    [onChange, state.cpu],
  )
  const onClearCpu = useCallback(() => onChange({ cpu: [] }), [onChange])

  const onToggleRam = useCallback(
    (v: string) => onChange({ ram: toggleArray(state.ram, v) }),
    [onChange, state.ram],
  )
  const onClearRam = useCallback(() => onChange({ ram: [] }), [onChange])

  const onToggleStorage = useCallback(
    (v: string) => onChange({ storage: toggleArray(state.storage, v) }),
    [onChange, state.storage],
  )
  const onClearStorage = useCallback(
    () => onChange({ storage: [] }),
    [onChange],
  )

  const onToggleMedal = useCallback(
    (v: string) => onChange({ medal: toggleArray(state.medal, v) }),
    [onChange, state.medal],
  )
  const onClearMedal = useCallback(() => onChange({ medal: [] }), [onChange])

  const onToggleSubcat = useCallback(
    (v: string) => onChange({ subcat: toggleArray(state.subcat, v) }),
    [onChange, state.subcat],
  )
  const onClearSubcat = useCallback(
    () => onChange({ subcat: [] }),
    [onChange],
  )

  if (layout === "bar") {
    return (
      <div
        data-leaderboard-filters
        data-testid="leaderboard-filters"
        data-layout="bar"
        className="mb-6 border border-[#222] bg-[#0a0a0a] px-4 py-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <PriceFilterPopover state={state} bounds={bounds} onChange={onChange} />
          <FilterFacetDropdown
            label="Year"
            selected={state.year}
            options={yearOptions}
            onToggle={onToggleYear}
            onClear={onClearYear}
          />
          <FilterFacetDropdown
            label="CPU"
            selected={state.cpu}
            options={cpuOptions}
            onToggle={onToggleCpu}
            onClear={onClearCpu}
          />
          <FilterFacetDropdown
            label="RAM"
            selected={state.ram}
            options={RAM_OPTIONS}
            onToggle={onToggleRam}
            onClear={onClearRam}
          />
          <FilterFacetDropdown
            label="Storage"
            selected={state.storage}
            options={STORAGE_OPTIONS}
            onToggle={onToggleStorage}
            onClear={onClearStorage}
          />
          <FilterFacetDropdown
            label="Medal"
            selected={state.medal}
            options={MEDAL_OPTIONS}
            onToggle={onToggleMedal}
            onClear={onClearMedal}
          />
          {bounds.subCategories.length > 0 && (
            <FilterFacetDropdown
              label="Sub-cat"
              selected={state.subcat}
              options={subcatOptions}
              onToggle={onToggleSubcat}
              onClear={onClearSubcat}
            />
          )}

          <button
            type="button"
            data-reset-filters
            onClick={onReset}
            disabled={activeCount === 0}
            className={
              "ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider " +
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
        options={yearOptions}
        onToggle={onToggleYear}
      />
      <FilterChipGroupVertical
        label="CPU"
        selected={state.cpu}
        options={cpuOptions}
        onToggle={onToggleCpu}
      />
      <FilterChipGroupVertical
        label="RAM"
        selected={state.ram}
        options={RAM_OPTIONS}
        onToggle={onToggleRam}
      />
      <FilterChipGroupVertical
        label="Storage"
        selected={state.storage}
        options={STORAGE_OPTIONS}
        onToggle={onToggleStorage}
      />
      <FilterChipGroupVertical
        label="Medal"
        selected={state.medal}
        options={MEDAL_OPTIONS}
        onToggle={onToggleMedal}
      />
      {bounds.subCategories.length > 0 && (
        <FilterChipGroupVertical
          label="Sub-cat"
          selected={state.subcat}
          options={subcatOptions}
          onToggle={onToggleSubcat}
        />
      )}

      <button
        type="button"
        data-reset-filters
        onClick={onReset}
        disabled={activeCount === 0}
        className={
          "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider " +
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
