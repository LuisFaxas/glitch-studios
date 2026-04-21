"use client"

import { useRouter, useSearchParams } from "next/navigation"
import clsx from "clsx"
import type { BlogCategory } from "@/types"

interface CategoryFilterProps {
  categories: BlogCategory[]
  activeCategory: string | null
}

export function CategoryFilter({
  categories,
  activeCategory,
}: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleCategoryClick(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set("category", slug)
    } else {
      params.delete("category")
    }
    params.delete("page")
    params.delete("offset")
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => handleCategoryClick(null)}
        className={clsx(
          "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200",
          !activeCategory
            ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
            : "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]",
        )}
      >
        ALL
      </button>
      {categories.map((category) => {
        const isActive = activeCategory === category.slug
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            className={clsx(
              "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200",
              isActive
                ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
                : "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]",
            )}
          >
            {category.name.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
