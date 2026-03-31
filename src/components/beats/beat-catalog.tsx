"use client"

import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useQueryState, parseAsString } from "nuqs"
import { AnimatePresence, motion } from "motion/react"
import { FilterBar } from "@/components/beats/filter-bar"
import { BeatCardGrid } from "@/components/beats/beat-card-grid"
import { BeatList } from "@/components/beats/beat-list"
import type { BeatSummary } from "@/types/beats"

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
    parseAsString.withDefault("card").withOptions({ shallow: true })
  )
  // Validate: only "card" or "list" are valid values
  const currentView = view === "list" ? "list" : "card"

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
            {currentView === "card" ? (
              <motion.div
                key="card-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BeatCardGrid beats={beats} />
              </motion.div>
            ) : (
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BeatList beats={beats} hasActiveFilters={hasActiveFilters} />
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
