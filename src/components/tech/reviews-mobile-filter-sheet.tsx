"use client"

import type { ReactNode } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { FilterBarCategory } from "./reviews-filter-bar"

interface ReviewsMobileFilterSheetProps {
  children: ReactNode
  categories: FilterBarCategory[]
  category: string | null
  sort: "latest" | "rating" | "name"
  q: string | null
  onCategoryChange: (value: string | null) => void
  onSortChange: (value: "latest" | "rating" | "name") => void
  onQChange: (value: string | null) => void
}

const SORT_OPTIONS: Array<{ value: "latest" | "rating" | "name"; label: string }> = [
  { value: "latest", label: "Latest" },
  { value: "rating", label: "Highest rated" },
  { value: "name", label: "By product name" },
]

export function ReviewsMobileFilterSheet({
  children,
  categories,
  category,
  sort,
  q,
  onCategoryChange,
  onSortChange,
  onQChange,
}: ReviewsMobileFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger render={children as React.ReactElement} />
      <SheetContent side="right" className="border-[#222] bg-[#0a0a0a] text-[#f5f5f0]">
        <SheetHeader className="border-b border-[#222]">
          <SheetTitle className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#f5f5f0]">
            Filters
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto p-4">
          <div>
            <h3 className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Search</h3>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search reviews"
                value={q ?? ""}
                onChange={(e) => onQChange(e.target.value || null)}
                className="border-[#222] bg-[#111] pl-9 font-mono text-[13px] text-[#f5f5f0] placeholder:text-[#555]"
                aria-label="Search reviews"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Sort</h3>
            <div className="flex flex-col gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSortChange(opt.value)}
                  className={`cursor-pointer border px-3 py-2 text-left font-mono text-[13px] uppercase tracking-[0.05em] transition-colors ${
                    sort === opt.value
                      ? "border-[#f5f5f0] bg-[#f5f5f0] text-black"
                      : "border-[#222] bg-[#111] text-[#888] hover:border-[#444] hover:text-[#f5f5f0]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">Category</h3>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onCategoryChange(null)}
                className={`cursor-pointer border px-3 py-2 text-left font-mono text-[13px] uppercase tracking-[0.05em] transition-colors ${
                  !category
                    ? "border-[#f5f5f0] bg-[#f5f5f0] text-black"
                    : "border-[#222] bg-[#111] text-[#888] hover:border-[#444] hover:text-[#f5f5f0]"
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => onCategoryChange(category === c.slug ? null : c.slug)}
                  className={`cursor-pointer border px-3 py-2 text-left font-mono text-[13px] uppercase tracking-[0.05em] transition-colors ${
                    category === c.slug
                      ? "border-[#f5f5f0] bg-[#f5f5f0] text-black"
                      : "border-[#222] bg-[#111] text-[#888] hover:border-[#444] hover:text-[#f5f5f0]"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
