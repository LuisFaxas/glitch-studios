"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  ServiceDetailPanel,
  type PortfolioItemLite,
  type Service,
} from "./service-detail-panel"
import { cn } from "@/lib/utils"

interface ServiceDetailOverlayProps {
  service: Service | null
  portfolioItems: PortfolioItemLite[]
  onClose: () => void
}

// Private hook — ported verbatim from license-modal.tsx (lines 29-46).
// Do NOT extract to a shared util this phase (RESEARCH §Pattern 3 + Q2).
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)

    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches)
    }

    mql.addEventListener("change", handleChange)
    return () => mql.removeEventListener("change", handleChange)
  }, [query])

  return matches
}

export function ServiceDetailOverlay({
  service,
  portfolioItems,
  onClose,
}: ServiceDetailOverlayProps) {
  // Hydration-safe mount guard (RESEARCH §Pitfall 4). Auto-open on deep-link
  // is exactly when SSR/client mismatch is most visible — defer mount.
  // setState is deferred via setTimeout(0) per project convention 48-16 to
  // satisfy react-hooks/set-state-in-effect and the ranking-filter-safety rule.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (service === null) return null
  if (!mounted) return null

  const isOpen = service !== null
  const ctaLabel = service.isBookable ? "BOOK THIS SERVICE" : "REQUEST A QUOTE"
  const ctaHref = service.isBookable
    ? `/book?service=${service.slug}`
    : `/contact?service=${service.slug}`

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "max-w-[720px] rounded-none border border-[#222] bg-[#111] p-0",
            "!grid !grid-rows-[auto_minmax(0,1fr)_auto] !gap-0",
            "max-h-[85vh]",
          )}
        >
          <DialogHeader className="border-b border-[#222] p-4 m-0">
            <DialogTitle
              render={
                <h2 className="font-mono font-bold uppercase tracking-[0.05em] text-[#f5f5f0] text-[22px] md:text-[28px] leading-[1.15]" />
              }
            >
              {service.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Details and booking for {service.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto">
            <ServiceDetailPanel
              service={service}
              portfolioItems={portfolioItems}
            />
          </div>
          <div className="border-t border-[#222] bg-[#111] p-4">
            <Link
              href={ctaHref}
              className="block w-full text-center bg-[#f5f5f0] text-[#000] font-mono font-bold text-[13px] uppercase tracking-[0.05em] px-6 py-3 rounded-none transition-colors duration-150 hover:bg-[#e5e5e0]"
            >
              {ctaLabel}
            </Link>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 cursor-pointer text-[#555] transition-colors duration-150 hover:text-[#f5f5f0]"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        data-testid="service-detail-drawer"
        className={cn(
          "rounded-none border-t border-[#222] bg-[#111]",
          "data-[vaul-drawer-direction=bottom]:!rounded-none",
          "data-[vaul-drawer-direction=bottom]:!mt-0",
          "data-[vaul-drawer-direction=bottom]:!max-h-[92vh]",
          "!grid grid-rows-[auto_minmax(0,1fr)_auto]",
        )}
      >
        <DrawerHeader className="border-b border-[#222] p-4 text-left">
          <DrawerTitle asChild>
            <h2 className="font-mono font-bold uppercase tracking-[0.05em] text-[#f5f5f0] text-[22px] leading-[1.15]">
              {service.name}
            </h2>
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Details and booking for {service.name}.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto">
          <ServiceDetailPanel
            service={service}
            portfolioItems={portfolioItems}
          />
        </div>
        <div className="border-t border-[#222] bg-[#111] p-4">
          <Link
            href={ctaHref}
            className="block w-full text-center bg-[#f5f5f0] text-[#000] font-mono font-bold text-[13px] uppercase tracking-[0.05em] px-6 py-3 rounded-none transition-colors duration-150 hover:bg-[#e5e5e0]"
          >
            {ctaLabel}
          </Link>
        </div>
        <DrawerClose
          aria-label="Close"
          className="absolute right-3 top-3 cursor-pointer text-[#555] transition-colors duration-150 hover:text-[#f5f5f0]"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  )
}
