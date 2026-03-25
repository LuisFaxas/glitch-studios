"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"

export function CartIcon() {
  const { itemCount, isMounted, toggleCart } = useCart()

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="relative cursor-pointer p-2"
      aria-label={
        isMounted && itemCount > 0
          ? `Shopping cart, ${itemCount} items`
          : "Shopping cart, empty"
      }
    >
      <ShoppingCart className="h-6 w-6" />
      {isMounted && itemCount > 0 && (
        <span className="bg-[#333] text-[#f5f5f0] text-[10px] font-mono font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-none absolute -top-1 -right-1">
          {itemCount}
        </span>
      )}
    </button>
  )
}
