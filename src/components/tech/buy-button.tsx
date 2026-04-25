"use client"
import { useId } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink } from "lucide-react"

interface BuyButtonProps {
  productId: string
}

/**
 * Phase 29 placeholder. Phase 41 swaps the click target to `/go/[productId]`
 * with affiliate cloaking. Component contract (productId-only) stays stable
 * so Phase 41 does not need to touch the leaderboard table layout.
 *
 * D-19: stopPropagation on click so the surrounding row click does not fire.
 */
export function BuyButton({ productId }: BuyButtonProps) {
  const triggerId = useId()
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            data-product-id={productId}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            className="inline-flex items-center gap-1.5 border border-[#333] bg-[#111] px-3 py-1.5 text-xs font-mono uppercase tracking-wide text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0] focus:outline-none focus:ring-1 focus:ring-[#f5f5f0]"
            aria-describedby={triggerId}
          >
            Buy
            <ExternalLink className="h-3 w-3" aria-hidden />
          </button>
        }
      />
      <TooltipContent id={triggerId}>Affiliate links coming soon</TooltipContent>
    </Tooltip>
  )
}
