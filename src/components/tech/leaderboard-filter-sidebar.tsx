"use client"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"

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

interface Props {
  state: FilterState
  onChange: (next: Partial<FilterState>) => void
  onReset: () => void
  bounds: FilterCorpusBounds
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-[#888]">
      {children}
    </h3>
  )
}

function Chip<T extends string | number>({
  value,
  label,
  isSelected,
  onToggle,
}: {
  value: T
  label: string
  isSelected: boolean
  onToggle: (v: T) => void
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onToggle(value)}
      className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors ${
        isSelected
          ? "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0]"
          : "border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-[#ccc]"
      }`}
    >
      {label}
    </button>
  )
}

export function LeaderboardFilters({ state, onChange, onReset, bounds }: Props) {
  const toggleString =
    (key: keyof Pick<FilterState, "cpu" | "ram" | "storage" | "medal" | "subcat">) =>
    (v: string) => {
      const current = state[key]
      const next = current.includes(v)
        ? current.filter((x) => x !== v)
        : [...current, v]
      onChange({ [key]: next } as Partial<FilterState>)
    }
  const toggleNumber = (key: "year") => (v: number) => {
    const current = state[key]
    const next = current.includes(v)
      ? current.filter((x) => x !== v)
      : [...current, v]
    onChange({ [key]: next } as Partial<FilterState>)
  }

  const min = state.minPrice ?? bounds.priceMin
  const max = state.maxPrice ?? bounds.priceMax

  return (
    <div className="space-y-6">
      {/* D-06: Reset filters button at top of sidebar header */}
      <div className="flex items-center justify-between border-b border-[#222] pb-3">
        <span className="font-mono text-xs uppercase tracking-wider text-[#f5f5f0]">
          Filters
        </span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#888] hover:text-[#f5f5f0]"
        >
          <X className="h-3 w-3" aria-hidden />
          Reset filters
        </button>
      </div>

      {/* 1. Price — range slider */}
      <section>
        <SectionHeading>Price</SectionHeading>
        <Slider
          value={[min, max]}
          min={bounds.priceMin}
          max={bounds.priceMax}
          step={50}
          onValueChange={(v) => {
            const arr = Array.isArray(v) ? Array.from(v) : [v]
            onChange({ minPrice: arr[0] ?? null, maxPrice: arr[1] ?? null })
          }}
          className="mt-3"
        />
        <div className="mt-2 flex justify-between font-mono text-[10px] text-[#888]">
          <span>${min.toLocaleString()}</span>
          <span>${max.toLocaleString()}</span>
        </div>
      </section>

      {/* 2. Year */}
      <section>
        <SectionHeading>Year</SectionHeading>
        <div className="flex flex-wrap gap-1.5">
          {bounds.years.map((y) => (
            <Chip
              key={y}
              value={y}
              label={String(y)}
              isSelected={state.year.includes(y)}
              onToggle={toggleNumber("year")}
            />
          ))}
        </div>
      </section>

      {/* 3. CPU kind — derived from corpus */}
      <section>
        <SectionHeading>CPU</SectionHeading>
        <div className="flex flex-wrap gap-1.5">
          {bounds.cpuKinds.map((c) => (
            <Chip
              key={c}
              value={c}
              label={c}
              isSelected={state.cpu.includes(c)}
              onToggle={toggleString("cpu")}
            />
          ))}
        </div>
      </section>

      {/* 4. RAM */}
      <section>
        <SectionHeading>RAM</SectionHeading>
        <div className="flex flex-wrap gap-1.5">
          {RAM_BUCKETS.map((b) => (
            <Chip
              key={b.value}
              value={b.value}
              label={b.label}
              isSelected={state.ram.includes(b.value)}
              onToggle={toggleString("ram")}
            />
          ))}
        </div>
      </section>

      {/* 5. Storage — 3 buckets (D-05 amendment 2026-04-25 dropped <512) */}
      <section>
        <SectionHeading>Storage</SectionHeading>
        <div className="flex flex-wrap gap-1.5">
          {STORAGE_BUCKETS.map((b) => (
            <Chip
              key={b.value}
              value={b.value}
              label={b.label}
              isSelected={state.storage.includes(b.value)}
              onToggle={toggleString("storage")}
            />
          ))}
        </div>
      </section>

      {/* 6. Medal tier */}
      <section>
        <SectionHeading>Medal</SectionHeading>
        <div className="flex flex-wrap gap-1.5">
          {MEDAL_TIERS.map((t) => (
            <Chip
              key={t.value}
              value={t.value}
              label={t.label}
              isSelected={state.medal.includes(t.value)}
              onToggle={toggleString("medal")}
            />
          ))}
        </div>
      </section>

      {/* 7. Sub-category — only when descendants are flattened (>0) */}
      {bounds.subCategories.length > 0 && (
        <section>
          <SectionHeading>Sub-category</SectionHeading>
          <div className="flex flex-wrap gap-1.5">
            {bounds.subCategories.map((s) => (
              <Chip
                key={s.slug}
                value={s.slug}
                label={s.name}
                isSelected={state.subcat.includes(s.slug)}
                onToggle={toggleString("subcat")}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
