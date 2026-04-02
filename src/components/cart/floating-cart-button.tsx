"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"

export function FloatingCartButton() {
  const { itemCount, isMounted, toggleCart } = useCart()

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="fixed top-4 right-4 z-50 flex items-center justify-center h-11 w-11 bg-[#111111] border border-[#222222] text-[#f5f5f0] active:bg-[#0a0a0a] md:hidden"
      aria-label={
        isMounted && itemCount > 0
          ? `Shopping cart, ${itemCount} items`
          : "Shopping cart, empty"
      }
    >
      <ShoppingCart className="h-5 w-5" />
      {isMounted && itemCount > 0 && (
        <span className="bg-[#f5f5f0] text-[#000000] text-[10px] font-mono font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-none absolute -top-1.5 -right-1.5">
          {itemCount}
        </span>
      )}
    </button>
  )
}
