"use client"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Filter } from "lucide-react"
import {
  LeaderboardFilters,
  type FilterState,
  type FilterCorpusBounds,
} from "./leaderboard-filter-sidebar"

interface Props {
  state: FilterState
  onChange: (next: Partial<FilterState>) => void
  onReset: () => void
  bounds: FilterCorpusBounds
  activeCount: number
}

/**
 * D-20: Mobile filter overlay. Sticky filter button bottom-right;
 * Sheet slides in from right with the SAME LeaderboardFilters control set.
 * Reuses LeaderboardFilters as the body — single source of truth for filter UI.
 */
export function LeaderboardFilterSheet({
  state,
  onChange,
  onReset,
  bounds,
  activeCount,
}: Props) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 border border-[#f5f5f0] bg-[#0a0a0a] px-4 py-3 text-xs font-mono uppercase tracking-wider text-[#f5f5f0] shadow-lg md:hidden"
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filters {activeCount > 0 ? `(${activeCount})` : ""}
          </button>
        }
      />
      <SheetContent
        side="right"
        className="w-[320px] overflow-y-auto bg-[#0a0a0a] p-4"
      >
        <SheetHeader>
          <SheetTitle className="font-mono uppercase tracking-wider text-[#f5f5f0]">
            Filters
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <LeaderboardFilters
            state={state}
            onChange={onChange}
            onReset={onReset}
            bounds={bounds}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
