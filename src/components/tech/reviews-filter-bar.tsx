"use client"

import { useQueryState, parseAsString, parseAsStringEnum } from "nuqs"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReviewsMobileFilterSheet } from "./reviews-mobile-filter-sheet"

export interface FilterBarCategory {
  name: string
  slug: string
}

interface ReviewsFilterBarProps {
  categories: FilterBarCategory[]
}

export function ReviewsFilterBar({ categories }: ReviewsFilterBarProps) {
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withOptions({ shallow: false }),
  )
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringEnum(["latest", "rating", "name"])
      .withDefault("latest")
      .withOptions({ shallow: false }),
  )
  const [q, setQ] = useQueryState(
    "q",
    parseAsString.withOptions({ shallow: false, throttleMs: 300 }),
  )

  return (
    <div className="flex flex-col gap-4 border-b border-[#222] py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden md:block">
          <Select value={sort} onValueChange={(v) => setSort(v as "latest" | "rating" | "name")}>
            <SelectTrigger className="w-[200px] border-[#222] bg-[#111] font-mono text-[13px] uppercase tracking-[0.05em] text-[#f5f5f0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[#222] bg-[#111] text-[#f5f5f0]">
              <SelectItem value="latest" className="font-mono uppercase tracking-[0.05em]">Latest</SelectItem>
              <SelectItem value="rating" className="font-mono uppercase tracking-[0.05em]">Highest rated</SelectItem>
              <SelectItem value="name" className="font-mono uppercase tracking-[0.05em]">By product name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative hidden min-w-[240px] flex-1 md:block md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search reviews"
            value={q ?? ""}
            onChange={(e) => setQ(e.target.value || null)}
            className="border-[#222] bg-[#111] pl-9 font-mono text-[13px] text-[#f5f5f0] placeholder:text-[#555]"
            aria-label="Search reviews"
          />
        </div>

        <div className="flex w-full items-center gap-2 md:hidden">
          <ReviewsMobileFilterSheet
            categories={categories}
            category={category}
            sort={sort}
            q={q}
            onCategoryChange={setCategory}
            onSortChange={(v) => setSort(v)}
            onQChange={setQ}
          >
            <button
              type="button"
              aria-label="Open filters"
              className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 border border-[#222] bg-[#111] font-mono text-[13px] uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:border-[#444]"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filter
              {(category || q) && (
                <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-[#f5f5f0]" aria-hidden="true" />
              )}
            </button>
          </ReviewsMobileFilterSheet>
        </div>
      </div>

      <div
        className="flex gap-2 overflow-x-auto"
        style={{
          maskImage: "linear-gradient(to right, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, black 92%, transparent)",
        }}
      >
        <CategoryPill label="All" isActive={!category} onClick={() => setCategory(null)} />
        {categories.map((c) => (
          <CategoryPill
            key={c.slug}
            label={c.name}
            isActive={category === c.slug}
            onClick={() => setCategory(category === c.slug ? null : c.slug)}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryPill({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer border px-4 py-2 font-mono text-[13px] uppercase tracking-[0.05em] transition-colors ${
        isActive
          ? "border-[#f5f5f0] bg-[#f5f5f0] text-black"
          : "border-[#222] bg-[#111] text-[#888] hover:border-[#444] hover:text-[#f5f5f0]"
      }`}
    >
      {label}
    </button>
  )
}
