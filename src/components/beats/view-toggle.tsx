"use client"

import { Grid3x3, LayoutGrid, List } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ViewToggleProps {
  view: string
  onViewChange: (view: string) => void
}

const views = [
  { value: "compact", label: "Compact view", icon: Grid3x3 },
  { value: "card", label: "Large view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
] as const

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex" data-testid="view-toggle">
        {views.map(({ value, label, icon: Icon }) => (
          <Tooltip key={value}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => onViewChange(value)}
                  aria-label={label}
                  className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-none border transition-colors ${
                    view === value
                      ? "border-[#f5f5f0] bg-[#f5f5f0] text-[#000]"
                      : "border-[#333] bg-[#111] text-[#f5f5f0] hover:border-[#f5f5f0] hover:bg-[#f5f5f0] hover:text-[#000]"
                  }`}
                />
              }
            >
              <Icon className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
