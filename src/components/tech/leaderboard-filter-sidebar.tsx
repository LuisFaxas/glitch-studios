"use client"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
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
    function closeBeforePageSuspends() {
      // Defer out of the native lifecycle event task. A synchronous setState
      // here during a route transition or visibility change can wedge the
      // real-mac compositor (same fault class as the click-path crash).
      setOpenAfterInput(false)
    }
    function onVisibilityChange() {
      if (document.visibilityState !== "visible") closeBeforePageSuspends()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("pagehide", closeBeforePageSuspends)
    window.addEventListener("blur", closeBeforePageSuspends)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pagehide", closeBeforePageSuspends)
      window.removeEventListener("blur", closeBeforePageSuspends)
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

interface PriceRangeSliderProps {
  value: readonly [number, number]
  min: number
  max: number
  step?: number
  onCommit: (value: [number, number]) => void
}

function PriceRangeSlider({
  value,
  min,
  max,
  step = 50,
  onCommit,
}: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const rangeRef = useRef<HTMLDivElement | null>(null)
  const minThumbRef = useRef<HTMLButtonElement | null>(null)
  const maxThumbRef = useRef<HTMLButtonElement | null>(null)
  const minLabelRef = useRef<HTMLSpanElement | null>(null)
  const maxLabelRef = useRef<HTMLSpanElement | null>(null)
  const activeThumbRef = useRef<0 | 1 | null>(null)
  const stopDraggingRef = useRef<(event: Event) => void>(() => {})
  const liveValueRef = useRef<[number, number]>([value[0], value[1]])
  const rafRef = useRef<number | null>(null)

  const clampValue = useCallback(
    (next: number) => Math.min(max, Math.max(min, next)),
    [max, min],
  )

  const snapValue = useCallback(
    (next: number) => {
      if (step <= 0) return clampValue(next)
      const snapped = Math.round((next - min) / step) * step + min
      return clampValue(snapped)
    },
    [clampValue, min, step],
  )

  const getPercent = useCallback(
    (next: number) => {
      const range = Math.max(max - min, 1)
      return ((clampValue(next) - min) / range) * 100
    },
    [clampValue, max, min],
  )

  const formatPrice = useCallback(
    (next: number) => `$${Math.round(next).toLocaleString()}`,
    [],
  )

  const paint = useCallback(
    (nextValue: [number, number]) => {
      const [nextMin, nextMax] = nextValue
      const low = getPercent(nextMin)
      const high = getPercent(nextMax)

      if (rangeRef.current) {
        rangeRef.current.style.left = `${low}%`
        rangeRef.current.style.right = `${100 - high}%`
      }
      if (minThumbRef.current) {
        minThumbRef.current.style.left = `${low}%`
        minThumbRef.current.setAttribute("aria-valuenow", String(nextMin))
        minThumbRef.current.setAttribute("aria-valuetext", formatPrice(nextMin))
      }
      if (maxThumbRef.current) {
        maxThumbRef.current.style.left = `${high}%`
        maxThumbRef.current.setAttribute("aria-valuenow", String(nextMax))
        maxThumbRef.current.setAttribute("aria-valuetext", formatPrice(nextMax))
      }
      if (minLabelRef.current) minLabelRef.current.textContent = formatPrice(nextMin)
      if (maxLabelRef.current) maxLabelRef.current.textContent = formatPrice(nextMax)
    },
    [formatPrice, getPercent],
  )

  const schedulePaint = useCallback(
    (nextValue: [number, number]) => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        paint(nextValue)
      })
    },
    [paint],
  )

  const commitLiveValue = useCallback(() => {
    const nextValue = liveValueRef.current
    window.setTimeout(() => onCommit(nextValue), 0)
  }, [onCommit])

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect || rect.width <= 0) return liveValueRef.current[0]
      const raw = min + ((clientX - rect.left) / rect.width) * (max - min)
      return snapValue(raw)
    },
    [max, min, snapValue],
  )

  const setLiveThumbValue = useCallback(
    (thumbIndex: 0 | 1, clientX: number) => {
      const next = valueFromClientX(clientX)
      const [currentMin, currentMax] = liveValueRef.current
      const nextValue: [number, number] =
        thumbIndex === 0
          ? [Math.min(next, currentMax), currentMax]
          : [currentMin, Math.max(next, currentMin)]

      liveValueRef.current = nextValue
      schedulePaint(nextValue)
    },
    [schedulePaint, valueFromClientX],
  )

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const thumbIndex = activeThumbRef.current
      if (thumbIndex == null) return
      setLiveThumbValue(thumbIndex, event.clientX)
    },
    [setLiveThumbValue],
  )

  const stopDragging = useCallback(
    (event?: Event) => {
      if (event instanceof PointerEvent && activeThumbRef.current != null) {
        setLiveThumbValue(activeThumbRef.current, event.clientX)
      }
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", stopDraggingRef.current)
      window.removeEventListener("pointercancel", stopDraggingRef.current)
      window.removeEventListener("blur", stopDraggingRef.current)
      activeThumbRef.current = null
      commitLiveValue()
    },
    [commitLiveValue, onPointerMove, setLiveThumbValue],
  )

  useEffect(() => {
    stopDraggingRef.current = stopDragging
  }, [stopDragging])

  const startDragging = useCallback(
    (thumbIndex: 0 | 1, event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()
      activeThumbRef.current = thumbIndex
      event.currentTarget.focus({ preventScroll: true })
      setLiveThumbValue(thumbIndex, event.clientX)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", stopDraggingRef.current)
      window.removeEventListener("pointercancel", stopDraggingRef.current)
      window.removeEventListener("blur", stopDraggingRef.current)
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      window.addEventListener("pointerup", stopDragging, { once: true })
      window.addEventListener("pointercancel", stopDragging, { once: true })
      window.addEventListener("blur", stopDragging, { once: true })
    },
    [onPointerMove, setLiveThumbValue, stopDragging],
  )

  const onTrackPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("[data-slot='slider-thumb']")) return

      const next = valueFromClientX(event.clientX)
      const [currentMin, currentMax] = liveValueRef.current
      const thumbIndex: 0 | 1 =
        Math.abs(next - currentMin) <= Math.abs(next - currentMax) ? 0 : 1

      startDragging(thumbIndex, event)
    },
    [startDragging, valueFromClientX],
  )

  const onThumbKeyDown = useCallback(
    (thumbIndex: 0 | 1, event: React.KeyboardEvent<HTMLButtonElement>) => {
      let delta = 0
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta = -step
      if (event.key === "ArrowRight" || event.key === "ArrowUp") delta = step
      if (event.key === "Home") {
        delta =
          thumbIndex === 0
            ? min - liveValueRef.current[0]
            : min - liveValueRef.current[1]
      }
      if (event.key === "End") {
        delta =
          thumbIndex === 0
            ? max - liveValueRef.current[0]
            : max - liveValueRef.current[1]
      }
      if (delta === 0) return

      event.preventDefault()
      const [currentMin, currentMax] = liveValueRef.current
      const nextValue: [number, number] =
        thumbIndex === 0
          ? [Math.min(snapValue(currentMin + delta), currentMax), currentMax]
          : [currentMin, Math.max(snapValue(currentMax + delta), currentMin)]

      liveValueRef.current = nextValue
      paint(nextValue)
      commitLiveValue()
    },
    [commitLiveValue, max, min, paint, snapValue, step],
  )

  useEffect(() => {
    const nextValue: [number, number] = [clampValue(value[0]), clampValue(value[1])]
    liveValueRef.current =
      nextValue[0] <= nextValue[1] ? nextValue : [nextValue[1], nextValue[0]]
    paint(liveValueRef.current)
  }, [clampValue, paint, value])

  useEffect(
    () => () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", stopDraggingRef.current)
      window.removeEventListener("pointercancel", stopDraggingRef.current)
      window.removeEventListener("blur", stopDraggingRef.current)
    },
    [onPointerMove, stopDragging],
  )

  const lowPercent = getPercent(value[0])
  const highPercent = getPercent(value[1])

  return (
    <div data-slot="slider" className="w-full">
      <div
        ref={trackRef}
        data-slot="slider-track"
        className="relative flex h-8 w-full touch-none items-center select-none"
        onPointerDown={onTrackPointerDown}
      >
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted" />
        <div
          ref={rangeRef}
          data-slot="slider-range"
          className="absolute top-1/2 h-1 -translate-y-1/2 bg-primary"
          style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
        />
        <button
          ref={minThumbRef}
          type="button"
          data-slot="slider-thumb"
          role="slider"
          aria-label="Minimum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[0]}
          aria-valuetext={formatPrice(value[0])}
          className="absolute top-1/2 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ring bg-white ring-ring/50 select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3"
          style={{ left: `${lowPercent}%` }}
          onPointerDown={(event) => startDragging(0, event)}
          onKeyDown={(event) => onThumbKeyDown(0, event)}
        />
        <button
          ref={maxThumbRef}
          type="button"
          data-slot="slider-thumb"
          role="slider"
          aria-label="Maximum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[1]}
          aria-valuetext={formatPrice(value[1])}
          className="absolute top-1/2 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ring bg-white ring-ring/50 select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3"
          style={{ left: `${highPercent}%` }}
          onPointerDown={(event) => startDragging(1, event)}
          onKeyDown={(event) => onThumbKeyDown(1, event)}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-[#888]">
        <span ref={minLabelRef}>{formatPrice(value[0])}</span>
        <span ref={maxLabelRef}>{formatPrice(value[1])}</span>
      </div>
    </div>
  )
}

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
  const sliderValue = useMemo<readonly [number, number]>(() => [min, max], [min, max])
  const onSliderChange = useCallback(
    (v: [number, number]) => {
      onChange({ minPrice: v[0], maxPrice: v[1] })
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
      <PriceRangeSlider
        value={sliderValue}
        min={bounds.priceMin}
        max={bounds.priceMax}
        step={50}
        onCommit={onSliderChange}
      />
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
