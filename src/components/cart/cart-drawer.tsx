"use client"

import Image from "next/image"
import Link from "next/link"
import { X, Music, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCart } from "@/components/cart/cart-provider"

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, total, itemCount } = useCart()

  function handleRemove(
    beatId: string,
    licenseTier: string,
    beatTitle: string
  ) {
    removeItem(beatId, licenseTier)
    toast(`Removed "${beatTitle}" from cart`)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full md:w-[384px] md:max-w-[384px] bg-[#111] border-l border-[#222] p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="border-b border-[#222] p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-mono text-[15px] font-bold uppercase text-[#f5f5f0]">
              Cart ({itemCount})
            </SheetTitle>
            <button
              type="button"
              onClick={closeCart}
              className="cursor-pointer text-[#888] transition-colors hover:text-[#f5f5f0]"
              aria-label="Close cart"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <ShoppingBag className="h-10 w-10 text-[#333]" />
            <h3 className="font-mono text-[15px] font-bold uppercase text-[#f5f5f0]">
              Your cart is empty
            </h3>
            <p className="text-center font-sans text-[15px] text-[#888]">
              Browse beats and add your favorites to get started.
            </p>
            <Link
              href="/beats"
              onClick={closeCart}
              className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase w-full py-3 rounded-none text-center transition-opacity hover:opacity-90"
            >
              Browse Beats
            </Link>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="divide-y divide-[#222] p-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.beatId}-${item.licenseTier}`}
                      layout
                      initial={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        {/* Cover art */}
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden">
                          {item.coverArtUrl ? (
                            <Image
                              src={item.coverArtUrl}
                              alt={item.beatTitle}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#222]">
                              <Music className="h-4 w-4 text-[#555]" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                          <span className="truncate font-mono text-[11px] font-bold text-[#f5f5f0]">
                            {item.beatTitle}
                          </span>
                          <span className="font-sans text-[11px] text-[#888]">
                            {item.licenseTierDisplay}
                          </span>
                        </div>

                        {/* Price */}
                        <span className="shrink-0 font-mono text-[15px] font-bold text-[#f5f5f0]">
                          ${item.price.toFixed(0)}
                        </span>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              item.beatId,
                              item.licenseTier,
                              item.beatTitle
                            )
                          }
                          className="shrink-0 cursor-pointer p-1 text-[#888] transition-colors hover:text-[#dc2626]"
                          aria-label={`Remove ${item.beatTitle} from cart`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer */}
            <SheetFooter className="border-t border-[#222] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] font-bold uppercase text-[#888]">
                  Subtotal
                </span>
                <span className="font-mono text-[15px] font-bold text-[#f5f5f0]">
                  ${total.toFixed(0)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase w-full py-3 rounded-none text-center transition-opacity hover:opacity-90"
              >
                Go to Checkout
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
