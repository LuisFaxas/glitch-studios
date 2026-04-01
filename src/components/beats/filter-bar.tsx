"use client"

import { useState, useEffect, useCallback } from "react"
import { useQueryState, parseAsString, parseAsInteger } from "nuqs"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ViewToggle } from "@/components/beats/view-toggle"

interface FilterBarProps {
  options: { genres: string[]; keys: string[]; moods: string[] }
  beatCount: number
  view: string
  onViewChange: (view: string) => void
}

export function FilterBar({
  options,
  beatCount,
  view,
  onViewChange,
}: FilterBarProps) {
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
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withOptions({ shallow: false })
  )

  const [localSearch, setLocalSearch] = useState(query ?? "")

  // Sync external query changes to local state
  useEffect(() => {
    setLocalSearch(query ?? "")
  }, [query])

  // Debounced update to URL (300ms)
  const updateQuery = useCallback(
    (value: string) => {
      setQuery(value || null)
    },
    [setQuery]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (query ?? "")) {
        updateQuery(localSearch)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, query, updateQuery])

  const hasActiveFilters =
    genre !== null ||
    keyFilter !== null ||
    mood !== null ||
    bpmMin !== null ||
    bpmMax !== null ||
    query !== null

  function clearAll() {
    setGenre(null)
    setKeyFilter(null)
    setMood(null)
    setBpmMin(null)
    setBpmMax(null)
    setQuery(null)
    setLocalSearch("")
  }

  const [localBpm, setLocalBpm] = useState([bpmMin ?? 60, bpmMax ?? 200])

  // Sync from URL -> local when URL changes (e.g., clear filters)
  useEffect(() => {
    setLocalBpm([bpmMin ?? 60, bpmMax ?? 200])
  }, [bpmMin, bpmMax])

  return (
    <div
      data-testid="filter-bar"
      className="sticky top-0 z-10 border border-[#222] bg-[#0a0a0a] px-4 py-2"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
        {/* Row 1 (mobile) / inline (desktop): Search input */}
        <div className="relative w-full md:min-w-[200px] md:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search beats..."
            className="h-9 w-full rounded-none border border-[#222] bg-[#111] pl-9 pr-3 font-sans text-[15px] text-[#f5f5f0] outline-none transition-colors placeholder:text-[#555] focus:border-[#f5f5f0]"
          />
        </div>

        {/* Row 2 (mobile scrollable) / inline (desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden md:contents">
          {/* Genre Select */}
          <Select
            value={genre ?? undefined}
            onValueChange={(v) => setGenre(v || null)}
          >
            <SelectTrigger className="w-auto min-w-[100px] shrink-0 rounded-none border-[#222] bg-[#111] font-mono text-[11px] uppercase text-[#f5f5f0] h-9">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#222] bg-[#111]">
              {options.genres.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Key Select */}
          <Select
            value={keyFilter ?? undefined}
            onValueChange={(v) => setKeyFilter(v || null)}
          >
            <SelectTrigger className="w-auto min-w-[80px] shrink-0 rounded-none border-[#222] bg-[#111] font-mono text-[11px] uppercase text-[#f5f5f0] h-9">
              <SelectValue placeholder="Key" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#222] bg-[#111]">
              {options.keys.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mood Select */}
          <Select
            value={mood ?? undefined}
            onValueChange={(v) => setMood(v || null)}
          >
            <SelectTrigger className="w-auto min-w-[100px] shrink-0 rounded-none border-[#222] bg-[#111] font-mono text-[11px] uppercase text-[#f5f5f0] h-9">
              <SelectValue placeholder="Mood" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#222] bg-[#111]">
              {options.moods.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* BPM Slider */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="shrink-0 font-mono text-[11px] uppercase text-[#888]">
              BPM
            </span>
            <div className="w-[120px]">
              <Slider
                min={60}
                max={200}
                step={1}
                value={localBpm}
                onValueChange={(value: number | readonly number[]) => {
                  const values = Array.isArray(value)
                    ? value
                    : [value, value]
                  setLocalBpm(values as number[])
                }}
                onValueCommit={(value: number | readonly number[]) => {
                  const values = Array.isArray(value)
                    ? value
                    : [value, value]
                  setBpmMin(values[0] === 60 ? null : values[0])
                  setBpmMax(values[1] === 200 ? null : values[1])
                }}
              />
            </div>
          </div>

          {/* Beat count */}
          <span className="shrink-0 font-mono text-[11px] text-[#888]">
            {beatCount} beats
          </span>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="shrink-0 cursor-pointer font-mono text-[11px] uppercase text-[#888] transition-colors hover:text-[#f5f5f0]"
            >
              CLEAR FILTERS
            </button>
          )}

          {/* View toggle */}
          <ViewToggle view={view} onViewChange={onViewChange} />
        </div>
      </div>
    </div>
  )
}
