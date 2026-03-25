"use client"

import { useState, useEffect, useCallback } from "react"
import { useQueryState, parseAsString } from "nuqs"
import { Search } from "lucide-react"

export function BeatSearch() {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withOptions({ shallow: false })
  )
  const [localValue, setLocalValue] = useState(query ?? "")

  // Sync external query changes to local state
  useEffect(() => {
    setLocalValue(query ?? "")
  }, [query])

  // Debounced update to URL
  const updateQuery = useCallback(
    (value: string) => {
      setQuery(value || null)
    },
    [setQuery]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== (query ?? "")) {
        updateQuery(localValue)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localValue, query, updateQuery])

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Search beats..."
        className="w-full rounded-none border border-[#333] bg-[#111] py-3 pl-11 pr-4 font-sans text-[15px] text-[#f5f5f0] outline-none transition-colors duration-200 placeholder:text-[#555] focus:border-[#f5f5f0]"
      />
    </div>
  )
}
