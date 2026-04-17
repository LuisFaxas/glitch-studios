"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { CategoryTreeNode } from "@/actions/admin-tech-categories"

interface LeafOption {
  id: string
  name: string
  fullPath: string
  searchText: string
}

function flattenLeaves(tree: CategoryTreeNode[]): LeafOption[] {
  const out: LeafOption[] = []
  const walk = (node: CategoryTreeNode, trail: string[]) => {
    const path = [...trail, node.name]
    if (node.children.length === 0) {
      out.push({
        id: node.id,
        name: node.name,
        fullPath: path.join(" > "),
        searchText: path.join(" ").toLowerCase(),
      })
    } else {
      for (const child of node.children) walk(child, path)
    }
  }
  for (const root of tree) walk(root, [])
  return out
}

interface CategoryPickerProps {
  value: string | null
  onChange: (categoryId: string) => void
  tree: CategoryTreeNode[]
  placeholder?: string
}

export function CategoryPicker({
  value,
  onChange,
  tree,
  placeholder = "Select category",
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false)
  const leaves = useMemo(() => flattenLeaves(tree), [tree])
  const selected = leaves.find((l) => l.id === value) ?? null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between bg-[#111111] border border-[#222222] text-[#f5f5f0] font-sans text-[15px] px-3 py-2 outline-none focus:border-[#f5f5f0] hover:border-[#444444]"
      >
        <span className={selected ? "text-[#f5f5f0]" : "text-[#555555]"}>
          {selected ? selected.fullPath : placeholder}
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-[#555555]" />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] bg-[#0a0a0a] border border-[#222222]">
        <Command className="bg-[#0a0a0a]">
          <CommandInput
            placeholder="Search categories…"
            className="font-sans text-[13px] text-[#f5f5f0]"
          />
          <CommandList>
            <CommandEmpty>
              <div className="px-3 py-2">
                <p className="font-sans text-[13px] text-[#888888]">No matching categories.</p>
                <p className="font-sans text-[11px] text-[#555555] mt-1">
                  Choose a specific category (only leaf categories are selectable).
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {leaves.map((leaf) => (
                <CommandItem
                  key={leaf.id}
                  value={leaf.searchText}
                  onSelect={() => {
                    onChange(leaf.id)
                    setOpen(false)
                  }}
                  className="font-sans text-[13px] text-[#f5f5f0] cursor-pointer"
                >
                  <Check
                    size={14}
                    className={`mr-2 ${value === leaf.id ? "opacity-100" : "opacity-0"}`}
                  />
                  {leaf.fullPath}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
