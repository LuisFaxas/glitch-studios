"use client"

import { useRouter, useSearchParams } from "next/navigation"
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
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => handleCategoryClick(null)}
        className={`px-4 py-2 rounded-full text-sm font-mono border whitespace-nowrap transition-colors ${
          !activeCategory
            ? "bg-gray-800 text-white border-gray-600"
            : "bg-transparent text-gray-400 border-gray-800 hover:text-white"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.slug)}
          className={`px-4 py-2 rounded-full text-sm font-mono border whitespace-nowrap transition-colors ${
            activeCategory === category.slug
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-transparent text-gray-400 border-gray-800 hover:text-white"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
