"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"

interface CartIconProps {
  /** Optional className merged onto the button. When omitted, the default
   *  `p-2` padding is used (keeps existing call-sites unchanged). Pass a
   *  stretchable value like `"w-full h-full flex items-center justify-center p-3"`
   *  to let the button fill a parent tile — Phase 16.1 D-07 needs this for
   *  the collapsed sidebar cart to be clickable across its full bounding box. */
  className?: string
}

export function CartIcon({ className }: CartIconProps = {}) {
  const { itemCount, isMounted, toggleCart } = useCart()

  return (
    <button
      type="button"
      onClick={toggleCart}
      className={`relative cursor-pointer ${className ?? "p-2"}`}
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
