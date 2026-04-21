"use client"

import { useMemo, useState } from "react"
import clsx from "clsx"
import { VideoCard } from "./video-card"
import type { PortfolioItem } from "@/types"

interface PortfolioGridProps {
  items: PortfolioItem[]
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  const [active, setActive] = useState<string | null>(null)

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((i) => i.category)
            .filter((c): c is string => typeof c === "string" && c.length > 0)
        )
      ),
    [items]
  )

  const filtered = useMemo(
    () => (active ? items.filter((i) => i.category === active) : items),
    [items, active]
  )

  const chipBase =
    "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200"
  const chipActive = "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
  const chipInactive =
    "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2 mt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setActive(null)}
          className={clsx(chipBase, !active ? chipActive : chipInactive)}
          aria-pressed={!active}
        >
          ALL
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={clsx(chipBase, active === c ? chipActive : chipInactive)}
            aria-pressed={active === c}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-8">
          {filtered.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <h2 className="font-mono font-bold text-2xl uppercase text-[#f5f5f0] mb-4">
            NO ITEMS IN THIS CATEGORY
          </h2>
          <p className="text-[#888888] font-sans">
            Try a different category or tap ALL to see every item.
          </p>
        </div>
      )}
    </div>
  )
}
