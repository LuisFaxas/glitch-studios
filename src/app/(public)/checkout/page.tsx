"use client"

import { useCallback } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { useCart } from "@/components/cart/cart-provider"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function CheckoutPage() {
  const { items } = useCart()

  const fetchClientSecret = useCallback(async () => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
    const { clientSecret } = await response.json()
    return clientSecret
  }, [items])

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
          Checkout
        </h1>
        <p className="font-sans text-[15px] text-[#888]">
          Your cart is empty. Add some beats first.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
        Checkout
      </h1>
      <div
        id="checkout"
        className="border border-[#222] bg-[#111] p-4 rounded-none"
      >
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  )
}
