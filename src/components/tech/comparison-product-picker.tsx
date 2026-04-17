"use client"

import Image from "next/image"
import { Plus, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import type { PublicProductPickerEntry, PublicProductForCompare } from "@/lib/tech/queries"

interface ComparisonProductPickerProps {
  selectedProducts: PublicProductForCompare[]
  availableProducts: PublicProductPickerEntry[]
  maxSlots: number
  onAdd: (slug: string) => void
  onRemove: (slug: string) => void
}

export function ComparisonProductPicker({
  selectedProducts,
  availableProducts,
  maxSlots,
  onAdd,
  onRemove,
}: ComparisonProductPickerProps) {
  const lockedCategoryId = selectedProducts[0]?.categoryId ?? null
  const selectedSlugs = new Set(selectedProducts.map((p) => p.slug))
  const options = availableProducts.filter((p) => {
    if (selectedSlugs.has(p.slug)) return false
    if (lockedCategoryId && p.categoryId !== lockedCategoryId) return false
    return true
  })

  const emptySlotCount = Math.max(0, maxSlots - selectedProducts.length)

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      {selectedProducts.map((product) => (
        <div
          key={product.slug}
          className="relative flex flex-col overflow-hidden border border-[#222] bg-[#111]"
        >
          <div className="relative aspect-square bg-[#0a0a0a]">
            {product.heroImageUrl ? (
              <Image
                src={product.heroImageUrl}
                alt={product.heroImageAlt ?? product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#444]">Product</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 p-3">
            <h3 className="line-clamp-2 font-mono text-[13px] font-bold uppercase tracking-[0.02em] text-[#f5f5f0]">
              {product.name}
            </h3>
            {product.manufacturer && (
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555]">
                {product.manufacturer}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onRemove(product.slug)}
            aria-label={`Remove ${product.name}`}
            className="absolute right-1 top-1 flex h-8 w-8 cursor-pointer items-center justify-center border border-[#222] bg-black/70 text-[#f5f5f0] hover:border-[#f5f5f0]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      {Array.from({ length: emptySlotCount }).map((_, i) => (
        <Popover key={`empty-${i}`}>
          <PopoverTrigger
            aria-label="Add product to compare"
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[#444] bg-transparent text-[#888] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
          >
            <Plus className="h-8 w-8" aria-hidden="true" />
            <span className="font-mono text-[11px] uppercase tracking-[0.1em]">Add product</span>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] border-[#222] bg-[#111] p-0">
            <Command>
              <CommandInput
                placeholder="Search products..."
                className="h-10 border-b-[#222] font-mono text-[13px]"
              />
              <CommandList>
                <CommandEmpty className="py-4 text-center font-mono text-[13px] text-[#888]">
                  {lockedCategoryId ? "No products in this category" : "No products found"}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`${p.name} ${p.manufacturer ?? ""} ${p.categoryName}`}
                      onSelect={() => onAdd(p.slug)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-mono text-[13px] font-bold text-[#f5f5f0]">{p.name}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#555]">
                          {p.categoryName}
                          {p.manufacturer && ` · ${p.manufacturer}`}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}
