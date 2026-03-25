"use client"

import { useQueryState, parseAsString, parseAsInteger } from "nuqs"
import { Slider } from "@/components/ui/slider"

interface BeatFiltersProps {
  options: {
    genres: string[]
    keys: string[]
    moods: string[]
  }
}

function FilterChip({
  label,
  isSelected,
  onClick,
}: {
  label: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-none border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors duration-100 ${
        isSelected
          ? "border-[#f5f5f0] bg-[#f5f5f0] text-[#000]"
          : "border-[#222] bg-[#111] text-[#f5f5f0] hover:border-[#444]"
      }`}
    >
      {label}
    </button>
  )
}

export function BeatFilters({ options }: BeatFiltersProps) {
  const [genre, setGenre] = useQueryState(
    "genre",
    parseAsString.withOptions({ shallow: false })
  )
  const [keyFilter, setKeyFilter] = useQueryState(
    "key",
    parseAsString.withOptions({ shallow: false })
  )
  const [mood, setMood] = useQueryState(
    "mood",
    parseAsString.withOptions({ shallow: false })
  )
  const [bpmMin, setBpmMin] = useQueryState(
    "bpmMin",
    parseAsInteger.withOptions({ shallow: false })
  )
  const [bpmMax, setBpmMax] = useQueryState(
    "bpmMax",
    parseAsInteger.withOptions({ shallow: false })
  )

  const hasActiveFilters =
    genre !== null ||
    keyFilter !== null ||
    mood !== null ||
    bpmMin !== null ||
    bpmMax !== null

  function clearAll() {
    setGenre(null)
    setKeyFilter(null)
    setMood(null)
    setBpmMin(null)
    setBpmMax(null)
  }

  function toggleFilter(
    current: string | null,
    value: string,
    setter: (v: string | null) => void
  ) {
    setter(current === value ? null : value)
  }

  const bpmValues = [bpmMin ?? 60, bpmMax ?? 200]

  return (
    <div className="flex flex-col gap-3">
      {/* Genre chips */}
      {options.genres.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto"
          style={{
            maskImage:
              "linear-gradient(to right, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, black 85%, transparent)",
          }}
        >
          {options.genres.map((g) => (
            <FilterChip
              key={g}
              label={g}
              isSelected={genre === g}
              onClick={() => toggleFilter(genre, g, setGenre)}
            />
          ))}
        </div>
      )}

      {/* Key chips */}
      {options.keys.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto"
          style={{
            maskImage:
              "linear-gradient(to right, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, black 85%, transparent)",
          }}
        >
          {options.keys.map((k) => (
            <FilterChip
              key={k}
              label={k}
              isSelected={keyFilter === k}
              onClick={() => toggleFilter(keyFilter, k, setKeyFilter)}
            />
          ))}
        </div>
      )}

      {/* Mood chips */}
      {options.moods.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto"
          style={{
            maskImage:
              "linear-gradient(to right, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, black 85%, transparent)",
          }}
        >
          {options.moods.map((m) => (
            <FilterChip
              key={m}
              label={m}
              isSelected={mood === m}
              onClick={() => toggleFilter(mood, m, setMood)}
            />
          ))}
        </div>
      )}

      {/* BPM range slider + clear */}
      <div className="flex items-center gap-4">
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.05em] text-[#888]">
          BPM {bpmValues[0]}–{bpmValues[1]}
        </span>
        <div className="w-40">
          <Slider
            min={60}
            max={200}
            value={bpmValues}
            onValueChange={(value: number | readonly number[]) => {
              const values = Array.isArray(value)
                ? value
                : [value, value]
              setBpmMin(values[0] === 60 ? null : values[0])
              setBpmMax(values[1] === 200 ? null : values[1])
            }}
          />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto shrink-0 cursor-pointer font-mono text-[11px] uppercase text-[#888] transition-colors hover:text-[#f5f5f0]"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
