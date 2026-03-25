"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Music, X } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer"
import { DEFAULT_LICENSE_TIERS, type BeatSummary } from "@/types/beats"
import { useCart } from "@/components/cart/cart-provider"

interface LicenseModalProps {
  beat: BeatSummary
  isOpen: boolean
  onClose: () => void
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches)
    }

    mql.addEventListener("change", handleChange)
    return () => mql.removeEventListener("change", handleChange)
  }, [query])

  return matches
}

function LicenseTierTable({
  beat,
  onClose,
}: {
  beat: BeatSummary
  onClose: () => void
}) {
  const { addItem } = useCart()

  const activeTiers = DEFAULT_LICENSE_TIERS.filter((tierDef) =>
    beat.pricing.some((p) => p.tier === tierDef.tier && p.isActive)
  )

  function handleSelectTier(
    tierDef: (typeof DEFAULT_LICENSE_TIERS)[number],
    price: string
  ) {
    addItem({
      beatId: beat.id,
      beatTitle: beat.title,
      beatSlug: beat.slug,
      coverArtUrl: beat.coverArtUrl,
      licenseTier: tierDef.tier,
      licenseTierDisplay: tierDef.displayName,
      price: Number(price),
    })
    toast(`Added "${beat.title}" (${tierDef.displayName}) to cart`)
    onClose()
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#222]">
            <th className="px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Tier
            </th>
            <th className="hidden px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#555] md:table-cell">
              Included
            </th>
            <th className="hidden px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#555] md:table-cell">
              Usage Rights
            </th>
            <th className="px-3 py-2 text-right font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#555]">
              Price
            </th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {activeTiers.map((tierDef) => {
            const pricing = beat.pricing.find((p) => p.tier === tierDef.tier)
            if (!pricing) return null

            const isSoldExclusive =
              tierDef.tier === "exclusive" &&
              beat.status === "sold_exclusive"

            return (
              <tr
                key={tierDef.tier}
                className="border-b border-[#222] last:border-b-0"
              >
                <td className="px-3 py-3">
                  <span className="font-mono text-[15px] font-bold uppercase text-[#f5f5f0]">
                    {tierDef.displayName}
                  </span>
                </td>
                <td className="hidden px-3 py-3 md:table-cell">
                  <ul className="space-y-0.5">
                    {tierDef.deliverables.map((d) => (
                      <li
                        key={d}
                        className="font-sans text-[11px] text-[#888]"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="hidden px-3 py-3 md:table-cell">
                  <ul className="space-y-0.5">
                    {tierDef.usageRights.map((r) => (
                      <li
                        key={r}
                        className="font-sans text-[11px] text-[#888]"
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-mono text-[15px] font-bold text-[#f5f5f0]">
                    ${Number(pricing.price).toFixed(0)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {isSoldExclusive ? (
                    <span className="font-mono text-[11px] font-bold uppercase text-[#555]">
                      SOLD
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectTier(tierDef, pricing.price)
                      }
                      className="cursor-pointer whitespace-nowrap bg-[#f5f5f0] text-[#000] font-mono font-bold text-[11px] uppercase px-4 py-2 rounded-none transition-opacity hover:opacity-90"
                    >
                      Select Tier
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ModalHeader({ beat }: { beat: BeatSummary }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden">
        {beat.coverArtUrl ? (
          <Image
            src={beat.coverArtUrl}
            alt={beat.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#222]">
            <Music className="h-5 w-5 text-[#555]" />
          </div>
        )}
      </div>
      <span className="font-mono text-[15px] font-bold text-[#f5f5f0]">
        {beat.title}
      </span>
    </div>
  )
}

export function LicenseModal({ beat, isOpen, onClose }: LicenseModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[640px] rounded-none border border-[#222] bg-[#111] p-0 sm:max-w-[640px]"
        >
          <DialogHeader className="border-b border-[#222] p-4">
            <DialogTitle>
              <ModalHeader beat={beat} />
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <LicenseTierTable beat={beat} onClose={onClose} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 cursor-pointer text-[#555] transition-colors hover:text-[#f5f5f0]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="rounded-none border-t border-[#222] bg-[#111]">
        <DrawerHeader className="border-b border-[#222]">
          <DrawerTitle>
            <ModalHeader beat={beat} />
          </DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">
          <LicenseTierTable beat={beat} onClose={onClose} />
        </div>
        <DrawerClose className="absolute right-3 top-3 cursor-pointer text-[#555] transition-colors hover:text-[#f5f5f0]">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  )
}
