"use client"

import { LayoutGrid, List } from "lucide-react"
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

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex" data-testid="view-toggle">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => onViewChange("card")}
                aria-label="Card view"
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-none border transition-colors ${
                  view === "card"
                    ? "border-[#f5f5f0] bg-[#f5f5f0] text-[#000]"
                    : "border-[#333] bg-[#111] text-[#f5f5f0] hover:border-[#f5f5f0] hover:bg-[#f5f5f0] hover:text-[#000]"
                }`}
              />
            }
          >
            <LayoutGrid className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Card view</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => onViewChange("list")}
                aria-label="List view"
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-none border transition-colors ${
                  view === "list"
                    ? "border-[#f5f5f0] bg-[#f5f5f0] text-[#000]"
                    : "border-[#333] bg-[#111] text-[#f5f5f0] hover:border-[#f5f5f0] hover:bg-[#f5f5f0] hover:text-[#000]"
                }`}
              />
            }
          >
            <List className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>List view</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
