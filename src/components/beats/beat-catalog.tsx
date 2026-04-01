"use client"

import { useEffect } from "react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useQueryState, parseAsString } from "nuqs"
import { AnimatePresence, motion } from "motion/react"
import { FilterBar } from "@/components/beats/filter-bar"
import { BeatCardGrid } from "@/components/beats/beat-card-grid"
import { BeatList } from "@/components/beats/beat-list"
import type { BeatSummary } from "@/types/beats"

const STORAGE_KEY = "beats-view"
const VALID_VIEWS = ["compact", "card", "list"] as const

function validateView(v: string): "compact" | "card" | "list" {
  if (v === "list") return "list"
  if (v === "card") return "card"
  return "compact"
}

interface BeatCatalogProps {
  beats: BeatSummary[]
  filterOptions: { genres: string[]; keys: string[]; moods: string[] }
  hasActiveFilters: boolean
}

function BeatCatalogInner({
  beats,
  filterOptions,
  hasActiveFilters,
}: BeatCatalogProps) {
  const [view, setView] = useQueryState(
    "view",
    parseAsString.withDefault("compact").withOptions({ shallow: true })
  )
  const currentView = validateView(view)

  // On mount: if no URL view param, restore from localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has("view")) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && VALID_VIEWS.includes(stored as (typeof VALID_VIEWS)[number])) {
          setView(stored)
        }
      } catch {
        // localStorage unavailable
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist view changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currentView)
    } catch {
      // localStorage unavailable
    }
  }, [currentView])

  return (
    <>
      <FilterBar
        options={filterOptions}
        beatCount={beats.length}
        view={currentView}
        onViewChange={(v) => setView(v)}
      />
      {beats.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <h2 className="mb-2 font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            NO BEATS FOUND
          </h2>
          <p className="max-w-md font-sans text-[15px] text-[#888]">
            {hasActiveFilters
              ? "No beats match your filters. Try adjusting your search or clearing filters."
              : "New beats are coming soon. Check back later."}
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {currentView === "list" ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BeatList beats={beats} hasActiveFilters={hasActiveFilters} />
              </motion.div>
            ) : (
              <motion.div
                key={currentView === "card" ? "card-view" : "compact-view"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BeatCardGrid
                  beats={beats}
                  variant={currentView === "card" ? "large" : "compact"}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}

export function BeatCatalog(props: BeatCatalogProps) {
  return (
    <NuqsAdapter>
      <BeatCatalogInner {...props} />
    </NuqsAdapter>
  )
}
